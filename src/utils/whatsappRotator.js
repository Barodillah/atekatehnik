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

const ROTATOR_STORAGE_KEY = 'ateka_wa_rotator_idx';

/**
 * Mendapatkan kontak berikutnya secara bergantian (Round-Robin)
 * dan mengupdate index rotasi di localStorage.
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
 * Mendapatkan kontak saat ini tanpa memajukan index rotasi
 * (berguna untuk default href/fallback)
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
 * Membentuk URL wa.me dengan teks pesan
 */
export const buildWaUrl = (number, text = 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.') => {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

/**
 * Menangani klik tombol WhatsApp bergantian:
 * Memajukan rotasi, mencatat tracking log dengan target nomor & label,
 * lalu membuka WhatsApp di tab baru.
 *
 * @param {string} sourcePage  - Misal 'floating-btn', 'hero', 'product-detail'
 * @param {string} sourceLabel - Misal nama produk, 'hubungi-langsung'
 * @param {string} customText  - Pesan pembuka WhatsApp
 */
export const handleRotatedWaClick = (sourcePage, sourceLabel = '', customText = '') => {
  const contact = getNextWaContact();
  const text = customText || 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.';
  trackWaClick(sourcePage, sourceLabel, contact.number, contact.name);
  const url = buildWaUrl(contact.number, text);
  window.open(url, '_blank', 'noopener,noreferrer');
  return contact;
};

if (typeof window !== 'undefined') {
  window.handleRotatedWaClick = handleRotatedWaClick;
  window.openRotatedWhatsApp = handleRotatedWaClick;
  window.WA_CONTACTS = WA_CONTACTS;
}

/**
 * Menangani klik WhatsApp ke kontak spesifik tertentu (tanpa rotasi)
 * Digunakan jika tombol diarahkan khusus ke Rani atau Barron.
 */
export const handleDirectWaClick = (contactNumberOrId, sourcePage, sourceLabel = '', customText = '') => {
  const contact = WA_CONTACTS.find(
    c => c.id === contactNumberOrId || c.number === contactNumberOrId
  ) || WA_CONTACTS[0];

  const text = customText || 'Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik.';
  trackWaClick(sourcePage, sourceLabel, contact.number, contact.name);
  const url = buildWaUrl(contact.number, text);
  window.open(url, '_blank', 'noopener,noreferrer');
  return contact;
};

if (typeof window !== 'undefined') {
  window.handleRotatedWaClick = handleRotatedWaClick;
  window.openRotatedWhatsApp = handleRotatedWaClick;
  window.WA_CONTACTS = WA_CONTACTS;
}
