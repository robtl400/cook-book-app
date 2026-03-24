import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';

export default function RecipeBoxDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [box, setBox] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete box state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Remove-post state
  const [removeTarget, setRemoveTarget] = useState(null); // post_id pending removal
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/boxes/${id}`);
        // Backend wraps as { box: {...}, posts: [...] }
        setBox(data.box ?? data);
        setPosts(data.posts ?? data.entries ?? []);
      } catch (err) {
        setError(err.message ?? 'Could not load this box.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function startEdit() {
    setEditName(box.name ?? '');
    setEditDesc(box.description ?? '');
    setEditError('');
    setEditing(true);
  }

  async function saveEdit() {
    if (!editName.trim()) {
      setEditError('Name is required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const updated = await api.patch(`/boxes/${id}`, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      setBox(prev => ({ ...prev, ...updated }));
      setEditing(false);
      toast.success('Box updated!');
    } catch (err) {
      setEditError(err.message ?? 'Could not save changes.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.delete(`/boxes/${id}`);
      navigate(`/users/${box.user_id}`);
    } catch (err) {
      setError(err.message ?? 'Could not delete this box.');
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  }

  function handleRemoveClick(postId) {
    if (box?.box_type === 'liked') {
      // Recipe Box — cascade removal, show warning first
      setRemoveTarget(postId);
    } else {
      // Sub-box — remove directly
      removePost(postId);
    }
  }

  async function removePost(postId) {
    try {
      await api.delete(`/posts/${postId}/save/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Removed from list.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove recipe.');
    }
  }

  async function confirmCascadeRemove() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      await api.delete(`/posts/${removeTarget}/save/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== removeTarget));
      toast.success('Removed from My Recipe Box and all lists.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove recipe.');
    } finally {
      setRemoveLoading(false);
      setRemoveTarget(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400">{error || 'Box not found.'}</p>
      </div>
    );
  }

  const isOwner = currentUser && String(currentUser.id) === String(box.user_id);
  const canEdit = isOwner && !box.is_default;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* ── Header ── */}
      <div className="mb-6">
        {editing ? (
          <div className="space-y-3">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-text text-xl font-bold bg-surface-input focus:outline-none focus:ring-2 focus:ring-cta"
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full border border-border rounded px-3 py-2 text-text bg-surface-input resize-none focus:outline-none focus:ring-2 focus:ring-cta"
            />
            {editError && <p className="text-red-400 text-sm">{editError}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={editLoading}
                className="px-4 py-1.5 bg-cta text-white text-sm font-semibold rounded-sm hover:bg-cta-dark disabled:opacity-50 transition-colors"
              >
                {editLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 border border-border text-text-muted text-sm rounded-sm hover:border-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-text">{box.name}</h1>
                  {box.is_default && (
                    <span className="text-xs px-2 py-0.5 bg-surface-input text-text-muted rounded-full">
                      Default
                    </span>
                  )}
                </div>
                {box.description && (
                  <p className="text-text-muted mt-1 text-sm">{box.description}</p>
                )}
                {box.user_id && (
                  <p className="text-sm text-text-muted mt-1">
                    by{' '}
                    <Link
                      to={`/users/${box.user_id}`}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {box.user?.display_name || box.user?.username || `user #${box.user_id}`}
                    </Link>
                  </p>
                )}
              </div>

              {canEdit && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={startEdit}
                    className="text-sm px-3 py-1.5 border border-border text-text-muted rounded-sm hover:border-text transition-colors"
                  >
                    Edit
                  </button>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-sm px-3 py-1.5 border border-red-800/50 text-red-400 rounded-sm hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-400">Delete this box?</span>
                      <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deleteLoading ? '…' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-sm px-3 py-1 border border-border text-text-muted rounded-sm hover:border-text transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Post grid ── */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p>No recipes saved yet.</p>
          {isOwner && (
            <p className="text-sm mt-1">
              Browse the{' '}
              <Link to="/explore" className="text-accent hover:underline">
                Explore page
              </Link>{' '}
              to find recipes to save.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="relative group">
              <PostCard post={post} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveClick(post.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-surface-raised/90 border border-border rounded-full text-text-muted hover:text-red-400 hover:border-red-400/60 flex items-center justify-center text-base leading-none transition-colors opacity-0 group-hover:opacity-100"
                  title={box.box_type === 'liked' ? 'Remove from My Recipe Box' : `Remove from ${box.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Cascade remove confirmation ── */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !removeLoading && setRemoveTarget(null)}
        >
          <div
            className="bg-surface-raised rounded shadow-xl w-full max-w-sm border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-text mb-2">Remove from My Recipe Box?</h3>
            <p className="text-sm text-text-muted mb-5">
              This will also remove the recipe from all your other lists (Cooked, Want to Try, etc.).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                disabled={removeLoading}
                className="flex-1 py-2 border border-border text-text-muted rounded-sm text-sm hover:border-text transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCascadeRemove}
                disabled={removeLoading}
                className="flex-1 py-2 bg-red-600 text-white rounded-sm text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {removeLoading ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
