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
            <span className="material-symbols-outlined text-white cursor-pointer hover:text-secondary-container">language</span>
            <span className="material-symbols-outlined text-white cursor-pointer hover:text-secondary-container">mail</span>
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
