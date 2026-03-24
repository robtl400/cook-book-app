import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Search } from 'lucide-react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const menuDidMount = useRef(false);

  // Close hamburger on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Focus first menu item when menu opens; return focus to hamburger on close.
  // Skip the initial mount run so the hamburger doesn't steal focus on page load.
  useEffect(() => {
    if (!menuDidMount.current) { menuDidMount.current = true; return; }
    if (menuOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector('a, button');
      firstFocusable?.focus();
    } else if (!menuOpen && hamburgerRef.current) {
      hamburgerRef.current.focus();
    }
  }, [menuOpen]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path ? 'text-accent' : 'text-text-muted hover:text-accent'
    }`;

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

        {/* Desktop nav links — horizontal */}
        {user && (
          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <Link to="/feed" className={navLinkClass('/feed')}>Feed</Link>
            <Link to="/explore" className={navLinkClass('/explore')}>Explore</Link>
            <Link to="/recipe-box" className={navLinkClass('/recipe-box')}>My Recipe Box</Link>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-sm relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search recipes…"
            className="w-full pl-4 pr-10 py-2 text-sm bg-surface-input border border-border rounded-full text-text placeholder-text-dim focus:outline-none focus:border-cta min-h-[44px]"
          />
          <button
            onClick={handleSearchSubmit}
            className="absolute right-3 text-text-dim hover:text-accent transition-colors"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
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
                className="hidden sm:block text-sm text-text-muted hover:text-text transition-colors min-h-[44px] px-1"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:flex text-sm font-medium text-text hover:text-accent transition-colors min-h-[44px] items-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex items-center min-h-[44px] px-3 py-2 text-sm font-medium bg-cta text-white rounded-sm hover:bg-cta-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            ref={hamburgerRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-text-muted hover:text-text transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          id="nav-mobile-menu"
          ref={menuRef}
          role="navigation"
          aria-label="Mobile navigation"
          className="sm:hidden absolute top-16 left-0 right-0 bg-surface-nav border-b border-border z-40 flex flex-col py-2"
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setMenuOpen(false); return; }
            if (e.key !== 'Tab') return;
            const focusable = menuRef.current.querySelectorAll('a, button');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            if (!menuRef.current.contains(active)) return;
            if (e.shiftKey && active === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && active === last) {
              e.preventDefault();
              first.focus();
            }
          }}
        >
          {user ? (
            <>
              <Link
                to="/feed"
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium ${location.pathname === '/feed' ? 'text-accent' : 'text-text-muted'}`}
              >
                Feed
              </Link>
              <Link
                to="/explore"
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium ${location.pathname === '/explore' ? 'text-accent' : 'text-text-muted'}`}
              >
                Explore
              </Link>
              <Link
                to="/recipe-box"
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium ${location.pathname === '/recipe-box' ? 'text-accent' : 'text-text-muted'}`}
              >
                My Recipe Box
              </Link>
              <div className="border-t border-border-subtle my-1" />
              <Link
                to={`/users/${user.id}`}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3 text-sm font-medium text-text-muted"
              >
                {user.display_name || user.username}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="px-5 py-3 text-sm font-medium text-text-muted text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3 text-sm font-medium text-text-muted"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3 text-sm font-medium text-text-muted"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
