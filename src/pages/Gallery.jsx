import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const Gallery = () => {
  const { lang } = useLanguage();
  const [selectedItem, setSelectedItem] = useState(null);

  usePageTitle(
    selectedItem
      ? `${selectedItem.type === 'video' ? 'Video' : 'Gambar'} ${selectedItem.title}`
      : (lang === 'id' ? 'Galeri' : 'Gallery')
  );

  const [galleries, setGalleries] = useState([]);
  const [displayedGalleries, setDisplayedGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredGalleries = useMemo(() => {
    if (!searchQuery) return galleries;
    const lowerQuery = searchQuery.toLowerCase();
    return galleries.filter(item =>
      item.title.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, galleries]);

  const observerTarget = useRef(null);
  const modalVideoRef = useRef(null);

  // Play otomatis saat modal terbuka (iOS biasanya mengizinkan autoplay unmuted jika diawali dengan interaksi 'klik' user untuk membuka modal)
  useEffect(() => {
    if (selectedItem && selectedItem.type === 'video' && modalVideoRef.current) {
      modalVideoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented by browser:', err);
      });
    }
  }, [selectedItem]);

  // Swipe states
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);
  const [showSwipeInstruction, setShowSwipeInstruction] = useState(false);

  // Link dropup state
  const [showLinksDropup, setShowLinksDropup] = useState(false);

  // For deep linking
  const createSlug = (title, id) => {
    if (!title) return `gallery-${id}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${slug}-${id}`;
  };

  const updateUrl = (item) => {
    if (item) {
      const slug = createSlug(item.title, item.id);
      window.history.pushState({}, '', `${window.location.pathname}?view=${slug}`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  // Track Main Page View
  useEffect(() => {
    fetch('/api/track_view.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_type: 'gallery', slug: 'main' })
    }).catch(console.error);
  }, []);

  // Track Individual Gallery Item View (Debounced)
  useEffect(() => {
    if (selectedItem) {
      const slug = createSlug(selectedItem.title, selectedItem.id);
      const timer = setTimeout(() => {
        fetch('/api/track_view.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_type: 'gallery', slug })
        }).catch(console.error);
      }, 1500); // Tunggu 1.5 detik agar swipe cepat tidak terhitung sebagai view

      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await fetch('/api/gallery.php');
        const data = await res.json();
        if (data.success) {
          // Shuffle the galleries array
          const shuffled = data.galleries.sort(() => Math.random() - 0.5);
          setGalleries(shuffled);

          // Initial load
          let initialItems = shuffled.slice(0, 15).map((item, index) => ({
            ...item,
            uniqueKey: `${item.id}_initial_${index}`
          }));

          // Deep linking check
          const params = new URLSearchParams(window.location.search);
          const viewParam = params.get('view');
          if (viewParam) {
            const parts = viewParam.split('-');
            const idPart = parts[parts.length - 1];
            if (idPart) {
              const targetItem = shuffled.find(g => g.id.toString() === idPart);
              if (targetItem) {
                const targetIndexInShuffled = shuffled.findIndex(g => g.id === targetItem.id);
                let targetUniqueKey = '';
                if (targetIndexInShuffled >= 15) {
                  const newItem = { ...targetItem, uniqueKey: `${targetItem.id}_initial_deep` };
                  initialItems.unshift(newItem);
                  targetUniqueKey = newItem.uniqueKey;
                } else {
                  targetUniqueKey = `${targetItem.id}_initial_${targetIndexInShuffled}`;
                }
                setSelectedItem({ ...targetItem, uniqueKey: targetUniqueKey });
                if (window.innerWidth < 768) setShowSwipeInstruction(true);
              }
            }
          }
          setDisplayedGalleries(initialItems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  const loadMoreItems = useCallback(() => {
    if (filteredGalleries.length === 0) return;

    setDisplayedGalleries(prev => {
      const prevCount = prev.length;
      if (prevCount >= filteredGalleries.length) return prev; // All items loaded

      const nextCount = Math.min(prevCount + 15, filteredGalleries.length);
      const newItems = [];

      for (let i = prevCount; i < nextCount; i++) {
        const originalItem = filteredGalleries[i];
        newItems.push({
          ...originalItem,
          uniqueKey: `${originalItem.id}_initial_${i}`
        });
      }

      return [...prev, ...newItems];
    });
  }, [filteredGalleries]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (filteredGalleries.length > 0) {
      setDisplayedGalleries(filteredGalleries.slice(0, 15).map((item, index) => ({
        ...item,
        uniqueKey: `${item.id}_search_${index}`
      })));
    } else {
      setDisplayedGalleries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && galleries.length > 0) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreItems, isLoading, galleries.length]);

  const closeModal = () => {
    setSelectedItem(null);
    updateUrl(null);
    setShowSwipeInstruction(false);
    setShowLinksDropup(false);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    updateUrl(item);
    setShowLinksDropup(false);
    if (window.innerWidth < 768) {
      setShowSwipeInstruction(true);
    }
  };

  // Use displayedGalleries for modal navigation
  const currentIndex = selectedItem ? displayedGalleries.findIndex(g => g.uniqueKey === selectedItem.uniqueKey) : -1;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setShowSwipeInstruction(false);

    if (currentIndex < displayedGalleries.length - 1) {
      // Masih ada item di daftar yang sudah ter-load
      const nextItem = displayedGalleries[currentIndex + 1];
      setSelectedItem(nextItem);
      updateUrl(nextItem);
      setShowLinksDropup(false);
    } else if (displayedGalleries.length < filteredGalleries.length) {
      // Sudah mencapai ujung dari displayedGalleries, muat lebih banyak!
      const nextOriginalItem = filteredGalleries[displayedGalleries.length];
      const nextItem = {
        ...nextOriginalItem,
        uniqueKey: `${nextOriginalItem.id}_initial_${displayedGalleries.length}`
      };

      loadMoreItems(); // Load batch 15 gambar/video berikutnya ke memori
      setSelectedItem(nextItem); // Lanjut ke gambar pertama dari batch baru tersebut
      updateUrl(nextItem);
      setShowLinksDropup(false);
    }
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setShowSwipeInstruction(false);
    if (currentIndex > 0) {
      const prevItem = displayedGalleries[currentIndex - 1];
      setSelectedItem(prevItem);
      updateUrl(prevItem);
      setShowLinksDropup(false);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchStartY || !touchEndX || !touchEndY) return;
    setShowSwipeInstruction(false);

    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    const minSwipeDistance = 50;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      if (distanceY > minSwipeDistance) handleNext();
      else if (distanceY < -minSwipeDistance) handlePrev();
    } else {
      if (distanceX > minSwipeDistance) handleNext();
      else if (distanceX < -minSwipeDistance) handlePrev();
    }
  };

  const [showCopied, setShowCopied] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  useEffect(() => {
    if (showSwipeInstruction) {
      const timer = setTimeout(() => setShowSwipeInstruction(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showSwipeInstruction]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, displayedGalleries, currentIndex]);

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8">
        <header className="mb-8 w-full text-left">
          {/* Baris Atas: Judul (Kiri) dan Deskripsi (Kanan) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4 mb-6">
            <div>
              <h1 className="font-headline font-extrabold text-[#001f5b] dark:text-white tracking-tight text-3xl md:text-4xl">
                {lang === 'id' ? 'Galeri Kami' : 'Our Gallery'}
              </h1>
            </div>

            <div className="md:text-right max-w-xl">
              <p className="text-sm text-outline dark:text-slate-400 font-body">
                {lang === 'id'
                  ? 'Koleksi dokumentasi proyek, pemasangan, dan produk terbaik dari Ateka Tehnik.'
                  : 'Collection of project documentation, installations, and our best products.'}
              </p>
            </div>
          </div>

          {/* Baris Bawah: Kotak Pencarian Lebar Penuh (Full Width) */}
          <div className="w-full relative shadow-sm rounded-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'id' ? "Cari nama galeri..." : "Search gallery..."}
              className="w-full pl-12 pr-12 py-3.5 md:py-4 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm md:text-base transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </header>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
            <p className="text-sm text-on-surface-variant mt-3">{lang === 'id' ? 'Memuat Galeri...' : 'Loading Gallery...'}</p>
          </div>
        ) : displayedGalleries.length > 0 ? (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
              {displayedGalleries.map((item) => (
                <div
                  key={item.uniqueKey}
                  onClick={() => handleOpenModal(item)}
                  className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 bg-surface-container-highest"
                >
                  {item.type === 'video' ? (
                    <div className={`relative ${item.height} w-full bg-black/10`}>
                      <video
                        src={item.src}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-4xl drop-shadow-lg">play_circle</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${item.height}`}
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                    <h3 className="text-white font-headline font-bold text-base md:text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {item.title}
                    </h3>
                    <span className="text-white/80 text-sm mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.type === 'video' ? (lang === 'id' ? 'Video' : 'Video') : (lang === 'id' ? 'Gambar' : 'Image')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Observer Target for Infinite Scroll */}
            {displayedGalleries.length < filteredGalleries.length && (
              <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
                <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-outline">
            {searchQuery
              ? (lang === 'id' ? 'Gambar/video tidak ditemukan.' : 'No images/videos found.')
              : (lang === 'id' ? 'Belum ada galeri.' : 'No gallery available yet.')}
          </div>
        )}
      </div>

      {/* Modal / Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black md:bg-black/95 md:backdrop-blur-md p-0 md:p-8 animate-fade-in touch-none"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Navigation Bar */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/90 to-transparent z-[120] flex items-start pt-6 px-4 md:px-8 justify-between" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 hover:bg-white/20 rounded-full px-4 py-2.5 backdrop-blur-md shadow-lg border border-white/5">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="text-sm font-bold tracking-wide uppercase">{lang === 'id' ? 'Galeri' : 'Gallery'}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-white/10 hover:bg-white/20 rounded-full px-4 py-2.5 backdrop-blur-md shadow-lg border border-white/5">
              {showCopied ? (
                <>
                  <span className="text-sm font-bold tracking-wide uppercase text-green-400">{lang === 'id' ? 'Tersalin!' : 'Copied!'}</span>
                  <span className="material-symbols-outlined text-xl text-green-400">check_circle</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold tracking-wide uppercase">{lang === 'id' ? 'Bagikan' : 'Share'}</span>
                  <span className="material-symbols-outlined text-xl">share</span>
                </>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="hidden md:block absolute left-8 z-[120] text-white/50 hover:text-white bg-black/30 hover:bg-black/80 rounded-full p-4 transition-all backdrop-blur-sm shadow-lg"
            >
              <span className="material-symbols-outlined text-5xl">chevron_left</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="hidden md:block absolute right-8 z-[120] text-white/50 hover:text-white bg-black/30 hover:bg-black/80 rounded-full p-4 transition-all backdrop-blur-sm shadow-lg"
          >
            <span className="material-symbols-outlined text-5xl">chevron_right</span>
          </button>

          {/* Mobile Navigation (Bottom Right) */}
          <div className="md:hidden absolute right-4 bottom-28 z-[120] flex flex-col gap-3">
            <button
              onClick={handlePrev}
              className={`text-white/70 hover:text-white bg-black/40 hover:bg-black/80 rounded-full p-3 transition-all backdrop-blur-md shadow-lg border border-white/10 ${currentIndex === 0 ? 'opacity-30 pointer-events-none' : ''}`}
            >
              <span className="material-symbols-outlined text-2xl">keyboard_arrow_up</span>
            </button>
            <button
              onClick={handleNext}
              className="text-white/70 hover:text-white bg-black/40 hover:bg-black/80 rounded-full p-3 transition-all backdrop-blur-md shadow-lg border border-white/10"
            >
              <span className="material-symbols-outlined text-2xl">keyboard_arrow_down</span>
            </button>
          </div>

          {/* Reels-style Swipe Instruction (Mobile Only) */}
          {showSwipeInstruction && (
            <div className="md:hidden absolute inset-0 z-[150] flex flex-col items-center justify-center pointer-events-none bg-black/40 animate-fade-in">
              <div className="bg-black/60 backdrop-blur-md px-6 py-5 rounded-2xl flex flex-col items-center gap-3 animate-bounce shadow-2xl">
                <span className="material-symbols-outlined text-white text-5xl">swipe_up</span>
                <p className="text-white font-medium text-sm text-center">{lang === 'id' ? 'Geser ke atas untuk' : 'Swipe up for'}<br />{lang === 'id' ? 'foto/video selanjutnya' : 'next photo or video'}</p>
              </div>
            </div>
          )}

          <div
            className="relative w-full h-full md:max-w-5xl md:max-h-[90vh] md:rounded-lg overflow-hidden md:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center animate-zoom-in"
            onClick={(e) => { e.stopPropagation(); setShowLinksDropup(false); }}
          >
            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden mix-blend-overlay opacity-60">
              <span className="text-white text-4xl md:text-5xl lg:text-7xl font-black -rotate-12 select-none tracking-[0.2em] whitespace-nowrap drop-shadow-lg">
                ATEKATEHNIK
              </span>
            </div>

            {selectedItem.type === 'video' ? (
              <video
                ref={modalVideoRef}
                src={selectedItem.src}
                controls
                autoPlay
                loop
                playsInline
                webkit-playsinline="true"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                className="w-full h-full object-contain bg-black select-none"
              />
            )}

            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8 pt-32 md:pt-32 z-20 pointer-events-none flex flex-col justify-end">

              {/* Related Links Area */}
              {selectedItem.links && selectedItem.links.length > 0 && (
                <div className="mb-4 flex items-end pointer-events-auto relative">
                  {selectedItem.links.length === 1 ? (
                    (() => {
                      const link = selectedItem.links[0];
                      const route = link.type === 'external' ? link.url
                        : link.type === 'product' ? `/product/${link.slug}`
                        : link.type === 'portfolio' ? `/portfolio/${link.slug}`
                          : `/news/${link.slug}`;
                      const bgClass = link.type === 'external' ? 'bg-purple-600 text-white'
                        : link.type === 'product' ? 'bg-[#f0c14b] text-yellow-950'
                        : link.type === 'portfolio' ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white';
                      const icon = link.type === 'external' ? 'open_in_new'
                        : link.type === 'product' ? 'shopping_basket'
                        : link.type === 'portfolio' ? 'business_center'
                          : 'article';
                      const shortTitle = link.title.length > 10 ? link.title.substring(0, 10) + '...' : link.title;
                      
                      const linkClasses = `flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform ${bgClass}`;

                      if (link.type === 'external') {
                        return (
                          <a href={route} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                            <span className="material-symbols-outlined text-lg">{icon}</span>
                            <span>{shortTitle}</span>
                          </a>
                        );
                      }

                      return (
                        <Link to={route} className={linkClasses}>
                          <span className="material-symbols-outlined text-lg">{icon}</span>
                          <span>{shortTitle}</span>
                        </Link>
                      );
                    })()
                  ) : (
                    <div className="relative">
                      {showLinksDropup && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden animate-fade-in border border-white/20">
                          {selectedItem.links.map((link, idx) => {
                            const route = link.type === 'external' ? link.url
                              : link.type === 'product' ? `/products/${link.slug}`
                              : link.type === 'portfolio' ? `/portfolio/${link.slug}`
                                : `/news/${link.slug}`;
                            const bgClass = link.type === 'external' ? 'bg-purple-100 text-purple-800'
                              : link.type === 'product' ? 'bg-[#f0c14b]/20 text-yellow-800'
                              : link.type === 'portfolio' ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800';
                            const icon = link.type === 'external' ? 'open_in_new'
                              : link.type === 'product' ? 'shopping_basket'
                              : link.type === 'portfolio' ? 'business_center'
                                : 'article';
                            
                            const linkClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors";
                            const content = (
                              <>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 truncate">{link.title}</span>
                              </>
                            );

                            if (link.type === 'external') {
                              return (
                                <a key={idx} href={route} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                                  {content}
                                </a>
                              );
                            }

                            return (
                              <Link key={idx} to={route} className={linkClasses}>
                                {content}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); setShowLinksDropup(!showLinksDropup); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform bg-white/90 text-slate-800 border border-white/20"
                      >
                        <span className="material-symbols-outlined text-lg">layers</span>
                        <span>{selectedItem.links.length} Link Terkait</span>
                        <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${showLinksDropup ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-white font-headline font-bold text-xl md:text-3xl leading-snug">
                {selectedItem.title}
              </h2>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
