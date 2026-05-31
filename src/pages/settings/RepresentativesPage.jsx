/**
 * Authorized representatives management page for the CSNP Member Portal.
 * Lists current representatives with name, relationship, and contact info.
 * Provides Add, Edit, and Remove actions with inline forms and confirmation dialogs.
 * All changes persist to localStorage via MemberDataContext.
 * UI feedback via NotificationContext.
 * @module RepresentativesPage
 */

import { useState, useCallback } from 'react';
import { useMemberData } from '../../contexts/MemberDataContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * Relationship options for the representative form.
 * @type {string[]}
 */
const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Son',
  'Daughter',
  'Parent',
  'Sibling',
  'Legal Representative',
  'Power of Attorney',
  'Other',
];

/**
 * Scope options for the representative form.
 * @type {string[]}
 */
const SCOPE_OPTIONS = [
  'Full Access',
  'Medical Decisions Only',
  'Financial Only',
  'Legal Matters Only',
];

/**
 * Empty form data template for adding a new representative.
 * @type {object}
 */
const EMPTY_FORM = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  address: '',
  scope: 'Full Access',
};

/**
 * RepresentativesPage component that renders the authorized representatives
 * management interface. Displays a list of current representatives and provides
 * Add, Edit, and Remove actions.
 *
 * @returns {JSX.Element} The representatives settings page element.
 */
export function RepresentativesPage() {
  const {
    representatives,
    addRepresentative,
    updateRepresentative,
    removeRepresentative,
  } = useMemberData();
  const { showNotification } = useNotification();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  /**
   * Validates the representative form data.
   * @returns {boolean} True if the form data is valid.
   */
  function validate() {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.relationship || !formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required.';
    }

    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Handles form field changes.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The input change event.
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  }

  /**
   * Opens the add representative form.
   */
  const handleStartAdd = useCallback(() => {
    setEditingId(null);
    setRemovingId(null);
    setFormData({ ...EMPTY_FORM });
    setErrors({});
    setIsAdding(true);
  }, []);

  /**
   * Opens the edit form for a specific representative.
   * @param {object} rep - The representative to edit.
   */
  const handleStartEdit = useCallback((rep) => {
    setIsAdding(false);
    setRemovingId(null);
    setFormData({
      name: rep.name || '',
      relationship: rep.relationship || '',
      phone: rep.phone || '',
      email: rep.email || '',
      address: rep.address || '',
      scope: rep.scope || 'Full Access',
    });
    setErrors({});
    setEditingId(rep.id);
  }, []);

  /**
   * Cancels the current add or edit operation.
   */
  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingId(null);
    setRemovingId(null);
    setFormData({ ...EMPTY_FORM });
    setErrors({});
  }, []);

  /**
   * Handles the add representative form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleAddSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = addRepresentative({
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      scope: formData.scope.trim(),
    });

    if (result.success) {
      showNotification('Representative added successfully.', 'success');
      setIsAdding(false);
      setFormData({ ...EMPTY_FORM });
      setErrors({});
    } else {
      showNotification(result.error || 'Failed to add representative.', 'error');
    }
  }

  /**
   * Handles the edit representative form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleEditSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = updateRepresentative(editingId, {
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      scope: formData.scope.trim(),
    });

    if (result.success) {
      showNotification('Representative updated successfully.', 'success');
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      setErrors({});
    } else {
      showNotification(result.error || 'Failed to update representative.', 'error');
    }
  }

  /**
   * Shows the remove confirmation dialog for a representative.
   * @param {string} id - The representative ID to remove.
   */
  const handleStartRemove = useCallback((id) => {
    setIsAdding(false);
    setEditingId(null);
    setErrors({});
    setRemovingId(id);
  }, []);

  /**
   * Confirms and removes the representative.
   */
  const handleConfirmRemove = useCallback(() => {
    if (!removingId) {
      return;
    }

    const result = removeRepresentative(removingId);

    if (result.success) {
      showNotification('Representative removed successfully.', 'success');
    } else {
      showNotification(result.error || 'Failed to remove representative.', 'error');
    }

    setRemovingId(null);
  }, [removingId, removeRepresentative, showNotification]);

  /**
   * Cancels the remove confirmation dialog.
   */
  const handleCancelRemove = useCallback(() => {
    setRemovingId(null);
  }, []);

  /**
   * Renders the representative form for add or edit.
   * @param {function} onSubmit - The form submit handler.
   * @param {string} submitLabel - The submit button label.
   * @param {string} ariaLabel - The form aria-label.
   * @returns {JSX.Element} The representative form element.
   */
  function renderForm(onSubmit, submitLabel, ariaLabel) {
    return (
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-5"
        noValidate
        aria-label={ariaLabel}
      >
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md border-l-4 border-csnp-error bg-red-50 p-4"
          >
            <div className="flex items-start gap-2">
              <span aria-hidden="true" className="flex-shrink-0 font-bold text-red-800">✕</span>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Please correct the following errors:
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                  {Object.values(errors).map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="rep-name"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Full Name <span className="text-csnp-error">*</span>
            </label>
            <input
              id="rep-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                errors.name
                  ? 'border-csnp-error focus:border-csnp-error'
                  : 'border-csnp-neutral-300 focus:border-csnp-secondary'
              }`}
              placeholder="Enter representative's full name"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'rep-name-error' : undefined}
            />
            {errors.name && (
              <p id="rep-name-error" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="rep-relationship"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Relationship <span className="text-csnp-error">*</span>
            </label>
            <select
              id="rep-relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                errors.relationship
                  ? 'border-csnp-error focus:border-csnp-error'
                  : 'border-csnp-neutral-300 focus:border-csnp-secondary'
              }`}
              aria-invalid={errors.relationship ? 'true' : 'false'}
              aria-describedby={errors.relationship ? 'rep-relationship-error' : undefined}
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.relationship && (
              <p id="rep-relationship-error" className="mt-1 text-xs text-red-600">
                {errors.relationship}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="rep-phone"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Phone Number
            </label>
            <input
              id="rep-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                errors.phone
                  ? 'border-csnp-error focus:border-csnp-error'
                  : 'border-csnp-neutral-300 focus:border-csnp-secondary'
              }`}
              placeholder="Enter phone number"
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'rep-phone-error' : undefined}
            />
            {errors.phone && (
              <p id="rep-phone-error" className="mt-1 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="rep-email"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Email Address
            </label>
            <input
              id="rep-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                errors.email
                  ? 'border-csnp-error focus:border-csnp-error'
                  : 'border-csnp-neutral-300 focus:border-csnp-secondary'
              }`}
              placeholder="Enter email address"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'rep-email-error' : undefined}
            />
            {errors.email && (
              <p id="rep-email-error" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="rep-address"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Mailing Address
            </label>
            <input
              id="rep-address"
              name="address"
              type="text"
              autoComplete="street-address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm"
              placeholder="Enter mailing address"
            />
          </div>

          <div>
            <label
              htmlFor="rep-scope"
              className="block text-sm font-medium text-csnp-neutral-700"
            >
              Authorization Scope
            </label>
            <select
              id="rep-scope"
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm"
            >
              {SCOPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-csnp-neutral-200 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
            aria-label={submitLabel}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    );
  }

  /**
   * Finds the representative being removed for the confirmation dialog.
   */
  const removingRep = removingId
    ? representatives.find((rep) => rep.id === removingId)
    : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-csnp-neutral-800">
            Authorized Representatives
          </h2>
          <p className="mt-1 text-sm text-csnp-neutral-500">
            Manage the people authorized to act on your behalf.
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
            aria-label="Add a new representative"
          >
            + Add Representative
          </button>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      {removingId && removingRep && (
        <div
          role="alertdialog"
          aria-labelledby="remove-dialog-title"
          aria-describedby="remove-dialog-desc"
          className="mb-6 rounded-lg border border-csnp-error bg-red-50 p-5"
        >
          <h3
            id="remove-dialog-title"
            className="text-sm font-semibold text-red-800"
          >
            Confirm Removal
          </h3>
          <p
            id="remove-dialog-desc"
            className="mt-2 text-sm text-red-700"
          >
            Are you sure you want to remove <strong>{removingRep.name}</strong> ({removingRep.relationship}) as an authorized representative? This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleConfirmRemove}
              className="rounded-md bg-csnp-error px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
              aria-label={`Confirm removal of ${removingRep.name}`}
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleCancelRemove}
              className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
              aria-label="Cancel removal"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Representative Form */}
      {isAdding && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-medium text-csnp-neutral-800">
            Add New Representative
          </h3>
          {renderForm(handleAddSubmit, 'Add Representative', 'Add new representative form')}
        </div>
      )}

      {/* Representatives List */}
      {representatives.length === 0 && !isAdding ? (
        <div className="rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-8 text-center">
          <span aria-hidden="true" className="text-4xl">👥</span>
          <p className="mt-3 text-sm font-medium text-csnp-neutral-600">
            No authorized representatives
          </p>
          <p className="mt-1 text-xs text-csnp-neutral-500">
            You have not added any authorized representatives yet. Click &quot;Add Representative&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4" aria-label="List of authorized representatives">
          {representatives.map((rep) => (
            <div key={rep.id}>
              {editingId === rep.id ? (
                <div>
                  <h3 className="mb-3 text-lg font-medium text-csnp-neutral-800">
                    Edit Representative
                  </h3>
                  {renderForm(handleEditSubmit, 'Save Changes', `Edit representative ${rep.name} form`)}
                </div>
              ) : (
                <div className="rounded-lg border border-csnp-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="text-lg">👤</span>
                        <h3 className="text-sm font-semibold text-csnp-neutral-800">
                          {rep.name}
                        </h3>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                            Relationship
                          </dt>
                          <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                            {rep.relationship || '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                            Scope
                          </dt>
                          <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                            <span className="inline-flex items-center rounded-md bg-csnp-neutral-100 px-2 py-0.5 text-xs font-medium text-csnp-neutral-700">
                              {rep.scope || 'Full Access'}
                            </span>
                          </dd>
                        </div>
                        {rep.phone && (
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                              Phone
                            </dt>
                            <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                              {rep.phone}
                            </dd>
                          </div>
                        )}
                        {rep.email && (
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                              Email
                            </dt>
                            <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                              {rep.email}
                            </dd>
                          </div>
                        )}
                        {rep.address && (
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                              Address
                            </dt>
                            <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                              {rep.address}
                            </dd>
                          </div>
                        )}
                        {rep.authorizedDate && (
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                              Authorized Date
                            </dt>
                            <dd className="mt-0.5 text-sm text-csnp-neutral-700">
                              <time dateTime={rep.authorizedDate}>{rep.authorizedDate}</time>
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(rep)}
                        disabled={isAdding || (editingId !== null && editingId !== rep.id)}
                        className="rounded-md border border-csnp-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Edit ${rep.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRemove(rep.id)}
                        disabled={isAdding || editingId !== null}
                        className="rounded-md border border-csnp-error bg-white px-3 py-1.5 text-xs font-medium text-csnp-error shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${rep.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 rounded-md bg-csnp-neutral-50 p-4">
        <p className="text-xs text-csnp-neutral-500">
          <span aria-hidden="true">ℹ</span>{' '}
          Authorized representatives can access your account information and make decisions on your behalf based on their assigned scope. Changes are saved automatically.
        </p>
      </div>
    </div>
  );
}

export default RepresentativesPage;