import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ContactMe = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-28 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-surface-container-lowest p-6 sm:p-8 lg:p-16 rounded-sm relative shadow-sm border border-outline-variant/10">
          {/* Link to full Contact page */}
          <Link
            to="/contact"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-10 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-colors group"
          >
            <span className="border-b border-transparent group-hover:border-secondary transition-colors">
              {t('contactPage.formTitle')}
            </span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Maps Embed */}
            <div className="order-2 lg:order-1 relative aspect-video lg:aspect-square w-full rounded-sm overflow-hidden bg-surface-container shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.5504884237557!2d110.97146737501566!3d-7.514770374144991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1bcc306b1955%3A0xdde6bfbc97d7a0e8!2sCV.%20ATEKA%20TEHNIK!5e0!3m2!1sid!2sid!4v1774846118049!5m2!1sid!2sid"
                className="w-full h-full border-0 absolute top-0 left-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Profil & Kontak Pendek */}
            <div className="order-1 lg:order-2 space-y-5 md:space-y-6 pt-6 lg:pt-0">
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-primary">{t('contact.title')}</h2>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-surface rounded-sm hover:shadow-sm transition-shadow">
                  <span className="material-symbols-outlined text-secondary mt-0.5 text-xl md:text-2xl">location_on</span>
                  <p className="text-xs sm:text-sm font-medium text-on-surface-variant leading-relaxed">
                    Jl. Grompol - Jambangan, Gondang, Kedungjeruk, Kec. Mojogedang, Kabupaten Karanganyar, Jawa Tengah
                  </p>
                </div>
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-surface rounded-sm hover:shadow-sm transition-shadow">
                  <span className="material-symbols-outlined text-secondary mt-0.5 text-xl md:text-2xl">phone</span>
                  <div className="text-xs sm:text-sm font-medium text-on-surface-variant leading-relaxed">
                    <p className="font-bold text-primary">{t('contact.phone')}</p>
                    <p>+62 881-0806-34612</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3 md:gap-4">
                <a
                  href="https://wa.me/62881080634612?text=Halo%20Ateka%20Tehnik%2C%20saya%20tertarik%20dengan%20produk%20mesin%20penggilingan%20padi%20Anda.%20Bisa%20konsultasi%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-5 md:px-8 py-3 md:py-4 rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors duration-300 shadow-sm text-sm md:text-base"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {t('contact.whatsapp')}
                </a>
                <a
                  href="tel:+62881080634612"
                  className="bg-primary-container text-white px-5 md:px-8 py-3 md:py-4 rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors duration-300 shadow-sm text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-xl">call</span>
                  {t('contact.call')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
