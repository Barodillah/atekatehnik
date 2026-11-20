/**
 * Satu pintu untuk mengirim event ke gtag.
 * Repo ini punya dua loader (index.html + react-ga4), jadi jangan bergantung pada satu.
 */
export const adsGtag = (...args) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      return window.gtag(...args);
    }
  } catch { /* lanjut ke fallback */ }

  try {
    const rg = window.ReactGA;
    if (rg && typeof rg.gtag === 'function') return rg.gtag(...args);
  } catch { /* diamkan */ }

  return undefined;
};
