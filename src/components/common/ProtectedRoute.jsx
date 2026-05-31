/**
 * Route guard component for the CSNP Member Portal.
 * Checks authentication state via useAuth hook and redirects
 * unauthenticated users to the login page.
 * Wraps all member-only routes.
 * @module ProtectedRoute
 */

import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * ProtectedRoute component that guards member-only routes.
 * If the user is not authenticated, redirects to the login page
 * while preserving the attempted location for post-login redirect.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected content to render when authenticated.
 * @param {string} [props.redirectTo='/login'] - The path to redirect unauthenticated users to.
 * @returns {JSX.Element} The children if authenticated, or a Navigate redirect if not.
 */
export function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;