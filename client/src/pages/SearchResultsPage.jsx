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
      className="flex items-center gap-3 p-3 bg-white border border-warm-tan rounded-xl hover:border-burnt-orange/40 hover:shadow-sm transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-burnt-orange/20 flex items-center justify-center shrink-0 text-burnt-orange font-semibold overflow-hidden">
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
        <p className="font-semibold text-ink text-sm">{user.display_name || user.username}</p>
        <p className="text-xs text-warm-brown">@{user.username}</p>
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
          ? Promise.resolve({ data: [] })
          : api.get(`/search/recipes?q=${encodeURIComponent(q)}`),
        isAt
          ? api.get(`/search/users?q=${encodeURIComponent(stripped)}`)
          : Promise.resolve({ data: [] }),
      ]);

      setRecipes(recipeRes.data ?? []);
      setUsers(userRes.data ?? []);
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
      setRecipes(res.data ?? []);
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
      <h1 className="text-2xl font-bold text-ink mb-1">Search Results</h1>
      {query && (
        <p className="text-warm-brown text-sm mb-6">
          {activeTag
            ? `Filtered by tag: "${activeTag.name}"`
            : `Results for "${query}"`}
        </p>
      )}

      {!query ? (
        <p className="text-warm-brown">Enter a search term in the bar above.</p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Tag filter sidebar */}
          <aside className="sm:w-48 shrink-0">
            <p className="text-xs font-semibold text-warm-brown uppercase tracking-wide mb-3">
              Filter by tag
            </p>

            <div className="mb-4">
              <p className="text-xs text-warm-brown/70 mb-1.5">Cuisine</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.cuisine.map((name) => {
                  const isActive = activeTag?.name === name;
                  return (
                    <button
                      key={name}
                      onClick={() => handleTagClick({ name, category: 'cuisine' })}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-colors ${
                        isActive
                          ? 'bg-burnt-orange text-white border-burnt-orange'
                          : 'bg-white border-warm-tan text-warm-brown hover:border-burnt-orange hover:text-burnt-orange'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-warm-brown/70 mb-1.5">Dietary</p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.dietary.map((name) => {
                  const isActive = activeTag?.name === name;
                  return (
                    <button
                      key={name}
                      onClick={() => handleTagClick({ name, category: 'dietary' })}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-colors ${
                        isActive
                          ? 'bg-burnt-orange text-white border-burnt-orange'
                          : 'bg-white border-warm-tan text-warm-brown hover:border-burnt-orange hover:text-burnt-orange'
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
                <p className="text-warm-brown mb-3">{error}</p>
                <button
                  onClick={() => fetchResults(query)}
                  className="text-sm text-burnt-orange hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : !hasResults ? (
              <div className="py-16 text-center">
                <p className="text-lg text-ink mb-1">No results found</p>
                <p className="text-sm text-warm-brown">
                  {activeTag
                    ? `No recipes tagged "${activeTag.name}".`
                    : isUserSearch
                    ? `No users match "@${strippedQuery}".`
                    : `No recipes match "${query}". Try a tag filter or a different term.`}
                </p>
              </div>
            ) : (
              <>
                {users.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wide mb-3">
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
                      <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wide mb-3">
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
