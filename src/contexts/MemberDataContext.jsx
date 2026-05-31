/**
 * React Context provider for member data state management.
 * Manages personal info, representatives, privacy/security settings,
 * communication preferences, PCP info, and care manager info.
 * All data initialized from mock data files and persisted to localStorage.
 * Exports useMemberData hook with getters and setters for all data domains.
 * @module MemberDataContext
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';
import { getRepresentativesForUser } from '../data/mockRepresentatives.js';
import { getPrivacySettingsForUser, getCommunicationPreferencesForUser } from '../data/mockSettings.js';
import { getPCPForUser, getAvailableProviders, pcpChangeStatusTemplates } from '../data/mockPCPData.js';
import { getCareManagerForUser } from '../data/mockCareManagerData.js';
import { getItem, setItem, removeItem } from '../utils/storage.js';
import {
  MEMBER_DATA_KEY,
  REPRESENTATIVES_KEY,
  PRIVACY_SETTINGS_KEY,
  COMM_PREFS_KEY,
  PCP_INFO_KEY,
  CARE_MANAGER_KEY,
  PCP_CHANGE_KEY,
} from '../utils/constants.js';

/**
 * @typedef {object} PersonalInfo
 * @property {string} name - Member full name.
 * @property {string} address - Member mailing address.
 * @property {string} email - Member email address.
 * @property {string} phone - Member phone number.
 * @property {string} memberId - CSNP member ID.
 */

/**
 * @typedef {object} MemberDataContextValue
 * @property {PersonalInfo} personalInfo - The current member's personal info.
 * @property {function(Partial<PersonalInfo>): {success: boolean, error?: string}} updatePersonalInfo - Updates personal info fields.
 * @property {import('../data/mockRepresentatives.js').Representative[]} representatives - List of authorized representatives.
 * @property {function(import('../data/mockRepresentatives.js').Representative): {success: boolean, error?: string}} addRepresentative - Adds a new representative.
 * @property {function(string, Partial<import('../data/mockRepresentatives.js').Representative>): {success: boolean, error?: string}} updateRepresentative - Updates an existing representative.
 * @property {function(string): {success: boolean, error?: string}} removeRepresentative - Removes a representative by ID.
 * @property {import('../data/mockSettings.js').PrivacySettings} privacySettings - Privacy/security settings.
 * @property {function(Partial<import('../data/mockSettings.js').PrivacySettings>): {success: boolean, error?: string}} updatePrivacySettings - Updates privacy settings.
 * @property {import('../data/mockSettings.js').CommunicationPreferences} communicationPreferences - Communication preferences.
 * @property {function(Partial<import('../data/mockSettings.js').CommunicationPreferences>): {success: boolean, error?: string}} updateCommunicationPreferences - Updates communication preferences.
 * @property {import('../data/mockPCPData.js').PCPInfo} pcpInfo - Current PCP information.
 * @property {import('../data/mockPCPData.js').PCPChangeStatus} pcpChangeStatus - Current PCP change request status.
 * @property {function(string, string): {success: boolean, error?: string}} initiatePCPChange - Initiates a PCP change request.
 * @property {function(object): import('../data/mockPCPData.js').AvailableProvider[]} searchProviders - Searches available providers with optional filters.
 * @property {import('../data/mockCareManagerData.js').CareManager} careManagerInfo - Care manager information.
 * @property {function(): void} resetMemberData - Resets all member data to defaults for the current user.
 */

const MemberDataContext = createContext(null);

/**
 * Loads initial personal info from auth state.
 * @param {object} currentUser - The current authenticated user from AuthContext.
 * @returns {PersonalInfo} The personal info object.
 */
function buildPersonalInfo(currentUser) {
  return {
    name: currentUser.name || '',
    address: currentUser.address || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    memberId: currentUser.memberId || '',
  };
}

/**
 * Generates a unique representative ID.
 * @returns {string} A unique ID string.
 */
function generateRepId() {
  return 'rep-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

/**
 * MemberDataProvider component that wraps the application and provides member data state.
 * On mount, restores member data from localStorage if available, otherwise initializes from mock data.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} The MemberDataContext provider wrapping children.
 */
export function MemberDataProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth();

  const userId = currentUser?.id || null;

  const [personalInfo, setPersonalInfo] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { name: '', address: '', email: '', phone: '', memberId: '' };
    }
    try {
      const persisted = getItem(MEMBER_DATA_KEY, null);
      if (persisted && typeof persisted === 'object' && persisted.memberId) {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return buildPersonalInfo(currentUser);
  });

  const [representatives, setRepresentatives] = useState(() => {
    if (!isAuthenticated || !userId) {
      return [];
    }
    try {
      const persisted = getItem(REPRESENTATIVES_KEY, null);
      if (Array.isArray(persisted)) {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return getRepresentativesForUser(userId);
  });

  const [privacySettings, setPrivacySettings] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { twoFAEnabled: false, communicationConsent: true };
    }
    try {
      const persisted = getItem(PRIVACY_SETTINGS_KEY, null);
      if (persisted && typeof persisted === 'object') {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return getPrivacySettingsForUser(userId);
  });

  const [communicationPreferences, setCommunicationPreferences] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { paperless: false, verifiedEmail: false, categories: [] };
    }
    try {
      const persisted = getItem(COMM_PREFS_KEY, null);
      if (persisted && typeof persisted === 'object') {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return getCommunicationPreferencesForUser(userId);
  });

  const [pcpInfo, setPcpInfo] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { name: '', npi: '', address: '', phone: '', effectiveDate: '', specialty: '', group: '' };
    }
    try {
      const persisted = getItem(PCP_INFO_KEY, null);
      if (persisted && typeof persisted === 'object' && persisted.name) {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return getPCPForUser(userId);
  });

  const [pcpChangeStatus, setPcpChangeStatus] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { ...pcpChangeStatusTemplates.none };
    }
    try {
      const persisted = getItem(PCP_CHANGE_KEY, null);
      if (persisted && typeof persisted === 'object' && persisted.status) {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return { ...pcpChangeStatusTemplates.none };
  });

  const [careManagerInfo, setCareManagerInfo] = useState(() => {
    if (!isAuthenticated || !userId) {
      return { name: '', phone: '', email: '', assignedDate: '', specialty: '', organization: '' };
    }
    try {
      const persisted = getItem(CARE_MANAGER_KEY, null);
      if (persisted && typeof persisted === 'object' && persisted.name) {
        return persisted;
      }
    } catch (_e) {
      // Fall through to default
    }
    return getCareManagerForUser(userId);
  });

  /**
   * Re-initialize all data when user changes or logs out.
   */
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setPersonalInfo({ name: '', address: '', email: '', phone: '', memberId: '' });
      setRepresentatives([]);
      setPrivacySettings({ twoFAEnabled: false, communicationConsent: true });
      setCommunicationPreferences({ paperless: false, verifiedEmail: false, categories: [] });
      setPcpInfo({ name: '', npi: '', address: '', phone: '', effectiveDate: '', specialty: '', group: '' });
      setPcpChangeStatus({ ...pcpChangeStatusTemplates.none });
      setCareManagerInfo({ name: '', phone: '', email: '', assignedDate: '', specialty: '', organization: '' });
      return;
    }

    const persistedMember = getItem(MEMBER_DATA_KEY, null);
    if (persistedMember && typeof persistedMember === 'object' && persistedMember.memberId) {
      setPersonalInfo(persistedMember);
    } else {
      setPersonalInfo(buildPersonalInfo(currentUser));
    }

    const persistedReps = getItem(REPRESENTATIVES_KEY, null);
    if (Array.isArray(persistedReps)) {
      setRepresentatives(persistedReps);
    } else {
      setRepresentatives(getRepresentativesForUser(userId));
    }

    const persistedPrivacy = getItem(PRIVACY_SETTINGS_KEY, null);
    if (persistedPrivacy && typeof persistedPrivacy === 'object') {
      setPrivacySettings(persistedPrivacy);
    } else {
      setPrivacySettings(getPrivacySettingsForUser(userId));
    }

    const persistedComm = getItem(COMM_PREFS_KEY, null);
    if (persistedComm && typeof persistedComm === 'object') {
      setCommunicationPreferences(persistedComm);
    } else {
      setCommunicationPreferences(getCommunicationPreferencesForUser(userId));
    }

    const persistedPcp = getItem(PCP_INFO_KEY, null);
    if (persistedPcp && typeof persistedPcp === 'object' && persistedPcp.name) {
      setPcpInfo(persistedPcp);
    } else {
      setPcpInfo(getPCPForUser(userId));
    }

    const persistedPcpChange = getItem(PCP_CHANGE_KEY, null);
    if (persistedPcpChange && typeof persistedPcpChange === 'object' && persistedPcpChange.status) {
      setPcpChangeStatus(persistedPcpChange);
    } else {
      setPcpChangeStatus({ ...pcpChangeStatusTemplates.none });
    }

    const persistedCm = getItem(CARE_MANAGER_KEY, null);
    if (persistedCm && typeof persistedCm === 'object' && persistedCm.name) {
      setCareManagerInfo(persistedCm);
    } else {
      setCareManagerInfo(getCareManagerForUser(userId));
    }
  }, [isAuthenticated, userId, currentUser]);

  /**
   * Persist personal info to localStorage whenever it changes.
   */
  useEffect(() => {
    if (isAuthenticated && userId && personalInfo.memberId) {
      try {
        setItem(MEMBER_DATA_KEY, personalInfo);
      } catch (_e) {
        // Storage write failed; continue with in-memory state
      }
    }
  }, [personalInfo, isAuthenticated, userId]);

  /**
   * Persist representatives to localStorage whenever they change.
   */
  useEffect(() => {
    if (isAuthenticated && userId) {
      try {
        setItem(REPRESENTATIVES_KEY, representatives);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [representatives, isAuthenticated, userId]);

  /**
   * Persist privacy settings to localStorage whenever they change.
   */
  useEffect(() => {
    if (isAuthenticated && userId) {
      try {
        setItem(PRIVACY_SETTINGS_KEY, privacySettings);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [privacySettings, isAuthenticated, userId]);

  /**
   * Persist communication preferences to localStorage whenever they change.
   */
  useEffect(() => {
    if (isAuthenticated && userId) {
      try {
        setItem(COMM_PREFS_KEY, communicationPreferences);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [communicationPreferences, isAuthenticated, userId]);

  /**
   * Persist PCP info to localStorage whenever it changes.
   */
  useEffect(() => {
    if (isAuthenticated && userId && pcpInfo.name) {
      try {
        setItem(PCP_INFO_KEY, pcpInfo);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [pcpInfo, isAuthenticated, userId]);

  /**
   * Persist PCP change status to localStorage whenever it changes.
   */
  useEffect(() => {
    if (isAuthenticated && userId) {
      try {
        setItem(PCP_CHANGE_KEY, pcpChangeStatus);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [pcpChangeStatus, isAuthenticated, userId]);

  /**
   * Persist care manager info to localStorage whenever it changes.
   */
  useEffect(() => {
    if (isAuthenticated && userId && careManagerInfo.name) {
      try {
        setItem(CARE_MANAGER_KEY, careManagerInfo);
      } catch (_e) {
        // Storage write failed
      }
    }
  }, [careManagerInfo, isAuthenticated, userId]);

  /**
   * Updates personal info fields.
   * @param {Partial<PersonalInfo>} updates - The fields to update.
   * @returns {{success: boolean, error?: string}} Result of the update.
   */
  const updatePersonalInfoHandler = useCallback((updates) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Invalid updates.' };
    }

    if (updates.email !== undefined) {
      const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
      if (typeof updates.email !== 'string' || !emailPattern.test(updates.email.trim())) {
        return { success: false, error: 'Invalid email format.' };
      }
    }

    if (updates.phone !== undefined) {
      const phoneDigits = typeof updates.phone === 'string' ? updates.phone.replace(/\D/g, '') : '';
      if (phoneDigits.length < 10) {
        return { success: false, error: 'Invalid phone number format.' };
      }
    }

    setPersonalInfo((prev) => {
      const updated = { ...prev };
      if (updates.name !== undefined) {
        updated.name = String(updates.name).trim();
      }
      if (updates.address !== undefined) {
        updated.address = String(updates.address).trim();
      }
      if (updates.email !== undefined) {
        updated.email = String(updates.email).trim();
      }
      if (updates.phone !== undefined) {
        updated.phone = String(updates.phone).trim();
      }
      return updated;
    });

    return { success: true };
  }, [isAuthenticated]);

  /**
   * Adds a new authorized representative.
   * @param {object} rep - The representative to add.
   * @returns {{success: boolean, error?: string}} Result of the operation.
   */
  const addRepresentativeHandler = useCallback((rep) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!rep || typeof rep !== 'object') {
      return { success: false, error: 'Invalid representative data.' };
    }
    if (!rep.name || typeof rep.name !== 'string' || !rep.name.trim()) {
      return { success: false, error: 'Representative name is required.' };
    }
    if (!rep.relationship || typeof rep.relationship !== 'string' || !rep.relationship.trim()) {
      return { success: false, error: 'Relationship is required.' };
    }

    const newRep = {
      id: rep.id || generateRepId(),
      name: rep.name.trim(),
      relationship: rep.relationship.trim(),
      phone: (rep.phone || '').trim(),
      email: (rep.email || '').trim(),
      address: (rep.address || '').trim(),
      authorizedDate: rep.authorizedDate || new Date().toISOString().split('T')[0],
      scope: (rep.scope || 'Full Access').trim(),
    };

    setRepresentatives((prev) => [...prev, newRep]);
    return { success: true };
  }, [isAuthenticated]);

  /**
   * Updates an existing authorized representative.
   * @param {string} id - The representative ID to update.
   * @param {object} updates - The fields to update.
   * @returns {{success: boolean, error?: string}} Result of the operation.
   */
  const updateRepresentativeHandler = useCallback((id, updates) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Representative ID is required.' };
    }
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Invalid updates.' };
    }

    let found = false;
    setRepresentatives((prev) => {
      const updated = prev.map((rep) => {
        if (rep.id === id) {
          found = true;
          return {
            ...rep,
            ...(updates.name !== undefined ? { name: String(updates.name).trim() } : {}),
            ...(updates.relationship !== undefined ? { relationship: String(updates.relationship).trim() } : {}),
            ...(updates.phone !== undefined ? { phone: String(updates.phone).trim() } : {}),
            ...(updates.email !== undefined ? { email: String(updates.email).trim() } : {}),
            ...(updates.address !== undefined ? { address: String(updates.address).trim() } : {}),
            ...(updates.scope !== undefined ? { scope: String(updates.scope).trim() } : {}),
          };
        }
        return rep;
      });
      return updated;
    });

    if (!found) {
      return { success: false, error: 'Representative not found.' };
    }
    return { success: true };
  }, [isAuthenticated]);

  /**
   * Removes an authorized representative by ID.
   * @param {string} id - The representative ID to remove.
   * @returns {{success: boolean, error?: string}} Result of the operation.
   */
  const removeRepresentativeHandler = useCallback((id) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Representative ID is required.' };
    }

    let found = false;
    setRepresentatives((prev) => {
      const filtered = prev.filter((rep) => {
        if (rep.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      return filtered;
    });

    if (!found) {
      return { success: false, error: 'Representative not found.' };
    }
    return { success: true };
  }, [isAuthenticated]);

  /**
   * Updates privacy/security settings.
   * @param {object} updates - The settings to update.
   * @returns {{success: boolean, error?: string}} Result of the update.
   */
  const updatePrivacySettingsHandler = useCallback((updates) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Invalid updates.' };
    }

    setPrivacySettings((prev) => {
      const updated = { ...prev };
      if (updates.twoFAEnabled !== undefined) {
        updated.twoFAEnabled = Boolean(updates.twoFAEnabled);
      }
      if (updates.communicationConsent !== undefined) {
        updated.communicationConsent = Boolean(updates.communicationConsent);
      }
      return updated;
    });

    return { success: true };
  }, [isAuthenticated]);

  /**
   * Updates communication preferences.
   * @param {object} updates - The preferences to update.
   * @returns {{success: boolean, error?: string}} Result of the update.
   */
  const updateCommunicationPreferencesHandler = useCallback((updates) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!updates || typeof updates !== 'object') {
      return { success: false, error: 'Invalid updates.' };
    }

    setCommunicationPreferences((prev) => {
      const updated = { ...prev };
      if (updates.paperless !== undefined) {
        updated.paperless = Boolean(updates.paperless);
      }
      if (updates.verifiedEmail !== undefined) {
        updated.verifiedEmail = Boolean(updates.verifiedEmail);
      }
      if (Array.isArray(updates.categories)) {
        updated.categories = updates.categories.map((cat) => ({
          category: cat.category || '',
          channel: cat.channel || '',
          enabled: Boolean(cat.enabled),
        }));
      }
      return updated;
    });

    return { success: true };
  }, [isAuthenticated]);

  /**
   * Initiates a PCP change request.
   * @param {string} reason - The reason for the PCP change.
   * @param {string} newProviderNpi - The NPI of the requested new provider.
   * @returns {{success: boolean, error?: string}} Result of the operation.
   */
  const initiatePCPChangeHandler = useCallback((reason, newProviderNpi) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated.' };
    }
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return { success: false, error: 'Reason is required.' };
    }
    if (!newProviderNpi || typeof newProviderNpi !== 'string' || !newProviderNpi.trim()) {
      return { success: false, error: 'New provider selection is required.' };
    }

    if (pcpChangeStatus.status === 'PENDING') {
      return { success: false, error: 'A PCP change request is already pending.' };
    }

    const allProviders = getAvailableProviders();
    const selectedProvider = allProviders.find((p) => p.npi === newProviderNpi.trim());

    if (!selectedProvider) {
      return { success: false, error: 'Selected provider not found.' };
    }

    if (!selectedProvider.acceptingNewPatients) {
      return { success: false, error: 'Selected provider is not accepting new patients.' };
    }

    const today = new Date().toISOString().split('T')[0];
    const effectiveDate = new Date();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);
    const effectiveDateStr = effectiveDate.toISOString().split('T')[0];

    const newChangeStatus = {
      status: 'PENDING',
      requestedDate: today,
      effectiveDate: effectiveDateStr,
      reason: reason.trim(),
      newProviderName: selectedProvider.name,
      newProviderNpi: selectedProvider.npi,
    };

    setPcpChangeStatus(newChangeStatus);
    return { success: true };
  }, [isAuthenticated, pcpChangeStatus.status]);

  /**
   * Searches available providers with optional filters.
   * @param {object} [filters] - Optional filter criteria.
   * @returns {import('../data/mockPCPData.js').AvailableProvider[]} Filtered list of providers.
   */
  const searchProvidersHandler = useCallback((filters) => {
    return getAvailableProviders(filters);
  }, []);

  /**
   * Resets all member data to defaults for the current user.
   */
  const resetMemberData = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    setPersonalInfo(buildPersonalInfo(currentUser));
    setRepresentatives(getRepresentativesForUser(userId));
    setPrivacySettings(getPrivacySettingsForUser(userId));
    setCommunicationPreferences(getCommunicationPreferencesForUser(userId));
    setPcpInfo(getPCPForUser(userId));
    setPcpChangeStatus({ ...pcpChangeStatusTemplates.none });
    setCareManagerInfo(getCareManagerForUser(userId));

    try {
      removeItem(MEMBER_DATA_KEY);
      removeItem(REPRESENTATIVES_KEY);
      removeItem(PRIVACY_SETTINGS_KEY);
      removeItem(COMM_PREFS_KEY);
      removeItem(PCP_INFO_KEY);
      removeItem(PCP_CHANGE_KEY);
      removeItem(CARE_MANAGER_KEY);
    } catch (_e) {
      // Storage removal failed; state is already reset in memory
    }
  }, [isAuthenticated, userId, currentUser]);

  const contextValue = {
    personalInfo,
    updatePersonalInfo: updatePersonalInfoHandler,
    representatives,
    addRepresentative: addRepresentativeHandler,
    updateRepresentative: updateRepresentativeHandler,
    removeRepresentative: removeRepresentativeHandler,
    privacySettings,
    updatePrivacySettings: updatePrivacySettingsHandler,
    communicationPreferences,
    updateCommunicationPreferences: updateCommunicationPreferencesHandler,
    pcpInfo,
    pcpChangeStatus,
    initiatePCPChange: initiatePCPChangeHandler,
    searchProviders: searchProvidersHandler,
    careManagerInfo,
    resetMemberData,
  };

  return (
    <MemberDataContext.Provider value={contextValue}>
      {children}
    </MemberDataContext.Provider>
  );
}

MemberDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the member data context.
 * Must be used within a MemberDataProvider.
 * @returns {MemberDataContextValue} The member data context value.
 * @throws {Error} If used outside of a MemberDataProvider.
 */
export function useMemberData() {
  const context = useContext(MemberDataContext);
  if (!context) {
    throw new Error('useMemberData must be used within a MemberDataProvider.');
  }
  return context;
}

export default MemberDataContext;