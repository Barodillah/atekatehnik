import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const MarketplaceButton = ({ product, size = 'small' }) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const shopee = product.shopee_link;
  const tokopedia = product.tokopedia_link;
  const tiktok = product.tiktokshop_link;

  const marketplaces = [];
  if (shopee) marketplaces.push({ name: 'Shopee', url: shopee, color: 'bg-[#ee4d2d]', hover: 'hover:bg-[#d73f21]', icon: 'shopping_bag' });
  if (tokopedia) marketplaces.push({ name: 'Tokopedia', url: tokopedia, color: 'bg-[#03AC0E]', hover: 'hover:bg-[#028c0b]', icon: 'shopping_cart' });
  if (tiktok) marketplaces.push({ name: 'TikTok Shop', url: tiktok, color: 'bg-black', hover: 'hover:bg-gray-800', icon: 'local_mall' });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (marketplaces.length === 0) return null;

  const btnClasses = size === 'large' 
    ? "px-8 py-4 font-headline font-extrabold text-lg flex items-center justify-center gap-3"
    : size === 'mini'
      ? "w-full py-1.5 md:py-2 font-headline font-bold text-[10px] md:text-xs tracking-tight flex items-center justify-center gap-1"
      : "w-full py-2 md:py-3 font-headline font-bold text-xs md:text-sm tracking-tight flex items-center justify-center gap-1 md:gap-2";

  const iconClasses = size === 'large' ? "text-[20px]" : size === 'mini' ? "text-[12px]" : "text-[14px] md:text-sm";

  if (marketplaces.length === 1) {
    const mp = marketplaces[0];
    return (
      <a
        href={mp.url}
        target="_blank"
        rel="noreferrer"
        className={`${mp.color} ${mp.hover} text-white transition-colors text-center group rounded-sm shadow-xl ${btnClasses}`}
      >
        <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${iconClasses}`}>{mp.icon}</span>
        {lang === 'id' ? `Beli di ${mp.name}` : `Buy on ${mp.name}`}
      </a>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-primary text-white hover:bg-primary/90 transition-colors text-center group rounded-sm shadow-xl ${btnClasses}`}
      >
        <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${iconClasses}`}>store</span>
        {lang === 'id' ? 'Beli di Marketplace' : 'Buy on Marketplace'}
        <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${iconClasses}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-full ${size === 'mini' ? 'min-w-full' : 'min-w-[200px]'} bg-white border border-outline-variant/30 shadow-xl z-50 flex flex-col overflow-hidden animate-fade-in-up rounded-sm`}>
          {marketplaces.map((mp, i) => (
            <a
              key={i}
              href={mp.url}
              target="_blank"
              rel="noreferrer"
              className={`${mp.color} ${mp.hover} text-white transition-colors group border-b border-white/10 last:border-0 ${size === 'mini' ? 'py-1.5 px-2 font-headline font-bold text-[10px] tracking-wide flex items-center justify-center gap-1' : 'py-2.5 px-3 font-headline font-bold text-xs tracking-wide flex items-center justify-center gap-2'}`}
            >
              <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${size === 'mini' ? 'text-[12px]' : 'text-[14px]'}`}>{mp.icon}</span>
              {mp.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceButton;
