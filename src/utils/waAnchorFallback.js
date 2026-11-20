import { ADS, isAdsConfigured } from '../config/ads';
import { adsGtag } from './adsGtag';

const dedupeKey = () => `ateka_ads_wa_fired_${ADS.labelWaClick}`;

const isWaAnchor = (el) =>
  Boolean(el && el.closest &&
    el.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="web.whatsapp.com/send"]'));

const fireIfNotYet = (label) => {
  if (!isAdsConfigured() || !label) return;
  try {
    if (sessionStorage.getItem(dedupeKey())) return; // sudah dihitung oleh trackWaClick
    sessionStorage.setItem(dedupeKey(), '1');
  } catch { /* storage diblokir: biarkan tetap terkirim */ }

  adsGtag('event', 'conversion', {
    send_to: `${ADS.conversionId}/${label}`,
    value: ADS.valueWaClick,
    currency: ADS.currency,
    transport_type: 'beacon',
  });
};

export const installWaAnchorFallback = () => {
  if (typeof window === 'undefined' || window.__atekaWaFallback) return;
  window.__atekaWaFallback = true;

  document.addEventListener('click', (e) => {
    if (!isWaAnchor(e.target)) return;

    // Klik normal: biarkan onClick React yang menghitung lewat trackWaClick.
    // Beri jeda agar dedupe key sudah terisi oleh jalur utama.
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button !== 1) {
      setTimeout(() => fireIfNotYet(ADS.labelWaClick), 600);
      return;
    }
    fireIfNotYet(ADS.labelWaClick);
  }, true);

  window.addEventListener('auxclick', (e) => {
    if (e.button === 1 && isWaAnchor(e.target)) fireIfNotYet(ADS.labelWaClick);
  }, true);
};
