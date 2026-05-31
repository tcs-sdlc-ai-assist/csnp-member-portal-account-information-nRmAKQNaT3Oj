/**
 * React Context provider for authentication state management.
 * Manages login/logout, persists auth state to localStorage via storage utility,
 * exposes useAuth hook with login, logout, isAuthenticated, currentUser, and getMaskedPII.
 * @module AuthContext
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { mockUsers } from '../data/mockUsers.js';
import { maskAll } from '../utils/masking.js';
import { getItem, setItem, removeItem } from '../utils/storage.js';
import { AUTH_STATE_KEY } from '../utils/constants.js';

/**
 * @typedef {object} AuthState
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated.
 * @property {string|null} id - The authenticated user's ID.
 * @property {string|null} username - The authenticated user's username.
 * @property {string|null} name - The authenticated user's full name.
 * @property {string|null} email - The authenticated user's email address.
 * @property {string|null} phone - The authenticated user's phone number.
 * @property {string|null} address - The authenticated user's mailing address.
 * @property {string|null} memberId - The authenticated user's CSNP member ID.
 * @property {string|null} vccStatus - The authenticated user's VCC attestation status.
 */

/**
 * Default unauthenticated state.
 * @type {AuthState}
 */
const defaultAuthState = {
  isAuthenticated: false,
  id: null,
  username: null,
  name: null,
  email: null,
  phone: null,
  address: null,
  memberId: null,
  vccStatus: null,
};

/**
 * @typedef {object} AuthContextValue
 * @property {boolean} isAuthenticated - Whether the user is currently authenticated.
 * @property {AuthState} currentUser - The current authenticated user state.
 * @property {function(string, string): {success: boolean, error?: string}} login - Authenticates a user with username and password.
 * @property {function(): void} logout - Logs out the current user.
 * @property {function(): import('../utils/masking.js').MaskedPII} getMaskedPII - Returns masked PII for the current user.
 * @property {function(): string} getVerifiedEmail - Returns the full (unmasked) email for the current user.
 */

const AuthContext = createContext(null);

/**
 * Builds an auth state object from a mock user record.
 * @param {import('../data/mockUsers.js').MockUser} user - The mock user record.
 * @returns {AuthState} The auth state for the user.
 */
function buildAuthState(user) {
  return {
    isAuthenticated: true,
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    memberId: user.memberId,
    vccStatus: user.vccStatus,
  };
}

/**
 * Validates a persisted auth state object has the expected shape.
 * @param {*} state - The state to validate.
 * @returns {boolean} True if the state is valid.
 */
function isValidPersistedState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }
  if (state.isAuthenticated !== true) {
    return false;
  }
  if (!state.id || typeof state.id !== 'string') {
    return false;
  }
  if (!state.username || typeof state.username !== 'string') {
    return false;
  }
  return true;
}

/**
 * AuthProvider component that wraps the application and provides authentication state.
 * On mount, restores auth state from localStorage if available.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} The AuthContext provider wrapping children.
 */
export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const persisted = getItem(AUTH_STATE_KEY, null);
      if (isValidPersistedState(persisted)) {
        // Verify the persisted user still exists in mock data
        const user = mockUsers.find((u) => u.id === persisted.id);
        if (user) {
          return buildAuthState(user);
        }
      }
    } catch (_e) {
      // Corrupted state; fall through to default
    }
    return { ...defaultAuthState };
  });

  /**
   * Persists auth state to localStorage whenever it changes.
   */
  useEffect(() => {
    try {
      if (authState.isAuthenticated) {
        setItem(AUTH_STATE_KEY, authState);
      } else {
        removeItem(AUTH_STATE_KEY);
      }
    } catch (_e) {
      // Storage write failed; continue with in-memory state
    }
  }, [authState]);

  /**
   * Authenticates a user with the given username and password.
   * @param {string} username - The username to authenticate.
   * @param {string} password - The password to authenticate.
   * @returns {{success: boolean, error?: string}} Result of the login attempt.
   */
  const login = useCallback((username, password) => {
    if (!username || typeof username !== 'string') {
      return { success: false, error: 'Username is required.' };
    }
    if (!password || typeof password !== 'string') {
      return { success: false, error: 'Password is required.' };
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = mockUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const newState = buildAuthState(user);
    setAuthState(newState);
    return { success: true };
  }, []);

  /**
   * Logs out the current user and clears persisted state.
   */
  const logout = useCallback(() => {
    setAuthState({ ...defaultAuthState });
    try {
      removeItem(AUTH_STATE_KEY);
    } catch (_e) {
      // Storage removal failed; state is already cleared in memory
    }
  }, []);

  /**
   * Returns masked PII for the current authenticated user.
   * @returns {import('../utils/masking.js').MaskedPII} Masked PII fields.
   */
  const getMaskedPII = useCallback(() => {
    if (!authState.isAuthenticated) {
      return maskAll(null);
    }
    return maskAll({
      memberId: authState.memberId,
      email: authState.email,
      phone: authState.phone,
      name: authState.name,
      address: authState.address,
    });
  }, [authState]);

  /**
   * Returns the full (unmasked) email for the current authenticated user.
   * @returns {string} The user's email address, or empty string if not authenticated.
   */
  const getVerifiedEmail = useCallback(() => {
    if (!authState.isAuthenticated) {
      return '';
    }
    return authState.email || '';
  }, [authState]);

  const contextValue = {
    isAuthenticated: authState.isAuthenticated,
    currentUser: authState,
    login,
    logout,
    getMaskedPII,
    getVerifiedEmail,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider.
 * @returns {AuthContextValue} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

export default AuthContext;