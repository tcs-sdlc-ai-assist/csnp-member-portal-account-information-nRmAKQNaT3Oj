/**
 * Reusable form component for adding/editing an authorized representative.
 * Fields: name, relationship (dropdown), phone, email, address, scope.
 * Validates required fields and emits onSave and onCancel callbacks.
 * Accessible form with proper labels and error messages.
 * @module RepresentativeForm
 */

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

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
 * Empty form data template.
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
 * RepresentativeForm component for adding or editing an authorized representative.
 * Validates required fields (name, relationship) and optional fields (email format, phone format).
 * Emits onSave with validated form data and onCancel to dismiss the form.
 *
 * @param {object} props
 * @param {object} [props.initialData] - Initial form data for editing. If omitted, form starts empty (add mode).
 * @param {function} props.onSave - Callback invoked with the validated form data object on successful submission.
 * @param {function} props.onCancel - Callback invoked when the user cancels the form.
 * @param {string} [props.submitLabel='Save'] - Label text for the submit button.
 * @param {string} [props.formLabel='Representative form'] - Accessible aria-label for the form element.
 * @param {boolean} [props.disabled=false] - Whether the form inputs and buttons should be disabled.
 * @returns {JSX.Element} The representative form element.
 */
export function RepresentativeForm({
  initialData,
  onSave,
  onCancel,
  submitLabel = 'Save',
  formLabel = 'Representative form',
  disabled = false,
}) {
  const [formData, setFormData] = useState(() => {
    if (initialData && typeof initialData === 'object') {
      return {
        name: initialData.name || '',
        relationship: initialData.relationship || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        scope: initialData.scope || 'Full Access',
      };
    }
    return { ...EMPTY_FORM };
  });

  const [errors, setErrors] = useState({});

  /**
   * Validates the form data.
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
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (prev[name]) {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      }
      return prev;
    });
  }, []);

  /**
   * Handles form submission. Validates and invokes onSave with form data.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      scope: formData.scope.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-csnp-neutral-200 bg-csnp-neutral-50 p-5"
      noValidate
      aria-label={formLabel}
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
            htmlFor="rep-form-name"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Full Name <span className="text-csnp-error">*</span>
          </label>
          <input
            id="rep-form-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm ${
              errors.name
                ? 'border-csnp-error focus:border-csnp-error'
                : 'border-csnp-neutral-300 focus:border-csnp-secondary'
            }`}
            placeholder="Enter representative's full name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'rep-form-name-error' : undefined}
          />
          {errors.name && (
            <p id="rep-form-name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="rep-form-relationship"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Relationship <span className="text-csnp-error">*</span>
          </label>
          <select
            id="rep-form-relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm ${
              errors.relationship
                ? 'border-csnp-error focus:border-csnp-error'
                : 'border-csnp-neutral-300 focus:border-csnp-secondary'
            }`}
            aria-invalid={errors.relationship ? 'true' : 'false'}
            aria-describedby={errors.relationship ? 'rep-form-relationship-error' : undefined}
          >
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p id="rep-form-relationship-error" className="mt-1 text-xs text-red-600">
              {errors.relationship}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="rep-form-phone"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Phone Number
          </label>
          <input
            id="rep-form-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm ${
              errors.phone
                ? 'border-csnp-error focus:border-csnp-error'
                : 'border-csnp-neutral-300 focus:border-csnp-secondary'
            }`}
            placeholder="Enter phone number"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'rep-form-phone-error' : undefined}
          />
          {errors.phone && (
            <p id="rep-form-phone-error" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="rep-form-email"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Email Address
          </label>
          <input
            id="rep-form-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm ${
              errors.email
                ? 'border-csnp-error focus:border-csnp-error'
                : 'border-csnp-neutral-300 focus:border-csnp-secondary'
            }`}
            placeholder="Enter email address"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'rep-form-email-error' : undefined}
          />
          {errors.email && (
            <p id="rep-form-email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="rep-form-address"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Mailing Address
          </label>
          <input
            id="rep-form-address"
            name="address"
            type="text"
            autoComplete="street-address"
            value={formData.address}
            onChange={handleChange}
            disabled={disabled}
            className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm"
            placeholder="Enter mailing address"
          />
        </div>

        <div>
          <label
            htmlFor="rep-form-scope"
            className="block text-sm font-medium text-csnp-neutral-700"
          >
            Authorization Scope
          </label>
          <select
            id="rep-form-scope"
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            disabled={disabled}
            className="mt-1 block w-full rounded-md border border-csnp-neutral-300 px-3 py-2 text-csnp-neutral-800 shadow-sm transition-colors focus:border-csnp-secondary focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-csnp-neutral-100 sm:text-sm"
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
          onClick={onCancel}
          disabled={disabled}
          className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={submitLabel}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

RepresentativeForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    relationship: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    scope: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  formLabel: PropTypes.string,
  disabled: PropTypes.bool,
};

export default RepresentativeForm;