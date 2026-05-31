/**
 * Pre-provisioned mock user data store for the CSNP Member Portal.
 * Contains obviously fake user data for development and testing purposes.
 * @module mockUsers
 */

import { VCC_ATTESTATION_STATUSES } from '../utils/constants.js';

/**
 * @typedef {object} MockUser
 * @property {string} id - Unique user identifier.
 * @property {string} username - Login username.
 * @property {string} password - Login password (plaintext for mock purposes only).
 * @property {string} name - Full display name.
 * @property {string} address - Mailing address.
 * @property {string} email - Email address.
 * @property {string} phone - Phone number.
 * @property {string} memberId - CSNP member ID.
 * @property {string} vccStatus - VCC attestation status.
 */

/**
 * Array of pre-provisioned mock users for development and testing.
 * @type {MockUser[]}
 */
export const mockUsers = [
  {
    id: 'usr-001',
    username: 'jdoe',
    password: 'Password1!',
    name: 'Jane Doe',
    address: '123 Maple Street, Springfield, IL 62701',
    email: 'jane.doe@fakemail.test',
    phone: '(555) 123-4567',
    memberId: 'CSNP10001234',
    vccStatus: VCC_ATTESTATION_STATUSES.ATTESTED,
  },
  {
    id: 'usr-002',
    username: 'bsmith',
    password: 'Password2!',
    name: 'Bob Smith',
    address: '456 Oak Avenue, Shelbyville, IL 62565',
    email: 'bob.smith@fakemail.test',
    phone: '(555) 234-5678',
    memberId: 'CSNP10005678',
    vccStatus: VCC_ATTESTATION_STATUSES.PENDING,
  },
  {
    id: 'usr-003',
    username: 'ajohnson',
    password: 'Password3!',
    name: 'Alice Johnson',
    address: '789 Elm Drive, Capital City, IL 62702',
    email: 'alice.johnson@fakemail.test',
    phone: '(555) 345-6789',
    memberId: 'CSNP10009012',
    vccStatus: VCC_ATTESTATION_STATUSES.DECLINED,
  },
  {
    id: 'usr-004',
    username: 'cwilliams',
    password: 'Password4!',
    name: 'Carlos Williams',
    address: '321 Pine Lane, Ogdenville, IL 62550',
    email: 'carlos.williams@fakemail.test',
    phone: '(555) 456-7890',
    memberId: 'CSNP10003456',
    vccStatus: VCC_ATTESTATION_STATUSES.EXPIRED,
  },
  {
    id: 'usr-005',
    username: 'mgarcia',
    password: 'Password5!',
    name: 'Maria Garcia',
    address: '654 Birch Court, North Haverbrook, IL 62510',
    email: 'maria.garcia@fakemail.test',
    phone: '(555) 567-8901',
    memberId: 'CSNP10007890',
    vccStatus: VCC_ATTESTATION_STATUSES.ATTESTED,
  },
];

export default mockUsers;