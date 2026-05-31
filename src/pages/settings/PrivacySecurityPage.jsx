/**
 * Privacy and security settings page for the CSNP Member Portal.
 * Displays toggles for two-factor authentication (simulated) and
 * communication consent. Toggle changes update simulated data via
 * MemberDataContext. UI feedback confirms changes via NotificationContext.
 * No real security enforcement.
 * @module PrivacySecurityPage
 */

import { useState, useCallback } from 'react';
import { useMemberData } from '../../contexts/MemberDataContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * PrivacySecurityPage component that renders the privacy and security
 * settings interface. Provides toggles for two-factor authentication
 * and communication consent with immediate persistence and UI feedback.
 *
 * @returns {JSX.Element} The privacy and security settings page element.
 */
export function PrivacySecurityPage() {
  const { privacySettings, updatePrivacySettings } = useMemberData();
  const { showNotification } = useNotification();

  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Handles toggling the two-factor authentication setting.
   */
  const handleToggle2FA = useCallback(() => {
    setIsUpdating(true);

    const newValue = !privacySettings.twoFAEnabled;
    const result = updatePrivacySettings({ twoFAEnabled: newValue });

    if (result.success) {
      showNotification(
        newValue
          ? 'Two-factor authentication has been enabled.'
          : 'Two-factor authentication has been disabled.',
        'success'
      );
    } else {
      showNotification(
        result.error || 'Failed to update two-factor authentication setting.',
        'error'
      );
    }

    setIsUpdating(false);
  }, [privacySettings.twoFAEnabled, updatePrivacySettings, showNotification]);

  /**
   * Handles toggling the communication consent setting.
   */
  const handleToggleCommunicationConsent = useCallback(() => {
    setIsUpdating(true);

    const newValue = !privacySettings.communicationConsent;
    const result = updatePrivacySettings({ communicationConsent: newValue });

    if (result.success) {
      showNotification(
        newValue
          ? 'Communication consent has been granted.'
          : 'Communication consent has been revoked.',
        'success'
      );
    } else {
      showNotification(
        result.error || 'Failed to update communication consent setting.',
        'error'
      );
    }

    setIsUpdating(false);
  }, [privacySettings.communicationConsent, updatePrivacySettings, showNotification]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-csnp-neutral-800">
          Privacy & Security
        </h2>
        <p className="mt-1 text-sm text-csnp-neutral-500">
          Manage your privacy and security preferences. All settings are simulated for demonstration purposes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Two-Factor Authentication */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">🔐</span>
                <h3 className="text-sm font-semibold text-csnp-neutral-800">
                  Two-Factor Authentication (2FA)
                </h3>
              </div>
              <p className="mt-1 text-sm text-csnp-neutral-500">
                Add an extra layer of security to your account by requiring a second form of verification when signing in.
              </p>
              <p className="mt-2 text-xs text-csnp-neutral-400">
                <span aria-hidden="true">ℹ</span>{' '}
                This is a simulated setting. No real 2FA is enforced.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <span
                className={`text-xs font-medium ${
                  privacySettings.twoFAEnabled
                    ? 'text-green-700'
                    : 'text-csnp-neutral-500'
                }`}
                aria-hidden="true"
              >
                {privacySettings.twoFAEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={privacySettings.twoFAEnabled}
                aria-label={`Two-factor authentication is currently ${privacySettings.twoFAEnabled ? 'enabled' : 'disabled'}. Click to ${privacySettings.twoFAEnabled ? 'disable' : 'enable'}.`}
                onClick={handleToggle2FA}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  privacySettings.twoFAEnabled
                    ? 'bg-csnp-success'
                    : 'bg-csnp-neutral-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    privacySettings.twoFAEnabled
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Communication Consent */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">📬</span>
                <h3 className="text-sm font-semibold text-csnp-neutral-800">
                  Communication Consent
                </h3>
              </div>
              <p className="mt-1 text-sm text-csnp-neutral-500">
                Allow CSNP to send you communications regarding your health plan, benefits, and important updates.
              </p>
              <p className="mt-2 text-xs text-csnp-neutral-400">
                <span aria-hidden="true">ℹ</span>{' '}
                Revoking consent may limit the notifications and updates you receive.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <span
                className={`text-xs font-medium ${
                  privacySettings.communicationConsent
                    ? 'text-green-700'
                    : 'text-csnp-neutral-500'
                }`}
                aria-hidden="true"
              >
                {privacySettings.communicationConsent ? 'Granted' : 'Revoked'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={privacySettings.communicationConsent}
                aria-label={`Communication consent is currently ${privacySettings.communicationConsent ? 'granted' : 'revoked'}. Click to ${privacySettings.communicationConsent ? 'revoke' : 'grant'}.`}
                onClick={handleToggleCommunicationConsent}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  privacySettings.communicationConsent
                    ? 'bg-csnp-success'
                    : 'bg-csnp-neutral-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    privacySettings.communicationConsent
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-5">
          <h3 className="text-sm font-semibold text-csnp-neutral-700">
            Current Settings Summary
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-csnp-neutral-200 bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Two-Factor Authentication
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    privacySettings.twoFAEnabled
                      ? 'bg-green-50 text-green-800'
                      : 'bg-csnp-neutral-100 text-csnp-neutral-600'
                  }`}
                >
                  {privacySettings.twoFAEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </dd>
            </div>
            <div className="rounded-md border border-csnp-neutral-200 bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Communication Consent
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    privacySettings.communicationConsent
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {privacySettings.communicationConsent ? 'Granted' : 'Revoked'}
                </span>
              </dd>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-md bg-csnp-neutral-50 p-4">
          <p className="text-xs text-csnp-neutral-500">
            <span aria-hidden="true">⚠</span>{' '}
            This is a simulated environment. Privacy and security settings shown here are for demonstration purposes only. No real security enforcement or data protection changes are applied.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacySecurityPage;