/**
 * Account settings sidebar navigation component for the CSNP Member Portal.
 * Renders navigation links for Personal Info, Representatives, Privacy & Security,
 * Communication Preferences, PCP Management, and Care Manager.
 * Highlights active section and uses aria-current for accessibility.
 * @module Sidebar
 */

import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation items for the account settings sidebar.
 * @type {Array<{label: string, path: string, icon: string}>}
 */
const NAV_ITEMS = [
  {
    label: 'Personal Info',
    path: '/account-settings/personal-info',
    icon: '👤',
  },
  {
    label: 'Representatives',
    path: '/account-settings/representatives',
    icon: '👥',
  },
  {
    label: 'Privacy & Security',
    path: '/account-settings/privacy-security',
    icon: '🔒',
  },
  {
    label: 'Communication Preferences',
    path: '/account-settings/communication-preferences',
    icon: '📧',
  },
  {
    label: 'PCP Management',
    path: '/account-settings/pcp-management',
    icon: '🏥',
  },
  {
    label: 'Care Manager',
    path: '/account-settings/care-manager',
    icon: '💊',
  },
];

/**
 * Sidebar component that renders the account settings navigation.
 * Highlights the currently active section based on the current route.
 * Supports an optional className prop for additional styling.
 *
 * @param {object} props
 * @param {string} [props.className=''] - Additional CSS classes to apply to the sidebar container.
 * @returns {JSX.Element} The sidebar navigation element.
 */
export function Sidebar({ className = '' }) {
  const location = useLocation();

  /**
   * Determines if a given path is the current active route.
   * Also matches the base /account-settings path to the first nav item.
   * @param {string} path - The path to check.
   * @returns {boolean} True if the path matches the current location.
   */
  function isActive(path) {
    if (location.pathname === '/account-settings' && path === '/account-settings/personal-info') {
      return true;
    }
    return location.pathname === path;
  }

  return (
    <aside
      className={`w-full shrink-0 md:w-64 ${className}`}
      aria-label="Account settings navigation"
    >
      <nav aria-label="Account settings sections">
        <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0 md:overflow-x-visible">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-csnp focus:ring-offset-2 ${
                    active
                      ? 'bg-csnp-secondary text-white'
                      : 'text-csnp-neutral-700 hover:bg-csnp-neutral-100 hover:text-csnp-primary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span aria-hidden="true" className="text-base">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
};

export default Sidebar;