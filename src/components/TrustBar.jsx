import { useLanguage } from '../context/LanguageContext';

const TrustBar = () => {
  const { t } = useLanguage();
  const logos = [
    '/trust/Kementerian-BUMN-RI-vector-logo.png',
    '/trust/dept-pertanian.png',
    '/trust/inaproc.webp',
    '/trust/mentri_industri.webp',
    '/trust/pt-agrindo.png',
    '/trust/pt-rutan.png',
    '/trust/satake.png',
    '/trust/yanmar.png',
    '/trust/mitsuboshi.svg',
  ];

  return (
    <section className="bg-surface-container-low py-12 border-y border-outline-variant/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 mb-8">
        <p className="text-center font-label text-xs tracking-widest text-on-surface-variant uppercase">
          {t('trustBar.label')}
        </p>
      </div>
      <div className="w-full relative flex overflow-hidden">
        <div className="flex w-max shrink-0 animate-slide hover:[animation-play-state:paused] items-center">
          {[...logos, ...logos].map((src, index) => (
            <div key={`group1-${index}`} className="flex-shrink-0 px-6 md:px-12">
              <img
                src={src}
                alt={`Partner ${(index % logos.length) + 1}`}
                className="h-10 md:h-12 w-auto object-contain mix-blend-multiply opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
        <div className="flex w-max shrink-0 animate-slide hover:[animation-play-state:paused] items-center">
          {[...logos, ...logos].map((src, index) => (
            <div key={`group2-${index}`} className="flex-shrink-0 px-6 md:px-12">
              <img
                src={src}
                alt={`Partner ${(index % logos.length) + 1}`}
                className="h-10 md:h-12 w-auto object-contain mix-blend-multiply opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
