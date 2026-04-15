import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const DryerAdvantages = () => {
    const { t } = useLanguage();

    const innovations = [
        { icon: 'grid_view', titleKey: 'dryerAdv.even', descKey: 'dryerAdv.evenDesc' },
        { icon: 'timer', titleKey: 'dryerAdv.efficient', descKey: 'dryerAdv.efficientDesc' },
        { icon: 'trending_down', titleKey: 'dryerAdv.minLoss', descKey: 'dryerAdv.minLossDesc' },
        { icon: 'bolt', titleKey: 'dryerAdv.energy', descKey: 'dryerAdv.energyDesc' },
        { icon: 'add_business', titleKey: 'dryerAdv.profit', descKey: 'dryerAdv.profitDesc' },
    ];

    return (
        <section className="py-10 bg-surface-container-low border-y border-outline-variant/10 relative overflow-hidden">
            {/* Optional subtle background gradient */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-16 space-y-5">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-bold tracking-widest uppercase text-xs">
                        {t('dryerAdv.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">{t('dryerAdv.title')}</h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                        {t('dryerAdv.desc')}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {innovations.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl text-center shadow-sm border border-outline-variant/10 hover:shadow-xl hover:border-secondary/40 hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 bg-surface-container-low text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 flex items-center justify-center rounded-2xl shadow-sm">
                                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                            </div>
                            <h4 className="font-bold text-primary text-lg group-hover:text-secondary transition-colors duration-300">{t(item.titleKey)}</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                {t(item.descKey)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DryerAdvantages;

