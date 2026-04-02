import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();
  
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    "https://atekatehnik.com/wp-content/uploads/gambar_hero_ai.jpeg",
    "https://atekatehnik.com/wp-content/uploads/gambar_hero_3.png",
    "https://atekatehnik.com/wp-content/uploads/gambar_hero_2.png",
    "https://atekatehnik.com/wp-content/uploads/gambar_hero_1.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-surface">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.1] tracking-tight">
              {t('hero.title')}<span className="text-secondary">{t('hero.titleHighlight')}</span>{t('hero.titleSuffix')}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/contact" className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors duration-300">
                {t('hero.cta1')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a href="https://katalog.inaproc.id/ateka-tehnik" target="_blank" rel="noopener noreferrer" className="border-2 border-outline-variant text-primary px-8 py-4 rounded-sm font-bold hover:bg-surface-container-low transition-colors duration-300">
                {t('hero.cta2')}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-surface-container-highest rounded-sm overflow-hidden shadow-2xl relative">
              {images.map((src, index) => (
                <img
                  key={index}
                  alt={`Industrial Machinery ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-1000 ease-in-out ${
                    index === currentImage ? 'opacity-90' : 'opacity-0'
                  }`}
                  src={src}
                />
              ))}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary-container text-white p-6 rounded-sm shadow-xl hidden md:block">
              <div className="text-4xl font-black font-headline">20+</div>
              <div className="text-xs uppercase tracking-widest text-secondary-container">{t('hero.stat')}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
