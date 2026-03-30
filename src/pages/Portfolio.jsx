import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Portfolio = () => {
    const { t } = useLanguage();
    return (
        <main className="pt-20">
            {/* Hero Section */}
            <section className="bg-[linear-gradient(135deg,#000c2e_0%,#001f5b_100%)] relative overflow-hidden py-24 md:py-32">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img alt="Industrial texture" className="w-full h-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1Jc0BreR6iTLpK8sJZ2QPvQHc_cv7QvzquANMCpWGUho8mD_TDetmVj85EDc0PU5RYRh5j9kNsFoS25xH3AYYPu6Cz0CpSDi58EUGLrtil0XJTExM8q7zWC5yfGHEsWzO6quRCw044nE4h-cUArDcSLNJxMMglVU9_H4uM8JsiIJ8P1WlHCfPfkt9hpKFCg9OMKdHgZu1rD7fQcj3NAwdjdDYNmxMqPB-lacd2fKW4_ACUJx_wRe3ztzC_uqNLKniAvjW4j11MEY" />
                </div>
                <div className="relative max-w-7xl mx-auto px-8 w-full">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-white tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
                            {t('portfolioPage.heroTitle')}
                        </h1>
                        <p className="text-lg md:text-xl text-primary-fixed-dim font-body leading-relaxed max-w-2xl">
                            {t('portfolioPage.heroSub')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Project */}
            <section className="bg-surface-container-low py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full md:w-3/5 relative">
                            <div className="aspect-video overflow-hidden rounded-sm shadow-2xl">
                                <img alt="Featured Project" className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZYCn8vOZ-RrONT4PKUlZTn8DcaIciHS3OTQfU6GqLnaKSqc79Otbuc1NP16LhBwN5V0bO6MKp00CP13xuzAzeyAuhqfZWGRfV-8jKg3hT3GmWJDqh72I0rMwYcT3oGP7jbw9b-wV1HjMfz5Lwrq3RuEOH6KsFi3eTYWPF_1s2PyoNIjlBm0R_n34A3LhMxbrkR0sywTTakCyQ1F0qy0m4WOLO4cTz3-_gN7bZ9k6tU-V5me5gFckPwKPsbYFRkpX1-FlB0mIXqMI" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-secondary p-8 rounded-sm hidden md:block">
                                <span className="block text-white font-headline text-4xl font-black">2024</span>
                                <span className="block text-white/80 font-label text-xs tracking-widest uppercase">Flagship Completion</span>
                            </div>
                        </div>
                        <div className="w-full md:w-2/5">
                            <span className="text-secondary font-label font-bold tracking-widest uppercase text-xs mb-4 block">{t('portfolioPage.featuredLabel')}</span>
                            <h2 className="text-3xl font-headline font-bold text-primary mb-6 leading-tight">{t('portfolioPage.featuredTitle')}</h2>
                            <p className="text-on-surface-variant leading-relaxed mb-8">{t('portfolioPage.featuredDesc')}</p>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <span className="block text-2xl font-headline font-extrabold text-primary">5 Ton/Hr</span>
                                    <span className="block text-xs font-label text-on-surface-variant uppercase tracking-wider">{t('portfolioPage.statCapacity')}</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-headline font-extrabold text-primary">99.8%</span>
                                    <span className="block text-xs font-label text-on-surface-variant uppercase tracking-wider">{t('portfolioPage.statPurity')}</span>
                                </div>
                            </div>
                            <a className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all" href="#">
                                {t('portfolioPage.viewSpecs')} <span className="material-symbols-outlined">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="bg-surface py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-16">
                        <h3 className="text-sm font-label font-bold text-secondary uppercase tracking-[0.2em] mb-4">{t('portfolioPage.gridLabel')}</h3>
                        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight">{t('portfolioPage.gridTitle')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Koperasi Tani Makmur" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGI8z4Cif84fvn4L8F2iXeDvKkmqK2mF-K3897R7bl_q35gOfxFrO6iSXhLHzkanC-llyFdbLgdsobbIzVKPKf8DDh2vX0HB9Vyv3NyJbW9L1oUcaoV3xpRvj1ZjyLyZAbJ4b9Ocn4CmPb2xOCMpOflIqm1Dfgf_6MSWCiSV9W4xqQgfT1X8ffHB2yOa5gOda7D5W7uIjICY4OxWeP59deDm2tA1na0v8l0aX3QFLfixRH4sEGopUD6SxNd12inbYBA_hwZlIIkkc" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">Efficiency +15%</span>
                                    <span className="material-symbols-outlined text-outline-variant">settings_suggest</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Koperasi Tani Makmur</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Subang, West Java</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">2 Ton/Jam capacity unit installed for local cooperative processing.</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Mitra Sejahtera Rice" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0We1Z7JjDMFlQ22PnZXly1UWLzdAE6ttRkraknL7dgac41Kx_nLsmbPY97Feiu6fKc44USzKcU2uCVBgbQiHH6LKg7QyiIxCeTZA4Z4lKVHn5h5IM2p9VT4Ofzlxyap-zXIm7sxcje7nOZ_ihBxb5ohzeonIUShavFZz-OUMfFwvQUOr7I2ek2mldOknfMr8EvxGvY7HrI9dmBrYJz-lbdM9O3hGwoPcHfhGpcx8gQB6QQ-7BY6aKQsNURh1fzfyDO0v-uoi63Ug" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-primary-container text-on-primary text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">Export Grade</span>
                                    <span className="material-symbols-outlined text-outline-variant">verified</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Mitra Sejahtera Rice</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Sidrap, South Sulawesi</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">Full automation line for premium jasmine rice processing.</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Lombok Mandiri Plant" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADYc9c7-b8uNrPkdLnhbZJmCEMHhByvti3MFpHqXubVF3dCyZVny2PLogKvVrij2CZ6BfYTYsGzkDJ7NkNzoZUjmGF6ivqe8i-_06_S6OIPJrsI4NNAfsIm4pHC_mPaNR2mx0OdSpVOK8z78d7AZCE7ydJ8SjQkQ6Sls7JySuUmWbKchcFPiVLcm-vGHKwI2_v0NaOzO_lKmfipMVN9mCPJvjdqsTqFx-4fPb7goh_Ikir2pVlWtOyS68ySTaxFmOvMq26gEUcF3c" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">Optimized Energy</span>
                                    <span className="material-symbols-outlined text-outline-variant">bolt</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Lombok Mandiri Plant</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Mataram, NTB</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">Compact RMU design for high-efficiency regional production.</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 4 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Borneo Grain Hub" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2wWzcLKLISn0dDcJoNG_vWUpYAq7zEuOe8oERf1y2wXa2EkJcPNQCBSU2IpPK6u28n71U8G1CfCOTdUg8myLbdxhrJehCydHxkuDhq6f1gEuyih0VTDk8Q85tSB5EzOmMdmcvtd1aDmiUTvTSk5tyTORg-zJD6UxBKAeGrlX-70WohmA6gYAjtQkTKPMLDrJnkP8wCOfIpciKFy6YPpmJf9WgZZp7IvzhxgSnZp5safcD_2fmGBgGgh6sxravUBy3XQYPysacgo0" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-primary-container text-on-primary text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">High Capacity</span>
                                    <span className="material-symbols-outlined text-outline-variant">data_thresholding</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Borneo Grain Hub</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Banjarmasin, South Kalimantan</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">Strategic storage and milling integration for 10 Ton/Hr output.</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 5 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Sumatra Rice Solutions" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAug36A14cskbaqrlos38YjokhEdEXHpfEt07cAby2s6bKeO3c3yFFxary7pXINVbge9U4RfflyMa0p1x53mHwoxEnv-FFvdMXdg4WeSZIlzcrf_GrLs0HVN76YbQdAGo1Q46VxSh601_lIlwkGeis9AB9xheoMPI3JdglRuBGvQdCrbrK6POv_ItPMyvhqLA_wwh5MXR07w-92yyEyv0UMxkYlRXGaGD0S_iJ_RfteQ8VSYsiHlQbjCesrvCiws5GHsHVTuRBII90" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">Precision Polishing</span>
                                    <span className="material-symbols-outlined text-outline-variant">star</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Sumatra Rice Solutions</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Medan, North Sumatra</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">Advanced polishing technology installation for silky grain finish.</span>
                                </div>
                            </div>
                        </div>
                        {/* Card 6 */}
                        <div className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-shadow duration-500">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img alt="Papua Agri-Center" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrAy1Q-_pzbfkE90wImNHkB0zFX2OIx6NfxUzS0bjvFCcJ1BSgk0KYuzlw_zMt5FRqlLGBp_hERizeTO5u07CV0DpEO035f72tOKcXOfILquM3fmlIAFOSgT0kH2lNSwBJhLStG9m88fglMii9HjTHfbVHjleFA-IEUxJbLrvJlZ2QPKjIACu104uWkTWDkBr72UmxeE7_XV_brxJnZdB2amTdcTFLV8tgXuQMtpJecdpq-PyiMBoJqP6A2-ZMvpCP1cQf4P8y2us" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-primary-container text-on-primary text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">Remote Operation</span>
                                    <span className="material-symbols-outlined text-outline-variant">wifi</span>
                                </div>
                                <h3 className="font-headline font-bold text-lg text-primary mb-2">Papua Agri-Center</h3>
                                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                                    <span className="material-symbols-outlined text-sm">location_on</span><span>Merauke, Papua</span>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10">
                                    <span className="text-xs font-label text-on-surface-variant font-medium">Low-maintenance setup designed for remote agricultural regions.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nationwide Reach */}
            <section className="bg-surface-container py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-sm font-label font-bold text-secondary uppercase tracking-[0.2em] mb-4">{t('portfolioPage.presenceLabel')}</h3>
                            <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-6">{t('portfolioPage.presenceTitle')}</h2>
                            <p className="text-on-surface-variant leading-relaxed mb-8">{t('portfolioPage.presenceDesc')}</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-sm flex items-center justify-center text-on-primary">
                                        <span className="material-symbols-outlined">map</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-primary">{t('portfolioPage.statInstall')}</span>
                                        <span className="block text-xs text-on-surface-variant uppercase tracking-wider">{t('portfolioPage.statInstallSub')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">construction</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-primary">{t('portfolioPage.statSupport')}</span>
                                        <span className="block text-xs text-on-surface-variant uppercase tracking-wider">{t('portfolioPage.statSupportSub')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <div className="bg-surface-container-lowest p-4 rounded-sm shadow-lg">
                                <img alt="Indonesia Map" className="w-full h-auto grayscale opacity-90 contrast-125"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz_dmOtcmRt7Vobjbh_8F0MaEooPpM6txngVcrByVs7ig1ASgmnvH2kAqpRCRM6F4FSdhq8YWHgai6O0DvbBhUwguTaDuLGo5mLmnxRQUn7ahqEgYaPaEupPzbprlB6IkLJf1oEcpkBlAeqblOwMUW7g4Hu6cgch7f1-UQbJoMHP0IwYS5rO-GKWgo0BSgOAn_UekKu-C46SHfT4OJwYyj0pxg8exTtOPy9onlkoPXvJMtgrtx-RJQEwZ-ojXFa3eW2VzmZQhcgn8" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent"></div>
                </div>
                <div className="relative max-w-4xl mx-auto px-8">
                    <h2 className="text-4xl md:text-5xl font-headline font-extrabold mb-8 tracking-tight">{t('portfolioPage.ctaTitle')}</h2>
                    <p className="text-primary-fixed-dim text-lg mb-10 leading-relaxed">{t('portfolioPage.ctaDesc')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/contact" className="bg-secondary hover:bg-on-secondary-container text-white px-10 py-4 rounded-sm font-bold transition-all hover:scale-105 active:scale-95">
                            {t('portfolioPage.ctaBtn1')}
                        </Link>
                        <Link to="/about" className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-10 py-4 rounded-sm font-bold transition-all">
                            {t('portfolioPage.ctaBtn2')}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Portfolio;
