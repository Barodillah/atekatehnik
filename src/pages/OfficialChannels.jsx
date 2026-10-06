import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import TikTokCarousel from '../components/TikTokCarousel';

const OfficialChannels = () => {
  const { t } = useLanguage();
  usePageTitle(t('channels.badge') === 'Verifikasi Channel' ? 'Channel Resmi Ateka Tehnik' : 'Official Channels');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-2">
            <span className="material-symbols-outlined text-sm">verified</span>
            {t('channels.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-headline tracking-tight">
            {t('channels.title')}<span className="text-secondary">{t('channels.titleHighlight')}</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
            {t('channels.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Official Section */}
          <div className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-xl shadow-emerald-900/5 rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-emerald-100 pb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-sm flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald-900 tracking-tight">{t('channels.officialTitle')}</h2>
                  <p className="text-emerald-700 font-medium text-sm">{t('channels.officialSub')}</p>
                </div>
              </div>

              {/* Maps Official */}
              <div className="space-y-3">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  {t('channels.officialMapLabel')}
                </h3>
                <div className="w-full h-64 rounded-sm overflow-hidden shadow-md border-2 border-emerald-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.5504399209117!2d110.9740423!3d-7.514775699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1bcc306b1955%3A0xdde6bfbc97d7a0e8!2sCV.%20ATEKA%20TEHNIK!5e0!3m2!1sid!2sid!4v1774947093135!5m2!1sid!2sid"
                    className="w-full h-full border-0"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <a href="https://maps.app.goo.gl/sCfYncxzxEtxHjBb9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                  {t('channels.openMaps')} <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>

                {/* Lokasi Cabang / Sparepart (Link Saja) */}
                <div className="mt-2 p-4 bg-emerald-50/50 rounded-sm border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-sm">{t('channels.sparepartTitle')}</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">{t('channels.sparepartDesc')}</p>
                    </div>
                  </div>
                  <a href="https://maps.app.goo.gl/inXvTXJEXd4oF2is5" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold text-xs rounded-sm hover:bg-emerald-50 transition-colors shrink-0 w-full sm:w-auto shadow-sm">
                    {t('channels.openMaps')} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Verified Socials */}
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">public</span>
                  {t('channels.socialLabel')}
                </h3>
                <div className="flex flex-col gap-3">
                  <a href="https://www.instagram.com/toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">@toko.ateka.tehnik</span>
                  </a>
                  <a href="https://www.facebook.com/warsito.atktehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">Ateka Tehnik</span>
                  </a>
                  <a href="https://www.tiktok.com/@toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://atekatehnik.com/wp/uploads/asset_6abf70fa993fe1.48512687.png" alt="TikTok" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">@toko.ateka.tehnik</span>
                  </a>
                  <a href="https://shopee.co.id/sparepartricemillkaranganyar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://atekatehnik.com/wp/uploads/url_6abf716f9aaed5.45057497.png" alt="Shopee" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">Toko Ateka Tehnik</span>
                  </a>
                  <a href="https://www.tokopedia.com/toko-ateka-tehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://atekatehnik.com/wp/uploads/url_6abf7124b2c404.83625225.png" alt="Tokopedia" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">Toko Ateka Tehnik</span>
                  </a>
                  <a href="https://youtube.com/@atekatehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <svg className="w-8 h-8 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">@atekatehnik</span>
                  </a>
                </div>
              </div>

              {/* E-Katalog INAPROC */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Pemesanan Institusional (INAPROC)
                </h3>
                <div className="p-4 bg-white rounded-sm border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all">
                  <p className="text-sm text-gray-600 mb-4">
                    Pemesanan untuk pemerintahan / dinas dapat dilakukan secara transparan melalui E-Katalog LKPP karena kami adalah vendor resmi.
                  </p>
                  <a href="https://katalog.inaproc.id/ateka-tehnik" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D22B50] text-white font-bold text-sm rounded-sm hover:bg-[#D22B50]/90 transition-colors w-full sm:w-auto justify-center">
                    Kunjungi E-Katalog
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Unofficial Section */}
          <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 shadow-xl shadow-red-900/5 rounded-sm p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-red-100 pb-6">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-sm flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-red-600">gpp_bad</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 tracking-tight">{t('channels.fakeTitle')}</h2>
                  <p className="text-red-700 font-medium text-sm">{t('channels.fakeSub')}</p>
                </div>
              </div>

              {/* Maps Fake */}
              <div className="space-y-3">
                <h3 className="font-bold text-red-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  {t('channels.fakeMapLabel')}
                </h3>
                <div className="w-full h-64 rounded-sm overflow-hidden shadow-md border-2 border-red-200 grayscale-[40%]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.511742840282!2d106.54883767499815!3d-6.196007860700971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ff98558bc3b7%3A0x162e53f9f4a950c9!2sAteka%20tehnik!5e0!3m2!1sid!2sid!4v1774947175889!5m2!1sid!2sid"
                    className="w-full h-full border-0 pointer-events-none"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-sm w-fit">{t('channels.ignoreLocation')}</span>
                  <a href="https://maps.app.goo.gl/zJWx3yYU546QiFqTA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-800 transition-colors">
                    {t('channels.viewRef')} <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Fake Web */}
              <div className="space-y-3 pt-4 border-t border-red-50">
                <h3 className="font-bold text-red-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">language</span>
                  {t('channels.fakeWebLabel')}
                </h3>
                <div className="p-4 bg-white rounded-sm border-2 border-dashed border-red-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                    <div>
                      <p className="font-bold text-gray-800 line-through decoration-red-500 decoration-2">atekateknik.com</p>
                      <p className="text-xs text-red-600 font-medium tracking-wide">{t('channels.fakeWebNote')}</p>
                    </div>
                  </div>
                  <a href="https://atekateknik.com/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-sm transition-colors border border-red-100">
                    {t('channels.fakeWebVisit')}
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        <TikTokCarousel />

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-primary hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            {t('channels.backHome')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OfficialChannels;
