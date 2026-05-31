/**
 * Accessible skip-to-content link component.
 * Renders a visually hidden link that becomes visible on focus,
 * allowing keyboard users to skip navigation and jump to main content.
 * WCAG 2.1 AA compliant.
 * @module SkipToContent
 */

import PropTypes from 'prop-types';

/**
 * SkipToContent component renders an anchor link that is visually hidden
 * until it receives keyboard focus. When activated, it moves focus to the
 * element identified by the targetId prop (defaults to '#main-content').
 *
 * Uses the `.skip-to-content` utility class defined in index.css for styling.
 *
 * @param {object} props
 * @param {string} [props.targetId='main-content'] - The ID of the target element to skip to (without the '#' prefix).
 * @param {string} [props.label='Skip to main content'] - The visible label text for the skip link.
 * @returns {JSX.Element} The skip-to-content anchor element.
 */
export function SkipToContent({ targetId = 'main-content', label = 'Skip to main content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
    >
      {label}
    </a>
  );
}

SkipToContent.propTypes = {
  targetId: PropTypes.string,
  label: PropTypes.string,
};

export default SkipToContent;