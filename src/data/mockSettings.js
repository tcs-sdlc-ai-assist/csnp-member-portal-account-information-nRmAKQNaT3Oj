/**
 * Mock default settings data for the CSNP Member Portal.
 * Contains default privacy/security settings and communication preferences.
 * @module mockSettings
 */

import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from '../utils/constants.js';

/**
 * @typedef {object} PrivacySettings
 * @property {boolean} twoFAEnabled - Whether two-factor authentication is enabled.
 * @property {boolean} communicationConsent - Whether the member has consented to communications.
 */

/**
 * @typedef {object} CategoryPreference
 * @property {string} category - The notification category identifier.
 * @property {string} channel - The selected notification channel.
 * @property {boolean} enabled - Whether notifications for this category are enabled.
 */

/**
 * @typedef {object} CommunicationPreferences
 * @property {boolean} paperless - Whether the member has opted into paperless communications.
 * @property {boolean} verifiedEmail - Whether the member's email has been verified.
 * @property {CategoryPreference[]} categories - Notification category preferences.
 */

/**
 * Default privacy and security settings for a member.
 * @type {PrivacySettings}
 */
export const defaultPrivacySettings = {
  twoFAEnabled: false,
  communicationConsent: true,
};

/**
 * Default communication preferences for a member.
 * @type {CommunicationPreferences}
 */
export const defaultCommunicationPreferences = {
  paperless: false,
  verifiedEmail: false,
  categories: [
    {
      category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
      channel: NOTIFICATION_CHANNELS.EMAIL,
      enabled: true,
    },
    {
      category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
      channel: NOTIFICATION_CHANNELS.EMAIL,
      enabled: true,
    },
    {
      category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
      channel: NOTIFICATION_CHANNELS.BOTH,
      enabled: true,
    },
  ],
};

/**
 * Privacy settings keyed by user ID from mockUsers.
 * Falls back to defaultPrivacySettings for users not listed.
 * @type {Object<string, PrivacySettings>}
 */
export const privacySettingsByUser = {
  'usr-001': {
    twoFAEnabled: true,
    communicationConsent: true,
  },
  'usr-002': {
    twoFAEnabled: false,
    communicationConsent: true,
  },
  'usr-003': {
    twoFAEnabled: true,
    communicationConsent: false,
  },
  'usr-004': {
    twoFAEnabled: false,
    communicationConsent: false,
  },
  'usr-005': {
    twoFAEnabled: true,
    communicationConsent: true,
  },
};

/**
 * Communication preferences keyed by user ID from mockUsers.
 * Falls back to defaultCommunicationPreferences for users not listed.
 * @type {Object<string, CommunicationPreferences>}
 */
export const communicationPreferencesByUser = {
  'usr-001': {
    paperless: true,
    verifiedEmail: true,
    categories: [
      {
        category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
        channel: NOTIFICATION_CHANNELS.TEXT,
        enabled: true,
      },
    ],
  },
  'usr-002': {
    paperless: false,
    verifiedEmail: true,
    categories: [
      {
        category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        enabled: false,
      },
    ],
  },
  'usr-003': {
    paperless: true,
    verifiedEmail: true,
    categories: [
      {
        category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
    ],
  },
  'usr-004': {
    paperless: false,
    verifiedEmail: false,
    categories: [
      {
        category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
        channel: NOTIFICATION_CHANNELS.TEXT,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
        channel: NOTIFICATION_CHANNELS.TEXT,
        enabled: false,
      },
      {
        category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
        channel: NOTIFICATION_CHANNELS.TEXT,
        enabled: false,
      },
    ],
  },
  'usr-005': {
    paperless: true,
    verifiedEmail: true,
    categories: [
      {
        category: NOTIFICATION_CATEGORIES.COVERAGE_INFO,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.PROCESSED_REQUESTS,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
      {
        category: NOTIFICATION_CATEGORIES.HEALTH_WELLNESS,
        channel: NOTIFICATION_CHANNELS.BOTH,
        enabled: true,
      },
    ],
  },
};

/**
 * Deep clones a communication preferences object.
 * @param {CommunicationPreferences} prefs - The preferences to clone.
 * @returns {CommunicationPreferences} A deep copy of the preferences.
 */
function cloneCommunicationPreferences(prefs) {
  return {
    ...prefs,
    categories: prefs.categories.map((cat) => ({ ...cat })),
  };
}

/**
 * Retrieves the privacy settings for a given user ID.
 * Falls back to defaultPrivacySettings if the user ID is not found.
 * @param {string} userId - The user ID to look up.
 * @returns {PrivacySettings} The privacy settings for the user.
 */
export function getPrivacySettingsForUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return { ...defaultPrivacySettings };
  }
  const settings = privacySettingsByUser[userId];
  return settings ? { ...settings } : { ...defaultPrivacySettings };
}

/**
 * Retrieves the communication preferences for a given user ID.
 * Falls back to defaultCommunicationPreferences if the user ID is not found.
 * @param {string} userId - The user ID to look up.
 * @returns {CommunicationPreferences} The communication preferences for the user.
 */
export function getCommunicationPreferencesForUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return cloneCommunicationPreferences(defaultCommunicationPreferences);
  }
  const prefs = communicationPreferencesByUser[userId];
  return prefs
    ? cloneCommunicationPreferences(prefs)
    : cloneCommunicationPreferences(defaultCommunicationPreferences);
}

export default {
  defaultPrivacySettings,
  defaultCommunicationPreferences,
  privacySettingsByUser,
  communicationPreferencesByUser,
  getPrivacySettingsForUser,
  getCommunicationPreferencesForUser,
};