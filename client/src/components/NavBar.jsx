import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream border-b border-warm-tan shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-burnt-orange hover:text-burnt-orange-dark shrink-0"
        >
          CookBook
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search recipes…"
            className="w-full px-4 py-1.5 text-sm bg-cream-dark border border-warm-tan rounded-full text-ink placeholder-warm-brown/60 focus:outline-none focus:border-burnt-orange"
          />
        </div>

        {/* Auth-dependent actions */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link
                to="/posts/new"
                className="px-3 py-1.5 text-sm font-medium bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark transition-colors"
              >
                + New Recipe
              </Link>
              <Link
                to={`/users/${user.id}`}
                className="text-sm font-medium text-ink hover:text-burnt-orange transition-colors"
              >
                {user.display_name || user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-warm-brown hover:text-ink transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink hover:text-burnt-orange transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-sm font-medium bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
