/**
 * PCP management settings page for the CSNP Member Portal.
 * Displays current PCP info, VCC attestation status, and provides
 * PCP change flow with reason selection, Doctor Hospital Finder,
 * PCP selection, and confirmation with turnaround time.
 * Failure shows simulated email notification.
 * Uses pcpService and MemberDataContext.
 * @module PCPManagementPage
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useMemberData } from '../../contexts/MemberDataContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { changePCP, getChangeReasons, getPCPList, resetChangeStatus } from '../../services/pcpService.js';
import { maskPhone } from '../../utils/masking.js';
import { VCC_ATTESTATION_STATUSES } from '../../utils/constants.js';

/**
 * Steps in the PCP change flow.
 * @enum {string}
 */
const CHANGE_STEPS = {
  IDLE: 'IDLE',
  REASON: 'REASON',
  FINDER: 'FINDER',
  CONFIRM: 'CONFIRM',
  RESULT: 'RESULT',
};

/**
 * PCPManagementPage component that renders the PCP management interface.
 * Shows current PCP info, VCC attestation status, PCP change request status,
 * and provides a multi-step PCP change flow.
 *
 * @returns {JSX.Element} The PCP management settings page element.
 */
export function PCPManagementPage() {
  const { currentUser } = useAuth();
  const { pcpInfo, pcpChangeStatus, personalInfo } = useMemberData();
  const { showNotification } = useNotification();

  const [changeStep, setChangeStep] = useState(CHANGE_STEPS.IDLE);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Finder state
  const [finderFilters, setFinderFilters] = useState({
    specialty: '',
    acceptingNewPatients: true,
    gender: '',
  });
  const [providerList, setProviderList] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Confirmation / result state
  const [changeResult, setChangeResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeReasons = useMemo(() => getChangeReasons(), []);

  const vccStatus = currentUser?.vccStatus || '';
  const canChangePCP = vccStatus === VCC_ATTESTATION_STATUSES.ATTESTED || vccStatus === VCC_ATTESTATION_STATUSES.PENDING;
  const hasPendingChange = pcpChangeStatus?.status === 'PENDING';

  /**
   * Returns the VCC status badge styling.
   * @param {string} status - The VCC attestation status.
   * @returns {string} Tailwind CSS classes.
   */
  function getVCCStatusClasses(status) {
    switch (status) {
      case VCC_ATTESTATION_STATUSES.ATTESTED:
        return 'bg-green-50 text-green-800';
      case VCC_ATTESTATION_STATUSES.PENDING:
        return 'bg-yellow-50 text-yellow-900';
      case VCC_ATTESTATION_STATUSES.DECLINED:
        return 'bg-red-50 text-red-800';
      case VCC_ATTESTATION_STATUSES.EXPIRED:
        return 'bg-csnp-neutral-100 text-csnp-neutral-600';
      default:
        return 'bg-csnp-neutral-100 text-csnp-neutral-600';
    }
  }

  /**
   * Returns the PCP change status badge styling.
   * @param {string} status - The PCP change status.
   * @returns {string} Tailwind CSS classes.
   */
  function getPCPChangeStatusClasses(status) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-900';
      case 'APPROVED':
        return 'bg-green-50 text-green-800';
      case 'DENIED':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-csnp-neutral-100 text-csnp-neutral-600';
    }
  }

  /**
   * Starts the PCP change flow.
   */
  const handleStartChange = useCallback(() => {
    setChangeStep(CHANGE_STEPS.REASON);
    setSelectedReason('');
    setOtherReason('');
    setReasonError('');
    setSelectedProvider(null);
    setChangeResult(null);
  }, []);

  /**
   * Cancels the PCP change flow and returns to idle.
   */
  const handleCancelChange = useCallback(() => {
    setChangeStep(CHANGE_STEPS.IDLE);
    setSelectedReason('');
    setOtherReason('');
    setReasonError('');
    setSelectedProvider(null);
    setChangeResult(null);
    setProviderList([]);
    setFinderFilters({ specialty: '', acceptingNewPatients: true, gender: '' });
  }, []);

  /**
   * Validates the reason step and proceeds to the finder step.
   */
  const handleReasonNext = useCallback(() => {
    setReasonError('');

    if (!selectedReason) {
      setReasonError('Please select a reason for the PCP change.');
      return;
    }

    if (selectedReason === 'Other') {
      if (!otherReason || otherReason.trim().length < 5) {
        setReasonError('Please provide a reason with at least 5 characters.');
        return;
      }
    }

    // Load providers and move to finder
    const providers = getPCPList({ acceptingNewPatients: true });
    setProviderList(providers);
    setChangeStep(CHANGE_STEPS.FINDER);
  }, [selectedReason, otherReason]);

  /**
   * Handles search/filter in the Doctor Hospital Finder.
   */
  const handleSearchProviders = useCallback(() => {
    const filters = {};
    if (finderFilters.specialty) {
      filters.specialty = finderFilters.specialty;
    }
    if (finderFilters.acceptingNewPatients) {
      filters.acceptingNewPatients = true;
    }
    if (finderFilters.gender) {
      filters.gender = finderFilters.gender;
    }
    const results = getPCPList(filters);
    setProviderList(results);
  }, [finderFilters]);

  /**
   * Handles selecting a provider from the finder list.
   * @param {object} provider - The selected provider.
   */
  const handleSelectProvider = useCallback((provider) => {
    setSelectedProvider(provider);
    setChangeStep(CHANGE_STEPS.CONFIRM);
  }, []);

  /**
   * Goes back from confirm to finder step.
   */
  const handleBackToFinder = useCallback(() => {
    setSelectedProvider(null);
    setChangeStep(CHANGE_STEPS.FINDER);
  }, []);

  /**
   * Goes back from finder to reason step.
   */
  const handleBackToReason = useCallback(() => {
    setChangeStep(CHANGE_STEPS.REASON);
  }, []);

  /**
   * Submits the PCP change request.
   */
  const handleConfirmChange = useCallback(() => {
    if (!selectedProvider) {
      return;
    }

    setIsSubmitting(true);

    const result = changePCP(
      {
        npi: selectedProvider.npi,
        name: selectedProvider.name,
        specialty: selectedProvider.specialty,
        address: selectedProvider.address,
        phone: selectedProvider.phone,
        group: selectedProvider.group,
      },
      selectedReason,
      selectedReason === 'Other' ? otherReason.trim() : undefined,
      personalInfo.email || '',
      personalInfo.phone || ''
    );

    setChangeResult(result);
    setChangeStep(CHANGE_STEPS.RESULT);

    if (result.status === 'success') {
      showNotification(
        'Your PCP change request has been submitted successfully. Estimated turnaround: ' +
          (result.confirmation?.turnaroundTime || '2 business days') + '.',
        'success'
      );
    } else {
      showNotification(
        result.error || 'PCP change request failed. A notification has been sent to your email.',
        'error'
      );
    }

    setIsSubmitting(false);
  }, [selectedProvider, selectedReason, otherReason, personalInfo.email, personalInfo.phone, showNotification]);

  /**
   * Resets the change status to allow retry.
   */
  const handleResetAndRetry = useCallback(() => {
    resetChangeStatus();
    setChangeStep(CHANGE_STEPS.IDLE);
    setChangeResult(null);
    setSelectedProvider(null);
    setSelectedReason('');
    setOtherReason('');
    setReasonError('');
    setProviderList([]);
    showNotification('PCP change status has been reset. You may try again.', 'info');
  }, [showNotification]);

  /**
   * Handles filter input changes.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event.
   */
  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFinderFilters((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-csnp-neutral-800">
          PCP Management
        </h2>
        <p className="mt-1 text-sm text-csnp-neutral-500">
          View your current Primary Care Physician, check your VCC attestation status, and request a PCP change. All data is simulated for demonstration purposes.
        </p>
      </div>

      <div className="space-y-6">
        {/* VCC Attestation Status */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className="text-lg">📋</span>
            <h3 className="text-sm font-semibold text-csnp-neutral-800">
              VCC Attestation Status
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getVCCStatusClasses(vccStatus)}`}
            >
              {vccStatus || 'Unknown'}
            </span>
            {!canChangePCP && (
              <p className="text-xs text-csnp-neutral-500">
                PCP changes require an active or pending VCC attestation.
              </p>
            )}
          </div>
        </div>

        {/* Current PCP Info */}
        <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span aria-hidden="true" className="text-lg">🏥</span>
            <h3 className="text-sm font-semibold text-csnp-neutral-800">
              Current Primary Care Physician
            </h3>
          </div>
          {pcpInfo && pcpInfo.name ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Provider Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.name}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Specialty
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.specialty || '—'}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Phone
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {maskPhone(pcpInfo.phone)}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Group / Practice
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.group || '—'}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4 sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Office Address
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.address || '—'}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  NPI
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.npi || '—'}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Effective Date
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {pcpInfo.effectiveDate ? (
                    <time dateTime={pcpInfo.effectiveDate}>{pcpInfo.effectiveDate}</time>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </div>
          ) : (
            <p className="text-sm text-csnp-neutral-500">No PCP information available.</p>
          )}
        </div>

        {/* PCP Change Request Status */}
        {pcpChangeStatus && pcpChangeStatus.status !== 'NONE' && (
          <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true" className="text-lg">📝</span>
              <h3 className="text-sm font-semibold text-csnp-neutral-800">
                PCP Change Request Status
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getPCPChangeStatusClasses(pcpChangeStatus.status)}`}
                  >
                    {pcpChangeStatus.status}
                  </span>
                </dd>
              </div>
              {pcpChangeStatus.requestedDate && (
                <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                    Requested Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                    <time dateTime={pcpChangeStatus.requestedDate}>{pcpChangeStatus.requestedDate}</time>
                  </dd>
                </div>
              )}
              {pcpChangeStatus.newProviderName && (
                <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                    New Provider
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                    {pcpChangeStatus.newProviderName}
                  </dd>
                </div>
              )}
              {pcpChangeStatus.effectiveDate && (
                <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                    Effective Date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                    <time dateTime={pcpChangeStatus.effectiveDate}>{pcpChangeStatus.effectiveDate}</time>
                  </dd>
                </div>
              )}
              {pcpChangeStatus.reason && (
                <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                    Reason
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                    {pcpChangeStatus.reason}
                  </dd>
                </div>
              )}
            </div>
            {(pcpChangeStatus.status === 'DENIED') && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleResetAndRetry}
                  className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Reset PCP change status and try again"
                >
                  Reset & Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* PCP Change Button (Idle State) */}
        {changeStep === CHANGE_STEPS.IDLE && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartChange}
              disabled={!canChangePCP || hasPendingChange}
              className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Request a PCP change"
            >
              Request PCP Change
            </button>
            {hasPendingChange && (
              <p className="text-xs text-csnp-neutral-500">
                A PCP change request is already pending.
              </p>
            )}
            {!canChangePCP && !hasPendingChange && (
              <p className="text-xs text-csnp-neutral-500">
                VCC attestation must be completed or in progress to request a PCP change.
              </p>
            )}
          </div>
        )}

        {/* Step 1: Reason Selection */}
        {changeStep === CHANGE_STEPS.REASON && (
          <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span aria-hidden="true" className="text-lg">📝</span>
              <h3 className="text-sm font-semibold text-csnp-neutral-800">
                Step 1: Select Reason for PCP Change
              </h3>
            </div>

            {reasonError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 rounded-md border-l-4 border-csnp-error bg-red-50 p-4 text-sm text-red-800"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex-shrink-0 font-bold">✕</span>
                  <p>{reasonError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pcp-change-reason"
                  className="block text-sm font-medium text-csnp-neutral-700"
                >
                  Reason for Change <span className="text-csnp-error">*</span>
                </label>
                <select
                  id="pcp-change-reason"
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (reasonError) setReasonError('');
                  }}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                    reasonError
                      ? 'border-csnp-error focus:border-csnp-error'
                      : 'border-csnp-neutral-300 focus:border-csnp-secondary'
                  }`}
                  aria-invalid={reasonError ? 'true' : 'false'}
                  aria-describedby={reasonError ? 'pcp-reason-error' : undefined}
                >
                  <option value="">Select a reason</option>
                  {changeReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {reasonError && (
                  <p id="pcp-reason-error" className="mt-1 text-xs text-red-600">
                    {reasonError}
                  </p>
                )}
              </div>

              {selectedReason === 'Other' && (
                <div>
                  <label
                    htmlFor="pcp-other-reason"
                    className="block text-sm font-medium text-csnp-neutral-700"
                  >
                    Please specify <span className="text-csnp-error">*</span>
                  </label>
                  <input
                    id="pcp-other-reason"
                    type="text"
                    value={otherReason}
                    onChange={(e) => {
                      setOtherReason(e.target.value);
                      if (reasonError) setReasonError('');
                    }}
                    className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm"
                    placeholder="Enter your reason (at least 5 characters)"
                    aria-describedby="pcp-other-reason-hint"
                  />
                  <p id="pcp-other-reason-hint" className="mt-1 text-xs text-csnp-neutral-400">
                    Minimum 5 characters required.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-csnp-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={handleCancelChange}
                  className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Cancel PCP change"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReasonNext}
                  className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Continue to provider search"
                >
                  Next: Find a Provider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Doctor Hospital Finder */}
        {changeStep === CHANGE_STEPS.FINDER && (
          <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span aria-hidden="true" className="text-lg">🔍</span>
              <h3 className="text-sm font-semibold text-csnp-neutral-800">
                Step 2: Find a New Provider
              </h3>
            </div>
            <p className="text-sm text-csnp-neutral-500 mb-4">
              Search and select a new Primary Care Physician from the available providers below.
            </p>

            {/* Filters */}
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="finder-specialty"
                  className="block text-xs font-medium text-csnp-neutral-600"
                >
                  Specialty
                </label>
                <select
                  id="finder-specialty"
                  name="specialty"
                  value={finderFilters.specialty}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm"
                  aria-label="Filter by specialty"
                >
                  <option value="">All Specialties</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Family Medicine">Family Medicine</option>
                  <option value="Geriatric Medicine">Geriatric Medicine</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="finder-gender"
                  className="block text-xs font-medium text-csnp-neutral-600"
                >
                  Gender
                </label>
                <select
                  id="finder-gender"
                  name="gender"
                  value={finderFilters.gender}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm"
                  aria-label="Filter by gender"
                >
                  <option value="">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearchProviders}
                  className="w-full rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                  aria-label="Search providers"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Provider List */}
            {providerList.length === 0 ? (
              <div className="rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-8 text-center">
                <span aria-hidden="true" className="text-4xl">🏥</span>
                <p className="mt-3 text-sm font-medium text-csnp-neutral-600">
                  No providers found
                </p>
                <p className="mt-1 text-xs text-csnp-neutral-500">
                  Try adjusting your search filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3" aria-label="Available providers list">
                {providerList.map((provider) => {
                  const isCurrentPCP = provider.npi === pcpInfo?.npi;
                  const isAccepting = provider.acceptingNewPatients;

                  return (
                    <div
                      key={provider.id}
                      className={`rounded-lg border p-4 transition-all ${
                        isCurrentPCP
                          ? 'border-csnp-neutral-300 bg-csnp-neutral-50 opacity-60'
                          : 'border-csnp-neutral-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-csnp-neutral-800">
                              {provider.name}
                            </h4>
                            {isCurrentPCP && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                                Current PCP
                              </span>
                            )}
                            {!isAccepting && (
                              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                                Not Accepting
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid gap-1 text-xs text-csnp-neutral-600 sm:grid-cols-2">
                            <p><span className="font-medium">Specialty:</span> {provider.specialty}</p>
                            <p><span className="font-medium">Group:</span> {provider.group}</p>
                            <p><span className="font-medium">Phone:</span> {maskPhone(provider.phone)}</p>
                            <p><span className="font-medium">Distance:</span> {provider.distanceMiles} miles</p>
                            <p className="sm:col-span-2"><span className="font-medium">Address:</span> {provider.address}</p>
                            {provider.languages && provider.languages.length > 0 && (
                              <p className="sm:col-span-2">
                                <span className="font-medium">Languages:</span> {provider.languages.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelectProvider(provider)}
                            disabled={isCurrentPCP || !isAccepting}
                            className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Select ${provider.name} as new PCP`}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-csnp-neutral-200 pt-4">
              <button
                type="button"
                onClick={handleBackToReason}
                className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                aria-label="Go back to reason selection"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCancelChange}
                className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                aria-label="Cancel PCP change"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {changeStep === CHANGE_STEPS.CONFIRM && selectedProvider && (
          <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span aria-hidden="true" className="text-lg">✅</span>
              <h3 className="text-sm font-semibold text-csnp-neutral-800">
                Step 3: Confirm PCP Change
              </h3>
            </div>
            <p className="text-sm text-csnp-neutral-500 mb-4">
              Please review the details below and confirm your PCP change request.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  New Provider
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {selectedProvider.name}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Specialty
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {selectedProvider.specialty}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  NPI
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {selectedProvider.npi}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Group
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {selectedProvider.group}
                </dd>
              </div>
              <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4 sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                  Reason for Change
                </dt>
                <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                  {selectedReason === 'Other' ? otherReason.trim() : selectedReason}
                </dd>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <p className="text-xs text-blue-800">
                <span aria-hidden="true">ℹ</span>{' '}
                Estimated turnaround time: <strong>2 business days</strong>. This is a simulated request — no real PCP change will occur.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 border-t border-csnp-neutral-200 pt-4">
              <button
                type="button"
                onClick={handleBackToFinder}
                className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                aria-label="Go back to provider search"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCancelChange}
                className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                aria-label="Cancel PCP change"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChange}
                disabled={isSubmitting}
                className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Confirm PCP change request"
              >
                {isSubmitting ? 'Submitting…' : 'Confirm Change'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {changeStep === CHANGE_STEPS.RESULT && changeResult && (
          <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm">
            {changeResult.status === 'success' ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-csnp-success text-white text-lg font-bold"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <h3 className="text-lg font-semibold text-green-800">
                    PCP Change Request Submitted
                  </h3>
                </div>
                <p className="text-sm text-csnp-neutral-600 mb-4">
                  Your PCP change request has been submitted successfully.
                </p>
                {changeResult.confirmation && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-md border border-green-200 bg-green-50 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-green-700">
                        New Provider
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-green-900">
                        {changeResult.confirmation.pcp?.name || '—'}
                      </dd>
                    </div>
                    <div className="rounded-md border border-green-200 bg-green-50 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-green-700">
                        Estimated Turnaround
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-green-900">
                        {changeResult.confirmation.turnaroundTime || '2 business days'}
                      </dd>
                    </div>
                    {changeResult.confirmation.pcp?.effectiveDate && (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-green-700">
                          Effective Date
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-green-900">
                          <time dateTime={changeResult.confirmation.pcp.effectiveDate}>
                            {changeResult.confirmation.pcp.effectiveDate}
                          </time>
                        </dd>
                      </div>
                    )}
                    {changeResult.confirmation.pcp?.specialty && (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <dt className="text-xs font-medium uppercase tracking-wide text-green-700">
                          Specialty
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-green-900">
                          {changeResult.confirmation.pcp.specialty}
                        </dd>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCancelChange}
                    className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                    aria-label="Return to PCP management"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-csnp-error text-white text-lg font-bold"
                    aria-hidden="true"
                  >
                    ✕
                  </span>
                  <h3 className="text-lg font-semibold text-red-800">
                    PCP Change Request Failed
                  </h3>
                </div>
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-md border-l-4 border-csnp-error bg-red-50 p-4 mb-4"
                >
                  <p className="text-sm text-red-800">
                    {changeResult.error || 'An unexpected error occurred while processing your PCP change request.'}
                  </p>
                </div>
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-sm">📧</span>
                    <p className="text-xs text-yellow-800">
                      A simulated notification email has been sent to your registered email address regarding this failed request.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndRetry}
                    className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                    aria-label="Try PCP change again"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelChange}
                    className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
                    aria-label="Return to PCP management"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-md bg-csnp-neutral-50 p-4">
          <p className="text-xs text-csnp-neutral-500">
            <span aria-hidden="true">⚠</span>{' '}
            This is a simulated environment. PCP management features shown here are for demonstration purposes only. PCP change requests trigger simulated CDM data updates and NCompass validation but do not affect real provider assignments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PCPManagementPage;