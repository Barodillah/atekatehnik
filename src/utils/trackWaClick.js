/**
 * Track WhatsApp CTA click — fire-and-forget POST to /api/track_wa_click.php
 *
 * @param {string} sourcePage  - Page identifier, e.g. 'product-detail', 'chatbot'
 * @param {string} sourceLabel - Context label, e.g. product name, 'contact-agent'
 */
export const trackWaClick = (sourcePage, sourceLabel = '') => {
  try {
    fetch('/api/track_wa_click.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_page: sourcePage,
        source_label: sourceLabel,
      }),
    }).catch(() => {});
  } catch {
    // Silently ignore — tracking must never block UX
  }
};

if (typeof window !== 'undefined') {
  window.trackWaClick = trackWaClick;
}
