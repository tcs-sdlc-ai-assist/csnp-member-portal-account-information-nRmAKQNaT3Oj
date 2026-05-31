/**
 * PCP management service module for the CSNP Member Portal.
 * Exports getPCP, changePCP, getChangeStatus, getPCPList (Doctor Hospital Finder).
 * Reads/writes PCP data from localStorage via storage utility.
 * Simulates change confirmation and turnaround time.
 * Integrates with notificationService for failure email simulation.
 * @module pcpService
 */

import { getItem, setItem } from '../utils/storage.js';
import { PCP_INFO_KEY, PCP_CHANGE_KEY, PCP_CHANGE_REASONS } from '../utils/constants.js';
import {
  getPCPForUser,
  getAvailableProviders,
  pcpChangeStatusTemplates,
} from '../data/mockPCPData.js';
import { sendPCPChangeNotification } from './notificationService.js';

/**
 * @typedef {object} PCP
 * @property {string} name - Provider full name with credentials.
 * @property {string} npi - National Provider Identifier (10-digit).
 * @property {string} address - Provider office address.
 * @property {string} phone - Provider office phone number.
 * @property {string} effectiveDate - Date the PCP assignment became effective (ISO 8601).
 * @property {string} specialty - Provider specialty.
 * @property {string} group - Provider group or practice name.
 */

/**
 * @typedef {object} PCPChangeResult
 * @property {string} status - 'success' or 'failure'.
 * @property {object} [confirmation] - Confirmation details on success.
 * @property {PCP} [confirmation.pcp] - The new PCP info.
 * @property {string} [confirmation.turnaroundTime] - Estimated turnaround time.
 * @property {string} [error] - Error message on failure.
 */

/**
 * @typedef {object} PCPChangeStatus
 * @property {string} status - Current status of the PCP change request ('NONE', 'PENDING', 'APPROVED', 'DENIED').
 * @property {string} requestedDate - Date the change was requested (ISO 8601).
 * @property {string} effectiveDate - Date the change will take effect (ISO 8601).
 * @property {string} reason - Reason for the PCP change.
 * @property {string} newProviderName - Name of the requested new provider.
 * @property {string} newProviderNpi - NPI of the requested new provider.
 */

/**
 * Default turnaround time for PCP change requests.
 * @type {string}
 */
const TURNAROUND_TIME = '2 business days';

/**
 * Retrieves the current PCP information for a given user.
 * Checks localStorage first, then falls back to mock data.
 * @param {string} userId - The user ID to look up.
 * @returns {PCP|null} The current PCP info, or null if not found.
 */
export function getPCP(userId) {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const persisted = getItem(PCP_INFO_KEY, null);
    if (persisted && typeof persisted === 'object' && persisted.name) {
      return persisted;
    }
  } catch (_e) {
    // Fall through to mock data
  }

  const pcp = getPCPForUser(userId);
  if (pcp && pcp.name) {
    return pcp;
  }

  return null;
}

/**
 * Retrieves the current PCP change request status.
 * Checks localStorage first, then returns default 'NONE' status.
 * @returns {PCPChangeStatus} The current PCP change status.
 */
export function getChangeStatus() {
  try {
    const persisted = getItem(PCP_CHANGE_KEY, null);
    if (persisted && typeof persisted === 'object' && persisted.status) {
      return persisted;
    }
  } catch (_e) {
    // Fall through to default
  }

  return { ...pcpChangeStatusTemplates.none };
}

/**
 * Retrieves the list of available providers for the Doctor Hospital Finder.
 * Supports optional filtering by specialty, acceptingNewPatients, and gender.
 * @param {object} [filters] - Optional filter criteria.
 * @param {string} [filters.specialty] - Filter by specialty (case-insensitive).
 * @param {boolean} [filters.acceptingNewPatients] - Filter by accepting new patients.
 * @param {string} [filters.gender] - Filter by provider gender (case-insensitive).
 * @returns {import('../data/mockPCPData.js').AvailableProvider[]} Filtered list of available providers.
 */
export function getPCPList(filters) {
  return getAvailableProviders(filters);
}

/**
 * Initiates a PCP change request.
 * Validates inputs, simulates outcome (80% success, 20% failure),
 * persists result to localStorage, and sends notification on failure.
 * @param {object} newPCP - The new PCP to change to.
 * @param {string} newPCP.npi - The NPI of the new provider.
 * @param {string} newPCP.name - The name of the new provider.
 * @param {string} [newPCP.specialty] - The specialty of the new provider.
 * @param {string} [newPCP.address] - The address of the new provider.
 * @param {string} [newPCP.phone] - The phone of the new provider.
 * @param {string} [newPCP.group] - The group of the new provider.
 * @param {string} reason - The reason for the PCP change.
 * @param {string} [otherReason] - Free text reason if reason is 'Other'.
 * @param {string} [recipientEmail] - The member's email for failure notification.
 * @param {string} [recipientPhone] - The member's phone for failure notification.
 * @returns {PCPChangeResult} The result of the PCP change request.
 */
export function changePCP(newPCP, reason, otherReason, recipientEmail, recipientPhone) {
  // Validate reason
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return {
      status: 'failure',
      error: 'Reason is required.',
    };
  }

  const trimmedReason = reason.trim();

  // Validate 'Other' reason requires free text of at least 5 characters
  if (trimmedReason === 'Other') {
    if (!otherReason || typeof otherReason !== 'string' || otherReason.trim().length < 5) {
      return {
        status: 'failure',
        error: 'Other reason must be at least 5 characters.',
      };
    }
  }

  // Validate newPCP
  if (!newPCP || typeof newPCP !== 'object') {
    return {
      status: 'failure',
      error: 'New PCP selection is required.',
    };
  }

  if (!newPCP.npi || typeof newPCP.npi !== 'string' || !newPCP.npi.trim()) {
    return {
      status: 'failure',
      error: 'New provider NPI is required.',
    };
  }

  if (!newPCP.name || typeof newPCP.name !== 'string' || !newPCP.name.trim()) {
    return {
      status: 'failure',
      error: 'New provider name is required.',
    };
  }

  // Verify the provider exists in the available providers list
  const allProviders = getAvailableProviders();
  const selectedProvider = allProviders.find((p) => p.npi === newPCP.npi.trim());

  if (!selectedProvider) {
    return {
      status: 'failure',
      error: 'Selected provider not found in available providers.',
    };
  }

  if (!selectedProvider.acceptingNewPatients) {
    return {
      status: 'failure',
      error: 'Selected provider is not accepting new patients.',
    };
  }

  // Check for existing pending request
  const currentStatus = getChangeStatus();
  if (currentStatus.status === 'PENDING') {
    return {
      status: 'failure',
      error: 'A PCP change request is already pending.',
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const effectiveDate = new Date();
  effectiveDate.setMonth(effectiveDate.getMonth() + 1);
  effectiveDate.setDate(1);
  const effectiveDateStr = effectiveDate.toISOString().split('T')[0];

  const resolvedReason = trimmedReason === 'Other' ? otherReason.trim() : trimmedReason;

  // Simulate outcome: 80% success, 20% failure
  const outcome = Math.random() < 0.8 ? 'success' : 'failure';

  if (outcome === 'success') {
    const newPCPInfo = {
      name: selectedProvider.name,
      npi: selectedProvider.npi,
      address: selectedProvider.address,
      phone: selectedProvider.phone,
      effectiveDate: effectiveDateStr,
      specialty: selectedProvider.specialty,
      group: selectedProvider.group,
    };

    const changeStatus = {
      status: 'PENDING',
      requestedDate: today,
      effectiveDate: effectiveDateStr,
      reason: resolvedReason,
      newProviderName: selectedProvider.name,
      newProviderNpi: selectedProvider.npi,
    };

    try {
      setItem(PCP_CHANGE_KEY, changeStatus);
    } catch (_e) {
      // Storage write failed; continue with in-memory result
    }

    return {
      status: 'success',
      confirmation: {
        pcp: newPCPInfo,
        turnaroundTime: TURNAROUND_TIME,
      },
    };
  } else {
    const failedChangeStatus = {
      status: 'DENIED',
      requestedDate: today,
      effectiveDate: '',
      reason: resolvedReason,
      newProviderName: selectedProvider.name,
      newProviderNpi: selectedProvider.npi,
    };

    try {
      setItem(PCP_CHANGE_KEY, failedChangeStatus);
    } catch (_e) {
      // Storage write failed; continue with in-memory result
    }

    // Send failure notification via notificationService
    try {
      sendPCPChangeNotification(
        {
          reason: resolvedReason,
          newProviderName: selectedProvider.name,
          newProviderNpi: selectedProvider.npi,
          effectiveDate: 'N/A',
        },
        recipientEmail || '',
        recipientPhone || ''
      );
    } catch (_e) {
      // Notification send failed; continue with result
    }

    return {
      status: 'failure',
      error: 'Simulated PCP change failed. Notification sent to member email.',
    };
  }
}

/**
 * Resets the PCP change status to 'NONE'.
 * Used to allow retry after a failed PCP change request.
 * @returns {boolean} True if the reset was successful.
 */
export function resetChangeStatus() {
  try {
    const noneStatus = { ...pcpChangeStatusTemplates.none };
    setItem(PCP_CHANGE_KEY, noneStatus);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Retrieves the list of valid PCP change reasons.
 * @returns {string[]} The list of valid PCP change reasons.
 */
export function getChangeReasons() {
  return [...PCP_CHANGE_REASONS];
}

export default {
  getPCP,
  changePCP,
  getChangeStatus,
  getPCPList,
  resetChangeStatus,
  getChangeReasons,
};