import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

function PostRow({ posts }) {
  if (posts.length === 0) {
    return (
      <p className="text-warm-brown text-sm py-4">
        No trending recipes yet — be the first to cook something!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const [mostSaved, setMostSaved] = useState([]);
  const [mostCooked, setMostCooked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/explore');
      const data = res.data ?? res;
      setMostSaved(data.most_saved ?? []);
      setMostCooked(data.most_cooked ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load explore page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-1">Explore</h1>
        <p className="text-warm-brown">Discover what the CookBook community is saving and cooking.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-warm-brown mb-3">{error}</p>
          <button
            onClick={load}
            className="text-sm text-burnt-orange hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-ink">Most Saved</h2>
              <span className="text-sm text-warm-brown">— last 30 days</span>
            </div>
            <PostRow posts={mostSaved} />
          </section>

          <section>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-xl font-bold text-ink">Most Cooked</h2>
              <span className="text-sm text-warm-brown">— last 30 days</span>
            </div>
            <PostRow posts={mostCooked} />
          </section>
        </div>
      )}
    </div>
  );
}
