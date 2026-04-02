import { useEffect } from 'react';

const BASE_TITLE = 'ATEKA TEHNIK';
const DEFAULT_SUFFIX = 'Supplier Penggilingan Padi Terbaik di Indonesia';

/**
 * Sets document.title dynamically for SEO.
 * 
 * @param {string|null} title - Page-specific title. Pass null to use default.
 * @param {object} options
 * @param {boolean} options.noSuffix - If true, don't append base title.
 */
const usePageTitle = (title, { noSuffix = false } = {}) => {
  useEffect(() => {
    if (!title) {
      document.title = `${BASE_TITLE} | ${DEFAULT_SUFFIX}`;
    } else if (noSuffix) {
      document.title = title;
    } else {
      document.title = `${title} | ${BASE_TITLE}`;
    }

    return () => {
      // Reset to default when unmounting (navigating away)
      document.title = `${BASE_TITLE} | ${DEFAULT_SUFFIX}`;
    };
  }, [title, noSuffix]);
};

export default usePageTitle;
