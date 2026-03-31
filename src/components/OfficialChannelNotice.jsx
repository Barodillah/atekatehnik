import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const OfficialChannelNotice = () => {
  const { t } = useLanguage();
  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-red-50 via-white to-rose-50 border-y border-red-100">
      {/* Decorative blurry blobs floating behind */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 -right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-red-900/5 ring-1 ring-red-100/50 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between">

          {/* Main Warning Text Side */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-red-100 text-red-600 items-center justify-center shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-rose-600 tracking-tight">
                {t('notice.title')}
              </h2>
            </div>

            <div className="space-y-5 text-gray-700 leading-relaxed md:text-lg">
              <p>
                {t('notice.descPre')}<strong className="text-red-700 font-bold bg-white px-2 py-0.5 rounded-md border border-red-200 shadow-sm mx-1">{t('notice.fakeDomain')}</strong>{t('notice.descMid')}<strong className="text-red-600 font-extrabold underline underline-offset-4 decoration-red-300">{t('notice.notOfficial')}</strong>{t('notice.descPost')}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-red-50/80 to-transparent rounded-2xl p-4 md:p-5 border-l-4 border-l-red-500 overflow-hidden relative">
                <svg className="relative z-10 w-8 h-8 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div className="relative z-10">
                  <h4 className="font-bold text-red-950/80 text-sm md:text-base uppercase tracking-wider mb-1">{t('notice.locationLabel')}</h4>
                  <p className="text-base font-semibold text-red-800">
                    {t('notice.locationDesc')}<span className="text-red-900 border-b border-red-900/30 pb-0.5">{t('notice.locationCity')}</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Fake Channel & CTA Link Side */}
          <div className="w-full lg:w-[45%] shrink-0 flex flex-col gap-5">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-red-200/40 group w-full h-[220px] md:h-[260px] bg-red-950 cursor-pointer">
              {/* Fake Channel Background Images */}
              <div className="absolute inset-0 flex w-full h-full opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out">
                <div
                  className="w-1/2 h-full bg-cover bg-left md:bg-center border-r border-red-900/50"
                  style={{ backgroundImage: 'url("/notice/other_web.png")' }}
                />
                <div
                  className="w-1/2 h-full bg-cover bg-right md:bg-center border-l border-red-900/50"
                  style={{ backgroundImage: 'url("/notice/other_maps.png")' }}
                />
              </div>

              {/* Complex Premium Gradients Overlay - Fades out on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-950/95 via-rose-900/80 to-transparent group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/90 via-transparent to-red-950/90 group-hover:opacity-0 transition-opacity duration-500"></div>

              {/* Grid noise pattern - Fades out on hover */}
              <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] bg-[size:20px_20px] group-hover:opacity-0 transition-opacity duration-500"></div>

              {/* Warning Content Over Background - Fades out and translates down on hover */}
              <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-end group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500">
                <div className="inline-flex items-center gap-2 mb-3 bg-red-950/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-red-500/30 w-fit shadow-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span className="text-[10px] md:text-xs font-black text-red-50 uppercase tracking-widest">
                    {t('notice.fakeLabel')}
                  </span>
                </div>
                <p className="text-white text-sm md:text-base font-medium leading-relaxed drop-shadow-md">
                  {t('notice.fakeDesc')}<strong className="text-amber-400 font-bold px-1.5 py-0.5 bg-black/30 rounded inline-block mx-0.5">{t('notice.notOfficial')}</strong>{t('notice.fakeDescPost')}
                </p>
              </div>

              {/* Subtle hover label */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none delay-100">
                <span className="bg-black/70 backdrop-blur-sm text-red-50 px-4 py-2 flex items-center gap-2 rounded-full font-semibold text-sm shadow-2xl border border-white/10">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  {t('notice.hoverLabel')}
                </span>
              </div>
            </div>

            <Link
              to="/official-channels"
              className="inline-flex w-full items-center justify-between px-6 py-4 md:py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:via-red-600 hover:to-red-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-red-600/20 hover:shadow-red-600/40 group overflow-hidden relative"
            >
              <span className="relative z-10 text-base md:text-lg tracking-wide">{t('notice.ctaBtn')}</span>
              <div className="relative z-10 bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
              <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-white/20 skew-x-12 transform group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out"></div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OfficialChannelNotice;
