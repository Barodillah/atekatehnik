import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const TermsOfService = () => {
  const { t } = useLanguage();
  usePageTitle(t('terms.title'));

  return (
    <div className="bg-surface pt-24 pb-16 md:pt-32 md:pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-primary tracking-tighter mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-sm font-label text-on-surface-variant uppercase tracking-widest">
            {t('terms.lastUpdated')}
          </p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-primary-container prose-p:text-on-surface-variant prose-p:leading-relaxed">
          <p className="text-lg lead font-medium text-primary mb-8 border-l-4 border-secondary pl-6">
            {t('terms.intro')}
          </p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.acceptanceLabel')}</h2>
          <p>{t('terms.acceptanceDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.servicesLabel')}</h2>
          <p>{t('terms.servicesDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.intellectualLabel')}</h2>
          <p>{t('terms.intellectualDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.linksLabel')}</h2>
          <p>{t('terms.linksDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.liabilityLabel')}</h2>
          <p>{t('terms.liabilityDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('terms.governingLabel')}</h2>
          <p>{t('terms.governingDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
