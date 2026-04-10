import React, { useState, useEffect } from 'react';
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

    const categories = [
        { value: '', label: t('products.catAll') || 'Semua Produk', icon: 'apps' },
        { value: 'Paket', label: t('products.catPaketLengkap') || 'Paket Lengkap', icon: 'settings_input_component' },
        { value: 'Unit Mesin Tunggal', label: t('products.catUnitMesin') || 'Unit Mesin Tunggal', icon: 'precision_manufacturing' },
        { value: 'Peralatan Pendukung', label: t('products.catPeralatan') || 'Peralatan Pendukung', icon: 'handyman' },
        { value: 'Suku Cadang', label: t('products.catSukuCadang') || 'Suku Cadang', icon: 'build' },
    ];

    const fetchProducts = async (kategori = '') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (kategori) params.set('kategori', kategori);
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

    useEffect(() => {
        fetchProducts(activeCategory);
    }, [activeCategory]);

    const handleCategoryChange = (value) => {
        if (value) {
            setSearchParams({ kategori: value });
        } else {
            setSearchParams({});
        }
        setActiveCategory(value);
    };

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
                    <p className="text-on-primary-container mt-6 max-w-xl text-lg leading-relaxed">
                        {t('products.heroSub')}
                    </p>
                </div>
            </header>

            {/* Category Selector */}
            <section className="bg-surface-container-low py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`px-8 py-3 rounded-sm font-headline font-bold flex items-center gap-2 transition-colors cursor-pointer ${activeCategory === cat.value
                                ? 'bg-primary-container text-white'
                                : 'bg-surface-container-highest text-primary-container hover:bg-secondary-fixed'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Product Grid */}
            <main className="py-24 px-8 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
                        <p className="text-sm text-on-surface-variant mt-3">{t('products.loading') || 'Memuat produk...'}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                        <p className="text-lg font-bold">{t('products.noProducts') || 'Belum ada produk.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {products.map((product) => (
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
                                        <h3 className="font-headline text-2xl font-extrabold text-primary-container mb-6">{product.nama}</h3>
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
                                        {product.shopee_link ? (
                                            <a
                                                href={product.shopee_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-[#ee4d2d] text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-[#d73f21] transition-colors text-center flex items-center justify-center gap-2 group"
                                            >
                                                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">shopping_bag</span>
                                                {t('products.buyOnShopee') || 'Beli di Shopee'}
                                            </a>
                                        ) : (
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
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Comparison Table */}
            {/* <section className="bg-surface-container-low py-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-headline text-4xl font-extrabold text-primary-container mb-12 text-center">{t('products.compareTitle')}</h2>
                    <div className="overflow-x-auto shadow-sm rounded-sm overflow-hidden">
                        <table className="w-full text-left bg-white border-collapse">
                            <thead>
                                <tr className="bg-primary-container text-white font-headline">
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thFeature')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thStandard')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thBusiness')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thPremium')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-body">
                                <tr className="bg-surface border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Pre-Cleaner Stage</td><td className="p-6">Single Screen</td><td className="p-6">Dual Screen Vibratory</td><td className="p-6">Full Magnetic Destoner</td></tr>
                                <tr className="bg-white border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Milling Recovery</td><td className="p-6">62% - 64%</td><td className="p-6">65% - 68%</td><td className="p-6">69% - 71%</td></tr>
                                <tr className="bg-surface border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Polishing Type</td><td className="p-6">Friction Polisher</td><td className="p-6">Single Mist Polisher</td><td className="p-6">Dual Silky Polisher</td></tr>
                                <tr className="bg-white border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Automation Level</td><td className="p-6">Manual Lever</td><td className="p-6">Semi-Auto PLC</td><td className="p-6">Full Digital Control Center</td></tr>
                                <tr className="bg-surface"><td className="p-6 font-semibold text-primary-container">Warranty Period</td><td className="p-6">12 Months</td><td className="p-6">24 Months</td><td className="p-6">36 Months + On-Site</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section> */}

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
