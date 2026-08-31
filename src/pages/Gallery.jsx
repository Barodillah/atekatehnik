import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const Gallery = () => {
  const { lang } = useLanguage();
  usePageTitle(lang === 'id' ? 'Galeri | Ateka Tehnik' : 'Gallery | Ateka Tehnik');

  const [selectedItem, setSelectedItem] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [displayedGalleries, setDisplayedGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadCount, setLoadCount] = useState(15);
  
  const observerTarget = useRef(null);

  // Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
          const initialItems = shuffled.slice(0, 15).map((item, index) => ({
            ...item,
            uniqueKey: `${item.id}_initial_${index}`
          }));
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
    if (galleries.length === 0) return;
    
    setLoadCount(prevCount => {
      const nextCount = prevCount + 15;
      const newItems = [];
      
      for (let i = prevCount; i < nextCount; i++) {
        // modulo for looping
        const originalItem = galleries[i % galleries.length];
        newItems.push({
          ...originalItem,
          uniqueKey: `${originalItem.id}_loop_${Math.floor(i / galleries.length)}_${i}` 
        });
      }
      
      setDisplayedGalleries(prev => [...prev, ...newItems]);
      return nextCount;
    });
  }, [galleries]);

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

  const closeModal = () => setSelectedItem(null);

  // Use displayedGalleries for modal navigation
  const currentIndex = selectedItem ? displayedGalleries.findIndex(g => g.uniqueKey === selectedItem.uniqueKey) : -1;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex < displayedGalleries.length - 1) {
      setSelectedItem(displayedGalleries[currentIndex + 1]);
    }
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      setSelectedItem(displayedGalleries[currentIndex - 1]);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

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
    <main className="min-h-screen bg-surface pt-32 pb-20">
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
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-[#001f5b] dark:text-white tracking-tight mb-4">
            {lang === 'id' ? 'Galeri Kami' : 'Our Gallery'}
          </h1>
          <p className="text-lg text-outline dark:text-slate-400 font-body max-w-2xl mx-auto">
            {lang === 'id' 
              ? 'Koleksi dokumentasi proyek, pemasangan, dan produk terbaik dari Ateka Tehnik.' 
              : 'Collection of project documentation, installations, and our best products.'}
          </p>
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
                  onClick={() => setSelectedItem(item)}
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
            <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
              <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-outline">
            {lang === 'id' ? 'Belum ada galeri.' : 'No gallery available yet.'}
          </div>
        )}
      </div>

      {/* Modal / Lightbox */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-fade-in"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/50 hover:bg-black/80 rounded-full p-2 z-[120]"
            onClick={closeModal}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {currentIndex > 0 && (
            <button 
              onClick={handlePrev} 
              className="absolute left-2 md:left-8 z-[120] text-white/50 hover:text-white bg-black/30 hover:bg-black/80 rounded-full p-2 md:p-4 transition-all backdrop-blur-sm shadow-lg"
            >
              <span className="material-symbols-outlined text-3xl md:text-5xl">chevron_left</span>
            </button>
          )}

          {currentIndex < displayedGalleries.length - 1 && (
            <button 
              onClick={handleNext} 
              className="absolute right-2 md:right-8 z-[120] text-white/50 hover:text-white bg-black/30 hover:bg-black/80 rounded-full p-2 md:p-4 transition-all backdrop-blur-sm shadow-lg"
            >
              <span className="material-symbols-outlined text-3xl md:text-5xl">chevron_right</span>
            </button>
          )}

          <div 
            className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden mix-blend-overlay opacity-70">
              <span className="text-white text-3xl md:text-5xl lg:text-7xl font-black -rotate-12 select-none tracking-[0.2em] whitespace-nowrap drop-shadow-lg">
                ATEKATEHNIK
              </span>
            </div>

            {selectedItem.type === 'video' ? (
              <video 
                src={selectedItem.src} 
                controls 
                autoPlay 
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[90vh] object-contain bg-black/50"
              />
            ) : (
              <img 
                src={selectedItem.src} 
                alt={selectedItem.title} 
                onContextMenu={(e) => e.preventDefault()}
                draggable="false"
                className="w-full h-auto max-h-[90vh] object-contain bg-black/50 select-none"
              />
            )}
            
            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-8 pt-20 md:pt-24 z-20">
              <h2 className="text-white font-headline font-bold text-lg md:text-3xl">
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
