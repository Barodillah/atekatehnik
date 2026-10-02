import React, { useState, useEffect, useRef } from 'react';

const FloatingVideo = () => {
  const [videoData, setVideoData] = useState(null);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [isTimePassed, setIsTimePassed] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const videoRef = useRef(null);

  // Fetch data galeri
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch('/api/gallery.php');
        const data = await res.json();
        if (data.success) {
          const videos = data.galleries.filter(item => item.type === 'video');
          if (videos.length > 0) {
            // Pilih video acak
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            setVideoData(randomVideo);
          }
        }
      } catch (err) {
        console.error('Failed to fetch floating video:', err);
      }
    };
    fetchVideo();
  }, []);

  // Timer 2 detik setelah komponen mount (menandakan halaman Home dimuat)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Memaksa iOS untuk autoplay dengan mengatur property muted secara manual dan memanggil play()
  useEffect(() => {
    if (videoRef.current && videoData) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented by browser:', err);
      });
    }
  }, [videoData]);

  const createSlug = (title, id) => {
    if (!title) return `gallery-${id}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${slug}-${id}`;
  };

  const handleVideoReady = () => {
    setIsReadyToPlay(true);
  };

  const handleClose = (e) => {
    e.preventDefault(); // Mencegah link tertrigger saat menekan tombol close
    e.stopPropagation();
    setIsClosed(true);
  };

  if (!videoData || isClosed) return null;

  const isVisible = isTimePassed && isReadyToPlay;
  const linkHref = `/gallery?view=${createSlug(videoData.title, videoData.id)}`;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-700 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-[150%] opacity-0'
      }`}
    >
      <div className="relative">
        <a
          href={linkHref}
          className="block relative aspect-[4/5] w-28 md:w-40 bg-black rounded-2xl overflow-hidden shadow-2xl group transition-colors"
        >
        <video
          ref={videoRef}
          src={videoData.src}
          className="w-full h-full object-cover pointer-events-none"
          autoPlay
          muted
          defaultMuted
          loop
          playsInline
          webkit-playsinline="true"
          onCanPlayThrough={handleVideoReady}
          onLoadedData={handleVideoReady}
        />
        
        {/* Overlay untuk memperjelas video bisa di-klik */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-white/80 group-hover:text-white text-4xl drop-shadow-md scale-90 group-hover:scale-110 transition-transform">
            open_in_new
          </span>
        </div>
        </a>

        {/* Tombol Close di Luar */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-slate-900 rounded-full w-7 h-7 shadow-lg border border-white/30 transition-all flex items-center justify-center"
          aria-label="Tutup video"
        >
          <span className="material-symbols-outlined text-sm font-bold">close</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingVideo;
