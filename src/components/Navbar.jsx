import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Live search with debounce
  const fetchSearchResults = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search.php?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch {
      // silent
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim()) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        fetchSearchResults(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, fetchSearchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      // Disable body scroll when modal open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [searchOpen]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const isPathActive = (path) => {
    if (path === '/portfolio') {
      return location.pathname.startsWith('/portfolio') || location.pathname.startsWith('/post');
    }
    if (path === '/products') {
      return location.pathname.startsWith('/products') || location.pathname.startsWith('/product');
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

          {/* Right Actions: Search + Language Toggle + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 text-primary-container hover:bg-surface-container-low rounded-full transition-colors"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[20px] md:text-2xl">search</span>
            </button>

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

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center pt-20 md:pt-32">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSearchOpen(false)}
          />
          {/* Search Box */}
          <div className="relative w-full max-w-3xl px-4 z-10 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white dark:bg-[#000c2e] rounded-xl shadow-2xl p-2 border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline-variant ml-4 text-2xl">search</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={lang === 'id' ? 'Cari produk atau postingan...' : 'Search products or posts...'}
                className="w-full bg-transparent border-none text-xl font-headline text-primary-container dark:text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder-outline-variant"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                {/* Enter to search Button */}
                <button 
                  type="submit"
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 rounded-full text-outline-variant hover:text-primary-container dark:hover:text-white transition-colors"
                  title="Tekan Enter untuk mencari"
                >
                  <span className="text-xs font-bold uppercase tracking-widest">Enter</span>
                  <span className="material-symbols-outlined text-[14px]">keyboard_return</span>
                </button>
                {/* Mobile Search Icon Button */}
                <button 
                  type="submit"
                  className="md:hidden w-10 h-10 flex items-center justify-center text-outline-variant hover:text-primary-container dark:hover:text-white transition-colors rounded-full bg-surface-container-low dark:bg-white/10"
                >
                  <span className="material-symbols-outlined text-sm">keyboard_return</span>
                </button>
                {/* Close Modal Button */}
                <button 
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-10 h-10 flex items-center justify-center text-outline-variant hover:text-primary-container dark:hover:text-white transition-colors rounded-full hover:bg-surface-container-low dark:hover:bg-white/10"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </form>
            
            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 bg-white dark:bg-[#000c2e] rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
                {isSearching ? (
                  <div className="p-8 flex flex-col items-center text-outline-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl mb-2">progress_activity</span>
                    <span className="text-sm">{lang === 'id' ? 'Mencari...' : 'Searching...'}</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10">
                    {searchResults.map(item => (
                      <li key={item.id}>
                        <Link 
                          to={item.link} 
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low dark:hover:bg-[#001f5b]/50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img src={item.image} alt="" className="w-10 h-10 rounded-sm object-cover shrink-0 bg-surface-container" />
                            )}
                            <div className="flex flex-col">
                              <span className="font-headline font-bold text-primary-container dark:text-white group-hover:text-secondary transition-colors">
                                {item.title}
                              </span>
                              <span className="text-xs font-label text-outline-variant mt-1 uppercase tracking-wider">
                                {item.type === 'product' ? (lang === 'id' ? 'Produk' : 'Product') : (lang === 'id' ? 'Postingan' : 'Post')}
                                {item.badge && <span className="ml-2 text-secondary">· {item.badge}</span>}
                              </span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-outline-variant opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                            arrow_forward
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-outline-variant font-body">
                    {lang === 'id' ? 'Tidak ada hasil yang ditemukan.' : 'No results found.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
