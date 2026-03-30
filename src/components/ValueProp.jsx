import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ValueProp = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary-container text-white flex items-center justify-center rounded-sm">
              <span className="material-symbols-outlined">engineering</span>
            </div>
            <h4 className="text-xl font-headline font-bold text-primary">{t('valueProp.title1')}</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">{t('valueProp.desc1')}</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary text-white flex items-center justify-center rounded-sm">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h4 className="text-xl font-headline font-bold text-primary">{t('valueProp.title2')}</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">{t('valueProp.desc2')}</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-sm">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h4 className="text-xl font-headline font-bold text-primary">{t('valueProp.title3')}</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">{t('valueProp.desc3')}</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link to="/about" className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all group">
            {t('nav.about')} ATEKA TEHNIK
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ValueProp;
