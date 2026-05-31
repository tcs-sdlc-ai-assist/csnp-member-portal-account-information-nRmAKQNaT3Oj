/**
 * Application-wide constants for the CSNP Member Portal.
 * @module constants
 */

/**
 * Reference date used for date calculations throughout the application.
 * Can be overridden via the VITE_REFERENCE_DATE environment variable.
 * @type {string}
 */
export const REFERENCE_DATE = import.meta.env.VITE_REFERENCE_DATE || '2024-06-11';

/**
 * localStorage keys used for persisting application state.
 */
export const AUTH_STATE_KEY = 'csnp_auth_state';
export const MEMBER_DATA_KEY = 'csnp_member_data';
export const REPRESENTATIVES_KEY = 'csnp_representatives';
export const PRIVACY_SETTINGS_KEY = 'csnp_privacy_settings';
export const COMM_PREFS_KEY = 'csnp_comm_prefs';
export const PCP_INFO_KEY = 'csnp_pcp_info';
export const CARE_MANAGER_KEY = 'csnp_care_manager';
export const PCP_CHANGE_KEY = 'csnp_pcp_change';

/**
 * Notification categories for member communication preferences.
 * @enum {string}
 */
export const NOTIFICATION_CATEGORIES = {
  COVERAGE_INFO: 'COVERAGE_INFO',
  PROCESSED_REQUESTS: 'PROCESSED_REQUESTS',
  HEALTH_WELLNESS: 'HEALTH_WELLNESS',
};

/**
 * Notification channel options for member communication preferences.
 * @enum {string}
 */
export const NOTIFICATION_CHANNELS = {
  TEXT: 'TEXT',
  EMAIL: 'EMAIL',
  BOTH: 'BOTH',
};

/**
 * List of valid reasons a member may request a PCP change.
 * @type {string[]}
 */
export const PCP_CHANGE_REASONS = [
  'Relocation or moving to a new area',
  'Dissatisfaction with current PCP',
  'PCP no longer in network',
  'PCP retired or left practice',
  'Need a specialist as PCP',
  'Language or communication preference',
  'Schedule or availability conflicts',
  'Preference for a different gender provider',
  'Recommendation from family or friends',
  'Other',
];

/**
 * VCC (Voluntary Consent Confirmation) attestation statuses.
 * @enum {string}
 */
export const VCC_ATTESTATION_STATUSES = {
  PENDING: 'PENDING',
  ATTESTED: 'ATTESTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
};