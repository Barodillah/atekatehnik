import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const RMUAdvantages = () => {
    const { t } = useLanguage();

    const advantages = [
        { icon: 'speed', titleKey: 'rmuAdv.efficiency', descKey: 'rmuAdv.efficiencyDesc' },
        { icon: 'star', titleKey: 'rmuAdv.quality', descKey: 'rmuAdv.qualityDesc' },
        { icon: 'trending_up', titleKey: 'rmuAdv.productivity', descKey: 'rmuAdv.productivityDesc' },
        { icon: 'extension', titleKey: 'rmuAdv.multiFunc', descKey: 'rmuAdv.multiFuncDesc' },
        { icon: 'trending_down', titleKey: 'rmuAdv.reduceLoss', descKey: 'rmuAdv.reduceLossDesc' },
        { icon: 'payments', titleKey: 'rmuAdv.economic', descKey: 'rmuAdv.economicDesc' },
    ];

    return (
        <section className="py-10 bg-surface relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary">{t('rmuAdv.title')}</h2>
                    <p className="text-on-surface-variant text-lg leading-relaxed">
                        {t('rmuAdv.desc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {advantages.map((adv, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-start gap-5"
                        >
                            <div className="w-16 h-16 bg-primary-container/40 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex items-center justify-center rounded-2xl">
                                <span className="material-symbols-outlined text-3xl">{adv.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-primary text-xl mb-3">{t(adv.titleKey)}</h4>
                                <p className="text-on-surface-variant leading-relaxed">
                                    {t(adv.descKey)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RMUAdvantages;

