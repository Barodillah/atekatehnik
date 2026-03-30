import { useLanguage } from '../context/LanguageContext';

const TrustBar = () => {
  const { t } = useLanguage();
  const logos = [
    '/trust/Agrindo.jpg',
    '/trust/Kementerian-BUMN-RI-vector-logo.png',
    '/trust/dept-pertanian.png',
    '/trust/kppb.jpg',
    '/trust/kppb2.jpg',
    '/trust/kppb3.jpg',
    '/trust/satake.jpg'
  ];

  return (
    <section className="bg-surface-container-low py-12 border-y border-outline-variant/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 mb-8">
        <p className="text-center font-label text-xs tracking-widest text-on-surface-variant uppercase">
          {t('trustBar.label')}
        </p>
      </div>
      <div className="w-full relative">
        <div className="flex w-[200%] md:w-[150%] gap-12 md:gap-24 animate-slide hover:[animation-play-state:paused] items-center">
          <div className="flex justify-around flex-1 items-center gap-12 md:gap-24 px-6">
            {logos.map((src, index) => (
              <img 
                key={`logo1-${index}`}
                src={src} 
                alt={`Partner ${index+1}`} 
                className="h-12 md:h-16 w-auto max-w-[150px] object-contain mix-blend-multiply opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
              />
            ))}
          </div>
          <div className="flex justify-around flex-1 items-center gap-12 md:gap-24 px-6">
            {logos.map((src, index) => (
              <img 
                key={`logo2-${index}`}
                src={src} 
                alt={`Partner ${index+1}`} 
                className="h-12 md:h-16 w-auto max-w-[150px] object-contain mix-blend-multiply opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
