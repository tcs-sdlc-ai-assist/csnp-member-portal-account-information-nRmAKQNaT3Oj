/**
 * Toast notification component for the CSNP Member Portal.
 * Displays success, error, warning, and info messages with auto-dismiss and manual close.
 * Uses aria-live for screen reader announcements.
 * Consumes NotificationContext for notification state management.
 * @module Toast
 */

import PropTypes from 'prop-types';
import { useNotification } from '../../contexts/NotificationContext.jsx';

/**
 * Maps notification type to Tailwind CSS classes for styling.
 * @param {string} type - The notification type.
 * @returns {string} Tailwind CSS classes for the notification type.
 */
function getTypeClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-csnp-success text-green-800';
    case 'error':
      return 'bg-red-50 border-csnp-error text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-csnp-warning text-yellow-900';
    case 'info':
    default:
      return 'bg-blue-50 border-csnp-info text-blue-800';
  }
}

/**
 * Maps notification type to an accessible label prefix.
 * @param {string} type - The notification type.
 * @returns {string} The accessible label prefix.
 */
function getTypeLabel(type) {
  switch (type) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
    default:
      return 'Info';
  }
}

/**
 * Maps notification type to an icon character for visual indication.
 * @param {string} type - The notification type.
 * @returns {string} The icon character.
 */
function getTypeIcon(type) {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
}

/**
 * Maps notification type to icon background Tailwind classes.
 * @param {string} type - The notification type.
 * @returns {string} Tailwind CSS classes for the icon background.
 */
function getIconClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-csnp-success text-white';
    case 'error':
      return 'bg-csnp-error text-white';
    case 'warning':
      return 'bg-csnp-warning text-yellow-900';
    case 'info':
    default:
      return 'bg-csnp-info text-white';
  }
}

/**
 * Individual toast item component.
 * Renders a single notification with icon, message, and close button.
 *
 * @param {object} props
 * @param {string} props.id - The notification ID.
 * @param {string} props.message - The notification message text.
 * @param {string} props.type - The notification type (success, error, warning, info).
 * @param {function} props.onDismiss - Callback to dismiss the notification.
 * @returns {JSX.Element} The toast item element.
 */
function ToastItem({ id, message, type, onDismiss }) {
  const typeClasses = getTypeClasses(type);
  const typeLabel = getTypeLabel(type);
  const typeIcon = getTypeIcon(type);
  const iconClasses = getIconClasses(type);

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg transition-all duration-300 ${typeClasses}`}
    >
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${iconClasses}`}
        aria-hidden="true"
      >
        {typeIcon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{typeLabel}</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 transition-opacity"
        aria-label={`Dismiss ${typeLabel.toLowerCase()} notification`}
      >
        <span aria-hidden="true" className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

/**
 * Toast container component that renders all active notifications.
 * Consumes NotificationContext to display and dismiss notifications.
 * Positioned fixed in the top-right corner of the viewport.
 *
 * @returns {JSX.Element} The toast container element.
 */
export function Toast() {
  const { notifications, dismissNotification } = useNotification();

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3"
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
}

export default Toast;