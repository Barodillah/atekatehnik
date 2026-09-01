import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const GalleryCTA = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-10 md:py-12 relative overflow-hidden bg-[#000c2e]">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff6b00] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0047ff] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 flex-1">
                <div className="w-14 h-14 rounded-full bg-white/10 flex shrink-0 items-center justify-center border border-white/20 shadow-lg">
                    <span className="material-symbols-outlined text-[#ff6b00] text-3xl">collections</span>
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                    {lang === 'id' 
                        ? 'Ingin Melihat Hasil Kerja Kami?' 
                        : 'Want to See Our Work?'}
                    </h2>
                    <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-snug">
                    {lang === 'id'
                        ? 'Jelajahi galeri visual kami yang berisi dokumentasi foto dan video dari berbagai proyek dari Ateka Tehnik.'
                        : 'Explore our visual gallery featuring photo and video documentation of various projects by Ateka Tehnik.'}
                    </p>
                </div>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
                <Link 
                to="/gallery" 
                className="group flex items-center justify-center gap-2 bg-[#ff6b00] hover:bg-[#e66000] text-white px-6 py-3 w-full rounded-sm font-semibold transition-all duration-300 shadow hover:scale-105"
                >
                <span>{lang === 'id' ? 'Buka Galeri' : 'Open Gallery'}</span>
                <span className="material-symbols-outlined text-xl transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                </Link>
            </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryCTA;
