import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const OfficialChannels = () => {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs tracking-widest uppercase mb-2">
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
          <div className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-xl shadow-emerald-900/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-emerald-100 pb-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
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
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md border-2 border-emerald-100">
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
              </div>

              {/* Verified Socials */}
              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">public</span>
                  {t('channels.socialLabel')}
                </h3>
                <div className="flex flex-col gap-3">
                  <a href="https://www.instagram.com/toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">@toko.ateka.tehnik</span>
                  </a>
                  <a href="https://www.facebook.com/atktehnik.gondang/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">Ateka Tehnik Gondang</span>
                  </a>
                  <a href="https://www.tiktok.com/@toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg" alt="TikTok" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">@toko.ateka.tehnik</span>
                  </a>
                  <a href="https://s.shopee.co.id/60NGq5Cp16" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all group">
                    <div className="w-8 h-8 bg-[#ee4d2d] rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" viewBox="0 0 192 192" fill="none"><path fill="currentColor" d="m29.004 157.064 5.987-.399-5.987.399ZM22 52v-6a6 6 0 0 0-5.987 6.4L22 52Zm140.996 105.064-5.987-.399 5.987.399ZM170 52l5.987.4A6 6 0 0 0 170 46v6ZM34.991 156.665 27.987 51.601l-11.974.798 7.005 105.064 11.973-.798Zm133.991.798 7.005-105.064-11.974-.798-7.004 105.064 11.973.798Zm-11.973-.798a10 10 0 0 1-9.978 9.335v12c11.582 0 21.181-8.98 21.951-20.537l-11.973-.798Zm-133.991.798C23.788 169.02 33.387 178 44.968 178v-12a10 10 0 0 1-9.977-9.335l-11.973.798ZM74 48c0-12.15 9.85-22 22-22V14c-18.778 0-34 15.222-34 34h12Zm22-22c12.15 0 22 9.85 22 22h12c0-18.778-15.222-34-34-34v12ZM22 58h148V46H22v12Zm22.969 120H147.03v-12H44.969v12Z"/></svg>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-emerald-700">Toko Ateka Tehnik</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Unofficial Section */}
          <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 shadow-xl shadow-red-900/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-red-100 pb-6">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
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
                <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md border-2 border-red-200 grayscale-[40%]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.511742840282!2d106.54883767499815!3d-6.196007860700971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ff98558bc3b7%3A0x162e53f9f4a950c9!2sAteka%20tehnik!5e0!3m2!1sid!2sid!4v1774947175889!5m2!1sid!2sid" 
                    className="w-full h-full border-0 pointer-events-none" 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-md w-fit">{t('channels.ignoreLocation')}</span>
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
                <div className="p-4 bg-white rounded-xl border-2 border-dashed border-red-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                    <div>
                      <p className="font-bold text-gray-800 line-through decoration-red-500 decoration-2">atekateknik.com</p>
                      <p className="text-xs text-red-600 font-medium tracking-wide">{t('channels.fakeWebNote')}</p>
                    </div>
                  </div>
                  <a href="https://atekateknik.com/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-colors border border-red-100">
                    {t('channels.fakeWebVisit')}
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

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
