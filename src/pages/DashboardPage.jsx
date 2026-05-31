/**
 * Dashboard landing page for the CSNP Member Portal.
 * Displays welcome message with masked member name, quick links
 * to account settings sections, and simulated environment disclaimer banner.
 * @module DashboardPage
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { REFERENCE_DATE } from '../utils/constants.js';

/**
 * Quick link items for navigating to account settings sections.
 * @type {Array<{label: string, path: string, icon: string, description: string}>}
 */
const QUICK_LINKS = [
  {
    label: 'Personal Info',
    path: '/account-settings/personal-info',
    icon: '👤',
    description: 'View and update your personal information, contact details, and mailing address.',
  },
  {
    label: 'Representatives',
    path: '/account-settings/representatives',
    icon: '👥',
    description: 'Manage your authorized representatives and their access permissions.',
  },
  {
    label: 'Privacy & Security',
    path: '/account-settings/privacy-security',
    icon: '🔒',
    description: 'Configure two-factor authentication and communication consent settings.',
  },
  {
    label: 'Communication Preferences',
    path: '/account-settings/communication-preferences',
    icon: '📧',
    description: 'Set your notification preferences and opt into paperless communications.',
  },
  {
    label: 'PCP Management',
    path: '/account-settings/pcp-management',
    icon: '🏥',
    description: 'View your current PCP, search for providers, and request PCP changes.',
  },
  {
    label: 'Care Manager',
    path: '/account-settings/care-manager',
    icon: '💊',
    description: 'View your assigned care manager and their contact information.',
  },
];

/**
 * DashboardPage component that renders the member dashboard.
 * Shows a welcome message with the masked member name, a simulated
 * environment disclaimer banner, and quick links to account settings sections.
 *
 * @returns {JSX.Element} The dashboard page element.
 */
export function DashboardPage() {
  const { getMaskedPII, currentUser } = useAuth();

  const maskedPII = getMaskedPII();
  const displayName = maskedPII ? maskedPII.name : '';
  const maskedMemberId = maskedPII ? maskedPII.memberId : '****';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Simulated Environment Disclaimer Banner */}
      <div
        role="status"
        aria-label="Simulated environment disclaimer"
        className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-csnp-warning text-sm font-bold text-yellow-900"
          >
            ⚠
          </span>
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              Simulated Environment
            </p>
            <p className="mt-0.5 text-xs text-yellow-800">
              This portal uses mock data for demonstration purposes only. No real member data is displayed or stored.
              Reference Date: <time dateTime={REFERENCE_DATE}>{REFERENCE_DATE}</time>
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-csnp-neutral-800">
          Welcome{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="mt-2 text-sm text-csnp-neutral-500">
          Member ID: <span className="font-medium text-csnp-neutral-600">{maskedMemberId}</span>
        </p>
        {currentUser?.vccStatus && (
          <p className="mt-1 text-sm text-csnp-neutral-500">
            VCC Status:{' '}
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                currentUser.vccStatus === 'ATTESTED'
                  ? 'bg-green-50 text-green-800'
                  : currentUser.vccStatus === 'PENDING'
                    ? 'bg-yellow-50 text-yellow-900'
                    : currentUser.vccStatus === 'DECLINED'
                      ? 'bg-red-50 text-red-800'
                      : 'bg-csnp-neutral-100 text-csnp-neutral-600'
              }`}
            >
              {currentUser.vccStatus}
            </span>
          </p>
        )}
      </div>

      {/* Quick Links Section */}
      <section aria-label="Quick links to account settings">
        <h2 className="mb-4 text-xl font-semibold text-csnp-neutral-700">
          Account Settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-csnp-secondary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
              aria-label={`Go to ${link.label}`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-csnp-neutral-50 text-xl transition-colors group-hover:bg-csnp-secondary group-hover:text-white"
                >
                  {link.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-csnp-neutral-800 group-hover:text-csnp-secondary">
                    {link.label}
                  </h3>
                  <p className="mt-1 text-xs text-csnp-neutral-500">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;