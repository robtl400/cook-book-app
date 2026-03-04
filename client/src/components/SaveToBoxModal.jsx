import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SaveToBoxModal({ postId, onClose }) {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [savedBoxIds, setSavedBoxIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [newBoxName, setNewBoxName] = useState('');
  const [creatingBox, setCreatingBox] = useState(false);
  const [pending, setPending] = useState(new Set()); // box IDs currently being toggled

  useEffect(() => {
    if (!user) return;
    api
      .get(`/users/${user.id}/boxes`)
      .then((data) => setBoxes(data.data ?? data))
      .catch(() => toast.error('Could not load your boxes.'))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleToggle(boxId) {
    if (pending.has(boxId)) return;
    setPending((p) => new Set([...p, boxId]));

    const box = boxes.find((b) => b.id === boxId);
    const boxName = box?.name || 'box';

    if (savedBoxIds.has(boxId)) {
      // Unsave
      try {
        await api.delete(`/posts/${postId}/save/${boxId}`);
        setSavedBoxIds((prev) => {
          const next = new Set(prev);
          next.delete(boxId);
          return next;
        });
      } catch {
        toast.error('Failed to remove from box.');
      }
    } else {
      // Save
      try {
        await api.post(`/posts/${postId}/save`, { box_id: boxId });
        setSavedBoxIds((prev) => new Set([...prev, boxId]));
        toast.success(`Saved to "${boxName}"!`);
      } catch (err) {
        if (err.status === 409) {
          // Already saved — reflect that in state
          setSavedBoxIds((prev) => new Set([...prev, boxId]));
        }
      }
    }

    setPending((p) => {
      const next = new Set(p);
      next.delete(boxId);
      return next;
    });
  }

  async function handleCreateBox(e) {
    e.preventDefault();
    if (!newBoxName.trim()) return;
    setCreatingBox(true);
    try {
      const data = await api.post('/boxes', { name: newBoxName.trim() });
      const newBox = data.data ?? data;
      setBoxes((prev) => [...prev, newBox]);
      setNewBoxName('');
      // Auto-save this post to the new box
      await handleToggle(newBox.id);
    } catch {
      toast.error('Failed to create box.');
    } finally {
      setCreatingBox(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="bg-surface-raised rounded shadow-xl w-full max-w-sm overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text">Save to box</h2>
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
          ) : boxes.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No boxes yet.</p>
          ) : (
            <ul className="space-y-1">
              {boxes.map((box) => {
                const checked = savedBoxIds.has(box.id);
                const busy = pending.has(box.id);
                return (
                  <li key={box.id}>
                    <label className="flex items-center gap-3 py-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={busy}
                        onChange={() => handleToggle(box.id)}
                        className="w-4 h-4 accent-cta rounded cursor-pointer"
                      />
                      <span className="text-sm text-text group-hover:text-accent transition-colors flex-1">
                        {box.name}
                      </span>
                      {box.is_default && (
                        <span className="text-xs text-text-dim">{box.box_type}</span>
                      )}
                      {busy && (
                        <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Create new box */}
        <div className="px-5 py-4 border-t border-border bg-surface/50">
          <form onSubmit={handleCreateBox} className="flex gap-2">
            <input
              type="text"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
              placeholder="New box name…"
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
      </div>
    </div>
  );
}
