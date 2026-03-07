import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

export default function MyRecipeBoxPage() {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  // Remove-from-box state
  const [removeTarget, setRemoveTarget] = useState(null); // post_id pending removal
  const [removeLoading, setRemoveLoading] = useState(false);

  // Load all user boxes on mount
  useEffect(() => {
    if (!user) return;
    api
      .get(`/users/${user.id}/boxes`)
      .then((res) => {
        const allBoxes = res.data ?? res;
        setBoxes(allBoxes);
        const recipeBox = allBoxes.find((b) => b.box_type === 'liked');
        if (recipeBox) setSelectedBoxId(recipeBox.id);
      })
      .catch((err) => setError(err.message || 'Failed to load My Recipe Box.'))
      .finally(() => setLoading(false));
  }, [user]);

  // Load posts whenever selected box changes
  useEffect(() => {
    if (!selectedBoxId) return;
    setPostsLoading(true);
    setError(null);
    api
      .get(`/boxes/${selectedBoxId}`)
      .then((res) => {
        const data = res.data ?? res;
        setPosts(data.posts ?? data.entries ?? []);
      })
      .catch((err) => setError(err.message || 'Failed to load recipes.'))
      .finally(() => setPostsLoading(false));
  }, [selectedBoxId, retryKey]);

  const recipeBox = boxes.find((b) => b.box_type === 'liked');
  const subBoxes = boxes
    .filter((b) => b.box_type !== 'liked')
    .sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.name.localeCompare(b.name);
    });
  const selectedBox = boxes.find((b) => b.id === selectedBoxId);
  const isViewingRecipeBox = selectedBoxId === recipeBox?.id;

  async function handleRemove(postId) {
    if (!selectedBoxId) return;

    if (isViewingRecipeBox) {
      // Show cascade warning first
      setRemoveTarget(postId);
      return;
    }

    // Sub-box: remove directly
    try {
      await api.delete(`/posts/${postId}/save/${selectedBoxId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Removed from list.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove recipe.');
    }
  }

  async function confirmCascadeRemove() {
    if (!removeTarget || !recipeBox) return;
    setRemoveLoading(true);
    try {
      await api.delete(`/posts/${removeTarget}/save/${recipeBox.id}`);
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
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-1">My Recipe Box</h1>
        <p className="text-text-muted">
          {isViewingRecipeBox
            ? 'Every recipe you\'ve saved, all in one place.'
            : `Viewing your "${selectedBox?.name}" list.`}
        </p>
      </div>

      {/* View selector */}
      {boxes.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <label htmlFor="box-filter" className="text-sm font-medium text-text-muted whitespace-nowrap">
            View
          </label>
          <select
            id="box-filter"
            value={selectedBoxId ?? ''}
            onChange={(e) => setSelectedBoxId(Number(e.target.value))}
            className="border border-border rounded-md px-3 py-1.5 text-sm bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-cta"
          >
            {recipeBox && (
              <option value={recipeBox.id}>All Recipes (My Recipe Box)</option>
            )}
            {subBoxes.map((box) => (
              <option key={box.id} value={box.id}>{box.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="py-8 text-center">
          <p className="text-text-muted mb-3">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts grid */}
      {!error && (
        postsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p>No recipes saved yet.</p>
            <p className="text-sm mt-1">
              Browse the{' '}
              <Link to="/explore" className="text-accent hover:underline">
                Explore page
              </Link>{' '}
              to find recipes to save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                <PostCard post={post} />
                <button
                  onClick={() => handleRemove(post.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-surface-raised/90 border border-border rounded-full text-text-muted hover:text-red-400 hover:border-red-400/60 flex items-center justify-center text-base leading-none transition-colors opacity-0 group-hover:opacity-100"
                  title={isViewingRecipeBox ? 'Remove from My Recipe Box' : `Remove from ${selectedBox?.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Cascade remove confirmation dialog */}
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
