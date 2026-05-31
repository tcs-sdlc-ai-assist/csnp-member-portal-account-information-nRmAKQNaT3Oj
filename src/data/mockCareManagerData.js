/**
 * Mock Care Manager data for the CSNP Member Portal.
 * Contains care manager information for display in the care manager feature.
 * @module mockCareManagerData
 */

import { REFERENCE_DATE } from '../utils/constants.js';

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
 * Care manager assignments keyed by user ID from mockUsers.
 * @type {Object<string, CareManager>}
 */
export const careManagerByUser = {
  'usr-001': {
    name: 'Rebecca Taylor, RN, CCM',
    phone: '(555) 700-1001',
    email: 'r.taylor@csnpcare.test',
    assignedDate: '2023-02-01',
    specialty: 'Chronic Disease Management',
    organization: 'CSNP Care Coordination Services',
  },
  'usr-002': {
    name: 'Marcus Johnson, MSW, CCM',
    phone: '(555) 700-2002',
    email: 'm.johnson@csnpcare.test',
    assignedDate: '2023-07-15',
    specialty: 'Behavioral Health Integration',
    organization: 'CSNP Care Coordination Services',
  },
  'usr-003': {
    name: 'Diane Foster, RN, CCM',
    phone: '(555) 700-3003',
    email: 'd.foster@csnpcare.test',
    assignedDate: '2022-12-01',
    specialty: 'Geriatric Care Management',
    organization: 'CSNP Care Coordination Services',
  },
  'usr-004': {
    name: 'Steven Park, LCSW, CCM',
    phone: '(555) 700-4004',
    email: 's.park@csnpcare.test',
    assignedDate: '2024-03-01',
    specialty: 'Transitional Care',
    organization: 'CSNP Care Coordination Services',
  },
  'usr-005': {
    name: 'Laura Martinez, RN, CCM',
    phone: '(555) 700-5005',
    email: 'l.martinez@csnpcare.test',
    assignedDate: '2023-10-01',
    specialty: 'Chronic Disease Management',
    organization: 'CSNP Care Coordination Services',
  },
};

/**
 * Default care manager info returned when no user-specific care manager is found.
 * @type {CareManager}
 */
export const defaultCareManager = {
  name: 'Rebecca Taylor, RN, CCM',
  phone: '(555) 700-1001',
  email: 'r.taylor@csnpcare.test',
  assignedDate: '2023-02-01',
  specialty: 'Chronic Disease Management',
  organization: 'CSNP Care Coordination Services',
};

/**
 * Retrieves the care manager info for a given user ID.
 * Falls back to defaultCareManager if the user ID is not found.
 * @param {string} userId - The user ID to look up.
 * @returns {CareManager} The care manager info for the user.
 */
export function getCareManagerForUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return { ...defaultCareManager };
  }
  const careManager = careManagerByUser[userId];
  return careManager ? { ...careManager } : { ...defaultCareManager };
}

export default {
  careManagerByUser,
  defaultCareManager,
  getCareManagerForUser,
};