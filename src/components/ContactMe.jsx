import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { trackWaClick } from '../utils/trackWaClick';

const ContactMe = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-surface to-surface-container-lowest">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="bg-white/60 backdrop-blur-3xl p-6 sm:p-10 lg:p-14 rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-primary/5 ring-1 ring-primary/10 relative overflow-hidden">

          {/* Decorative subtle grid pattern inside the card */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,0,0,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 md:gap-14 items-center">

            {/* Profil & Kontak List */}
            <div className="order-1 flex flex-col justify-center space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-4 shadow-sm border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {t('contact.badge')}
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-secondary leading-tight pb-2">
                  {t('contact.title')}
                </h2>
                <p className="mt-2 text-on-surface-variant text-base md:text-lg leading-relaxed max-w-lg">
                  {t('contact.subtitle')}
                </p>
              </div>

              <div className="space-y-4">
                {/* Location Card */}
                <div className="group flex items-start gap-5 p-5 bg-white rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1 text-sm uppercase tracking-wide">{t('contact.addressLabel')}</h4>
                    <p className="text-sm md:text-base font-medium text-on-surface-variant leading-relaxed">
                      {t('contact.addressValue')}
                    </p>
                  </div>
                </div>

                {/* Phone Card */}
                <a href="tel:+62881080634612" className="group flex items-start gap-5 p-5 bg-white rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl">call</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1 text-sm uppercase tracking-wide group-hover:text-secondary transition-colors">{t('contact.phone')}</h4>
                    <p className="text-lg md:text-xl font-extrabold text-primary tracking-wide">
                      +62 881-0806-34612
                    </p>
                  </div>
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center">
                <a
                  href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik.com.%20Halo%20Ateka%20Tehnik%2C%20saya%20tertarik%20dengan%20produk%20mesin%20penggilingan%20padi%20Anda.%20Bisa%20konsultasi%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWaClick('home-contact', 'konsultasi')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#20B038] to-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:shadow-lg hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  {t('contact.whatsapp')}
                </a>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors duration-300 shadow-sm border border-outline-variant/30 group"
                >
                  {t('contactPage.formTitle')}
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Maps Embed */}
            <div className="order-2 relative w-full h-[350px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white/80 group">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay pointer-events-none group-hover:opacity-0 transition-opacity duration-1000 z-10"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.5504884237557!2d110.97146737501566!3d-7.514770374144991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1bcc306b1955%3A0xdde6bfbc97d7a0e8!2sCV.%20ATEKA%20TEHNIK!5e0!3m2!1sid!2sid!4v1774846118049!5m2!1sid!2sid"
                className="w-full h-full border-0 absolute top-0 left-0 filter grayscale-[20%] contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              {/* Floating label on Maps */}
              <div className="absolute bottom-5 right-5 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white flex items-center gap-2 pointer-events-none transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold text-on-surface">{t('contact.mapsLabel')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
