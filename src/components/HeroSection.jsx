import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { trackWaClick } from '../utils/trackWaClick';

// Media Helper Functions
const isYouTube = (url) => {
    return url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
};

const getYouTubeId = (url) => {
    const match = isYouTube(url);
    return match ? match[1] : null;
};

const isVideoFile = (url) => {
    return url?.match(/\.(mp4|webm|ogg)$/i);
};

const MediaItem = ({ phase, isActive }) => {
  const ytid = getYouTubeId(phase.image_url);
  const isDirectVideo = isVideoFile(phase.image_url);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isDirectVideo && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(e => console.log("Play prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isDirectVideo]);

  if (ytid) {
    return (
      <iframe 
        className="w-full max-w-4xl aspect-video rounded-sm shadow-2xl" 
        src={`https://www.youtube.com/embed/${ytid}?autoplay=${isActive ? '1' : '0'}&mute=1&playsinline=1`} 
        title={phase.title} 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen>
      </iframe>
    );
  }

  if (isDirectVideo) {
    return (
      <video
        ref={videoRef}
        className="w-full max-w-4xl max-h-[60vh] object-contain rounded-sm shadow-2xl"
        src={phase.image_url}
        controls
        playsInline
        muted
        loop
      />
    );
  }

  return (
    <img 
      alt={phase.title}
      className="w-auto max-w-full max-h-[60vh] object-contain rounded-sm shadow-2xl"
      src={phase.image_url} 
    />
  );
};

const HeroSection = () => {
  const { t, lang } = useLanguage();

  const [currentImage, setCurrentImage] = useState(0);
  
  // New States for Latest Project
  const [latestProject, setLatestProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const galleryRef = useRef(null);

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

  // Fetch Latest Project
  useEffect(() => {
    const fetchLatestProject = async () => {
      try {
        const res = await fetch(`/api/posts.php?lang=${lang}&category=Industrial%20Installations&limit=1`);
        const data = await res.json();
        if (data.success && data.posts && data.posts.length > 0) {
          const project = data.posts[0];
          setLatestProject(project);
          
          // Fetch full details for phases
          const detailRes = await fetch(`/api/posts.php?slug=${project.slug}&lang=${lang}`);
          const detailData = await detailRes.json();
          if (detailData.success && detailData.post) {
             setProjectDetails(detailData.post);
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest project", error);
      }
    };
    fetchLatestProject();
  }, [lang]);

  // Slider Logic
  const nextSlide = () => {
    if (projectDetails?.phases) {
      setActivePhaseIndex((prev) => (prev === projectDetails.phases.length - 1 ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (projectDetails?.phases) {
      setActivePhaseIndex((prev) => (prev === 0 ? projectDetails.phases.length - 1 : prev - 1));
    }
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Reset slider index when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setActivePhaseIndex(0);
    }
  }, [isModalOpen]);

  const ProjectCardContent = ({ isMobile }) => {
    if (!latestProject) return null;
    const projectDate = new Date(latestProject.publish_date || latestProject.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return (
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`group cursor-pointer bg-surface/90 backdrop-blur-xl rounded-sm shadow-xl border border-white/20 overflow-hidden relative transition-all duration-700 ease-out hover:shadow-2xl hover:border-secondary ${isMobile ? 'flex items-center p-3 gap-4 w-full' : 'flex flex-col w-[300px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(0,31,91,0.6)] -rotate-3 hover:rotate-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-0"></div>
        
        {isMobile ? (
          <>
            <div className="w-16 h-16 shrink-0 rounded-sm overflow-hidden relative z-10">
              <img src={latestProject.cover_image || 'https://via.placeholder.com/150'} alt={latestProject.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex flex-col z-10 flex-grow">
               <span className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-0.5 flex items-center justify-between">
                  {lang === 'id' ? 'Proyek Terbaru' : 'Latest Project'}
               </span>
               <h4 className="text-sm font-headline font-bold text-on-surface line-clamp-2 leading-tight">{latestProject.title}</h4>
               <span className="text-[10px] text-on-surface-variant font-medium mt-1">{projectDate}</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-full aspect-video overflow-hidden relative z-10">
               <img src={latestProject.cover_image || 'https://via.placeholder.com/300x200'} alt={latestProject.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest shadow-md">
                 {lang === 'id' ? 'Proyek Terbaru' : 'Latest Project'}
               </div>
            </div>
            <div className="p-6 relative z-10 flex flex-col items-center text-center">
               <h4 className="text-lg font-headline font-bold text-on-surface mb-1 line-clamp-2">{latestProject.title}</h4>
               <span className="text-xs text-on-surface-variant font-medium mb-3">{projectDate}</span>
               <span className="text-xs text-secondary font-medium flex items-center gap-1 group-hover:text-primary transition-colors">
                  {lang === 'id' ? 'Lihat Detail' : 'View Detail'} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
               </span>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
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
            <div className="inline-flex items-center gap-2 bg-secondary-fixed text-on-secondary-fixed px-4 py-2 rounded-sm text-xs font-bold tracking-widest uppercase shadow-md border border-secondary-fixed/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.1] tracking-tight drop-shadow-sm">
              {t('hero.title')}<span className="text-secondary">{t('hero.titleHighlight')}</span>
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

            {/* Mobile: Latest Project Card */}
            <div className="lg:hidden pt-4">
               {latestProject && <ProjectCardContent isMobile={true} />}
            </div>
          </div>

          {/* Right: Highlight Stat Card (desktop only) */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0">
             {latestProject && <ProjectCardContent isMobile={false} />}
          </div>
        </div>
      </div>
    </header>

    {/* Project Gallery Modal */}
    {isModalOpen && latestProject && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
         {/* Close Button */}
         <button 
           onClick={() => setIsModalOpen(false)} 
           onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(false); }}
           className="absolute top-2 right-2 md:top-6 md:right-6 text-white/70 md:hover:text-white bg-white/10 md:hover:bg-white/20 active:bg-white/20 p-2 rounded-full transition-all z-[60] cursor-pointer"
         >
           <span className="material-symbols-outlined text-2xl block pointer-events-none">close</span>
         </button>

         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-surface/5 rounded-sm overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-black/40 border-b border-white/10 relative z-20">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10 md:pr-0">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-headline font-bold text-white mb-2">{latestProject.title}</h3>
                    <p className="text-white/70 text-sm md:text-base line-clamp-2">{latestProject.subtitle}</p>
                  </div>
                  <Link to={`/portfolio/${latestProject.slug}`} className="shrink-0 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-sm font-bold flex items-center justify-center gap-2 transition-colors">
                     {lang === 'id' ? 'Lihat Detail' : 'View Detail'} <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </Link>
               </div>
            </div>
            
            {/* Gallery Area (Slider) */}
            <div 
               className="relative flex-grow min-h-[40vh] md:min-h-[60vh] bg-black/60 overflow-hidden group touch-pan-y"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEndEvent}
            >
               {(!projectDetails || !projectDetails.phases || projectDetails.phases.length === 0) ? (
                 <div className="absolute inset-0 text-white/50 flex flex-col items-center justify-center p-8">
                    <span className="material-symbols-outlined text-5xl mb-4 opacity-50">imagesmode</span>
                    <p>{lang === 'id' ? 'Galeri belum tersedia.' : 'Gallery not available.'}</p>
                 </div>
               ) : (
                 <>
                   {/* Navigation Arrows (Visible on all devices) */}
                   <button 
                     onClick={prevSlide} 
                     onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                     className="flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 md:hover:bg-white/30 active:bg-white/30 text-white p-2 md:p-3 rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                   >
                     <span className="material-symbols-outlined pointer-events-none">chevron_left</span>
                   </button>
                   <button 
                     onClick={nextSlide} 
                     onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                     className="flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 md:hover:bg-white/30 active:bg-white/30 text-white p-2 md:p-3 rounded-full opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                   >
                     <span className="material-symbols-outlined pointer-events-none">chevron_right</span>
                   </button>

                   {/* Slider Track */}
                   <div 
                     className="flex w-full h-full transition-transform duration-500 ease-out"
                     style={{ transform: `translateX(-${activePhaseIndex * 100}%)` }}
                   >
                     {projectDetails.phases.map((phase, index) => {
                         const isActive = index === activePhaseIndex;
                         
                         return (
                           <div key={index} className="w-full h-full flex-shrink-0 relative flex items-center justify-center p-4 pb-16 md:pb-8 md:p-8">
                             <MediaItem phase={phase} isActive={isActive} />
                             
                             {/* Phase Title Overlay */}
                             {phase.title && (
                               <div className="absolute bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center max-w-[80%]">
                                  <h4 className="text-white font-bold text-sm md:text-base font-headline truncate">{phase.title}</h4>
                                </div>
                             )}
                           </div>
                         );
                     })}
                   </div>
                 </>
               )}
            </div>
         </div>
      </div>
    )}
    </>
  );
};

export default HeroSection;

