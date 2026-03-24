import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

const TAGS = {
  cuisine: ['italian', 'mexican', 'japanese', 'american', 'mediterranean'],
  dietary: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
};

function UserCard({ user }) {
  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-3 p-3 bg-surface-raised border border-border rounded hover:border-cta/40 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-cta/20 flex items-center justify-center shrink-0 text-accent font-semibold overflow-hidden">
        {user.profile_image_url ? (
          <img
            src={user.profile_image_url}
            alt={user.display_name || user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          (user.display_name || user.username || '?')[0].toUpperCase()
        )}
      </div>
      <div>
        <p className="font-semibold text-text text-sm">{user.display_name || user.username}</p>
        <p className="text-xs text-text-muted">@{user.username}</p>
      </div>
    </Link>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  const isUserSearch = query.startsWith('@');
  const strippedQuery = isUserSearch ? query.slice(1) : query;

  useEffect(() => {
    if (!query) return;
    setActiveTag(null);
    fetchResults(query);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function fetchResults(q) {
    setLoading(true);
    setError(null);
    try {
      const isAt = q.startsWith('@');
      const stripped = isAt ? q.slice(1) : q;

      if (!stripped) {
        setRecipes([]);
        setUsers([]);
        return;
      }

      const [recipeRes, userRes] = await Promise.all([
        isAt
          ? Promise.resolve([])
          : api.get(`/search/recipes?q=${encodeURIComponent(q)}`),
        isAt
          ? api.get(`/search/users?q=${encodeURIComponent(stripped)}`)
          : Promise.resolve([]),
      ]);

      setRecipes(recipeRes ?? []);
      setUsers(userRes ?? []);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleTagClick(tag) {
    if (activeTag?.name === tag.name) {
      setActiveTag(null);
      fetchResults(query);
      return;
    }
    setActiveTag(tag);
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/search/tags?tag=${encodeURIComponent(tag.name)}&category=${encodeURIComponent(tag.category)}`
      );
      setRecipes(res ?? []);
      setUsers([]);
    } catch (err) {
      setError(err.message || 'Failed to filter by tag.');
    } finally {
      setLoading(false);
    }
  }

  const hasResults = recipes.length > 0 || users.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text mb-1">Search Results</h1>
      {query && (
        <p className="text-text-muted text-sm mb-6">
          {activeTag
            ? `Filtered by tag: "${activeTag.name}"`
            : `Results for "${query}"`}
        </p>
      )}

      {!query ? (
        <p className="text-text-muted">Enter a search term in the bar above.</p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Tag filter sidebar */}
          <aside className="sm:w-48 shrink-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
              Filter by tag
            </p>

            <div className="mb-4">
              <p className="text-xs text-text-dim mb-1.5">Cuisine</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.cuisine.map((name) => {
                  const isActive = activeTag?.name === name;
                  return (
                    <button
                      key={name}
                      onClick={() => handleTagClick({ name, category: 'cuisine' })}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-colors ${
                        isActive
                          ? 'bg-accent text-white border-accent'
                          : 'bg-surface-input border-border text-text-muted hover:border-cta hover:text-accent'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-text-dim mb-1.5">Dietary</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.dietary.map((name) => {
                  const isActive = activeTag?.name === name;
                  return (
                    <button
                      key={name}
                      onClick={() => handleTagClick({ name, category: 'dietary' })}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-colors ${
                        isActive
                          ? 'bg-accent text-white border-accent'
                          : 'bg-surface-input border-border text-text-muted hover:border-cta hover:text-accent'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Spinner />
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-text-muted mb-3">{error}</p>
                <button
                  onClick={() => fetchResults(query)}
                  className="text-sm text-accent hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : !hasResults ? (
              <div className="py-16 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-text mb-2">No results found</h2>
                <p className="text-text-muted text-sm mb-6 max-w-xs mx-auto">
                  {activeTag
                    ? `No recipes tagged "${activeTag.name}". Try a different tag or search term.`
                    : isUserSearch
                    ? `No users match "@${strippedQuery}".`
                    : `No recipes match "${query}". Try a tag filter or a different term.`}
                </p>
                {!activeTag && !isUserSearch && (
                  <Link
                    to="/explore"
                    className="px-5 py-2 bg-cta text-white rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Browse Explore
                  </Link>
                )}
              </div>
            ) : (
              <>
                {users.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                      People
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {users.map((u) => (
                        <UserCard key={u.id} user={u} />
                      ))}
                    </div>
                  </section>
                )}

                {recipes.length > 0 && (
                  <section>
                    {users.length > 0 && (
                      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                        Recipes
                      </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recipes.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
