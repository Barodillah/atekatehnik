export const PAPER_SIZES = {
  A4: { widthMm: 210, heightMm: 297, label: 'A4 (21x29.7cm)' },
  F4: { widthMm: 210, heightMm: 330, label: 'F4 (21x33.0cm)' },
};

/** CSS px per mm (CSS defines 1in = 96px = 25.4mm). */
export const mmToPx = (mm) => (mm * 96) / 25.4;

export const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export const formatNumber = (num) => formatRupiah(num).replace('Rp', '').trim();

export const terbilang = (angka) => {
  angka = Math.floor(Math.abs(angka));
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  let temp = '';

  if (angka < 12) {
    temp = ' ' + bilangan[angka];
  } else if (angka < 20) {
    temp = terbilang(angka - 10) + ' Belas';
  } else if (angka < 100) {
    temp = terbilang(Math.floor(angka / 10)) + ' Puluh' + terbilang(angka % 10);
  } else if (angka < 200) {
    temp = ' Seratus' + terbilang(angka - 100);
  } else if (angka < 1000) {
    temp = terbilang(Math.floor(angka / 100)) + ' Ratus' + terbilang(angka % 100);
  } else if (angka < 2000) {
    temp = ' Seribu' + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    temp = terbilang(Math.floor(angka / 1000)) + ' Ribu' + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    temp = terbilang(Math.floor(angka / 1000000)) + ' Juta' + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    temp = terbilang(Math.floor(angka / 1000000000)) + ' Milyar' + terbilang(angka % 1000000000);
  } else if (angka < 1000000000000000) {
    temp = terbilang(Math.floor(angka / 1000000000000)) + ' Trilyun' + terbilang(angka % 1000000000000);
  }

  return temp;
};
