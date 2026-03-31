import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPathActive = (path) => {
    if (path === '/portfolio') {
      return location.pathname.startsWith('/portfolio') || location.pathname.startsWith('/post');
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path) => {
    return isPathActive(path)
      ? "font-headline font-bold tracking-tight text-[#904d00] border-b-2 border-[#904d00] pb-1"
      : "font-headline font-bold tracking-tight text-[#001f5b] dark:text-slate-300 hover:text-[#904d00] transition-colors duration-300";
  };

  const getMobileLinkClass = (path) => {
    return isPathActive(path)
      ? "block w-full py-3 px-4 font-headline font-bold tracking-tight text-[#904d00] bg-[#904d00]/5 border-l-4 border-[#904d00]"
      : "block w-full py-3 px-4 font-headline font-bold tracking-tight text-[#001f5b] hover:text-[#904d00] hover:bg-surface-container-low transition-colors duration-200";
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/portfolio', label: t('nav.portfolio') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#000c2e]/80 backdrop-blur-md shadow-[0_32px_32px_rgba(25,28,29,0.04)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20">
          {/* Logo */}
          <Link className="text-xl md:text-2xl font-black tracking-tighter text-[#001f5b] dark:text-white font-headline" to="/">
            ATEKA TEHNIK
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} className={getLinkClass(item.path)} to={item.path}>
                {item.label}
              </Link>
            ))}
            <a className="font-headline font-bold tracking-tight text-[#001f5b] dark:text-slate-300 hover:text-[#904d00] transition-colors duration-300" href="https://katalog.inaproc.id/ateka-tehnik" target="_blank" rel="noopener noreferrer">
              {t('nav.elkkp')}
            </a>
          </div>

          {/* Right Actions: Language Toggle + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 px-3 py-1.5 rounded-full transition-all duration-200 group hover:shadow-sm"
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className={`fi ${lang === 'id' ? 'fi-id' : 'fi-gb'} rounded-sm`} style={{ fontSize: '1rem' }}></span>
              <span className="text-xs font-bold text-primary-container uppercase tracking-wider group-hover:text-secondary transition-colors">
                {lang === 'id' ? 'ID' : 'EN'}
              </span>
              <span className="material-symbols-outlined text-xs text-outline-variant group-hover:rotate-180 transition-transform duration-300">sync</span>
              <span className={`fi ${lang === 'id' ? 'fi-gb' : 'fi-id'} rounded-sm opacity-40 group-hover:opacity-100 transition-opacity`} style={{ fontSize: '1rem' }}></span>
            </button>

            {/* Hamburger Button (Mobile) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-primary-container hover:bg-surface-container-low rounded-sm transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#000c2e] shadow-2xl border-t border-outline-variant/10 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  className={getMobileLinkClass(item.path)}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                className="block w-full py-3 px-4 font-headline font-bold tracking-tight text-[#001f5b] hover:text-[#904d00] hover:bg-surface-container-low transition-colors duration-200"
                href="https://katalog.inaproc.id/ateka-tehnik"
              >
                {t('nav.elkkp')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
