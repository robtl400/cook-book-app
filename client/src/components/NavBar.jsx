import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-nav border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link
          to={user ? '/feed' : '/'}
          className="text-3xl font-bold leading-none text-accent hover:text-accent-dark shrink-0"
        >
          CookBook
        </Link>

        {/* Stacked Feed + Explore links */}
        <div className="hidden sm:flex flex-col shrink-0">
          {user && (
            <Link
              to="/feed"
              className={`text-xs font-medium leading-tight transition-colors ${
                location.pathname === '/feed' ? 'text-accent' : 'text-text-muted hover:text-accent'
              }`}
            >
              Feed
            </Link>
          )}
          <Link
            to="/explore"
            className={`text-xs font-medium leading-tight transition-colors ${
              location.pathname === '/explore' ? 'text-accent' : 'text-text-muted hover:text-accent'
            }`}
          >
            Explore
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search recipes…"
            className="w-full px-4 py-2 text-sm bg-surface-input border border-border rounded-full text-text placeholder-text-dim focus:outline-none focus:border-cta min-h-[44px]"
          />
        </div>

        {/* Auth-dependent actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              <Link
                to="/posts/new"
                className="flex items-center min-h-[44px] px-3 py-2 text-sm font-medium bg-cta text-white rounded-sm hover:bg-cta-dark transition-colors"
                aria-label="New Recipe"
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ New Recipe</span>
              </Link>
              <Link
                to={`/users/${user.id}`}
                className="hidden sm:block text-sm font-medium text-text hover:text-accent transition-colors max-w-[120px] truncate"
              >
                {user.display_name || user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-text-muted hover:text-text transition-colors min-h-[44px] px-1"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-text hover:text-accent transition-colors min-h-[44px] flex items-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex items-center min-h-[44px] px-3 py-2 text-sm font-medium bg-cta text-white rounded-sm hover:bg-cta-dark transition-colors"
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
