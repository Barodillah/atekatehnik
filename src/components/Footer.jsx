import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#001f5b] dark:bg-[#000c2e] w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="text-xl font-bold text-white font-headline">ATEKA TEHNIK</div>
          <p className="text-slate-400 text-sm leading-relaxed">{t('footer.desc')}</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-[#ffa454] font-['Inter'] text-sm tracking-wide uppercase font-bold">{t('footer.navigation')}</h5>
          <ul className="space-y-2">
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="/">{t('footer.home')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="/products">{t('footer.products')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="/portfolio">{t('footer.projects')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="https://katalog.inaproc.id/ateka-tehnik">E-Katalog INAPROC</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-[#ffa454] font-['Inter'] text-sm tracking-wide uppercase font-bold">{t('footer.quickLinks')}</h5>
          <ul className="space-y-2">
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="#">{t('footer.privacy')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="#">{t('footer.terms')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="#">{t('footer.serviceCenters')}</a></li>
            <li><a className="text-slate-400 hover:text-[#ffa454] text-sm hover:translate-x-1 transition-transform duration-200 inline-block" href="/contact">{t('footer.globalExport')}</a></li>
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
            <a href="https://www.instagram.com/toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ffa454] transition-colors" aria-label="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.facebook.com/atktehnik.gondang/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ffa454] transition-colors" aria-label="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@toko.ateka.tehnik" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ffa454] transition-colors" aria-label="TikTok">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a href="https://s.shopee.co.id/60NGq5Cp16" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#ffa454] transition-colors" aria-label="Shopee">
              <svg className="w-6 h-6" viewBox="0 0 192 192" fill="none" aria-hidden="true">
                <path fill="currentColor" d="m29.004 157.064 5.987-.399-5.987.399ZM22 52v-6a6 6 0 0 0-5.987 6.4L22 52Zm140.996 105.064-5.987-.399 5.987.399ZM170 52l5.987.4A6 6 0 0 0 170 46v6ZM34.991 156.665 27.987 51.601l-11.974.798 7.005 105.064 11.973-.798Zm133.991.798 7.005-105.064-11.974-.798-7.004 105.064 11.973.798Zm-11.973-.798a10 10 0 0 1-9.978 9.335v12c11.582 0 21.181-8.98 21.951-20.537l-11.973-.798Zm-133.991.798C23.788 169.02 33.387 178 44.968 178v-12a10 10 0 0 1-9.977-9.335l-11.973.798ZM74 48c0-12.15 9.85-22 22-22V14c-18.778 0-34 15.222-34 34h12Zm22-22c12.15 0 22 9.85 22 22h12c0-18.778-15.222-34-34-34v12ZM22 58h148V46H22v12Zm22.969 120H147.03v-12H44.969v12Z"/>
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="12" d="M114 84H88c-7.732 0-14 6.268-14 14v0c0 7.732 6.268 14 14 14h4m-2 0h14c7.732 0 14 6.268 14 14v0c0 7.732-6.268 14-14 14H78"/>
              </svg>
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
