/**
 * Mock PCP (Primary Care Provider) and Doctor/Hospital Finder data
 * for the CSNP Member Portal.
 * Contains current PCP info, available providers for the finder,
 * and PCP change status templates.
 * @module mockPCPData
 */

import { REFERENCE_DATE, PCP_CHANGE_REASONS } from '../utils/constants.js';

/**
 * @typedef {object} PCPInfo
 * @property {string} name - Provider full name with credentials.
 * @property {string} npi - National Provider Identifier (10-digit).
 * @property {string} address - Provider office address.
 * @property {string} phone - Provider office phone number.
 * @property {string} effectiveDate - Date the PCP assignment became effective (ISO 8601).
 * @property {string} specialty - Provider specialty.
 * @property {string} group - Provider group or practice name.
 */

/**
 * @typedef {object} AvailableProvider
 * @property {string} id - Unique provider identifier.
 * @property {string} name - Provider full name with credentials.
 * @property {string} npi - National Provider Identifier (10-digit).
 * @property {string} address - Provider office address.
 * @property {string} phone - Provider office phone number.
 * @property {string} specialty - Provider specialty.
 * @property {string} group - Provider group or practice name.
 * @property {boolean} acceptingNewPatients - Whether the provider is accepting new patients.
 * @property {string[]} languages - Languages spoken by the provider.
 * @property {string} gender - Provider gender.
 * @property {number} distanceMiles - Distance from member in miles.
 */

/**
 * @typedef {object} PCPChangeStatus
 * @property {string} status - Current status of the PCP change request.
 * @property {string} requestedDate - Date the change was requested (ISO 8601).
 * @property {string} effectiveDate - Date the change will take effect (ISO 8601).
 * @property {string} reason - Reason for the PCP change.
 * @property {string} newProviderName - Name of the requested new provider.
 * @property {string} newProviderNpi - NPI of the requested new provider.
 */

/**
 * Current PCP information for mock users.
 * Keyed by user ID from mockUsers.
 * @type {Object<string, PCPInfo>}
 */
export const currentPCPByUser = {
  'usr-001': {
    name: 'Dr. Robert Chen, MD',
    npi: '1234567890',
    address: '100 Health Plaza, Suite 200, Springfield, IL 62701',
    phone: '(555) 600-1001',
    effectiveDate: '2023-01-15',
    specialty: 'Internal Medicine',
    group: 'Springfield Health Partners',
  },
  'usr-002': {
    name: 'Dr. Sarah Mitchell, DO',
    npi: '2345678901',
    address: '250 Wellness Drive, Shelbyville, IL 62565',
    phone: '(555) 600-2002',
    effectiveDate: '2023-06-01',
    specialty: 'Family Medicine',
    group: 'Shelbyville Medical Group',
  },
  'usr-003': {
    name: 'Dr. James Patel, MD',
    npi: '3456789012',
    address: '500 Capitol Medical Center, Capital City, IL 62702',
    phone: '(555) 600-3003',
    effectiveDate: '2022-11-20',
    specialty: 'Geriatric Medicine',
    group: 'Capitol City Health Network',
  },
  'usr-004': {
    name: 'Dr. Linda Nguyen, MD',
    npi: '4567890123',
    address: '75 Pine Medical Building, Ogdenville, IL 62550',
    phone: '(555) 600-4004',
    effectiveDate: '2024-02-01',
    specialty: 'Internal Medicine',
    group: 'Ogdenville Family Care',
  },
  'usr-005': {
    name: 'Dr. Michael Torres, DO',
    npi: '5678901234',
    address: '320 Birch Health Center, North Haverbrook, IL 62510',
    phone: '(555) 600-5005',
    effectiveDate: '2023-09-10',
    specialty: 'Family Medicine',
    group: 'Haverbrook Wellness Associates',
  },
};

/**
 * List of available providers for the Doctor/Hospital Finder.
 * @type {AvailableProvider[]}
 */
export const availableProviders = [
  {
    id: 'prov-001',
    name: 'Dr. Robert Chen, MD',
    npi: '1234567890',
    address: '100 Health Plaza, Suite 200, Springfield, IL 62701',
    phone: '(555) 600-1001',
    specialty: 'Internal Medicine',
    group: 'Springfield Health Partners',
    acceptingNewPatients: true,
    languages: ['English', 'Mandarin'],
    gender: 'Male',
    distanceMiles: 2.3,
  },
  {
    id: 'prov-002',
    name: 'Dr. Sarah Mitchell, DO',
    npi: '2345678901',
    address: '250 Wellness Drive, Shelbyville, IL 62565',
    phone: '(555) 600-2002',
    specialty: 'Family Medicine',
    group: 'Shelbyville Medical Group',
    acceptingNewPatients: true,
    languages: ['English'],
    gender: 'Female',
    distanceMiles: 5.1,
  },
  {
    id: 'prov-003',
    name: 'Dr. James Patel, MD',
    npi: '3456789012',
    address: '500 Capitol Medical Center, Capital City, IL 62702',
    phone: '(555) 600-3003',
    specialty: 'Geriatric Medicine',
    group: 'Capitol City Health Network',
    acceptingNewPatients: false,
    languages: ['English', 'Hindi', 'Gujarati'],
    gender: 'Male',
    distanceMiles: 8.7,
  },
  {
    id: 'prov-004',
    name: 'Dr. Linda Nguyen, MD',
    npi: '4567890123',
    address: '75 Pine Medical Building, Ogdenville, IL 62550',
    phone: '(555) 600-4004',
    specialty: 'Internal Medicine',
    group: 'Ogdenville Family Care',
    acceptingNewPatients: true,
    languages: ['English', 'Vietnamese'],
    gender: 'Female',
    distanceMiles: 12.4,
  },
  {
    id: 'prov-005',
    name: 'Dr. Michael Torres, DO',
    npi: '5678901234',
    address: '320 Birch Health Center, North Haverbrook, IL 62510',
    phone: '(555) 600-5005',
    specialty: 'Family Medicine',
    group: 'Haverbrook Wellness Associates',
    acceptingNewPatients: true,
    languages: ['English', 'Spanish'],
    gender: 'Male',
    distanceMiles: 15.0,
  },
  {
    id: 'prov-006',
    name: 'Dr. Angela Brooks, MD',
    npi: '6789012345',
    address: '410 Elm Street Medical, Springfield, IL 62701',
    phone: '(555) 600-6006',
    specialty: 'Geriatric Medicine',
    group: 'Springfield Health Partners',
    acceptingNewPatients: true,
    languages: ['English', 'French'],
    gender: 'Female',
    distanceMiles: 3.5,
  },
  {
    id: 'prov-007',
    name: 'Dr. David Kim, MD',
    npi: '7890123456',
    address: '88 Oak Ridge Clinic, Capital City, IL 62702',
    phone: '(555) 600-7007',
    specialty: 'Internal Medicine',
    group: 'Capitol City Health Network',
    acceptingNewPatients: true,
    languages: ['English', 'Korean'],
    gender: 'Male',
    distanceMiles: 9.2,
  },
  {
    id: 'prov-008',
    name: 'Dr. Patricia Hernandez, DO',
    npi: '8901234567',
    address: '155 Maple Avenue, Shelbyville, IL 62565',
    phone: '(555) 600-8008',
    specialty: 'Family Medicine',
    group: 'Shelbyville Medical Group',
    acceptingNewPatients: false,
    languages: ['English', 'Spanish'],
    gender: 'Female',
    distanceMiles: 6.8,
  },
];

/**
 * PCP change request status templates.
 * Used to simulate different states of a PCP change request.
 * @type {Object<string, PCPChangeStatus>}
 */
export const pcpChangeStatusTemplates = {
  pending: {
    status: 'PENDING',
    requestedDate: REFERENCE_DATE,
    effectiveDate: '2024-07-01',
    reason: PCP_CHANGE_REASONS[0],
    newProviderName: 'Dr. Angela Brooks, MD',
    newProviderNpi: '6789012345',
  },
  approved: {
    status: 'APPROVED',
    requestedDate: '2024-05-15',
    effectiveDate: '2024-06-01',
    reason: PCP_CHANGE_REASONS[1],
    newProviderName: 'Dr. David Kim, MD',
    newProviderNpi: '7890123456',
  },
  denied: {
    status: 'DENIED',
    requestedDate: '2024-04-20',
    effectiveDate: '',
    reason: PCP_CHANGE_REASONS[2],
    newProviderName: 'Dr. Patricia Hernandez, DO',
    newProviderNpi: '8901234567',
  },
  none: {
    status: 'NONE',
    requestedDate: '',
    effectiveDate: '',
    reason: '',
    newProviderName: '',
    newProviderNpi: '',
  },
};

/**
 * Default PCP info returned when no user-specific PCP is found.
 * @type {PCPInfo}
 */
export const defaultPCPInfo = {
  name: 'Dr. Robert Chen, MD',
  npi: '1234567890',
  address: '100 Health Plaza, Suite 200, Springfield, IL 62701',
  phone: '(555) 600-1001',
  effectiveDate: '2023-01-15',
  specialty: 'Internal Medicine',
  group: 'Springfield Health Partners',
};

/**
 * Retrieves the current PCP info for a given user ID.
 * Falls back to defaultPCPInfo if the user ID is not found.
 * @param {string} userId - The user ID to look up.
 * @returns {PCPInfo} The PCP info for the user.
 */
export function getPCPForUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return { ...defaultPCPInfo };
  }
  const pcp = currentPCPByUser[userId];
  return pcp ? { ...pcp } : { ...defaultPCPInfo };
}

/**
 * Retrieves available providers, optionally filtered by specialty.
 * @param {object} [filters] - Optional filter criteria.
 * @param {string} [filters.specialty] - Filter by specialty (case-insensitive).
 * @param {boolean} [filters.acceptingNewPatients] - Filter by accepting new patients.
 * @param {string} [filters.gender] - Filter by provider gender (case-insensitive).
 * @returns {AvailableProvider[]} Filtered list of available providers.
 */
export function getAvailableProviders(filters) {
  if (!filters || typeof filters !== 'object') {
    return [...availableProviders];
  }

  return availableProviders.filter((provider) => {
    if (
      filters.specialty &&
      provider.specialty.toLowerCase() !== filters.specialty.toLowerCase()
    ) {
      return false;
    }
    if (
      typeof filters.acceptingNewPatients === 'boolean' &&
      provider.acceptingNewPatients !== filters.acceptingNewPatients
    ) {
      return false;
    }
    if (
      filters.gender &&
      provider.gender.toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}

export default {
  currentPCPByUser,
  availableProviders,
  pcpChangeStatusTemplates,
  defaultPCPInfo,
  getPCPForUser,
  getAvailableProviders,
};