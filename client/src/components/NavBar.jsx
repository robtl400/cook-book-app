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
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-burnt-orange hover:text-burnt-orange-dark shrink-0"
        >
          CookBook
        </Link>

        {/* Explore link — always visible */}
        <Link
          to="/explore"
          className="hidden sm:block text-sm font-medium text-warm-brown hover:text-burnt-orange transition-colors shrink-0"
        >
          Explore
        </Link>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search recipes…"
            className="w-full px-4 py-2 text-sm bg-cream-dark border border-warm-tan rounded-full text-ink placeholder-warm-brown/60 focus:outline-none focus:border-burnt-orange min-h-[44px]"
          />
        </div>

        {/* Auth-dependent actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              <Link
                to="/posts/new"
                className="flex items-center min-h-[44px] px-3 py-2 text-sm font-medium bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark transition-colors"
                aria-label="New Recipe"
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ New Recipe</span>
              </Link>
              <Link
                to={`/users/${user.id}`}
                className="hidden sm:block text-sm font-medium text-ink hover:text-burnt-orange transition-colors max-w-[120px] truncate"
              >
                {user.display_name || user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-warm-brown hover:text-ink transition-colors min-h-[44px] px-1"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink hover:text-burnt-orange transition-colors min-h-[44px] flex items-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex items-center min-h-[44px] px-3 py-2 text-sm font-medium bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark transition-colors"
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
