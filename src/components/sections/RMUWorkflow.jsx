import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const RMUWorkflow = () => {
    const { t } = useLanguage();

    const steps = [
        { icon: 'cleaning_services', titleKey: 'rmuWorkflow.step1Title', descKey: 'rmuWorkflow.step1Desc' },
        { icon: 'hardware', titleKey: 'rmuWorkflow.step2Title', descKey: 'rmuWorkflow.step2Desc' },
        { icon: 'filter_alt', titleKey: 'rmuWorkflow.step3Title', descKey: 'rmuWorkflow.step3Desc' },
        { icon: 'auto_fix_high', titleKey: 'rmuWorkflow.step4Title', descKey: 'rmuWorkflow.step4Desc' },
        { icon: 'layers', titleKey: 'rmuWorkflow.step5Title', descKey: 'rmuWorkflow.step5Desc' },
        { icon: 'inventory_2', titleKey: 'rmuWorkflow.step6Title', descKey: 'rmuWorkflow.step6Desc' },
    ];

    return (
        <section className="py-24 bg-surface-container-low overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl font-headline font-extrabold text-primary">{t('rmuWorkflow.title')}</h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto">{t('rmuWorkflow.desc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center space-y-4 group">
                            <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xl relative z-10 border-4 border-white shadow-lg group-hover:bg-secondary transition-colors duration-300">
                                {index + 1}
                            </div>
                            <div className="bg-white p-6 rounded-sm shadow-sm border border-outline-variant/10 flex-1 w-full">
                                <span className="material-symbols-outlined text-secondary mb-3 text-3xl">{step.icon}</span>
                                <h4 className="font-bold text-primary text-sm mb-2">{t(step.titleKey)}</h4>
                                <p className="text-xs text-on-surface-variant">{t(step.descKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RMUWorkflow;

