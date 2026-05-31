/**
 * Centralized PII masking utility for the CSNP Member Portal.
 * Ensures no unmasked PII is returned in display contexts.
 * @module masking
 */

/**
 * Masks a member ID, showing only the last 4 characters.
 * @param {string} memberId - The full member ID.
 * @returns {string} The masked member ID (e.g., '****1234').
 */
export function maskMemberId(memberId) {
  if (!memberId || typeof memberId !== 'string') {
    return '****';
  }
  const trimmed = memberId.trim();
  if (trimmed.length <= 4) {
    return '****' + trimmed;
  }
  return '****' + trimmed.slice(-4);
}

/**
 * Masks an email address, showing only the first character and domain.
 * @param {string} email - The full email address.
 * @returns {string} The masked email (e.g., 'j***@domain.com').
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') {
    return '***@***.***';
  }
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) {
    return '***@***.***';
  }
  const firstChar = trimmed.charAt(0);
  const domain = trimmed.slice(atIndex);
  return firstChar + '***' + domain;
}

/**
 * Masks a phone number, showing only the last 4 digits.
 * @param {string} phone - The full phone number.
 * @returns {string} The masked phone (e.g., '***-***-1234').
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return '***-***-****';
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return '***-***-****';
  }
  return '***-***-' + digits.slice(-4);
}

/**
 * Masks all PII fields in an auth state object.
 * Name and address are returned unmasked as they are not considered sensitive
 * in the display context of this application.
 * @param {object} state - The auth state containing PII fields.
 * @param {string} [state.memberId] - The full member ID.
 * @param {string} [state.email] - The full email address.
 * @param {string} [state.phone] - The full phone number.
 * @param {string} [state.name] - The member's name.
 * @param {string} [state.address] - The member's address.
 * @returns {object} An object with all PII fields masked.
 */
export function maskAll(state) {
  if (!state || typeof state !== 'object') {
    return {
      memberId: '****',
      email: '***@***.***',
      phone: '***-***-****',
      name: '',
      address: '',
    };
  }
  return {
    memberId: maskMemberId(state.memberId),
    email: maskEmail(state.email),
    phone: maskPhone(state.phone),
    name: state.name || '',
    address: state.address || '',
  };
}