/**
 * Care manager data service module for the CSNP Member Portal.
 * Exports getCareManager function that retrieves care manager info
 * from localStorage or falls back to mock data.
 * Applies masking to contact info in display context.
 * @module careManagerService
 */

import { getItem } from '../utils/storage.js';
import { CARE_MANAGER_KEY } from '../utils/constants.js';
import { getCareManagerForUser } from '../data/mockCareManagerData.js';
import { maskEmail, maskPhone } from '../utils/masking.js';

/**
 * @typedef {object} CareManager
 * @property {string} name - Care manager full name with credentials.
 * @property {string} phone - Care manager phone number.
 * @property {string} email - Care manager email address.
 * @property {string} assignedDate - Date the care manager was assigned (ISO 8601).
 * @property {string} specialty - Care manager specialty or focus area.
 * @property {string} organization - Care manager organization or employer.
 */

/**
 * @typedef {object} MaskedCareManager
 * @property {string} name - Care manager full name with credentials (unmasked).
 * @property {string} phone - Care manager phone number (masked).
 * @property {string} email - Care manager email address (masked).
 * @property {string} assignedDate - Date the care manager was assigned (ISO 8601).
 * @property {string} specialty - Care manager specialty or focus area.
 * @property {string} organization - Care manager organization or employer.
 */

/**
 * Retrieves the care manager info for a given user.
 * Checks localStorage first, then falls back to mock data.
 * @param {string} userId - The user ID to look up.
 * @returns {CareManager|null} The care manager info, or null if not found.
 */
export function getCareManager(userId) {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const persisted = getItem(CARE_MANAGER_KEY, null);
    if (persisted && typeof persisted === 'object' && persisted.name) {
      return persisted;
    }
  } catch (_e) {
    // Fall through to mock data
  }

  const careManager = getCareManagerForUser(userId);
  if (careManager && careManager.name) {
    return careManager;
  }

  return null;
}

/**
 * Retrieves the care manager info with masked contact information for display context.
 * Applies masking to phone and email fields.
 * @param {string} userId - The user ID to look up.
 * @returns {MaskedCareManager|null} The care manager info with masked contact fields, or null if not found.
 */
export function getMaskedCareManager(userId) {
  const careManager = getCareManager(userId);

  if (!careManager) {
    return null;
  }

  return {
    name: careManager.name || '',
    phone: maskPhone(careManager.phone),
    email: maskEmail(careManager.email),
    assignedDate: careManager.assignedDate || '',
    specialty: careManager.specialty || '',
    organization: careManager.organization || '',
  };
}

/**
 * Retrieves the unmasked care manager contact info for authenticated contexts.
 * Returns the full phone and email without masking.
 * @param {string} userId - The user ID to look up.
 * @returns {CareManager|null} The care manager info with unmasked contact fields, or null if not found.
 */
export function getCareManagerContact(userId) {
  const careManager = getCareManager(userId);

  if (!careManager) {
    return null;
  }

  return {
    name: careManager.name || '',
    phone: careManager.phone || '',
    email: careManager.email || '',
    assignedDate: careManager.assignedDate || '',
    specialty: careManager.specialty || '',
    organization: careManager.organization || '',
  };
}

export default {
  getCareManager,
  getMaskedCareManager,
  getCareManagerContact,
};