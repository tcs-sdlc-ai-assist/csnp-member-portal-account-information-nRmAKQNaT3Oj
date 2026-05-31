/**
 * Mock authorized representatives data for the CSNP Member Portal.
 * Contains representative information for the representatives management feature.
 * @module mockRepresentatives
 */

/**
 * @typedef {object} Representative
 * @property {string} id - Unique representative identifier.
 * @property {string} name - Representative full name.
 * @property {string} relationship - Relationship to the member.
 * @property {string} phone - Representative phone number.
 * @property {string} email - Representative email address.
 * @property {string} address - Representative mailing address.
 * @property {string} authorizedDate - Date the representative was authorized (ISO 8601).
 * @property {string} scope - Scope of authorization.
 */

/**
 * Authorized representatives keyed by user ID from mockUsers.
 * Each user may have zero or more authorized representatives.
 * @type {Object<string, Representative[]>}
 */
export const representativesByUser = {
  'usr-001': [
    {
      id: 'rep-001',
      name: 'John Doe',
      relationship: 'Spouse',
      phone: '(555) 111-2001',
      email: 'john.doe@fakemail.test',
      address: '123 Maple Street, Springfield, IL 62701',
      authorizedDate: '2023-03-15',
      scope: 'Full Access',
    },
    {
      id: 'rep-002',
      name: 'Emily Doe',
      relationship: 'Daughter',
      phone: '(555) 111-2002',
      email: 'emily.doe@fakemail.test',
      address: '456 Cedar Lane, Springfield, IL 62701',
      authorizedDate: '2023-08-20',
      scope: 'Medical Decisions Only',
    },
  ],
  'usr-002': [
    {
      id: 'rep-003',
      name: 'Linda Smith',
      relationship: 'Spouse',
      phone: '(555) 222-3001',
      email: 'linda.smith@fakemail.test',
      address: '456 Oak Avenue, Shelbyville, IL 62565',
      authorizedDate: '2023-07-01',
      scope: 'Full Access',
    },
  ],
  'usr-003': [
    {
      id: 'rep-004',
      name: 'Robert Johnson',
      relationship: 'Son',
      phone: '(555) 333-4001',
      email: 'robert.johnson@fakemail.test',
      address: '100 Walnut Street, Capital City, IL 62702',
      authorizedDate: '2022-12-10',
      scope: 'Full Access',
    },
    {
      id: 'rep-005',
      name: 'Susan Johnson-Clark',
      relationship: 'Daughter',
      phone: '(555) 333-4002',
      email: 'susan.jclark@fakemail.test',
      address: '210 Birch Road, Capital City, IL 62702',
      authorizedDate: '2023-01-05',
      scope: 'Financial Only',
    },
    {
      id: 'rep-006',
      name: 'Thomas Reed, Esq.',
      relationship: 'Legal Representative',
      phone: '(555) 333-4003',
      email: 't.reed@fakelegal.test',
      address: '500 Justice Blvd, Suite 300, Capital City, IL 62702',
      authorizedDate: '2023-04-18',
      scope: 'Legal Matters Only',
    },
  ],
  'usr-004': [],
  'usr-005': [
    {
      id: 'rep-007',
      name: 'Luis Garcia',
      relationship: 'Spouse',
      phone: '(555) 555-6001',
      email: 'luis.garcia@fakemail.test',
      address: '654 Birch Court, North Haverbrook, IL 62510',
      authorizedDate: '2023-10-15',
      scope: 'Full Access',
    },
  ],
};

/**
 * Retrieves the list of authorized representatives for a given user ID.
 * Returns an empty array if the user ID is not found or has no representatives.
 * @param {string} userId - The user ID to look up.
 * @returns {Representative[]} The list of authorized representatives for the user.
 */
export function getRepresentativesForUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  const representatives = representativesByUser[userId];
  return representatives ? representatives.map((rep) => ({ ...rep })) : [];
}

export default {
  representativesByUser,
  getRepresentativesForUser,
};