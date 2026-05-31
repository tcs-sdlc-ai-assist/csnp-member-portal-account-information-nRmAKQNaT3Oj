/**
 * Communication preferences management page for the CSNP Member Portal.
 * Includes paperless delivery toggle with verified email display,
 * and per-category notification preferences (Coverage Info, Processed Requests,
 * Health & Wellness) with Text/Email/Both channel selection.
 * Changes trigger simulated CDM update and NCompass validation via notificationService.
 * Persists to localStorage via MemberDataContext.
 * @module CommunicationPreferencesPage
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useMemberData } from '../../contexts/MemberDataContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { sendPreferenceUpdateNotification } from '../../services/notificationService.js';
import { maskEmail } from '../../utils/masking.js';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '../../utils/constants.js';

/**
 * Human-readable labels for notification categories.
 * @type {Object<string, string>}
 */
const CATEGORY_LABELS = {
  [NOTIFICATION_CATEGORIES.COVERAGE_INFO]: 'Coverage Information',
  [NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS]: 'Processed Requests',
  [NOTIFICATION_CATEGORIES.HEALTH_WELLNESS]: 'Health & Wellness',
};

/**
 * Human-readable labels for notification channels.
 * @type {Object<string, string>}
 */
const CHANNEL_LABELS = {
  [NOTIFICATION_CHANNELS.TEXT]: 'Text',
  [NOTIFICATION_CHANNELS.EMAIL]: 'Email',
  [NOTIFICATION_CHANNELS.BOTH]: 'Both',
};

/**
 * Icons for notification categories.
 * @type {Object<string, string>}
 */
const CATEGORY_ICONS = {
  [NOTIFICATION_CATEGORIES.COVERAGE_INFO]: '📋',
  [NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS]: '📄',
  [NOTIFICATION_CATEGORIES.HEALTH_WELLNESS]: '💚',
};

/**
 * Descriptions for notification categories.
 * @type {Object<string, string>}
 */
const CATEGORY_DESCRIPTIONS = {
  [NOTIFICATION_CATEGORIES.COVERAGE_INFO]: 'Receive updates about your coverage details, benefits, and plan changes.',
  [NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS]: 'Get notified when your requests, claims, or changes have been processed.',
  [NOTIFICATION_CATEGORIES.HEALTH_WELLNESS]: 'Stay informed about health tips, wellness programs, and preventive care reminders.',
};

/**
 * CommunicationPreferencesPage component that renders the communication
 * preferences management interface. Provides paperless delivery toggle,
 * email verification display, and per-category notification channel selection.
 *
 * @returns {JSX.Element} The communication preferences settings page element.
 */
export function CommunicationPreferencesPage() {
  const { getVerifiedEmail, currentUser } = useAuth();
  const { communicationPreferences, updateCommunicationPreferences, personalInfo } = useMemberData();
  const { showNotification } = useNotification();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  const verifiedEmail = getVerifiedEmail();
  const maskedEmailDisplay = maskEmail(personalInfo.email || verifiedEmail);

  /**
   * Handles toggling the paperless delivery preference.
   */
  const handleTogglePaperless = useCallback(() => {
    setIsUpdating(true);

    const newValue = !communicationPreferences.paperless;
    const result = updateCommunicationPreferences({ paperless: newValue });

    if (result.success) {
      const notifResult = sendPreferenceUpdateNotification(
        'paperless',
        personalInfo.email || verifiedEmail,
        personalInfo.phone || ''
      );

      showNotification(
        newValue
          ? 'Paperless delivery has been enabled.'
          : 'Paperless delivery has been disabled.',
        'success'
      );

      if (notifResult && notifResult.ncompassValidation && notifResult.ncompassValidation.warnings.length > 0) {
        showNotification(
          'CDM/NCompass: ' + notifResult.ncompassValidation.warnings.join(' '),
          'warning'
        );
      }
    } else {
      showNotification(
        result.error || 'Failed to update paperless delivery setting.',
        'error'
      );
    }

    setIsUpdating(false);
  }, [communicationPreferences.paperless, updateCommunicationPreferences, showNotification, personalInfo.email, personalInfo.phone, verifiedEmail]);

  /**
   * Handles starting email verification edit.
   */
  const handleStartEditEmail = useCallback(() => {
    setEmailInput(personalInfo.email || verifiedEmail || '');
    setEmailError('');
    setIsEditingEmail(true);
  }, [personalInfo.email, verifiedEmail]);

  /**
   * Handles cancelling email verification edit.
   */
  const handleCancelEditEmail = useCallback(() => {
    setIsEditingEmail(false);
    setEmailInput('');
    setEmailError('');
  }, []);

  /**
   * Handles saving the verified email.
   */
  const handleSaveEmail = useCallback(() => {
    const trimmed = emailInput.trim();

    if (!trimmed) {
      setEmailError('Email address is required.');
      return;
    }

    const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailPattern.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    const result = updateCommunicationPreferences({ verifiedEmail: true });

    if (result.success) {
      showNotification('Email address verified successfully.', 'success');
      setIsEditingEmail(false);
      setEmailInput('');
      setEmailError('');
    } else {
      showNotification(result.error || 'Failed to verify email address.', 'error');
    }
  }, [emailInput, updateCommunicationPreferences, showNotification]);

  /**
   * Handles toggling a notification category enabled/disabled.
   * @param {number} categoryIndex - The index of the category in the categories array.
   */
  const handleToggleCategory = useCallback((categoryIndex) => {
    setIsUpdating(true);

    const updatedCategories = communicationPreferences.categories.map((cat, index) => {
      if (index === categoryIndex) {
        return { ...cat, enabled: !cat.enabled };
      }
      return { ...cat };
    });

    const result = updateCommunicationPreferences({ categories: updatedCategories });

    if (result.success) {
      const category = updatedCategories[categoryIndex];
      const categoryLabel = CATEGORY_LABELS[category.category] || category.category;

      const notifResult = sendPreferenceUpdateNotification(
        categoryLabel,
        personalInfo.email || verifiedEmail,
        personalInfo.phone || ''
      );

      showNotification(
        category.enabled
          ? `${categoryLabel} notifications have been enabled.`
          : `${categoryLabel} notifications have been disabled.`,
        'success'
      );

      if (notifResult && notifResult.ncompassValidation && notifResult.ncompassValidation.warnings.length > 0) {
        showNotification(
          'CDM/NCompass: ' + notifResult.ncompassValidation.warnings.join(' '),
          'warning'
        );
      }
    } else {
      showNotification(
        result.error || 'Failed to update notification preference.',
        'error'
      );
    }

    setIsUpdating(false);
  }, [communicationPreferences.categories, updateCommunicationPreferences, showNotification, personalInfo.email, personalInfo.phone, verifiedEmail]);

  /**
   * Handles changing the notification channel for a category.
   * @param {number} categoryIndex - The index of the category in the categories array.
   * @param {string} newChannel - The new channel value.
   */
  const handleChangeChannel = useCallback((categoryIndex, newChannel) => {
    setIsUpdating(true);

    const updatedCategories = communicationPreferences.categories.map((cat, index) => {
      if (index === categoryIndex) {
        return { ...cat, channel: newChannel };
      }
      return { ...cat };
    });

    const result = updateCommunicationPreferences({ categories: updatedCategories });

    if (result.success) {
      const category = updatedCategories[categoryIndex];
      const categoryLabel = CATEGORY_LABELS[category.category] || category.category;
      const channelLabel = CHANNEL_LABELS[newChannel] || newChannel;

      const notifResult = sendPreferenceUpdateNotification(
        `${categoryLabel} channel`,
        personalInfo.email || verifiedEmail,
        personalInfo.phone || ''
      );

      showNotification(
        `${categoryLabel} delivery channel updated to ${channelLabel}.`,
        'success'
      );

      if (notifResult && notifResult.ncompassValidation && notifResult.ncompassValidation.warnings.length > 0) {
        showNotification(
          'CDM/NCompass: ' + notifResult.ncompassValidation.warnings.join(' '),
          'warning'
        );
      }
    } else {
      showNotification(
        result.error || 'Failed to update notification channel.',
        'error'
      );
    }

    setIsUpdating(false);
  }, [communicationPreferences.categories, updateCommunicationPreferences, showNotification, personalInfo.email, personalInfo.phone, verifiedEmail]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-csnp-neutral-800">
          Communication Preferences
        </h2>
        <p className="mt-1 text-sm text-csnp-neutral-500">
          Manage how you receive notifications and communications from CSNP. All settings are simulated for demonstration purposes.
        </p>
      </div>

      <div className="space-y-6">
        {/* Paperless Delivery */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">📬</span>
                <h3 className="text-sm font-semibold text-csnp-neutral-800">
                  Paperless Delivery
                </h3>
              </div>
              <p className="mt-1 text-sm text-csnp-neutral-500">
                Opt in to receive all communications electronically instead of by mail. Requires a verified email address.
              </p>
              <p className="mt-2 text-xs text-csnp-neutral-400">
                <span aria-hidden="true">ℹ</span>{' '}
                This is a simulated setting. No real delivery changes are applied.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <span
                className={`text-xs font-medium ${
                  communicationPreferences.paperless
                    ? 'text-green-700'
                    : 'text-csnp-neutral-500'
                }`}
                aria-hidden="true"
              >
                {communicationPreferences.paperless ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={communicationPreferences.paperless}
                aria-label={`Paperless delivery is currently ${communicationPreferences.paperless ? 'enabled' : 'disabled'}. Click to ${communicationPreferences.paperless ? 'disable' : 'enable'}.`}
                onClick={handleTogglePaperless}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  communicationPreferences.paperless
                    ? 'bg-csnp-success'
                    : 'bg-csnp-neutral-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    communicationPreferences.paperless
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Verified Email */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className="text-lg">✉️</span>
            <h3 className="text-sm font-semibold text-csnp-neutral-800">
              Verified Email Address
            </h3>
          </div>
          <p className="text-sm text-csnp-neutral-500 mb-3">
            Your verified email is used for electronic communications and paperless delivery.
          </p>

          {!isEditingEmail ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 px-4 py-2">
                  <span className="text-sm text-csnp-neutral-700">
                    {maskedEmailDisplay}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    communicationPreferences.verifiedEmail
                      ? 'bg-green-50 text-green-800'
                      : 'bg-yellow-50 text-yellow-900'
                  }`}
                >
                  {communicationPreferences.verifiedEmail ? 'Verified' : 'Not Verified'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartEditEmail}
                className="rounded-md border border-csnp-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                aria-label="Edit verified email address"
              >
                {communicationPreferences.verifiedEmail ? 'Update Email' : 'Verify Email'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="verified-email"
                  className="block text-sm font-medium text-csnp-neutral-700"
                >
                  Email Address
                </label>
                <input
                  id="verified-email"
                  type="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                    emailError
                      ? 'border-csnp-error focus:border-csnp-error'
                      : 'border-csnp-neutral-300 focus:border-csnp-secondary'
                  }`}
                  placeholder="Enter your email address"
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'verified-email-error' : undefined}
                />
                {emailError && (
                  <p id="verified-email-error" className="mt-1 text-xs text-red-600">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEditEmail}
                  className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Cancel email verification"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmail}
                  className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Verify email address"
                >
                  Verify Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className="text-lg">🔔</span>
            <h3 className="text-sm font-semibold text-csnp-neutral-800">
              Notification Preferences
            </h3>
          </div>
          <p className="text-sm text-csnp-neutral-500 mb-4">
            Choose how you want to receive notifications for each category. Changes are saved automatically and trigger a simulated CDM/NCompass update.
          </p>

          <div className="space-y-4">
            {communicationPreferences.categories.map((cat, index) => {
              const categoryLabel = CATEGORY_LABELS[cat.category] || cat.category;
              const categoryIcon = CATEGORY_ICONS[cat.category] || '📌';
              const categoryDescription = CATEGORY_DESCRIPTIONS[cat.category] || '';

              return (
                <div
                  key={cat.category}
                  className="rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="text-base">{categoryIcon}</span>
                        <h4 className="text-sm font-semibold text-csnp-neutral-800">
                          {categoryLabel}
                        </h4>
                      </div>
                      {categoryDescription && (
                        <p className="mt-1 text-xs text-csnp-neutral-500">
                          {categoryDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span
                        className={`text-xs font-medium ${
                          cat.enabled
                            ? 'text-green-700'
                            : 'text-csnp-neutral-500'
                        }`}
                        aria-hidden="true"
                      >
                        {cat.enabled ? 'On' : 'Off'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cat.enabled}
                        aria-label={`${categoryLabel} notifications are currently ${cat.enabled ? 'enabled' : 'disabled'}. Click to ${cat.enabled ? 'disable' : 'enable'}.`}
                        onClick={() => handleToggleCategory(index)}
                        disabled={isUpdating}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          cat.enabled
                            ? 'bg-csnp-success'
                            : 'bg-csnp-neutral-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            cat.enabled
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {cat.enabled && (
                    <div className="mt-3 border-t border-csnp-neutral-200 pt-3">
                      <label
                        htmlFor={`channel-${cat.category}`}
                        className="block text-xs font-medium text-csnp-neutral-600 mb-1"
                      >
                        Delivery Channel
                      </label>
                      <select
                        id={`channel-${cat.category}`}
                        value={cat.channel}
                        onChange={(e) => handleChangeChannel(index, e.target.value)}
                        disabled={isUpdating}
                        className="block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs sm:text-sm"
                        aria-label={`Select delivery channel for ${categoryLabel}`}
                      >
                        {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Preferences Summary */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-5">
          <h3 className="text-sm font-semibold text-csnp-neutral-700">
            Current Preferences Summary
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-csnp-neutral-200 bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Paperless Delivery
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    communicationPreferences.paperless
                      ? 'bg-green-50 text-green-800'
                      : 'bg-csnp-neutral-100 text-csnp-neutral-600'
                  }`}
                >
                  {communicationPreferences.paperless ? 'Enabled' : 'Disabled'}
                </span>
              </dd>
            </div>
            <div className="rounded-md border border-csnp-neutral-200 bg-white p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Email Verification
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    communicationPreferences.verifiedEmail
                      ? 'bg-green-50 text-green-800'
                      : 'bg-yellow-50 text-yellow-900'
                  }`}
                >
                  {communicationPreferences.verifiedEmail ? 'Verified' : 'Not Verified'}
                </span>
              </dd>
            </div>
            {communicationPreferences.categories.map((cat) => {
              const categoryLabel = CATEGORY_LABELS[cat.category] || cat.category;
              const channelLabel = CHANNEL_LABELS[cat.channel] || cat.channel;

              return (
                <div key={cat.category} className="rounded-md border border-csnp-neutral-200 bg-white p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                    {categoryLabel}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                        cat.enabled
                          ? 'bg-green-50 text-green-800'
                          : 'bg-csnp-neutral-100 text-csnp-neutral-600'
                      }`}
                    >
                      {cat.enabled ? 'On' : 'Off'}
                    </span>
                    {cat.enabled && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {channelLabel}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-md bg-csnp-neutral-50 p-4">
          <p className="text-xs text-csnp-neutral-500">
            <span aria-hidden="true">⚠</span>{' '}
            This is a simulated environment. Communication preferences shown here are for demonstration purposes only. Changes trigger simulated CDM data updates and NCompass validation but do not affect real notification delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommunicationPreferencesPage;