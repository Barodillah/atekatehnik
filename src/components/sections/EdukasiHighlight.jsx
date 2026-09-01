import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const EdukasiHighlight = () => {
    const { t } = useLanguage();

    return (
        <section className="py-10 md:py-12 bg-surface relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-surface"></div>
            
            <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
                <div className="bg-white/90 backdrop-blur-md border border-outline-variant/30 p-6 md:p-8 rounded-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 flex-1">
                        <div className="w-14 h-14 bg-primary text-white flex shrink-0 items-center justify-center rounded-full shadow-md">
                            <span className="material-symbols-outlined text-3xl">school</span>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-2">
                                {t('edukasi.highlightTitle')}
                            </h2>
                            <p className="text-sm md:text-base text-on-surface-variant max-w-2xl leading-snug">
                                {t('edukasi.highlightDesc')}
                            </p>
                        </div>
                    </div>
                    
                    <div className="shrink-0 w-full md:w-auto">
                        <Link 
                            to="/edukasi" 
                            className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-primary text-white font-semibold rounded-sm hover:bg-secondary transition-colors duration-300 shadow hover:-translate-y-0.5 transform"
                        >
                            <span>{t('edukasi.highlightCta')}</span>
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EdukasiHighlight;

