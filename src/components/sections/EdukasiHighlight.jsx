import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const EdukasiHighlight = () => {
    const { t } = useLanguage();

    return (
        <section className="py-24 bg-surface relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-surface"></div>
            
            {/* Decorative Orbs */}
            <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-8 w-full text-center">
                <div className="bg-white/80 backdrop-blur-md border border-outline-variant/30 p-10 md:p-16 rounded-3xl shadow-xl flex flex-col items-center space-y-8">
                    <div className="w-20 h-20 bg-primary text-white flex items-center justify-center rounded-full shadow-lg mb-2">
                        <span className="material-symbols-outlined text-4xl">school</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">
                            {t('edukasi.highlightTitle')}
                        </h2>
                        <p className="text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
                            {t('edukasi.highlightDesc')}
                        </p>
                    </div>
                    
                    <div className="pt-4">
                        <Link 
                            to="/edukasi" 
                            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                        >
                            <span className="text-lg">{t('edukasi.highlightCta')}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EdukasiHighlight;

