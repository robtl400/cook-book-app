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

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/boxes/${id}`);
        const data = res.data ?? res;
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
      const res = await api.patch(`/boxes/${id}`, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      const updated = res.data ?? res;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500">{error || 'Box not found.'}</p>
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
              className="w-full border border-warm-tan rounded-lg px-3 py-2 text-ink text-xl font-bold bg-white focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={2}
              placeholder="Description (optional)"
              className="w-full border border-warm-tan rounded-lg px-3 py-2 text-ink bg-white resize-none focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            />
            {editError && <p className="text-red-500 text-sm">{editError}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={editLoading}
                className="px-4 py-1.5 bg-burnt-orange text-white text-sm font-semibold rounded-lg hover:bg-burnt-orange-dark disabled:opacity-50 transition-colors"
              >
                {editLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 border border-warm-tan text-warm-brown text-sm rounded-lg hover:border-ink transition-colors"
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
                  <h1 className="text-2xl font-bold text-ink">{box.name}</h1>
                  {box.is_default && (
                    <span className="text-xs px-2 py-0.5 bg-cream-dark text-warm-brown rounded-full">
                      Default
                    </span>
                  )}
                </div>
                {box.description && (
                  <p className="text-warm-brown mt-1 text-sm">{box.description}</p>
                )}
                {box.user_id && (
                  <p className="text-sm text-warm-brown mt-1">
                    by{' '}
                    <Link
                      to={`/users/${box.user_id}`}
                      className="font-medium hover:text-burnt-orange transition-colors"
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
                    className="text-sm px-3 py-1.5 border border-warm-tan text-warm-brown rounded-lg hover:border-ink transition-colors"
                  >
                    Edit
                  </button>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-sm px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-500">Delete this box?</span>
                      <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="text-sm px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {deleteLoading ? '…' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-sm px-3 py-1 border border-warm-tan text-warm-brown rounded-lg hover:border-ink transition-colors"
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
        <div className="text-center py-16 text-warm-brown">
          <p>No recipes saved yet.</p>
          {isOwner && (
            <p className="text-sm mt-1">
              Browse the{' '}
              <Link to="/explore" className="text-burnt-orange hover:underline">
                Explore page
              </Link>{' '}
              to find recipes to save.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
