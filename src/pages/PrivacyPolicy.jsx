import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  usePageTitle(t('privacy.title'));

  return (
    <div className="bg-surface pt-24 pb-16 md:pt-32 md:pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-headline font-black text-primary tracking-tighter mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-sm font-label text-on-surface-variant uppercase tracking-widest">
            {t('privacy.lastUpdated')}
          </p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-primary-container prose-p:text-on-surface-variant prose-p:leading-relaxed">
          <p className="text-lg lead font-medium text-primary mb-8 border-l-4 border-secondary pl-6">
            {t('privacy.intro')}
          </p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.infoCollectionLabel')}</h2>
          <p>{t('privacy.infoCollectionDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.useDataLabel')}</h2>
          <p>{t('privacy.useDataDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.transferDataLabel')}</h2>
          <p>{t('privacy.transferDataDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.disclosureLabel')}</h2>
          <p>{t('privacy.disclosureDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.securityLabel')}</h2>
          <p>{t('privacy.securityDesc')}</p>

          <h2 className="text-2xl mt-12 mb-4">{t('privacy.contactLabel')}</h2>
          <p>{t('privacy.contactDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
