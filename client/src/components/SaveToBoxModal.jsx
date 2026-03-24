import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SaveToBoxModal({ postId, onClose }) {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoxName, setNewBoxName] = useState('');
  const [creatingBox, setCreatingBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Whether the liked (My Recipe Box) is checked
  const [likedChecked, setLikedChecked] = useState(true);
  // Whether the recipe was in liked when the modal opened
  const [initialSavedInLiked, setInitialSavedInLiked] = useState(false);
  // Desired final state for sub-boxes (pre-populated from saved state on load)
  const [stagedBoxIds, setStagedBoxIds] = useState(new Set());
  // Snapshot of sub-box membership when modal opened — used to diff add vs remove
  const [initialSavedSubBoxIds, setInitialSavedSubBoxIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      api.get(`/users/${user.id}/boxes`),
      api.get(`/posts/${postId}/saved-boxes`),
    ])
      .then(([boxesResult, savedResult]) => {
        if (boxesResult.status === 'rejected') {
          toast.error('Could not load your boxes.');
          return;
        }
        const allBoxes = boxesResult.value;
        setBoxes(allBoxes);

        if (savedResult.status === 'fulfilled') {
          const savedIds = new Set(savedResult.value);
          const likedBox = allBoxes.find((b) => b.box_type === 'liked');
          setInitialSavedInLiked(savedIds.has(likedBox?.id));
          const savedSubIds = new Set([...savedIds].filter((id) => id !== likedBox?.id));
          setStagedBoxIds(new Set(savedSubIds));
          setInitialSavedSubBoxIds(new Set(savedSubIds));
        }
      })
      .finally(() => setLoading(false));
  }, [user, postId]);

  function handleLikedToggle() {
    if (likedChecked) {
      // Unchecking liked — clear all sub-boxes
      setLikedChecked(false);
      setStagedBoxIds(new Set());
    } else {
      // Re-checking liked — restore sub-boxes to initial saved state
      setLikedChecked(true);
      setStagedBoxIds(new Set(initialSavedSubBoxIds));
    }
  }

  function handleToggle(boxId) {
    setStagedBoxIds((prev) => {
      const next = new Set(prev);
      if (next.has(boxId)) next.delete(boxId);
      else next.add(boxId);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    let changed = false;
    const likedBox = boxes.find((b) => b.box_type === 'liked');

    if (!likedChecked) {
      // Cascade remove: DELETE from liked removes from all sub-boxes too
      if (likedBox && initialSavedInLiked) {
        try {
          await api.delete(`/posts/${postId}/save/${likedBox.id}`);
          changed = true;
        } catch { /* silently skip */ }
      }
    } else {
      // Normal save path: ensure liked is saved, then diff sub-boxes
      if (likedBox) {
        try {
          await api.post(`/posts/${postId}/save`, { box_id: likedBox.id });
          changed = true;
        } catch (err) {
          if (err.status === 409) { /* already there — fine */ }
        }
      }
      // Add newly staged sub-boxes
      for (const boxId of stagedBoxIds) {
        if (!initialSavedSubBoxIds.has(boxId)) {
          try {
            await api.post(`/posts/${postId}/save`, { box_id: boxId });
            changed = true;
          } catch (err) {
            if (err.status === 409) changed = true;
          }
        }
      }
      // Remove un-staged sub-boxes
      for (const boxId of initialSavedSubBoxIds) {
        if (!stagedBoxIds.has(boxId)) {
          try {
            await api.delete(`/posts/${postId}/save/${boxId}`);
            changed = true;
          } catch { /* silently skip */ }
        }
      }
    }

    if (changed) toast.success(likedChecked ? 'Saved!' : 'Removed from all lists.');
    setSubmitting(false);
    onClose();
  }

  async function handleCreateBox(e) {
    e.preventDefault();
    if (!newBoxName.trim()) return;
    setCreatingBox(true);
    try {
      const newBox = await api.post('/boxes', { name: newBoxName.trim() });
      setBoxes((prev) => [...prev, newBox]);
      setNewBoxName('');
      // Auto-stage the new box so it will be saved on Submit
      setStagedBoxIds((prev) => new Set([...prev, newBox.id]));
    } catch {
      toast.error('Failed to create box.');
    } finally {
      setCreatingBox(false);
    }
  }

  const sortedBoxes = [...boxes].sort((a, b) => {
    if (a.box_type === 'liked') return -1;
    if (b.box_type === 'liked') return 1;
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-raised rounded shadow-xl w-full max-w-sm overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text">Save to My Recipe Box</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Box list */}
        <div className="px-5 py-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sortedBoxes.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No boxes yet.</p>
          ) : (
            <ul className="space-y-1">
              {sortedBoxes.map((box) => {
                const isRecipeBox = box.box_type === 'liked';
                const checked = isRecipeBox ? likedChecked : stagedBoxIds.has(box.id);
                return (
                  <li key={box.id}>
                    <label className="flex items-center gap-3 py-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={submitting || (!isRecipeBox && !likedChecked)}
                        onChange={() => isRecipeBox ? handleLikedToggle() : handleToggle(box.id)}
                        className="w-4 h-4 accent-cta rounded cursor-pointer disabled:cursor-default"
                      />
                      <span
                        className={`text-sm flex-1 transition-colors ${
                          isRecipeBox
                            ? 'text-text font-medium'
                            : 'text-text group-hover:text-accent'
                        }`}
                      >
                        {box.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Warning banner when liked is unchecked */}
        {!likedChecked && (
          <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs leading-relaxed">
            Removing from My Recipe Box will also remove this recipe from{' '}
            <strong>all your other lists</strong>.
          </div>
        )}

        {/* Create new box */}
        <div className="px-5 py-4 border-t border-border bg-surface/50">
          <form onSubmit={handleCreateBox} className="flex gap-2">
            <input
              type="text"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
              placeholder="New list name…"
              className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-surface-input text-text focus:outline-none focus:border-cta"
            />
            <button
              type="submit"
              disabled={creatingBox || !newBoxName.trim()}
              className="px-3 py-1.5 text-sm bg-cta text-white rounded-sm hover:bg-cta-dark disabled:opacity-60 transition-colors font-medium shrink-0"
            >
              {creatingBox ? '…' : 'Create'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2 border border-border text-text-muted rounded-sm text-sm hover:border-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 py-2 rounded-sm text-sm font-semibold disabled:opacity-50 transition-colors ${
              likedChecked
                ? 'bg-cta text-white hover:bg-cta-dark'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {submitting
              ? (likedChecked ? 'Saving…' : 'Removing…')
              : (likedChecked ? 'Save' : 'Remove from all lists')}
          </button>
        </div>
      </div>
    </div>
  );
}
