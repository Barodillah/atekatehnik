import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const GalleryCTA = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-24 relative overflow-hidden bg-[#000c2e]">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b00] rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0047ff] rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-2xl">
          <span className="material-symbols-outlined text-[#ff6b00] text-4xl">collections</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          {lang === 'id' 
            ? 'Ingin Melihat Hasil Kerja Kami?' 
            : 'Want to See Our Work?'}
        </h2>
        
        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          {lang === 'id'
            ? 'Jelajahi galeri visual kami yang berisi dokumentasi foto dan video dari berbagai proyek instalasi mesin, pengiriman, dan perakitan dari Ateka Tehnik.'
            : 'Explore our visual gallery featuring photo and video documentation of various machine installations, deliveries, and assemblies by Ateka Tehnik.'}
        </p>
        
        <Link 
          to="/gallery" 
          className="group inline-flex items-center gap-3 bg-[#ff6b00] hover:bg-[#e66000] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,0,0.4)]"
        >
          {lang === 'id' ? 'Buka Galeri' : 'Open Gallery'}
          <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
};

export default GalleryCTA;
