/**
 * Simulated notification integration service for the CSNP Member Portal.
 * Simulates CDM data update and NCompass validation flows.
 * Returns static success/failure responses with UI hints.
 * Used by communication preferences and PCP change flows.
 * @module notificationService
 */

import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '../utils/constants.js';

/**
 * @typedef {'email' | 'text' | 'both'} NotificationChannel
 */

/**
 * @typedef {object} NotificationPayload
 * @property {string} category - The notification category (from NOTIFICATION_CATEGORIES).
 * @property {string} channel - The delivery channel (from NOTIFICATION_CHANNELS).
 * @property {string} message - The notification message content.
 * @property {string} [recipientEmail] - The recipient email address (for email channel).
 * @property {string} [recipientPhone] - The recipient phone number (for text channel).
 */

/**
 * @typedef {object} CDMUpdateResult
 * @property {boolean} success - Whether the simulated CDM update succeeded.
 * @property {string} message - A human-readable result message.
 * @property {string} timestamp - ISO 8601 timestamp of the simulated update.
 * @property {string} referenceId - A simulated reference/tracking ID.
 */

/**
 * @typedef {object} NCompassValidationResult
 * @property {boolean} valid - Whether the simulated NCompass validation passed.
 * @property {string} message - A human-readable validation message.
 * @property {string[]} warnings - Any validation warnings.
 */

/**
 * @typedef {object} NotificationResult
 * @property {boolean} success - Whether the notification was sent successfully.
 * @property {string} message - A human-readable result message.
 * @property {CDMUpdateResult} cdmUpdate - The simulated CDM update result.
 * @property {NCompassValidationResult} ncompassValidation - The simulated NCompass validation result.
 * @property {string} uiHint - A hint for the UI layer on how to display the result.
 */

/**
 * Valid notification categories set for quick lookup.
 * @type {Set<string>}
 */
const VALID_CATEGORIES = new Set(Object.values(NOTIFICATION_CATEGORIES));

/**
 * Valid notification channels set for quick lookup.
 * @type {Set<string>}
 */
const VALID_CHANNELS = new Set(Object.values(NOTIFICATION_CHANNELS));

/**
 * Generates a simulated reference ID for tracking.
 * @returns {string} A simulated reference ID.
 */
function generateReferenceId() {
  return 'REF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

/**
 * Generates an ISO 8601 timestamp string for the current time.
 * @returns {string} The current timestamp in ISO 8601 format.
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Simulates a CDM (Care Data Management) data update.
 * Always returns a successful result in the simulation.
 * @param {string} category - The notification category.
 * @param {string} channel - The delivery channel.
 * @returns {CDMUpdateResult} The simulated CDM update result.
 */
export function simulateCDMUpdate(category, channel) {
  return {
    success: true,
    message: `CDM data update simulated successfully for category "${category}" via channel "${channel}".`,
    timestamp: getCurrentTimestamp(),
    referenceId: generateReferenceId(),
  };
}

/**
 * Simulates NCompass validation for a notification payload.
 * Returns a valid result for known categories/channels; returns warnings for unknown values.
 * @param {NotificationPayload} payload - The notification payload to validate.
 * @returns {NCompassValidationResult} The simulated NCompass validation result.
 */
export function simulateNCompassValidation(payload) {
  const warnings = [];

  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      message: 'NCompass validation failed: invalid payload.',
      warnings: ['Payload is missing or malformed.'],
    };
  }

  if (!payload.category || !VALID_CATEGORIES.has(payload.category)) {
    warnings.push(`Unknown notification category: "${payload.category || ''}".`);
  }

  if (!payload.channel || !VALID_CHANNELS.has(payload.channel)) {
    warnings.push(`Unknown notification channel: "${payload.channel || ''}".`);
  }

  if (!payload.message || typeof payload.message !== 'string' || !payload.message.trim()) {
    warnings.push('Notification message is empty or missing.');
  }

  if (payload.channel === NOTIFICATION_CHANNELS.EMAIL || payload.channel === NOTIFICATION_CHANNELS.BOTH) {
    if (!payload.recipientEmail || typeof payload.recipientEmail !== 'string' || !payload.recipientEmail.trim()) {
      warnings.push('Recipient email is recommended for email channel delivery.');
    }
  }

  if (payload.channel === NOTIFICATION_CHANNELS.TEXT || payload.channel === NOTIFICATION_CHANNELS.BOTH) {
    if (!payload.recipientPhone || typeof payload.recipientPhone !== 'string' || !payload.recipientPhone.trim()) {
      warnings.push('Recipient phone is recommended for text channel delivery.');
    }
  }

  const valid = warnings.length === 0;

  return {
    valid,
    message: valid
      ? 'NCompass validation passed successfully.'
      : 'NCompass validation completed with warnings.',
    warnings,
  };
}

/**
 * Sends a simulated notification through the CDM/NCompass integration pipeline.
 * Validates the payload via simulated NCompass validation, then simulates a CDM data update.
 * Returns a combined result with UI hints for display.
 * @param {NotificationPayload} payload - The notification payload to send.
 * @returns {NotificationResult} The combined result of the simulated notification send.
 */
export function sendNotification(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      message: 'Notification failed: invalid payload provided.',
      cdmUpdate: {
        success: false,
        message: 'CDM update skipped due to invalid payload.',
        timestamp: getCurrentTimestamp(),
        referenceId: '',
      },
      ncompassValidation: {
        valid: false,
        message: 'NCompass validation failed: invalid payload.',
        warnings: ['Payload is missing or malformed.'],
      },
      uiHint: 'error',
    };
  }

  const category = payload.category || '';
  const channel = payload.channel || '';
  const message = payload.message || '';

  if (!category || !VALID_CATEGORIES.has(category)) {
    return {
      success: false,
      message: `Notification failed: unknown category "${category}".`,
      cdmUpdate: {
        success: false,
        message: 'CDM update skipped due to invalid category.',
        timestamp: getCurrentTimestamp(),
        referenceId: '',
      },
      ncompassValidation: simulateNCompassValidation(payload),
      uiHint: 'error',
    };
  }

  if (!channel || !VALID_CHANNELS.has(channel)) {
    return {
      success: false,
      message: `Notification failed: unknown channel "${channel}".`,
      cdmUpdate: {
        success: false,
        message: 'CDM update skipped due to invalid channel.',
        timestamp: getCurrentTimestamp(),
        referenceId: '',
      },
      ncompassValidation: simulateNCompassValidation(payload),
      uiHint: 'error',
    };
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      success: false,
      message: 'Notification failed: message content is required.',
      cdmUpdate: {
        success: false,
        message: 'CDM update skipped due to missing message.',
        timestamp: getCurrentTimestamp(),
        referenceId: '',
      },
      ncompassValidation: simulateNCompassValidation(payload),
      uiHint: 'error',
    };
  }

  const ncompassValidation = simulateNCompassValidation(payload);
  const cdmUpdate = simulateCDMUpdate(category, channel);

  const hasWarnings = ncompassValidation.warnings.length > 0;

  return {
    success: true,
    message: hasWarnings
      ? 'Notification sent successfully with warnings.'
      : 'Notification sent successfully.',
    cdmUpdate,
    ncompassValidation,
    uiHint: hasWarnings ? 'warning' : 'success',
  };
}

/**
 * Sends a simulated PCP change notification through the CDM/NCompass pipeline.
 * Convenience wrapper around sendNotification for PCP change flows.
 * @param {object} pcpChangeDetails - Details of the PCP change request.
 * @param {string} pcpChangeDetails.reason - The reason for the PCP change.
 * @param {string} pcpChangeDetails.newProviderName - The name of the new provider.
 * @param {string} pcpChangeDetails.newProviderNpi - The NPI of the new provider.
 * @param {string} pcpChangeDetails.effectiveDate - The effective date of the change.
 * @param {string} [recipientEmail] - The member's email address.
 * @param {string} [recipientPhone] - The member's phone number.
 * @returns {NotificationResult} The combined result of the simulated notification send.
 */
export function sendPCPChangeNotification(pcpChangeDetails, recipientEmail, recipientPhone) {
  if (!pcpChangeDetails || typeof pcpChangeDetails !== 'object') {
    return sendNotification(null);
  }

  const message = `Your PCP change request has been submitted. New provider: ${pcpChangeDetails.newProviderName || 'Unknown'}` +
    ` (NPI: ${pcpChangeDetails.newProviderNpi || 'N/A'}).` +
    ` Reason: ${pcpChangeDetails.reason || 'Not specified'}.` +
    ` Effective date: ${pcpChangeDetails.effectiveDate || 'Pending'}.`;

  const payload = {
    category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
    channel: NOTIFICATION_CHANNELS.BOTH,
    message,
    recipientEmail: recipientEmail || '',
    recipientPhone: recipientPhone || '',
  };

  return sendNotification(payload);
}

/**
 * Sends a simulated communication preference update notification.
 * Convenience wrapper around sendNotification for preference change flows.
 * @param {string} preferenceType - The type of preference that was updated (e.g., 'paperless', 'category').
 * @param {string} [recipientEmail] - The member's email address.
 * @param {string} [recipientPhone] - The member's phone number.
 * @returns {NotificationResult} The combined result of the simulated notification send.
 */
export function sendPreferenceUpdateNotification(preferenceType, recipientEmail, recipientPhone) {
  const message = `Your communication preference "${preferenceType || 'general'}" has been updated successfully.`;

  const payload = {
    category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
    channel: NOTIFICATION_CHANNELS.EMAIL,
    message,
    recipientEmail: recipientEmail || '',
    recipientPhone: recipientPhone || '',
  };

  return sendNotification(payload);
}

export default {
  sendNotification,
  sendPCPChangeNotification,
  sendPreferenceUpdateNotification,
  simulateCDMUpdate,
  simulateNCompassValidation,
};