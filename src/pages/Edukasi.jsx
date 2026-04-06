import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { trackWaClick } from '../utils/trackWaClick';
import RMUWorkflow from '../components/sections/RMUWorkflow';
import RMUAdvantages from '../components/sections/RMUAdvantages';
import DryerWorkflow from '../components/sections/DryerWorkflow';
import DryerAdvantages from '../components/sections/DryerAdvantages';

const Edukasi = () => {
    const { t } = useLanguage();
    usePageTitle('Edukasi Pasca Panen');

    return (
        <div className="pt-24 bg-surface text-on-surface">
            <section className="relative overflow-hidden py-24 sm:py-36">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                    style={{ backgroundImage: "url('https://atekatehnik.com/wp-content/uploads/gambar_hero_ai.jpeg')" }}
                ></div>

                {/* Gradient Overlay to preserve text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-surface/95 via-surface/85 to-surface"></div>

                {/* Decorative Glowing Orbs */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/30 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary/30 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-8 text-center space-y-6 z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-primary/20 shadow-sm text-primary font-bold tracking-widest uppercase text-xs">
                        {t('edukasi.badge')}
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold text-primary">
                        {t('edukasi.heroTitle')}<span className="text-secondary">{t('edukasi.heroHighlight')}</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl md:text-2xl text-on-surface-variant leading-relaxed">
                        {t('edukasi.heroDesc')}
                    </p>
                </div>
            </section>

            {/* Imported Sections */}
            <RMUWorkflow />
            <RMUAdvantages />
            <DryerAdvantages />
            <DryerWorkflow />

            {/* Bottom Call-To-Action (3 actions) */}
            <section className="py-24 bg-surface border-t border-outline-variant/10">
                <div className="max-w-4xl mx-auto px-8 text-center space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('edukasi.ctaTitle')}</h2>
                        <p className="text-on-surface-variant text-lg">{t('edukasi.ctaDesc')}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
                        <Link
                            to="/"
                            className="w-full sm:w-auto px-6 py-3.5 border-2 border-outline-variant/30 text-primary font-bold rounded-full hover:border-primary/50 hover:bg-surface-container-low transition-colors duration-300"
                        >
                            {t('edukasi.ctaHome')}
                        </Link>

                        <Link
                            to="/contact"
                            className="w-full sm:w-auto px-6 py-3.5 bg-secondary text-white font-bold rounded-full hover:bg-[#a65d00] transition-colors duration-300 shadow-md hover:shadow-lg"
                        >
                            {t('edukasi.ctaTech')}
                        </Link>

                        <a
                            href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik.com.%20Halo%20Ateka%20Tehnik%2C%20saya%20ingin%20berkonsultasi%20setelah%20membaca%20halaman%20Edukasi."
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackWaClick('edukasi', 'cta-konsultasi')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#20B038] to-[#25D366] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#25D366]/40 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 pointer-events-none" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            {t('edukasi.ctaWa')}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Edukasi;

