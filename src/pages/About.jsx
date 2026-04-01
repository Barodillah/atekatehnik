import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
    const { t } = useLanguage();
    return (
        <main className="pt-20">
            {/* Hero Section */}
            <section className="relative h-[819px] flex items-center overflow-hidden bg-primary-container">
                <div className="absolute inset-0 opacity-40">
                    <img alt="Industrial machinery" className="w-full h-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuACevkjZk7yZIAwmZmumfgz06AAVsuXDrxGuG59nLxjRQ_01VP3iFbBmnDSfzheoc0Khkjx6RcfLuiX80ad8QTDEhgZAkv7ucKvGmtHrQBIb_6zPaoFI4pfgDvlh4A3GQ1gp8yuztfn8Oos0sCdC5U9K7GT4pLqbEvL63TNgbiH7jw7BmptTiUL7KeiQczx3qYO9gB_d3CP1Z83FpXYO2aA7am5FSFuGVmIjbAMn6I7dLKzXrCI_lbKUrDOlDZ0cltTyJd5Vl9eXP0" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
                    <div className="max-w-3xl">
                        <span className="inline-block px-4 py-1 mb-6 bg-secondary text-on-secondary text-xs font-bold tracking-[0.2em] uppercase rounded-sm">
                            {t('about.badge')}
                        </span>
                        <h1 className="text-6xl md:text-8xl font-headline font-extrabold text-white leading-tight tracking-tighter mb-8">
                            {t('about.heroTitle1')}<span className="text-secondary-container">{t('about.heroHighlight')}</span>
                        </h1>
                        <p className="text-xl text-surface-variant font-body leading-relaxed max-w-xl">
                            {t('about.heroSub')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="bg-surface-container-low py-24">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-7">
                        <h2 className="text-4xl font-headline font-bold text-primary mb-8 tracking-tight">{t('about.storyTitle')}</h2>
                        <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed font-body">
                            <p>{t('about.storyP1')}<span className="font-bold text-primary">{t('about.storyP1Bold')}</span>{t('about.storyP1End')}</p>
                            <p>{t('about.storyP2Start')}<span className="font-bold text-secondary">{t('about.storyP2Bold')}</span>{t('about.storyP2End')}</p>
                        </div>
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-4xl font-headline font-black text-secondary">20+</div>
                                <div className="text-sm font-label uppercase tracking-widest text-outline">{t('about.statYears')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-headline font-black text-secondary">1.5k+</div>
                                <div className="text-sm font-label uppercase tracking-widest text-outline">{t('about.statInstallations')}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-headline font-black text-secondary">34</div>
                                <div className="text-sm font-label uppercase tracking-widest text-outline">{t('about.statProvinces')}</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                        <div className="aspect-square bg-surface-container-highest rounded-sm overflow-hidden shadow-2xl">
                            <img alt="Technical drawing" className="w-full h-full object-cover mix-blend-multiply opacity-80"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPH2jPkT4gekvHv3YtMMw1xeeTa0MDqF-t24McHKBH8BC2vs7afCyGhI-_DSo5mG8e2qibMumqADAK9NsjfrPDx5KZ8GJhfu8yrpUD22TAv3GXsxR9vg_JF9YXHmGuGvYq-x7DOJU4dRw4-WhvB7-ljoo8lgWsquh-tmgbGoDDUjcgLQAt_-8SKh-6shUZofS9otYZr_Ew4otRy5D0kbMNrwZLxP3qctojaG0Cjx-nHwevrZ6eIsfW-N0pVG6H9Qu33tGDKsXr_3g" />
                        </div>
                        <div className="absolute -bottom-8 -left-8 bg-primary-container p-8 text-white shadow-xl max-w-xs hidden md:block">
                            <p className="font-headline font-bold text-lg mb-2 italic">{t('about.quote')}</p>
                            <p className="text-sm text-on-primary-container">{t('about.quoteAuthor')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Directives */}
            <section className="bg-surface py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="mb-16">
                        <h2 className="text-3xl font-headline font-bold text-primary tracking-tight">{t('about.coreTitle')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-surface-container-lowest p-10 border-b-4 border-secondary shadow-sm group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-secondary text-3xl">precision_manufacturing</span>
                            </div>
                            <h3 className="text-xl font-headline font-bold text-primary mb-4">{t('about.precisionTitle')}</h3>
                            <p className="text-on-surface-variant font-body leading-relaxed">{t('about.precisionDesc')}</p>
                        </div>
                        <div className="bg-surface-container-lowest p-10 border-b-4 border-primary shadow-sm group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
                            </div>
                            <h3 className="text-xl font-headline font-bold text-primary mb-4">{t('about.innovationTitle')}</h3>
                            <p className="text-on-surface-variant font-body leading-relaxed">{t('about.innovationDesc')}</p>
                        </div>
                        <div className="bg-surface-container-lowest p-10 border-b-4 border-secondary-container shadow-sm group hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-secondary-container text-3xl">handshake</span>
                            </div>
                            <h3 className="text-xl font-headline font-bold text-primary mb-4">{t('about.partnershipTitle')}</h3>
                            <p className="text-on-surface-variant font-body leading-relaxed">{t('about.partnershipDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership */}
            {/* <section className="bg-surface-container-low py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                        <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">{t('about.leadershipTitle')}</h2>
                        <p className="max-w-md text-on-surface-variant font-body">{t('about.leadershipSub')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div className="relative group">
                            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 rounded-sm">
                                <img alt="Chief Technical Officer" className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGP9QM5EJA7YCFR3g7iJX5AJECLNodlT_-O3UVPtyw3fWIn64TLSlYnhgUuG1q7UWgirlNa5-C8WEeW8k7E64_-89shWsckparW4L64UACcYj3sJCWaXHjNEHvCkYWUhYN3Z0pyg9i2NLIARrWBQy8vTEimpvdOolDMxQdkguzjyETLEsxonAsPETKupkrCOSqNT0_-AoclcebPAIAKXsEdAc0FZqqhPeH4JuEQNL3gcJpkDsfwJXzEoWnqZBOedS6AAhq6IRh4_w" />
                            </div>
                            <div className="absolute -bottom-4 left-4 right-4 bg-white p-6 shadow-xl">
                                <p className="text-sm font-label text-secondary font-bold tracking-widest uppercase mb-1">Chief Technical Officer</p>
                                <h4 className="text-xl font-headline font-extrabold text-primary tracking-tight">Warsito</h4>
                            </div>
                        </div>
                        <div className="relative group md:mt-12">
                            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 rounded-sm">
                                <img alt="Operations Director" className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-wXNupEKw4HXkS4YoYnMpnPQTTWotptxoxJtlpuGWw4tHTetNcB7a0mGgr9zb4O3kfGTnU-65GHWCxrhtVokaD-9PCT6swbw6omttDWf_Ug5jVcXKzrPmyeN569trnwWznzPkLG7Qu7NnfNbZn0kzIMUALdf8m8vbg9BNwMI4MOfXanMQ85lWpSGLRW37Y6NWSwSl7uEEQBWSfSvk3pP-0ciD2kOeRiNsOymnfXgLlBPU3zVUPuDNET59-9neHElZ9GiTpnJcNQA" />
                            </div>
                            <div className="absolute -bottom-4 left-4 right-4 bg-white p-6 shadow-xl">
                                <p className="text-sm font-label text-secondary font-bold tracking-widest uppercase mb-1">Operations Director</p>
                                <h4 className="text-xl font-headline font-extrabold text-primary tracking-tight">Rani</h4>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 rounded-sm">
                                <img alt="Lead Design Engineer" className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1WgBvVGTNJj3XdAK5inNS7r9njQFGA2_LqJqHjswHdtjg08_FlwyJj-hJQa8MO9KoBXWrWe_GAKxvv5ScZezC20DRNzsv5JtjAZKheMM27hOrB-PVJBoB58ASFGMk-oFLgX8XjG05uaOvYXVXd9nX6Ln8oD32pXwXgHMoARwH1NsST65p9xJ2JKP7Pzao4IijmI5IJzfXAbzr1l1Ex1CIczQabLX4pDI-MO2h5T5rJLQaVwarVMGV9JoV8xqKaDWXW8O5f0JiEJo" />
                            </div>
                            <div className="absolute -bottom-4 left-4 right-4 bg-white p-6 shadow-xl">
                                <p className="text-sm font-label text-secondary font-bold tracking-widest uppercase mb-1">Lead Design Engineer</p>
                                <h4 className="text-xl font-headline font-extrabold text-primary tracking-tight">Zulfa</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Certifications */}
            <section className="bg-surface py-24">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-label text-outline tracking-[0.3em] uppercase mb-4">{t('about.certLabel')}</h2>
                        <h3 className="text-3xl font-headline font-bold text-primary tracking-tight">{t('about.certTitle')}</h3>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-70 grayscale hover:grayscale-0 transition-all">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-surface-container-low rounded-full">
                                <span className="material-symbols-outlined text-4xl text-primary">verified</span>
                            </div>
                            <span className="font-headline font-bold text-primary">SNI ISO 9001</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-surface-container-low rounded-full">
                                <span className="material-symbols-outlined text-4xl text-primary">account_balance</span>
                            </div>
                            <span className="font-headline font-bold text-primary">E-Katalog INAPROC</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-surface-container-low rounded-full">
                                <span className="material-symbols-outlined text-4xl text-primary">security</span>
                            </div>
                            <span className="font-headline font-bold text-primary">TKDN Compliant</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-surface-container-low rounded-full">
                                <span className="material-symbols-outlined text-4xl text-primary">workspace_premium</span>
                            </div>
                            <span className="font-headline font-bold text-primary">ASAE Standard</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative bg-primary overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-30"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 text-center">
                    <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-white mb-8 tracking-tighter">{t('about.ctaTitle')}</h2>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Link to="/contact" className="bg-secondary text-on-secondary px-10 py-4 rounded-sm font-headline font-bold text-lg hover:bg-secondary-container transition-colors duration-300">
                            {t('about.ctaBtn1')}
                        </Link>
                        <button className="bg-white/10 text-white backdrop-blur-md px-10 py-4 rounded-sm font-headline font-bold text-lg hover:bg-white/20 transition-colors duration-300">
                            {t('about.ctaBtn2')}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;
