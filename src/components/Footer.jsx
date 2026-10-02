import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#001f5b] dark:bg-[#000c2e] w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-xl font-bold text-white font-headline">
            <img src="/logo-white.png" alt="Ateka Tehnik Logo" className="h-8 md:h-10" />
            ATEKA TEHNIK
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{t('footer.desc')}</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-[#ffa454] font-['Inter'] text-sm tracking-wide uppercase font-bold">{t('footer.navigation')}</h5>
          <ul className="space-y-2">
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/">{t('footer.home')}</Link></li>
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/products">{t('footer.products')}</Link></li>
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/portfolio">{t('footer.projects')}</Link></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="https://katalog.inaproc.id/ateka-tehnik">E-Katalog INAPROC</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-[#ffa454] font-['Inter'] text-sm tracking-wide uppercase font-bold">{t('footer.quickLinks')}</h5>
          <ul className="space-y-2">
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/privacy-policy">{t('footer.privacy')}</Link></li>
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/terms-of-service">{t('footer.terms')}</Link></li>
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/faq">{t('footer.faq')}</Link></li>
            <li><Link className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" to="/edukasi">{t('footer.globalExport')}</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-[#ffa454] font-['Inter'] text-sm tracking-wide uppercase font-bold">{t('footer.contactOffice')}</h5>
          <p className="text-slate-400 text-sm leading-relaxed">
            Jl. Grompol - Jambangan, Gondang, Kedungjeruk, Kec. Mojogedang,<br />
            Kabupaten Karanganyar, Jawa Tengah<br />
            <a href="mailto:info@atekatehnik.com" className="text-slate-400 hover:text-[#ffa454] transition-colors">info@atekatehnik.com</a>
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Instagram</span>
            </a>
            <a href="https://www.facebook.com/warsito.atktehnik" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Facebook</span>
            </a>
            <a href="https://www.tiktok.com/@toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="TikTok">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">TikTok</span>
            </a>
            <a href="https://shopee.co.id/sparepartricemillkaranganyar" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="Shopee">
              <svg className="w-6 h-6" viewBox="0 0 192 192" fill="none" aria-hidden="true">
                <path fill="currentColor" d="m29.004 157.064 5.987-.399-5.987.399ZM22 52v-6a6 6 0 0 0-5.987 6.4L22 52Zm140.996 105.064-5.987-.399 5.987.399ZM170 52l5.987.4A6 6 0 0 0 170 46v6ZM34.991 156.665 27.987 51.601l-11.974.798 7.005 105.064 11.973-.798Zm133.991.798 7.005-105.064-11.974-.798-7.004 105.064 11.973.798Zm-11.973-.798a10 10 0 0 1-9.978 9.335v12c11.582 0 21.181-8.98 21.951-20.537l-11.973-.798Zm-133.991.798C23.788 169.02 33.387 178 44.968 178v-12a10 10 0 0 1-9.977-9.335l-11.973.798ZM74 48c0-12.15 9.85-22 22-22V14c-18.778 0-34 15.222-34 34h12Zm22-22c12.15 0 22 9.85 22 22h12c0-18.778-15.222-34-34-34v12ZM22 58h148V46H22v12Zm22.969 120H147.03v-12H44.969v12Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="12" d="M114 84H88c-7.732 0-14 6.268-14 14v0c0 7.732 6.268 14 14 14h4m-2 0h14c7.732 0 14 6.268 14 14v0c0 7.732-6.268 14-14 14H78" />
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Shopee</span>
            </a>
            <a href="https://www.tokopedia.com/toko-ateka-tehnik" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="Tokopedia">
              <svg className="w-6 h-6" viewBox="0 0 800 800" fill="currentColor" aria-hidden="true">
                <g strokeWidth="0">
                  <path d="M378.5 68.1c-52.7 8.1-96.3 40.6-118.4 88.1l-5.3 11.3-70.9-.3c-46.2-.2-72.1.1-74.6.7-6 1.6-11.8 6.5-14.7 12.3l-2.6 5.2v264c.1 212.3.3 264.8 1.4 267.7 2 5.7 6.4 10.6 11.9 13.4l5.1 2.5H313c135.1 0 205.4-.3 211-1 38-4.7 73.8-19.4 104.5-42.9 8.2-6.2 24.4-22 32-31.1 25-30 41.6-68.5 46.5-108 1.6-13.4 1.3-362.4-.4-367.1-2-5.8-6.4-10.7-12.1-13.4l-5.2-2.6-72.3.2-72.4.1-3.7-8.7c-7.5-17.5-18.4-33.1-32.9-47.5-20.6-20.4-44.9-33.8-74-40.7-8.9-2.1-13.5-2.5-30-2.8-10.7-.2-22.2 0-25.5.6m38.6 50.4c21.8 3.8 41.7 14.1 56.9 29.5 7.4 7.5 17.4 21.5 16.5 23-.3.5-1.9 1-3.5 1-4.9 0-30 4.9-41.5 8.1-11.7 3.3-26.5 8.7-38.1 13.7l-7.1 3.1-11.5-4.9c-21.9-9.2-40.7-14.7-62.7-18.1-19.1-3-18.1-2.2-12.8-10.1 13.1-19.6 30.2-33.1 51.5-40.8 16.1-5.8 35.4-7.5 52.3-4.5M277 219c46.9 3.3 69.5 8.7 103.4 24.8 11.1 5.2 12.7 5.7 19.1 5.7s8-.5 18.4-5.3c48.2-22.7 80.9-27.2 197.4-27.2H658l-.3 164.2-.3 164.3-2.2 10c-6.7 29.2-18.5 53.1-36.7 73.9-20.6 23.5-49.1 41.1-78.7 48.7-19.6 5-15.4 4.9-213 4.9H142V216.7l60.3.6c33.1.3 66.7 1.1 74.7 1.7" />
                  <path d="M263.5 276.5c-53.6 9.4-94.5 50.2-103.6 103.4-1.9 11-1.4 33.1 1 44.8 4.8 23.1 15.5 43.9 31.3 60.8 24.3 26 58.7 40.4 94 39.4l10.8-.4 44.2 44.1c29.8 29.6 45.6 44.7 48.3 45.9 2.5 1.2 6.3 1.9 10 1.9 11.5-.1 11.6-.1 59.7-48.1l43.7-43.6 11.3.2c48.1 1 93-26.3 114.3-69.4 9.3-18.7 12.8-34.2 12.8-56-.1-32.4-11.6-61.6-33.5-85-23.5-25.2-56.7-39.6-91-39.5-48.1.1-92.2 27.8-112.9 70.8l-4 8.3-4-8.3c-17-35.1-48.6-60-87.1-68.4-10-2.2-35-2.7-45.3-.9m39.3 51.5c32.6 9.1 55.2 38.5 55.2 71.5 0 46.6-42.3 82.6-87.1 74.1-31.3-5.9-55.1-29-61-59.1-1.5-7.5-1.2-23.5.6-31.2 2.1-9 9.2-23.3 15.2-30.8 11.3-13.9 27.3-23.1 46.1-26.5 7.1-1.3 22.8-.3 31 2m227-1.5c30.5 5.8 54.4 29.3 60.3 59 1.5 7.5 1.2 23.5-.6 31.2-2.1 9-9.2 23.3-15.2 30.8-9.4 11.6-22.9 20.4-37.8 24.7-11.1 3.1-27.8 3.1-38.8 0-60.1-17.1-75.4-92.2-26.8-131.2 16.3-13.1 38-18.4 58.9-14.5m-113.6 148c7 9.3 18.7 20.9 27.1 26.9l6.9 4.9-25.1 25.1-25.1 25.1-25.1-25.1-25.1-25.1 7.8-5.8c15.7-11.5 30.5-29.4 38.9-47l3.5-7.5 5.5 10.7c3 6 7.9 13.9 10.7 17.8" />
                  <path d="M270.6 369.4c-8.2 3.5-12.8 7.8-17.4 16.1-2.3 4.4-2.7 6.1-2.7 14 0 7.6.4 9.8 2.6 14.5 3.1 6.5 9.6 13.2 15.9 16.3 6.6 3.2 18.6 3.6 26.2.7 7.5-2.8 15-9.6 18.5-16.8 3.9-8 4-19.1.1-27.3-3.4-7.4-8.9-13.4-15.2-16.7-7.6-3.8-19.9-4.2-28-.8m233.7-.3c-7.1 2.7-14.6 9.7-18 16.7-3.9 8-4 19.1-.1 27.3 3.3 7.3 8.9 13.4 15.2 16.7 4.5 2.3 6.3 2.7 14.6 2.7 8.2 0 10.3-.4 15-2.6 6.6-3.2 12.3-8.6 15.8-15.4 2.3-4.3 2.7-6.2 2.7-14 0-7.6-.4-9.8-2.6-14.5-3.1-6.5-9.6-13.2-15.9-16.3-6.5-3.1-19.5-3.5-26.7-.6" />
                </g>
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Tokopedia</span>
            </a>
            <a href="https://youtube.com/@atekatehnik" target="_blank" rel="noopener noreferrer" className="relative group text-white hover:text-[#ffa454] transition-colors" aria-label="YouTube">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
              </svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">YouTube</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 text-xs font-['Inter'] tracking-wide uppercase">{t('footer.copyright')}</p>
        <div className="flex gap-8">
          <span className="text-white text-xs font-bold uppercase tracking-widest">{t('footer.premiumQuality')}</span>
          <span className="text-white text-xs font-bold uppercase tracking-widest">ISO 9001 Certified</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
