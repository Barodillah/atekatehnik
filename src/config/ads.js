/**
 * Konfigurasi Google Ads — Ateka Tehnik
 * Nilai dari build-time env (Vite). Aman bila label kosong.
 */
export const ADS = {
  conversionId: import.meta.env.VITE_ADS_CONVERSION_ID || 'AW-18044930982',
  labelWaClick: import.meta.env.VITE_ADS_LABEL_WA_CLICK || '',
  labelLeadForm: import.meta.env.VITE_ADS_LABEL_LEAD_FORM || '',
  currency: 'IDR',
  valueWaClick: 1.0,
  valueLead: 1.0,
};

export const isAdsConfigured = () =>
  Boolean(ADS.conversionId && ADS.conversionId.startsWith('AW-'));
