import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

// ── Animated Gear SVG ───────────────────────────────────────────────
const AnimatedGear = ({ size = 80, delay = 0, reverse = false, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ animation: `errorGearSpin ${reverse ? '8s' : '6s'} linear infinite ${reverse ? 'reverse' : ''}`, animationDelay: `${delay}ms` }}
  >
    <path
      d="M50 10 L55 20 L65 15 L63 27 L75 27 L68 37 L80 42 L70 48 L78 58 L66 57 L68 68 L57 63 L55 75 L48 65 L40 72 L40 60 L28 63 L33 52 L20 50 L30 42 L22 33 L34 33 L30 22 L42 27 L45 15 L50 10Z"
      fill="currentColor"
      opacity="0.07"
    />
    <circle cx="50" cy="45" r="12" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.07" />
  </svg>
);

// ── Floating Particles ──────────────────────────────────────────────
const FloatingParticles = () => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-secondary/20"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `errorFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// ── Error Page Configurations ───────────────────────────────────────
const errorConfigs = {
  404: {
    icon: 'explore_off',
    titleId: 'Halaman Tidak Ditemukan',
    titleEn: 'Page Not Found',
    descId: 'Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. Mungkin URL yang Anda masukkan salah, atau halaman ini sudah tidak tersedia.',
    descEn: 'Sorry, the page you are looking for doesn\'t exist or has been moved. The URL might be incorrect, or this page is no longer available.',
    color: 'secondary',
    bgGradient: 'from-[#001f5b]/5 via-transparent to-[#904d00]/5',
  },
  403: {
    icon: 'lock',
    titleId: 'Akses Ditolak',
    titleEn: 'Access Denied',
    descId: 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan masuk dengan akun yang memiliki hak akses.',
    descEn: 'You do not have permission to access this page. Please sign in with an authorized account.',
    color: 'error',
    bgGradient: 'from-error/5 via-transparent to-[#001f5b]/5',
  },
  500: {
    icon: 'cloud_off',
    titleId: 'Kesalahan Server',
    titleEn: 'Server Error',
    descId: 'Terjadi kesalahan internal pada server kami. Tim teknis kami sedang menangani masalah ini. Silakan coba beberapa saat lagi.',
    descEn: 'An internal server error occurred. Our technical team is working on it. Please try again later.',
    color: 'error',
    bgGradient: 'from-error/5 via-transparent to-tertiary/5',
  },
  503: {
    icon: 'engineering',
    titleId: 'Sedang Maintenance',
    titleEn: 'Under Maintenance',
    descId: 'Kami sedang melakukan peningkatan sistem untuk memberikan layanan yang lebih baik. Silakan kembali beberapa saat lagi.',
    descEn: 'We are performing system upgrades to provide better service. Please come back shortly.',
    color: 'primary-container',
    bgGradient: 'from-[#001f5b]/5 via-transparent to-[#904d00]/5',
  },
};

// ── Main Error Page Component ───────────────────────────────────────
const ErrorPage = ({ code = 404 }) => {
  const { lang } = useLanguage();
  const location = useLocation();
  const [glitchActive, setGlitchActive] = useState(false);
  const config = errorConfigs[code] || errorConfigs[404];

  // Periodic glitch animation on error code
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const title = lang === 'id' ? config.titleId : config.titleEn;
  const desc = lang === 'id' ? config.descId : config.descEn;

  usePageTitle(title);

  return (
    <div className={`min-h-[80vh] pt-24 md:pt-32 pb-16 flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${config.bgGradient}`}>
      {/* Background Elements */}
      <FloatingParticles />

      {/* Large background gears */}
      <div className="absolute -left-10 -top-10 text-primary-container">
        <AnimatedGear size={200} />
      </div>
      <div className="absolute -right-10 -bottom-10 text-secondary">
        <AnimatedGear size={160} reverse delay={500} />
      </div>
      <div className="absolute right-1/4 top-10 text-outline-variant">
        <AnimatedGear size={80} delay={1000} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#000c2e 1px, transparent 1px), linear-gradient(90deg, #000c2e 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Error Code — Large with glitch effect */}
        <div className="relative mb-6">
          <span
            className={`text-[120px] sm:text-[160px] md:text-[200px] font-headline font-black tracking-tighter leading-none select-none
              ${code === 404 ? 'text-primary-container/10' : code === 403 ? 'text-error/10' : code === 500 ? 'text-error/10' : 'text-primary-container/10'}
              ${glitchActive ? 'error-glitch' : ''}
            `}
          >
            {code}
          </span>

          {/* Icon overlay centered on the number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-2xl
              ${code === 403 || code === 500 ? 'bg-error/10 text-error border border-error/20' : 'bg-primary-container/10 text-primary-container border border-primary-container/20'}
            `}>
              <span className="material-symbols-outlined text-5xl sm:text-6xl">{config.icon}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          {title}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg mx-auto mb-8">
          {desc}
        </p>

        {/* Attempted URL — only for 404 */}
        {code === 404 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full text-xs font-mono text-on-surface-variant/60 mb-8 max-w-full overflow-hidden">
            <span className="material-symbols-outlined text-[14px]">link_off</span>
            <span className="truncate">{location.pathname}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-container text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-lg hover:bg-secondary transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-surface-container-highest text-primary font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-surface-container-high transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            {lang === 'id' ? 'Permintaan Teknis' : 'Technical Inquiry'}
          </Link>
          <a
            href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik,com.%20Halo%20Ateka%20Tehnik%2C%20saya%20butuh%20bantuan."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-transparent text-on-surface-variant font-bold text-sm uppercase tracking-widest rounded-sm border border-outline-variant/30 hover:border-green-600 hover:text-green-600 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {lang === 'id' ? 'WhatsApp Kami' : 'Our WhatsApp'}
          </a>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-outline-variant/15">
          <p className="text-[10px] font-label font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 mb-4">
            {lang === 'id' ? 'Halaman Populer' : 'Popular Pages'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/products', label: lang === 'id' ? 'Produk' : 'Products', icon: 'factory' },
              { to: '/portfolio', label: lang === 'id' ? 'Portofolio' : 'Portfolio', icon: 'photo_library' },
              { to: '/about', label: lang === 'id' ? 'Tentang Kami' : 'About Us', icon: 'info' },
              { to: '/contact', label: lang === 'id' ? 'Kontak' : 'Contact', icon: 'mail' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high rounded-full transition-all duration-200 hover:text-primary-container group"
              >
                <span className="material-symbols-outlined text-[14px] opacity-60 group-hover:opacity-100">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Injected Styles ──────────────────────────────────────────── */}
      <style>{`
        @keyframes errorGearSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes errorFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.7; }
        }
        .error-glitch {
          animation: errorGlitch 0.2s steps(2) 1;
        }
        @keyframes errorGlitch {
          0% { transform: translate(0); filter: hue-rotate(0deg); }
          25% { transform: translate(-3px, 2px); filter: hue-rotate(90deg); }
          50% { transform: translate(3px, -2px); filter: hue-rotate(180deg); }
          75% { transform: translate(-2px, -1px); filter: hue-rotate(270deg); }
          100% { transform: translate(0); filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ── Named Exports for specific error codes ──────────────────────────
export const NotFound = () => <ErrorPage code={404} />;
export const Forbidden = () => <ErrorPage code={403} />;
export const ServerError = () => <ErrorPage code={500} />;
export const Maintenance = () => <ErrorPage code={503} />;

export default ErrorPage;
