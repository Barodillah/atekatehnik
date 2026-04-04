import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const DryerWorkflow = () => {
    const { t } = useLanguage();

    const steps = [
        { icon: 'layers', titleKey: 'dryerWorkflow.step1Title', descKey: 'dryerWorkflow.step1Desc' },
        { icon: 'local_fire_department', titleKey: 'dryerWorkflow.step2Title', descKey: 'dryerWorkflow.step2Desc' },
        { icon: 'thermostat', titleKey: 'dryerWorkflow.step3Title', descKey: 'dryerWorkflow.step3Desc' },
        { icon: 'output', titleKey: 'dryerWorkflow.step4Title', descKey: 'dryerWorkflow.step4Desc' },
    ];

    return (
        <section className="py-24 bg-surface overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl font-headline font-extrabold text-primary">{t('dryerWorkflow.title')}</h2>
                    <p className="text-on-surface-variant max-w-2xl mx-auto">{t('dryerWorkflow.desc')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center space-y-4 group">
                            <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xl relative z-10 border-4 border-white shadow-lg group-hover:bg-primary transition-colors duration-300">
                                {index + 1}
                            </div>
                            {/* Connector line (hidden on last item & mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-outline-variant/20 z-0"></div>
                            )}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/10 flex-1 w-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <span className="material-symbols-outlined text-secondary mb-4 text-4xl">{step.icon}</span>
                                <h4 className="font-bold text-primary text-base mb-2">{t(step.titleKey)}</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">{t(step.descKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DryerWorkflow;
