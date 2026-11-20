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

// Kontak yang disiapkan saat page load (default: Rani)
let preparedContact = WA_CONTACTS[0];
let isInitialized = false;
let initPromise = null;

/**
 * Mengambil 1 data dari database server saat page terload:
 * Nomor/label mana yang terakhir menerima klik WA,
 * untuk menyiapkan kontak WA berikutnya yang harus dituju.
 */
export const initWaRotation = async () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const res = await fetch('/api/track_wa_click.php?action=get_next');
      const data = await res.json();
      if (data && data.success && data.next) {
        const found = WA_CONTACTS.find(
          c => c.id === data.next.id || c.number === data.next.number
        );
        if (found) {
          preparedContact = found;
        }
      }
    } catch (err) {
      // Jika offline / error, tetap gunakan preparedContact default
      console.warn('Gagal memuat status rotasi WA dari server:', err);
    } finally {
      isInitialized = true;
    }
    return preparedContact;
  })();

  return initPromise;
};

// Jalankan otomatis saat script pertama kali dimuat di browser
if (typeof window !== 'undefined') {
  initWaRotation();
}

/**
 * Mendapatkan kontak yang sedang disiapkan untuk klik berikutnya
 */
export const getCurrentWaContact = () => {
  return preparedContact || WA_CONTACTS[0];
};

/**
 * Mengambil kontak saat ini lalu membalik antrean di memori
 * untuk klik berikutnya jika pengunjung mengklik lebih dari 1 kali.
 */
export const getNextWaContact = () => {
  const current = preparedContact || WA_CONTACTS[0];
  // Balikkan kontak untuk klik berikutnya
  preparedContact = current.id === 'rani' ? WA_CONTACTS[1] : WA_CONTACTS[0];
  return current;
};

/**
 * Membentuk URL wa.me dengan nomor dan pesan
 */
export const buildWaUrl = (number, text = DEFAULT_WA_TEXT) => {
  const cleanNumber = (number || preparedContact.number || WA_CONTACTS[0].number).replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text || DEFAULT_WA_TEXT)}`;
};

/**
 * Menangani klik tombol WhatsApp bergantian:
 * 1. Mengambil nomor CS yang sudah disiapkan dari server saat page load.
 * 2. Mencatat ke database HANYA 1 KALI via trackWaClick.
 * 3. Membuka URL WhatsApp langsung di tab baru.
 *
 * @param {string} sourcePage  - Misal 'floating-btn', 'hero', 'product-detail'
 * @param {string} sourceLabel - Misal nama produk, 'hubungi-langsung'
 * @param {string} customText  - Pesan pembuka WhatsApp
 */
export const handleRotatedWaClick = (sourcePage, sourceLabel = '', customText = '') => {
  const contact = getNextWaContact();
  const text = customText || DEFAULT_WA_TEXT;

  // Catat klik HANYA 1 KALI ke database
  trackWaClick(sourcePage, sourceLabel, contact.number, contact.name);

  // Buka WhatsApp langsung
  const url = buildWaUrl(contact.number, text);
  window.open(url, '_blank', 'noopener,noreferrer');

  return contact;
};

/**
 * Menangani klik WhatsApp langsung ke nomor spesifik (misal di halaman Contact)
 * 1. Mencatat ke database HANYA 1 KALI.
 * 2. Membuka WhatsApp langsung.
 * 3. Menyesuaikan preparedContact berikutnya ke nomor pasangannya.
 */
export const handleDirectWaClick = (contactNumberOrId, sourcePage = 'contact-page', sourceLabel = '', customText = '') => {
  const contact = WA_CONTACTS.find(
    c => c.id === contactNumberOrId || c.number === contactNumberOrId
  ) || WA_CONTACTS[0];

  const text = customText || DEFAULT_WA_TEXT;

  // Catat klik HANYA 1 KALI ke database
  trackWaClick(sourcePage, sourceLabel, contact.number, contact.name);

  // Buka WhatsApp langsung
  const url = buildWaUrl(contact.number, text);
  window.open(url, '_blank', 'noopener,noreferrer');

  // Set giliran berikutnya ke kontak yang lain
  preparedContact = contact.id === 'rani' ? WA_CONTACTS[1] : WA_CONTACTS[0];

  return contact;
};

// Global window helpers untuk kemudahan pemanggilan
if (typeof window !== 'undefined') {
  window.handleRotatedWaClick = handleRotatedWaClick;
  window.handleDirectWaClick = handleDirectWaClick;
  window.initWaRotation = initWaRotation;
  window.getCurrentWaContact = getCurrentWaContact;
  window.WA_CONTACTS = WA_CONTACTS;
}
