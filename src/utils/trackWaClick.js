import { getStoredUtm } from './utmTracker';
import { ADS, isAdsConfigured } from '../config/ads';
import { adsGtag } from './adsGtag';

// Satu key per label, dipakai bersama oleh waAnchorFallback
const dedupeKey = () => `ateka_ads_wa_fired_${ADS.labelWaClick}`;

const firedOnce = (key) => {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');
  } catch { /* storage diblokir */ }
  return false;
};

/**
 * Track WhatsApp CTA click — POST ke /api/track_wa_click.php + konversi Google Ads.
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

    // --- GA4: dikirim setiap klik (analitik) ---
    adsGtag('event', 'wa_click', {
      source_page: sourcePage,
      source_label: enrichedLabel,
      target_label: targetLabel || '',
      target_last4: targetNumber ? String(targetNumber).slice(-4) : '',
      utm_source: utmData?.utm_source || '(direct)',
      utm_medium: utmData?.utm_medium || '(none)',
      utm_campaign: utmData?.utm_campaign || '(not set)',
    });

    // --- Google Ads: konversi, sekali per sesi ---
    if (isAdsConfigured() && ADS.labelWaClick && !firedOnce(dedupeKey())) {
      adsGtag('event', 'conversion', {
        send_to: `${ADS.conversionId}/${ADS.labelWaClick}`,
        value: ADS.valueWaClick,
        currency: ADS.currency,
        transport_type: 'beacon',
      });
    }

    // --- Backend internal (jangan diubah perilakunya) ---
    fetch('/api/track_wa_click.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_page: sourcePage,
        source_label: enrichedLabel,
        target_number: targetNumber || null,
        wa_number: targetNumber || null,
        target_label: targetLabel || null,
      }),
    }).catch(() => {});
  } catch {
    // Tracking tidak boleh memblokir UX
  }
};

if (typeof window !== 'undefined') {
  window.trackWaClick = trackWaClick;
}
