/**
 * Application footer component for the CSNP Member Portal.
 * Displays copyright information, simulated environment disclaimer,
 * and reference date. Includes accessible landmark role.
 * @module Footer
 */

import { REFERENCE_DATE } from '../../utils/constants.js';

/**
 * Footer component that renders the application footer with copyright,
 * a simulated environment disclaimer, and the reference date used
 * for date calculations throughout the application.
 *
 * @returns {JSX.Element} The footer element.
 */
export function Footer() {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'CSNP Member Portal';
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-csnp-neutral-200 bg-csnp-neutral-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-csnp-neutral-600">
            &copy; {currentYear} {appTitle}. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="text-xs text-csnp-neutral-500">
              <span
                className="inline-flex items-center gap-1 rounded-md bg-csnp-warning px-2 py-0.5 text-xs font-semibold text-yellow-900"
                aria-label="Simulated environment disclaimer"
              >
                <span aria-hidden="true">⚠</span>
                Simulated Environment
              </span>
              {' '}— This portal uses mock data for demonstration purposes only.
            </p>
            <p className="text-xs text-csnp-neutral-400">
              Reference Date: <time dateTime={REFERENCE_DATE}>{REFERENCE_DATE}</time>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;