import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const SearchResults = () => {
  const { lang } = useLanguage();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  usePageTitle(query ? `${lang === 'id' ? 'Pencarian' : 'Search'}: ${query}` : (lang === 'id' ? 'Hasil Pencarian' : 'Search Results'));

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search.php?q=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <main className="min-h-[85vh] bg-surface pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="mb-12 border-b border-outline-variant/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-[#001f5b] dark:text-white tracking-tight mb-4">
            {lang === 'id' ? 'Hasil Pencarian' : 'Search Results'}
          </h1>
          <p className="text-lg text-outline dark:text-slate-400 font-body">
            {lang === 'id' ? `Menampilkan hasil untuk: ` : `Showing results for: `}
            <span className="font-bold text-[#904d00] dark:text-[#ffb776]">"{query}"</span>
          </p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
            <p className="text-sm text-on-surface-variant mt-3">{lang === 'id' ? 'Mencari...' : 'Searching...'}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <Link 
                to={item.link} 
                key={item.id} 
                className="group bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 hover:border-[#904d00] shadow-sm hover:shadow-xl transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full text-left"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-surface-container-highest">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-5xl">{item.type === 'product' ? 'inventory_2' : 'article'}</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#904d00] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                      {item.badge}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#001f5b]/10 dark:bg-white/10 text-[#001f5b] dark:text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">
                      {item.type === 'product' ? (lang === 'id' ? 'Produk' : 'Product') : (lang === 'id' ? 'Postingan' : 'Post')}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-[#001f5b] dark:text-white group-hover:text-[#904d00] transition-colors mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="text-xs font-label text-outline dark:text-slate-400 font-medium mb-4 line-clamp-2">
                      {item.desc}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                    <span className="text-sm font-label font-bold text-[#904d00] dark:text-[#ffb776] flex items-center gap-1 group-hover:gap-2 transition-all">
                      {lang === 'id' ? 'Lihat Detail' : 'View Detail'}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20 rounded-xl p-16 text-center shadow-lg">
            <span className="material-symbols-outlined text-7xl text-outline-variant/50 mb-6">search_off</span>
            <h2 className="text-3xl font-headline font-extrabold text-[#001f5b] dark:text-white mb-4">
              {lang === 'id' ? 'Tidak Ada Hasil' : 'No Results Found'}
            </h2>
            <p className="text-outline dark:text-slate-400 max-w-md mx-auto text-lg">
              {lang === 'id' 
                ? 'Kami tidak dapat menemukan produk atau postingan yang cocok dengan pencarian Anda. Coba gunakan kata kunci lain.' 
                : 'We couldn\'t find any products or posts matching your search. Try using different keywords.'}
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-10 bg-[#001f5b] text-white px-8 py-4 font-bold rounded-sm hover:bg-[#904d00] transition-colors shadow-md hover:shadow-lg">
              <span className="material-symbols-outlined">home</span>
              <span>{lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchResults;
