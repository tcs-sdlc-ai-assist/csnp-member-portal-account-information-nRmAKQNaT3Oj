/**
 * Main application layout wrapper for the CSNP Member Portal.
 * Composes SkipToContent, Header, main content area (Outlet), and Footer.
 * Sets up the main landmark structure for accessibility.
 * @module AppLayout
 */

import { Outlet } from 'react-router-dom';
import { SkipToContent } from '../common/SkipToContent.jsx';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

/**
 * AppLayout component that provides the main application structure.
 * Renders the skip-to-content link, header, main content area with
 * an Outlet for nested routes, and footer.
 * Uses semantic HTML landmarks for accessibility compliance.
 *
 * @returns {JSX.Element} The application layout element.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent targetId="main-content" label="Skip to main content" />
      <Header />
      <main
        id="main-content"
        role="main"
        className="flex-1"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;