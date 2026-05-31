/**
 * localStorage abstraction utility for the CSNP Member Portal.
 * Provides JSON parse/stringify and error handling.
 * Falls back to an in-memory store if localStorage is unavailable.
 * @module storage
 */

/**
 * In-memory fallback store used when localStorage is unavailable.
 * @type {Map<string, string>}
 */
const memoryStore = new Map();

/**
 * Checks whether localStorage is available and functional.
 * @returns {boolean} True if localStorage is available.
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__csnp_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Cached result of localStorage availability check.
 * @type {boolean}
 */
const localStorageAvailable = isLocalStorageAvailable();

/**
 * Retrieves a value from storage by key, parsing it from JSON.
 * @param {string} key - The storage key to retrieve.
 * @param {*} [defaultValue=null] - The default value to return if the key does not exist or parsing fails.
 * @returns {*} The parsed value, or the default value if not found or on error.
 */
export function getItem(key, defaultValue = null) {
  try {
    let raw;
    if (localStorageAvailable) {
      raw = localStorage.getItem(key);
    } else {
      raw = memoryStore.has(key) ? memoryStore.get(key) : null;
    }

    if (raw === null || raw === undefined) {
      return defaultValue;
    }

    return JSON.parse(raw);
  } catch (_e) {
    return defaultValue;
  }
}

/**
 * Stores a value in storage by key, stringifying it to JSON.
 * @param {string} key - The storage key to set.
 * @param {*} value - The value to store (will be JSON-stringified).
 * @returns {boolean} True if the value was stored successfully, false otherwise.
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);

    if (localStorageAvailable) {
      localStorage.setItem(key, serialized);
    } else {
      memoryStore.set(key, serialized);
    }

    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Removes a value from storage by key.
 * @param {string} key - The storage key to remove.
 * @returns {boolean} True if the removal was successful, false otherwise.
 */
export function removeItem(key) {
  try {
    if (localStorageAvailable) {
      localStorage.removeItem(key);
    } else {
      memoryStore.delete(key);
    }

    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Clears all values from storage.
 * @returns {boolean} True if the clear was successful, false otherwise.
 */
export function clearAll() {
  try {
    if (localStorageAvailable) {
      localStorage.clear();
    } else {
      memoryStore.clear();
    }

    return true;
  } catch (_e) {
    return false;
  }
}