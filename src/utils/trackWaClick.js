import { getStoredUtm } from './utmTracker';

/**
 * Track WhatsApp CTA click — fire-and-forget POST to /api/track_wa_click.php
 * Automatically includes active UTM Campaign info if visitor arrived via ad campaign.
 *
 * @param {string} sourcePage   - Page identifier, e.g. 'product-detail', 'chatbot'
 * @param {string} sourceLabel  - Context label, e.g. product name, 'contact-agent'
 * @param {string} targetNumber - Target phone number, e.g. '62881080634612'
 * @param {string} targetLabel  - Target CS label, e.g. 'Rani', 'Barron'
 */
export const trackWaClick = (sourcePage, sourceLabel = '', targetNumber = '', targetLabel = '') => {
  try {
    const utmData = getStoredUtm();
    let enrichedLabel = sourceLabel || '';
    if (utmData) {
      const campaignTag = utmData.utm_campaign || utmData.utm_source;
      if (campaignTag && !enrichedLabel.includes('[UTM:')) {
        enrichedLabel = enrichedLabel ? `${enrichedLabel} [UTM: ${campaignTag}]` : `[UTM: ${campaignTag}]`;
      }
    }

    fetch('/api/track_wa_click.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_page: sourcePage,
        source_label: enrichedLabel,
        target_number: targetNumber || null,
        target_label: targetLabel || null,
      }),
    }).catch(() => {});
  } catch {
    // Silently ignore — tracking must never block UX
  }
};

if (typeof window !== 'undefined') {
  window.trackWaClick = trackWaClick;
}
