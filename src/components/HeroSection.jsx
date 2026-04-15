import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { trackWaClick } from '../utils/trackWaClick';

const HeroSection = () => {
  const { t } = useLanguage();

  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://atekatehnik.com/wp-content/uploads/herobarukecil_1.jpeg",
    "https://atekatehnik.com/wp-content/uploads/herobarukecil_2.jpeg",
    "https://atekatehnik.com/wp-content/uploads/hero_size_kecil.jpeg",
    "https://atekatehnik.com/wp-content/uploads/hero_baru_kecil_lagi_4.jpg",
    "https://atekatehnik.com/wp-content/uploads/hero_baru_kecil_lagi_3.jpeg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-surface min-h-[90vh] flex items-center">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <img
            key={index}
            alt={`Industrial Machinery ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ease-in-out ${index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            src={src}
          />
        ))}
        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-surface/20 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30 z-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-20 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Left: Text Content */}
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-md border border-secondary-fixed/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.1] tracking-tight drop-shadow-sm">
              {t('hero.title')}<span className="text-secondary">{t('hero.titleHighlight')}</span>{t('hero.titleSuffix')}
            </h1>
            <p className="text-lg lg:text-xl text-on-surface-variant max-w-2xl leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/contact" className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors duration-300 shadow-md">
                {t('hero.cta1')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik.com.%20Halo%20Ateka%20Tehnik%2C%20saya%20tertarik%20dengan%20produk%20Anda." target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('hero', 'hubungi-langsung')} className="bg-[#25D366] text-white px-8 py-4 rounded-sm font-bold hover:bg-[#1da851] transition-all duration-300 shadow-md flex items-center justify-center gap-2.5">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                {t('hero.ctaWa')}
              </a>
            </div>

            {/* Mobile: stat inline below CTAs */}
            <div className="lg:hidden pt-4">
              <div className="inline-flex items-center gap-4 bg-primary/90 backdrop-blur-xl px-6 py-4 rounded-xl shadow-lg border border-white/10">
                <div className="text-4xl font-black font-headline text-white">20+</div>
                <div className="text-[11px] uppercase tracking-widest text-white/80 font-bold max-w-[100px] leading-tight">
                  {t('hero.stat')}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Highlight Stat Card (desktop only) */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0">
            <div className="bg-primary/90 backdrop-blur-xl px-10 py-10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,31,91,0.5)] border border-white/10 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-7xl font-black font-headline text-white leading-none mb-2">20+</div>
                <div className="w-12 h-0.5 bg-secondary mx-auto mb-3"></div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/80 font-bold leading-tight">
                  {t('hero.stat')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
