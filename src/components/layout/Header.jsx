/**
 * Application header component for the CSNP Member Portal.
 * Displays CSNP branding, navigation links, masked member name,
 * and logout button when authenticated.
 * Fully keyboard navigable with proper ARIA roles.
 * @module Header
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Header component that renders the application header with branding,
 * navigation links (Dashboard, Account Settings), masked member name,
 * and a logout button for authenticated users.
 *
 * @returns {JSX.Element} The header element.
 */
export function Header() {
  const { isAuthenticated, currentUser, getMaskedPII, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appTitle = import.meta.env.VITE_APP_TITLE || 'CSNP Member Portal';

  /**
   * Handles logout action: logs out the user and navigates to login page.
   */
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  /**
   * Determines if a given path is the current active route.
   * @param {string} path - The path to check.
   * @returns {boolean} True if the path matches the current location.
   */
  function isActive(path) {
    return location.pathname === path;
  }

  const maskedPII = isAuthenticated ? getMaskedPII() : null;
  const displayName = maskedPII ? maskedPII.name : '';

  return (
    <header
      role="banner"
      className="bg-csnp-primary text-white shadow-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-lg font-bold tracking-wide text-white transition-colors hover:text-csnp-accent-light focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary"
            aria-label={`${appTitle} - Go to ${isAuthenticated ? 'dashboard' : 'login'}`}
          >
            <span aria-hidden="true" className="text-xl">⚕</span>
            <span>{appTitle}</span>
          </Link>
        </div>

        {isAuthenticated && (
          <nav aria-label="Main navigation" className="hidden sm:flex sm:items-center sm:gap-1">
            <Link
              to="/dashboard"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary ${
                isActive('/dashboard')
                  ? 'bg-csnp-primary-dark text-white'
                  : 'text-csnp-neutral-200 hover:bg-csnp-primary-light hover:text-white'
              }`}
              aria-current={isActive('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <Link
              to="/account-settings"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary ${
                isActive('/account-settings')
                  ? 'bg-csnp-primary-dark text-white'
                  : 'text-csnp-neutral-200 hover:bg-csnp-primary-light hover:text-white'
              }`}
              aria-current={isActive('/account-settings') ? 'page' : undefined}
            >
              Account Settings
            </Link>
          </nav>
        )}

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            {displayName && (
              <span
                className="hidden text-sm text-csnp-neutral-200 md:inline-block"
                aria-label={`Logged in as ${displayName}`}
              >
                {displayName}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-csnp-primary-dark px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-csnp-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary"
              aria-label="Log out of your account"
            >
              Logout
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex items-center">
            <Link
              to="/login"
              className="rounded-md bg-csnp-secondary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-csnp-primary-light px-4 py-2 sm:hidden"
        >
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary ${
                isActive('/dashboard')
                  ? 'bg-csnp-primary-dark text-white'
                  : 'text-csnp-neutral-200 hover:bg-csnp-primary-light hover:text-white'
              }`}
              aria-current={isActive('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <Link
              to="/account-settings"
              className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 focus:ring-offset-csnp-primary ${
                isActive('/account-settings')
                  ? 'bg-csnp-primary-dark text-white'
                  : 'text-csnp-neutral-200 hover:bg-csnp-primary-light hover:text-white'
              }`}
              aria-current={isActive('/account-settings') ? 'page' : undefined}
            >
              Account Settings
            </Link>
          </div>
          {displayName && (
            <p
              className="mt-2 text-center text-xs text-csnp-neutral-300"
              aria-label={`Logged in as ${displayName}`}
            >
              {displayName}
            </p>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;