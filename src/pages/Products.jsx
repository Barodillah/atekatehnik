import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import { trackWaClick } from '../utils/trackWaClick';

const Products = () => {
    const { t, lang } = useLanguage();
    usePageTitle(lang === 'id' ? 'Produk Kami' : 'Our Products');
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(searchParams.get('kategori') || '');
    const [isLoading, setIsLoading] = useState(true);
    
    // Live Search and Infinite Scroll States
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [loadCount, setLoadCount] = useState(15);
    const observerTarget = useRef(null);

    const categories = [
        { value: '', label: t('products.catAll') || 'Semua Produk', icon: 'apps' },
        { value: 'Paket', label: t('products.catPaketLengkap') || 'Paket Lengkap', icon: 'settings_input_component' },
        { value: 'Unit Mesin Tunggal', label: t('products.catUnitMesin') || 'Unit Mesin Tunggal', icon: 'precision_manufacturing' },
        { value: 'Peralatan Pendukung', label: t('products.catPeralatan') || 'Peralatan Pendukung', icon: 'handyman' },
        { value: 'Suku Cadang', label: t('products.catSukuCadang') || 'Suku Cadang', icon: 'build' },
    ];

    const categoryOrder = {
        'Paket': 1,
        'Unit Mesin Tunggal': 2,
        'Peralatan Pendukung': 3,
        'Suku Cadang': 4
    };

    const fetchProducts = async (kategori = '', search = '') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: '1000' });
            if (kategori) params.set('kategori', kategori);
            if (search.length >= 3) params.set('search', search);
            const res = await fetch(`/api/products.php?${params}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch {
            // silent fail on public page
        } finally {
            setIsLoading(false);
        }
    };

    // Keep activeCategory synced with URL params when accessed via external links
    useEffect(() => {
        const urlKategori = searchParams.get('kategori') || '';
        setActiveCategory(urlKategori);
    }, [searchParams]);

    // Fetch products whenever activeCategory or searchQuery changes (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 3) {
                fetchProducts('', searchQuery);
            } else {
                fetchProducts(activeCategory);
            }
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [activeCategory, searchQuery]);

    const handleCategoryChange = (value) => {
        if (value) {
            setSearchParams({ kategori: value });
        } else {
            setSearchParams({});
        }
        setActiveCategory(value);
    };

    // Reset load count when category or search changes
    useEffect(() => {
        setLoadCount(15);
    }, [activeCategory, searchQuery]);

    // Compute displayed products
    const displayedProducts = useMemo(() => {
        let filtered = products;

        // Apply client-side filter for short queries (< 3 chars)
        if (searchQuery.trim() !== '' && searchQuery.length < 3) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.nama.toLowerCase().includes(lowerQuery));
        }

        // Apply custom sort for "Semua Produk"
        if (activeCategory === '') {
            filtered = [...filtered].sort((a, b) => {
                const orderA = categoryOrder[a.kategori] || 99;
                const orderB = categoryOrder[b.kategori] || 99;
                return orderA - orderB;
            });
        }

        // Apply chunk limit (Infinite scroll)
        return filtered.slice(0, loadCount);
    }, [products, searchQuery, activeCategory, loadCount]);

    // Infinite scroll trigger
    const loadMoreProducts = useCallback(() => {
        setLoadCount(prev => prev + 15);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading) {
                    loadMoreProducts();
                }
            },
            { threshold: 0.1 }
        );

        const target = observerTarget.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [loadMoreProducts, isLoading]);

    return (
        <>
            {/* Hero Section */}
            <header className="pt-32 pb-24 px-8 bg-[linear-gradient(135deg,#000c2e_0%,#001f5b_100%)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img alt="Industrial Blueprint" className="w-full h-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuACevkjZk7yZIAwmZmumfgz06AAVsuXDrxGuG59nLxjRQ_01VP3iFbBmnDSfzheoc0Khkjx6RcfLuiX80ad8QTDEhgZAkv7ucKvGmtHrQBIb_6zPaoFI4pfgDvlh4A3GQ1gp8yuztfn8Oos0sCdC5U9K7GT4pLqbEvL63TNgbiH7jw7BmptTiUL7KeiQczx3qYO9gB_d3CP1Z83FpXYO2aA7am5FSFuGVmIjbAMn6I7dLKzXrCI_lbKUrDOlDZ0cltTyJd5Vl9eXP0" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-secondary-container font-label text-sm uppercase tracking-[0.2em] mb-4 block">{t('products.badge')}</span>
                    <h1 className="text-white font-headline text-5xl md:text-7xl font-extrabold tracking-tighter max-w-3xl leading-[1.1]">
                        {t('products.heroTitle')}
                    </h1>
                    <p className="text-on-primary-container mt-6 max-w-xl text-lg leading-relaxed mb-8">
                        {t('products.heroSub')}
                    </p>
                    <a href="https://katalog.inaproc.id/ateka-tehnik" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#D22B50] text-white px-6 py-3 font-headline font-bold text-sm tracking-widest uppercase hover:bg-[#D22B50]/90 transition-colors rounded-sm">
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                        E-Katalog INAPROC
                    </a>
                </div>
            </header>

            {/* Category Selector & Live Search */}
            <section className="bg-surface-container-low py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {isSearchActive ? (
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                            <input
                                type="text"
                                autoFocus
                                placeholder={lang === 'id' ? 'Cari semua produk...' : 'Search all products...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-outline-variant/30 rounded-sm py-4 pl-12 pr-12 font-headline text-lg focus:outline-none focus:border-primary-container transition-colors shadow-sm"
                            />
                            <button 
                                onClick={() => {
                                    setIsSearchActive(false);
                                    setSearchQuery('');
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-row overflow-x-auto whitespace-nowrap snap-x hide-scrollbar gap-4 pb-2">
                            {/* Search Toggle Button */}
                            <button
                                onClick={() => {
                                    setIsSearchActive(true);
                                    handleCategoryChange(''); // Automatically switch to "Semua Produk" when searching
                                }}
                                className="shrink-0 px-6 py-3 rounded-sm font-headline font-bold flex items-center gap-2 transition-colors cursor-pointer bg-surface-container-highest text-primary-container hover:bg-secondary-fixed shadow-sm"
                            >
                                <span className="material-symbols-outlined text-xl">search</span>
                            </button>

                            {/* Category Buttons */}
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(cat.value)}
                                    className={`shrink-0 px-8 py-3 rounded-sm font-headline font-bold flex items-center gap-2 transition-colors cursor-pointer snap-start ${activeCategory === cat.value
                                        ? 'bg-primary-container text-white shadow-md'
                                        : 'bg-surface-container-highest text-primary-container hover:bg-secondary-fixed shadow-sm'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Product Grid */}
            <main className="py-24 px-8 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
                        <p className="text-sm text-on-surface-variant mt-3">{t('products.loading') || 'Memuat produk...'}</p>
                    </div>
                ) : displayedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                        <p className="text-lg font-bold">{t('products.noProducts') || 'Belum ada produk atau hasil pencarian tidak ditemukan.'}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {displayedProducts.map((product) => (
                                <div key={product.id} className="bg-surface-container-lowest group flex flex-col">
                                    <div className="relative h-80 overflow-hidden">
                                        {product.gambar ? (
                                            <img
                                                alt={product.nama}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                src={product.gambar.split(',')[0].trim()}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                                                <span className="material-symbols-outlined text-6xl text-outline">image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm ${product.kategori === 'Paket'
                                                ? 'bg-secondary-fixed text-on-secondary-fixed'
                                                : product.kategori === 'Unit Mesin Tunggal'
                                                    ? 'bg-primary-container text-white'
                                                    : product.kategori === 'Peralatan Pendukung'
                                                        ? 'bg-[#2e7d32] text-white'
                                                        : 'bg-primary text-white'
                                                }`}>
                                                {product.kategori === 'Paket' ? (t('products.catPaketLengkap') || 'Paket Lengkap')
                                                    : product.kategori === 'Unit Mesin Tunggal' ? (t('products.catUnitMesin') || 'Unit Mesin Tunggal')
                                                        : product.kategori === 'Peralatan Pendukung' ? (t('products.catPeralatan') || 'Peralatan Pendukung')
                                                            : product.kategori}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col">
                                        <Link to={`/product/${product.slug || product.id}`} className="hover:opacity-80 transition-opacity">
                                            <h3 className="font-headline text-2xl font-extrabold text-primary-container mb-6" title={product.nama}>
                                                {product.nama.length > 50 ? `${product.nama.substring(0, 50)}...` : product.nama}
                                            </h3>
                                        </Link>
                                        {product.spesifikasi && product.spesifikasi.length > 0 && (
                                            <div className="space-y-4 mb-8 flex-1">
                                                {product.spesifikasi.slice(0, 2).map((spec, i) => (
                                                    <div key={i} className="flex items-center gap-2 py-2 border-b border-outline-variant/20">
                                                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                                                        <span className="text-primary-container font-medium text-sm">{spec}</span>
                                                    </div>
                                                ))}
                                                {product.spesifikasi.length > 2 && (
                                                    <div className="text-xs text-outline font-medium pt-1">
                                                        +{product.spesifikasi.length - 2} {lang === 'id' ? 'spesifikasi lainnya' : 'other specifications'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-3 mt-auto">
                                            <Link
                                                to={`/product/${product.slug || product.id}`}
                                                className="bg-surface-container-high text-primary-container py-3 font-headline font-bold text-sm tracking-tight hover:bg-surface-container-highest transition-colors text-center border border-outline-variant/20"
                                            >
                                                {lang === 'id' ? 'Lihat Detail' : 'View Detail'}
                                            </Link>
                                            {product.shopee_link && (
                                                <a
                                                    href={product.shopee_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-[#ee4d2d] text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-[#d73f21] transition-colors text-center flex items-center justify-center gap-2 group"
                                                >
                                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">shopping_bag</span>
                                                    {t('products.buyOnShopee') || 'Beli di Shopee'}
                                                </a>
                                            )}
                                            <a
                                                href={`https://wa.me/62881080634612?text=${encodeURIComponent(`Saya melihat dari website atekatehnik.com. Halo, saya tertarik dengan produk: ${product.nama}. Bisa info lebih lanjut?`)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={() => trackWaClick('products-list', product.nama)}
                                                className="bg-[#25D366] text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-[#1da851] transition-colors text-center flex items-center justify-center gap-2 group"
                                            >
                                                <svg className="w-4 h-4 fill-current group-hover:animate-bounce" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp icon</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                {t('products.inquire')}
                                            </a>
                                            {product.inaproc_link && (
                                                <a
                                                    href={product.inaproc_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="bg-[#D22B50] text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-[#b02241] transition-colors text-center flex items-center justify-center gap-2 group"
                                                >
                                                    <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">storefront</span>
                                                    {lang === 'id' ? 'Kunjungi INAPROC' : 'Visit INAPROC'}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Observer Target */}
                        <div ref={observerTarget} className="h-10 w-full mt-8"></div>
                    </>
                )}
            </main>

            {/* Support Bento Grid */}
            <section className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
                    <div className="md:col-span-2 md:row-span-2 bg-primary-container p-12 flex flex-col justify-end relative overflow-hidden group">
                        <img alt="Spare Parts" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2csb2bBc5wmPyeG-HeD-gTXq8JaQMqx_CEuBWfeRZiqj3nQItX4XE2AL4K-TFKTdTjUgCGnO_aia2qj4Xr-4tWxHQjeg_oQMGq1mj3Om3hmEcrcRoZElJgiAtJMBDt13YZsyvZFxhNmhLNnhSVfVFLZiy5P7SznBwTRfAgQS9LHVnbJ8xz7vO3GAG_KYqfJnlw2NBRiDIaQxTA9r0pP5P7YxnJ9OJu6GhYAjXoL7lbqjBkUsgL1BHo67lMjyviKrrxB4vn8-Wq94" />
                        <div className="relative z-10">
                            <h3 className="text-white font-headline text-3xl font-extrabold mb-4">{t('products.spareParts')}</h3>
                            <p className="text-on-primary-container mb-6 max-w-sm">{t('products.spareDesc')}</p>
                            <a href="https://s.shopee.co.id/60NGq5Cp16" target="_blank" rel="noreferrer" className="bg-secondary-container text-on-secondary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-xs inline-block">{t('products.visitOfficialStore')}</a>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-surface-container-high p-8 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-4">support_agent</span>
                        <h4 className="font-headline text-xl font-bold text-primary-container mb-2">{t('products.support247')}</h4>
                        <p className="text-on-surface-variant text-sm">{t('products.supportDesc')}</p>
                    </div>
                    <div className="md:col-span-1 bg-white p-8 border border-outline-variant/20 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-4">verified</span>
                        <h4 className="font-headline text-lg font-bold text-primary-container mb-2">{t('products.isoCertified')}</h4>
                        <p className="text-on-surface-variant text-xs">{t('products.isoDesc')}</p>
                    </div>
                    <div className="md:col-span-1 bg-secondary-fixed p-8 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-on-secondary-fixed text-4xl mb-4">language</span>
                        <h4 className="font-headline text-lg font-bold text-on-secondary-fixed mb-2">{t('products.globalExport')}</h4>
                        <p className="text-on-secondary-fixed-variant text-xs">{t('products.globalDesc')}</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;
