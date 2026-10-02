import React, { useEffect, useState } from 'react';

const tikTokEmbeds = [
  <blockquote key="1" className="tiktok-embed" cite="https://www.tiktok.com/@toko.ateka.tehnik/video/7605829231867710738" data-video-id="7605829231867710738" style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }} ><section><a target="_blank" rel="noreferrer" title="@toko.ateka.tehnik" href="https://www.tiktok.com/@toko.ateka.tehnik?refer=embed">@toko.ateka.tehnik</a> uji coba pengeringan gabah 1 ton dengan bed dryer, pengeringan membutuhkan waktu sekitar 6 jam bos🤩🔥 info bed dryer chat admin❗️ <a title="penggilinganpadi" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/penggilinganpadi?refer=embed">#penggilinganpadi</a> <a title="gabahbalap🌾" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/gabahbalap%F0%9F%8C%BE?refer=embed">#gabahbalap🌾</a> <a title="beras" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/beras?refer=embed">#beras</a> <a target="_blank" rel="noreferrer" title="♬ suara asli  - La Tasya" href="https://www.tiktok.com/music/suara-asli-La-Tasya-7596018856641366805?refer=embed">♬ suara asli  - La Tasya</a></section></blockquote>,
  <blockquote key="2" className="tiktok-embed" cite="https://www.tiktok.com/@toko.ateka.tehnik/video/7526174808329948434" data-video-id="7526174808329948434" style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }} ><section><a target="_blank" rel="noreferrer" title="@toko.ateka.tehnik" href="https://www.tiktok.com/@toko.ateka.tehnik?refer=embed">@toko.ateka.tehnik</a> <a title="penggilinganpadi" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/penggilinganpadi?refer=embed">#penggilinganpadi</a> <a title="gabahbalap🌾" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/gabahbalap%F0%9F%8C%BE?refer=embed">#gabahbalap🌾</a> <a title="beras" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/beras?refer=embed">#beras</a> <a target="_blank" rel="noreferrer" title="♬ suara asli - carofvngky - HUDA CARO [𝑿𝑮]" href="https://www.tiktok.com/music/suara-asli-carofvngky-7367381357154093830?refer=embed">♬ suara asli - carofvngky - HUDA CARO [𝑿𝑮]</a></section></blockquote>,
  <blockquote key="3" className="tiktok-embed" cite="https://www.tiktok.com/@toko.ateka.tehnik/video/7531677565254192402" data-video-id="7531677565254192402" style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }} ><section><a target="_blank" rel="noreferrer" title="@toko.ateka.tehnik" href="https://www.tiktok.com/@toko.ateka.tehnik?refer=embed">@toko.ateka.tehnik</a> <a title="penggilinganpadi" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/penggilinganpadi?refer=embed">#penggilinganpadi</a> <a title="gabahbalap🌾" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/gabahbalap%F0%9F%8C%BE?refer=embed">#gabahbalap🌾</a> <a title="beras" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/beras?refer=embed">#beras</a> <a target="_blank" rel="noreferrer" title="♬ suara asli  - Bram ft 𝗔𝗣 (am prem di bio)" href="https://www.tiktok.com/music/suara-asli-Bram-ft-𝗔𝗣-am-prem-di-bio-7525763261527673656?refer=embed">♬ suara asli  - Bram ft 𝗔𝗣 (am prem di bio)</a></section></blockquote>,
  <blockquote key="4" className="tiktok-embed" cite="https://www.tiktok.com/@toko.ateka.tehnik/video/7681536512642600200" data-video-id="7681536512642600200" style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }} ><section><a target="_blank" rel="noreferrer" title="@toko.ateka.tehnik" href="https://www.tiktok.com/@toko.ateka.tehnik?refer=embed">@toko.ateka.tehnik</a> pecah kulit yanmar(hw) ready boss🤩🔥🫵🏼 siapa cepat dia dapat, yuk lgsg wa admin toko di bio😋🙏🏻 <a title="penggilinganpadi" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/penggilinganpadi?refer=embed">#penggilinganpadi</a> <a title="gabahbalap🌾" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/gabahbalap%F0%9F%8C%BE?refer=embed">#gabahbalap🌾</a> <a title="beras" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/beras?refer=embed">#beras</a> <a target="_blank" rel="noreferrer" title="♬ suara asli  - 𝐔𝐔𝐃.𝐃𝐂" href="https://www.tiktok.com/music/suara-asli-𝐔𝐔𝐃𝐃𝐂-7615224262387190535?refer=embed">♬ suara asli  - 𝐔𝐔𝐃.𝐃𝐂</a></section></blockquote>,
  <blockquote key="5" className="tiktok-embed" cite="https://www.tiktok.com/@toko.ateka.tehnik/video/7676327435587144978" data-video-id="7676327435587144978" style={{ maxWidth: '605px', minWidth: '325px', width: '100%' }} ><section><a target="_blank" rel="noreferrer" title="@toko.ateka.tehnik" href="https://www.tiktok.com/@toko.ateka.tehnik?refer=embed">@toko.ateka.tehnik</a> upgrade rice milling unit disini dijamin aman dan terpercaya boss😋🤙🏻🔥 <a title="penggilinganpadi" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/penggilinganpadi?refer=embed">#penggilinganpadi</a> <a title="gabahbalap🌾" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/gabahbalap%F0%9F%8C%BE?refer=embed">#gabahbalap🌾</a> <a title="beras" target="_blank" rel="noreferrer" href="https://www.tiktok.com/tag/beras?refer=embed">#beras</a> <a target="_blank" rel="noreferrer" title="♬ original sound  - elpe YETE" href="https://www.tiktok.com/music/original-sound-elpe-YETE-7669464838673812232?refer=embed">♬ original sound  - elpe YETE</a></section></blockquote>
];

// Clone 3 items at each edge for infinite loop (3 = max items per view on desktop)
const CLONE_COUNT = 3;
const loopEmbeds = [
  ...tikTokEmbeds.slice(-CLONE_COUNT),
  ...tikTokEmbeds,
  ...tikTokEmbeds.slice(0, CLONE_COUNT),
];

const TikTokCarousel = () => {
  const totalItems = tikTokEmbeds.length;
  const totalSlides = loopEmbeds.length;
  const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth >= 768 ? 3 : 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const existingScript = document.getElementById('tiktok-embed-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'tiktok-embed-script';
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      goNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, currentIndex]);

  const goNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    if (currentIndex >= CLONE_COUNT + totalItems) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - totalItems);
    } else if (currentIndex < CLONE_COUNT) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + totalItems);
    }
  };

  return (
    <div 
      className="mt-8 bg-white/80 backdrop-blur-2xl rounded-sm p-4 md:p-6 shadow-2xl shadow-emerald-900/5 ring-1 ring-emerald-100/50 relative z-20 group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Buttons */}
      <button 
        onClick={goPrev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-emerald-600 shadow-xl border border-emerald-100 p-2.5 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <button 
        onClick={goNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-emerald-600 shadow-xl border border-emerald-100 p-2.5 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
      </button>

      {/* Carousel Track */}
      <div 
        className="flex"
        style={{
          width: `${(totalSlides / itemsPerView) * 100}%`,
          transform: `translateX(-${(currentIndex / totalSlides) * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopEmbeds.map((embed, i) => (
          <div key={i} className="shrink-0 flex justify-center px-2 md:px-4" style={{ width: `${100 / totalSlides}%` }}>
            {embed}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TikTokCarousel;
