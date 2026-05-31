/**
 * React Context provider for simulated notification system.
 * Manages toast/banner notifications for UI feedback.
 * Simulates CDM/NCompass integration feedback.
 * Exports useNotification hook with showNotification and dismissNotification.
 * @module NotificationContext
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} NotificationType
 */

/**
 * @typedef {object} Notification
 * @property {string} id - Unique notification identifier.
 * @property {string} message - The notification message text.
 * @property {NotificationType} type - The notification type/severity.
 * @property {number} timestamp - The time the notification was created (ms since epoch).
 */

/**
 * @typedef {object} NotificationContextValue
 * @property {Notification[]} notifications - The current list of active notifications.
 * @property {function(string, NotificationType=): string} showNotification - Displays a notification with a message and optional type. Returns the notification ID.
 * @property {function(string): void} dismissNotification - Dismisses a notification by ID.
 * @property {function(): void} clearAllNotifications - Clears all active notifications.
 */

/**
 * Default auto-dismiss duration in milliseconds.
 * @type {number}
 */
const AUTO_DISMISS_MS = 5000;

/**
 * Valid notification types.
 * @type {Set<string>}
 */
const VALID_TYPES = new Set(['success', 'error', 'warning', 'info']);

const NotificationContext = createContext(null);

/**
 * Generates a unique notification ID.
 * @returns {string} A unique ID string.
 */
function generateNotificationId() {
  return 'notif-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

/**
 * NotificationProvider component that wraps the application and provides notification state.
 * Supports auto-dismissal of notifications after a configurable timeout.
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} The NotificationContext provider wrapping children.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  /**
   * Clears the auto-dismiss timer for a given notification ID.
   * @param {string} id - The notification ID.
   */
  const clearTimer = useCallback((id) => {
    const timers = timersRef.current;
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
  }, []);

  /**
   * Dismisses a notification by ID.
   * @param {string} id - The notification ID to dismiss.
   */
  const dismissNotification = useCallback((id) => {
    if (!id || typeof id !== 'string') {
      return;
    }
    clearTimer(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, [clearTimer]);

  /**
   * Displays a notification with a message and optional type.
   * Notifications are automatically dismissed after AUTO_DISMISS_MS unless type is 'error'.
   * @param {string} message - The notification message text.
   * @param {NotificationType} [type='info'] - The notification type/severity.
   * @returns {string} The unique ID of the created notification.
   */
  const showNotification = useCallback((message, type = 'info') => {
    if (!message || typeof message !== 'string') {
      return '';
    }

    const resolvedType = VALID_TYPES.has(type) ? type : 'info';

    const id = generateNotificationId();
    const notification = {
      id,
      message: message.trim(),
      type: resolvedType,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss non-error notifications
    if (resolvedType !== 'error') {
      const timer = setTimeout(() => {
        dismissNotification(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [dismissNotification]);

  /**
   * Clears all active notifications and their auto-dismiss timers.
   */
  const clearAllNotifications = useCallback(() => {
    const timers = timersRef.current;
    for (const [, timer] of timers) {
      clearTimeout(timer);
    }
    timers.clear();
    setNotifications([]);
  }, []);

  const contextValue = {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the notification context.
 * Must be used within a NotificationProvider.
 * @returns {NotificationContextValue} The notification context value.
 * @throws {Error} If used outside of a NotificationProvider.
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider.');
  }
  return context;
}

export default NotificationContext;