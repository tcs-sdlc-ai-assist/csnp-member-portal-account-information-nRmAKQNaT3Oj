/**
 * Personal information view/edit page for the CSNP Member Portal.
 * Displays Name, Address, Email, Phone, Member ID with PII masking in view mode.
 * Edit mode reveals unmasked values in form fields.
 * Save button persists changes to localStorage via MemberDataContext.
 * Cancel reverts to saved state.
 * @module PersonalInfoPage
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useMemberData } from '../../contexts/MemberDataContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { maskEmail, maskPhone, maskMemberId } from '../../utils/masking.js';

/**
 * PersonalInfoPage component that renders the personal information
 * view and edit interface. In view mode, PII fields are masked.
 * In edit mode, full values are shown in editable form fields.
 *
 * @returns {JSX.Element} The personal info settings page element.
 */
export function PersonalInfoPage() {
  const { getMaskedPII } = useAuth();
  const { personalInfo, updatePersonalInfo } = useMemberData();
  const { showNotification } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const maskedPII = getMaskedPII();

  /**
   * Enters edit mode and populates form with current unmasked values.
   */
  const handleEdit = useCallback(() => {
    setFormData({
      name: personalInfo.name || '',
      address: personalInfo.address || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
    });
    setErrors({});
    setIsEditing(true);
  }, [personalInfo]);

  /**
   * Cancels editing and reverts to view mode.
   */
  const handleCancel = useCallback(() => {
    setFormData({
      name: '',
      address: '',
      email: '',
      phone: '',
    });
    setErrors({});
    setIsEditing(false);
  }, []);

  /**
   * Handles form field changes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
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
   * Validates form data before saving.
   * @returns {boolean} True if the form data is valid.
   */
  function validate() {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.address || !formData.address.trim()) {
      newErrors.address = 'Address is required.';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else {
      const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Handles form submission. Validates and saves changes.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = updatePersonalInfo({
      name: formData.name.trim(),
      address: formData.address.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    });

    if (result.success) {
      showNotification('Personal information updated successfully.', 'success');
      setIsEditing(false);
      setErrors({});
    } else {
      showNotification(result.error || 'Failed to update personal information.', 'error');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-csnp-neutral-800">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-csnp-neutral-500">
            View and manage your personal details and contact information.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
            aria-label="Edit personal information"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div
          className="space-y-5"
          aria-label="Personal information details"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Full Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                {maskedPII.name || '—'}
              </dd>
            </div>

            <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Member ID
              </dt>
              <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                {maskedPII.memberId || '****'}
              </dd>
            </div>

            <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Email Address
              </dt>
              <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                {maskedPII.email || '***@***.***'}
              </dd>
            </div>

            <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                {maskedPII.phone || '***-***-****'}
              </dd>
            </div>

            <div className="rounded-md border border-csnp-neutral-200 bg-csnp-neutral-50 p-4 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-csnp-neutral-500">
                Mailing Address
              </dt>
              <dd className="mt-1 text-sm font-medium text-csnp-neutral-800">
                {maskedPII.address || '—'}
              </dd>
            </div>
          </div>

          <div className="rounded-md bg-csnp-neutral-50 p-4">
            <p className="text-xs text-csnp-neutral-500">
              <span aria-hidden="true">ℹ</span>{' '}
              Personal information is masked for your privacy. Click &quot;Edit&quot; to view and update your details.
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
          aria-label="Edit personal information form"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="personal-name"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Full Name
              </label>
              <input
                id="personal-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                  errors.name
                    ? 'border-csnp-error focus:border-csnp-error'
                    : 'border-csnp-neutral-300 focus:border-csnp-secondary'
                }`}
                placeholder="Enter your full name"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'personal-name-error' : undefined}
              />
              {errors.name && (
                <p id="personal-name-error" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="personal-member-id"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Member ID
              </label>
              <input
                id="personal-member-id"
                name="memberId"
                type="text"
                value={personalInfo.memberId || ''}
                disabled
                className="mt-1 block w-full rounded-md border border-csnp-neutral-300 bg-csnp-neutral-100 px-3 py-2 text-csnp-neutral-500 shadow-sm sm:text-sm cursor-not-allowed"
                aria-label="Member ID (read-only)"
              />
              <p className="mt-1 text-xs text-csnp-neutral-400">
                Member ID cannot be changed.
              </p>
            </div>

            <div>
              <label
                htmlFor="personal-email"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Email Address
              </label>
              <input
                id="personal-email"
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
                placeholder="Enter your email address"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'personal-email-error' : undefined}
              />
              {errors.email && (
                <p id="personal-email-error" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="personal-phone"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Phone Number
              </label>
              <input
                id="personal-phone"
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
                placeholder="Enter your phone number"
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'personal-phone-error' : undefined}
              />
              {errors.phone && (
                <p id="personal-phone-error" className="mt-1 text-xs text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="personal-address"
                className="block text-sm font-medium text-csnp-neutral-700"
              >
                Mailing Address
              </label>
              <input
                id="personal-address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-csnp-neutral-800 placeholder-csnp-neutral-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 sm:text-sm ${
                  errors.address
                    ? 'border-csnp-error focus:border-csnp-error'
                    : 'border-csnp-neutral-300 focus:border-csnp-secondary'
                }`}
                placeholder="Enter your mailing address"
                aria-invalid={errors.address ? 'true' : 'false'}
                aria-describedby={errors.address ? 'personal-address-error' : undefined}
              />
              {errors.address && (
                <p id="personal-address-error" className="mt-1 text-xs text-red-600">
                  {errors.address}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-csnp-neutral-200 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-csnp-neutral-300 bg-white px-4 py-2 text-sm font-medium text-csnp-neutral-700 shadow-sm transition-colors hover:bg-csnp-neutral-50 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
              aria-label="Cancel editing personal information"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-csnp-secondary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-csnp-secondary-dark focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2"
              aria-label="Save personal information changes"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PersonalInfoPage;