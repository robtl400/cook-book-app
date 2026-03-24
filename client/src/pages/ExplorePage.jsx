import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'most_saved', label: 'Most Saved' },
  { value: 'most_cooked', label: 'Most Cooked' },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(sortValue) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/explore?sort=${sortValue}`);
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load explore page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(sort);
  }, [sort]);

  const subtitle = sort === 'recent'
    ? 'Discover the latest recipes from the CookBook community.'
    : `Discover what the CookBook community is ${sort === 'most_saved' ? 'saving' : 'cooking'} — last 30 days.`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-1">Explore</h1>
        <p className="text-text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="explore-sort" className="text-sm font-medium text-text-muted whitespace-nowrap">
          Sort by
        </label>
        <select
          id="explore-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-border rounded px-3 py-1.5 text-sm bg-surface-input text-text focus:outline-none focus:ring-2 focus:ring-cta"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-text-muted mb-3">{error}</p>
          <button
            onClick={() => load(sort)}
            className="text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-semibold text-text mb-2">Nothing here yet</h2>
          <p className="text-text-muted text-sm mb-6 max-w-xs">
            Be the first to share a recipe with the community.
          </p>
          <Link
            to={user ? '/posts/new' : '/register'}
            className="px-5 py-2 bg-cta text-white rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {user ? '+ Post a Recipe' : 'Sign up to post'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
