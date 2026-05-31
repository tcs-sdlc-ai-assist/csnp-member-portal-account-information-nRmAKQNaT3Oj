/**
 * Account settings page layout for the CSNP Member Portal.
 * Composes Sidebar with a content area (Outlet) for the active settings section.
 * Provides responsive layout with sidebar collapsing on mobile.
 * @module SettingsLayout
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';

/**
 * SettingsLayout component that provides the account settings page structure.
 * Renders the Sidebar navigation alongside the active settings section content
 * via React Router's Outlet. On mobile, the sidebar collapses to a horizontal
 * scrollable navigation bar above the content area.
 *
 * @returns {JSX.Element} The settings layout element.
 */
export function SettingsLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-csnp-neutral-800">
        Account Settings
      </h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <Sidebar className="rounded-lg border border-csnp-neutral-200 bg-white p-3 shadow-sm" />
        <section
          className="min-w-0 flex-1 rounded-lg border border-csnp-neutral-200 bg-white p-6 shadow-sm"
          aria-label="Settings content"
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default SettingsLayout;