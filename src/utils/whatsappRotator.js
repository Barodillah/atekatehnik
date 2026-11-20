import { trackWaClick } from './trackWaClick';

/**
 * Daftar Kontak WhatsApp CS Ateka Tehnik
 * 1. Rani   : 62881080634612
 * 2. Barron : 62882005144907
 */
export const WA_CONTACTS = [
  {
    id: 'rani',
    name: 'Rani',
    number: '62881080634612',
    display: '+62 881-0806-34612',
  },
  {
    id: 'barron',
    name: 'Barron',
    number: '62882005144907',
    display: '+62 882-0051-44907',
  },
];

const DEFAULT_WA_TEXT = 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.';
const ROTATOR_STORAGE_KEY = 'ateka_wa_rotator_idx';

/**
 * Membentuk URL redirect pintar ke server (/api/wa_redirect.php).
 * Server akan membaca database klik terakhir untuk menentukan giliran CS (Rani / Barron)
 * secara global across all devices & IPs.
 */
export const getWaRedirectUrl = (sourcePage = 'website', sourceLabel = '', customText = '', target = '') => {
  const params = new URLSearchParams();
  if (sourcePage) params.set('source_page', sourcePage);
  if (sourceLabel) params.set('source_label', sourceLabel);
  params.set('text', customText || DEFAULT_WA_TEXT);
  if (target) params.set('target', target);

  return `/api/wa_redirect.php?${params.toString()}`;
};

/**
 * Mendapatkan kontak saat ini dari cache lokal (sebagai fallback tampilan).
 */
export const getCurrentWaContact = () => {
  let currentIdx = 0;
  try {
    const saved = localStorage.getItem(ROTATOR_STORAGE_KEY);
    if (saved !== null) {
      currentIdx = parseInt(saved, 10) % WA_CONTACTS.length;
    }
  } catch (e) {}

  return WA_CONTACTS[currentIdx] || WA_CONTACTS[0];
};

/**
 * Mendapatkan kontak berikutnya secara round-robin lokal (fallback).
 */
export const getNextWaContact = () => {
  let nextIdx = 0;
  try {
    const saved = localStorage.getItem(ROTATOR_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      nextIdx = (parsed + 1) % WA_CONTACTS.length;
    }
  } catch (e) {
    nextIdx = Math.floor(Math.random() * WA_CONTACTS.length);
  }

  try {
    localStorage.setItem(ROTATOR_STORAGE_KEY, nextIdx.toString());
  } catch (e) {}

  return WA_CONTACTS[nextIdx] || WA_CONTACTS[0];
};

/**
 * Membentuk URL direct wa.me / api.whatsapp.com dengan nomor dan teks pesan.
 */
export const buildWaUrl = (number, text = DEFAULT_WA_TEXT) => {
  const cleanNumber = (number || WA_CONTACTS[0].number).replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text || DEFAULT_WA_TEXT)}`;
};

/**
 * Menangani klik tombol WhatsApp bergantian berbasis SERVER DATABASE:
 * Mengarahkan ke /api/wa_redirect.php yang membaca riwayat klik terakhir di database
 * lalu langsung meneruskan ke WhatsApp CS yang bergiliran (Rani <-> Barron)
 * secara akurat meskipun pengunjung berbeda device, berbeda IP, atau private browsing.
 *
 * @param {string} sourcePage  - Misal 'floating-btn', 'hero', 'product-detail'
 * @param {string} sourceLabel - Misal nama produk, 'hubungi-langsung'
 * @param {string} customText  - Pesan pembuka WhatsApp
 */
export const handleRotatedWaClick = (sourcePage, sourceLabel = '', customText = '') => {
  // Update local counter as secondary fallback
  getNextWaContact();

  const url = getWaRedirectUrl(sourcePage, sourceLabel, customText);

  // Buka URL redirect di tab baru
  const newTab = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
    // Jika window.open diblokir oleh browser pop-up blocker, buka di window saat ini
    window.location.href = url;
  }

  return { redirected: true, url };
};

/**
 * Menangani klik WhatsApp ke kontak spesifik tertentu (tanpa rotasi)
 * Digunakan jika tombol diarahkan khusus ke nomor Rani atau Barron.
 *
 * @param {string} contactNumberOrId - 'rani', 'barron', atau nomor telp
 * @param {string} sourcePage        - Misal 'contact-page'
 * @param {string} sourceLabel       - Misal 'wa-support'
 * @param {string} customText        - Pesan pembuka
 */
export const handleDirectWaClick = (contactNumberOrId, sourcePage = 'contact-page', sourceLabel = '', customText = '') => {
  const targetId = (contactNumberOrId === 'barron' || contactNumberOrId === '62882005144907') ? 'barron' : 'rani';
  const url = getWaRedirectUrl(sourcePage, sourceLabel, customText, targetId);

  const newTab = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
    window.location.href = url;
  }

  return { redirected: true, target: targetId, url };
};

// Global window helpers untuk script eksternal
if (typeof window !== 'undefined') {
  window.handleRotatedWaClick = handleRotatedWaClick;
  window.handleDirectWaClick = handleDirectWaClick;
  window.openRotatedWhatsApp = handleRotatedWaClick;
  window.getWaRedirectUrl = getWaRedirectUrl;
  window.WA_CONTACTS = WA_CONTACTS;
}
