/**
 * UTM & Campaign Tracker Utility — Ateka Tehnik
 * 
 * Captures the 9 UTM parameters:
 * utm_source, utm_medium, utm_campaign, utm_content, utm_term,
 * utm_id, utm_source_platform, utm_creative_format, utm_marketing_tactic
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic'
];

const UTM_SESSION_KEY = 'ateka_utm_session';
const UTM_FIRST_TOUCH_KEY = 'ateka_first_touch_utm';

// In-memory set to prevent double execution in React StrictMode (development mode)
const inMemoryTracked = new Set();

/**
 * Extracts UTM parameters from URL search string
 * @param {string} search - e.g. "?utm_source=meta&utm_medium=cpc..."
 * @returns {object|null}
 */
export const extractUtmParams = (search = window.location.search) => {
  if (!search) return null;
  const params = new URLSearchParams(search);
  
  const utmSource = params.get('utm_source');
  if (!utmSource) return null;

  const utmData = {};
  UTM_KEYS.forEach((key) => {
    const val = params.get(key);
    if (val !== null && val !== '') {
      utmData[key] = val.trim();
    }
  });

  return Object.keys(utmData).length > 0 ? utmData : null;
};

/**
 * Saves UTM parameters into sessionStorage & localStorage (first-touch attribution)
 */
export const saveUtmToStorage = (utmData, landingUrl) => {
  if (!utmData || typeof window === 'undefined') return;

  const payload = {
    ...utmData,
    landing_url: landingUrl || window.location.pathname + window.location.search,
    captured_at: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(payload));
    
    // Save first-touch if not already present
    if (!localStorage.getItem(UTM_FIRST_TOUCH_KEY)) {
      localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(payload));
    }
  } catch (e) {
    console.debug('Failed to write UTM storage', e);
  }
};

/**
 * Retrieves the stored UTM parameters from sessionStorage (or first-touch fallback)
 */
export const getStoredUtm = () => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionData = sessionStorage.getItem(UTM_SESSION_KEY);
    if (sessionData) return JSON.parse(sessionData);

    const firstTouch = localStorage.getItem(UTM_FIRST_TOUCH_KEY);
    if (firstTouch) return JSON.parse(firstTouch);
  } catch (e) {
    console.debug('Failed to read UTM storage', e);
  }
  return null;
};

/**
 * Helper to determine page_type and slug from pathname
 */
const resolvePageContext = (pathname = window.location.pathname) => {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath.startsWith('/product/')) {
    return { page_type: 'product', slug: cleanPath.replace('/product/', '') };
  }
  if (cleanPath.startsWith('/portfolio/')) {
    return { page_type: 'post', slug: cleanPath.replace('/portfolio/', '') };
  }
  if (cleanPath.startsWith('/news/')) {
    return { page_type: 'post', slug: cleanPath.replace('/news/', '') };
  }
  if (cleanPath.startsWith('/post/')) {
    return { page_type: 'post', slug: cleanPath.replace('/post/', '') };
  }
  if (cleanPath === '/gallery') {
    return { page_type: 'gallery', slug: 'gallery' };
  }

  // Any other page (Home, Products catalog, About, Contact, etc.)
  const pageSlug = cleanPath === '/' ? 'home' : cleanPath.replace(/^\//, '').replace(/\//g, '-');
  return { page_type: 'page', slug: pageSlug };
};

/**
 * Tracks campaign visit if UTM parameters exist in current URL.
 * Automatically dedupes visits synchronously to prevent duplicate counts from React StrictMode.
 */
export const trackCampaignVisit = (pathname, search) => {
  if (typeof window === 'undefined') return;

  const utmData = extractUtmParams(search);
  if (!utmData) return;

  const dedupeKey = `ateka_tracked_campaign_${search}`;

  // 1. Synchronous in-memory check (catches React 18/19 StrictMode double-render immediately)
  if (inMemoryTracked.has(dedupeKey)) {
    return;
  }

  // 2. Synchronous sessionStorage check (catches page refresh / internal SPA route changes)
  try {
    if (sessionStorage.getItem(dedupeKey)) {
      inMemoryTracked.add(dedupeKey);
      return;
    }
  } catch {
    // Ignore storage issues
  }

  // CRITICAL: Mark as tracked SYNCHRONOUSLY before dispatching fetch
  inMemoryTracked.add(dedupeKey);
  try {
    sessionStorage.setItem(dedupeKey, Date.now().toString());
  } catch {}

  const landingUrl = (pathname || window.location.pathname) + (search || window.location.search);
  saveUtmToStorage(utmData, landingUrl);

  const { page_type, slug } = resolvePageContext(pathname);

  try {
    fetch('/api/track_view.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_type,
        slug,
        landing_url: landingUrl,
        utm: utmData
      })
    }).catch(() => {});
  } catch {
    // Silent fail to preserve UX
  }
};
