import { useLanguage } from '../context/LanguageContext';

const TrustBar = () => {
  const { t } = useLanguage();
  const logos = [
    '/trust/Kementerian-BUMN-RI-vector-logo.png',
    '/trust/dept-pertanian.png',
    '/trust/bulog.png',
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
      <div className="w-full relative overflow-hidden">
        <div className="flex w-max animate-marquee space-x-12 md:space-x-20 items-center py-4 px-4 md:px-10 hover:[animation-play-state:paused]">
          {[...logos, ...logos].map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Partner ${(index % logos.length) + 1}`}
              className="h-10 md:h-14 flex-shrink-0 object-contain mix-blend-multiply opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
