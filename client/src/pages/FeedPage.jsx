import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

const LIMIT = 20;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async (currentOffset, append = false) => {
    try {
      const data = await api.get(`/posts/feed?limit=${LIMIT}&offset=${currentOffset}`);
      const results = data.data ?? data;
      setPosts((prev) => (append ? [...prev, ...results] : results));
      setHasMore(results.length === LIMIT);
      setOffset(currentOffset + results.length);
    } catch (err) {
      setError(err.message || 'Failed to load feed.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPosts(0, false).finally(() => setLoading(false));
  }, [loadPosts]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadPosts(offset, true);
    setLoadingMore(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Your Feed</h1>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-10 text-warm-brown">
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-warm-brown">
          <p className="text-lg mb-2">Your feed is empty.</p>
          <p className="text-sm">
            Follow some cooks to fill your feed! Check out the{' '}
            <Link to="/explore" className="text-burnt-orange hover:underline font-medium">
              Explore page
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 border border-warm-tan text-warm-brown rounded-lg hover:border-burnt-orange hover:text-burnt-orange disabled:opacity-60 transition-colors text-sm font-medium"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
