/**
 * Login page component for the CSNP Member Portal.
 * Renders username/password form with accessible labels, error messages,
 * and submit button. On submit, calls useAuth().login with credentials.
 * Displays error feedback for invalid credentials.
 * Redirects to dashboard on success. All authentication is simulated.
 * @module LoginPage
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * LoginPage component that renders the login form.
 * Handles form submission, validation, error display, and redirect on success.
 *
 * @returns {JSX.Element} The login page element.
 */
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  /**
   * Redirect to dashboard (or intended destination) if already authenticated.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /**
   * Handles form submission. Validates inputs, calls login, and handles result.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError('Username is required.');
      return;
    }

    if (!trimmedPassword) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);

    const result = login(trimmedUsername, trimmedPassword);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid username or password.');
      setIsSubmitting(false);
    }
  }

  const appTitle = import.meta.env.VITE_APP_TITLE || 'CSNP Member Portal';

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span aria-hidden="true" className="text-5xl">⚕</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-csnp-neutral-800">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-csnp-neutral-500">
            {appTitle} — Simulated Environment
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-lg border border-csnp-neutral-200 bg-white p-8 shadow-sm"
          noValidate
        >
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-md border-l-4 border-csnp-error bg-red-50 p-4 text-sm text-red-800"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="flex-shrink-0 font-bold">✕</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm"
                placeholder="Enter your username"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm"
                placeholder="Enter your password"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
          </div>

          {error && (
            <p id="login-error" className="sr-only">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-csnp-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Sign in to your account"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <div className="rounded-md bg-csnp-neutral-50 p-4">
            <p className="text-xs font-medium text-csnp-neutral-600">
              <span aria-hidden="true">ℹ</span>{' '}
              This is a simulated environment. Use one of the pre-provisioned test accounts to sign in.
            </p>
            <div className="mt-2 space-y-1 text-xs text-csnp-neutral-500">
              <p><span className="font-semibold">Username:</span> jdoe &nbsp;|&nbsp; <span className="font-semibold">Password:</span> Password1!</p>
              <p><span className="font-semibold">Username:</span> bsmith &nbsp;|&nbsp; <span className="font-semibold">Password:</span> Password2!</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;