import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import { parseMarkdown } from '../utils/markdownParser';
import { trackWaClick } from '../utils/trackWaClick';

const ProductDetail = () => {
    const { slug } = useParams();
    const { t, lang } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedPosts, setRelatedPosts] = useState([]);

    usePageTitle(product?.nama || null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                // Fetch product by slug
                const res = await fetch(`/api/products.php?slug=${slug}`);
                const data = await res.json();
                if (data.success && data.product) {
                    setProduct(data.product);
                } else {
                    setError('Product not found');
                }
            } catch (error) {
                setError('Failed to load product data');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchProduct();
    }, [slug]);

    // Track product view
    useEffect(() => {
        if (slug && !loading && !error && product) {
            fetch('/api/track_view.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page_type: 'product', slug }),
            }).catch(() => { });
        }
    }, [slug, loading, error, product]);

    useEffect(() => {
        if (product?.gambar) {
            const firstImg = product.gambar.split(',')[0].trim();
            if (!isVideo(firstImg)) {
                const img = new Image();
                img.src = firstImg;
            }
        }
    }, [product]);

    const isVideo = (url) => {
        if (!url) return false;
        const lower = url.toLowerCase();
        return lower.match(/\.(mp4|webm|ogg|mov)$/) || lower.includes('youtube.com') || lower.includes('youtu.be');
    };

    const renderMedia = (url, className, props = {}) => {
        if (!url) return null;
        if (isVideo(url)) {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                // Sangat sederhana untuk youtube iframe, tapi lebih aman gunakan link video langsung seperti mp4
                const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
                return <iframe src={`https://www.youtube.com/embed/${videoId}`} className={`${className} bg-black`} allowFullScreen {...props}></iframe>
            }
            return (
                <video src={url} className={className} controls preload="metadata" {...props}>
                    Your browser does not support the video tag.
                </video>
            );
        }
        return <img alt={product?.nama || "Product Media"} src={url} className={className} {...props} />;
    };

    const mediaItems = product?.gambar ? product.gambar.split(',').map(s => s.trim()).filter(s => s) : [];

    useEffect(() => {
        if (!product || !product.kategori) return;

        const fetchRelated = async () => {
            try {
                // First, fetch same-category products
                const res = await fetch(`/api/products.php?kategori=${encodeURIComponent(product.kategori)}&limit=4`);
                const data = await res.json();
                let items = [];
                if (data.success && data.products) {
                    items = data.products.filter(p => p.slug !== product.slug).slice(0, 3);
                }

                // If fewer than 3, backfill from other categories
                if (items.length < 3) {
                    const allRes = await fetch(`/api/products.php?limit=20`);
                    const allData = await allRes.json();
                    if (allData.success && allData.products) {
                        const existingSlugs = new Set([product.slug, ...items.map(p => p.slug)]);
                        const extras = allData.products
                            .filter(p => !existingSlugs.has(p.slug))
                            .slice(0, 3 - items.length);
                        items = [...items, ...extras];
                    }
                }

                setRelatedProducts(items);
            } catch (error) {
                console.error("Failed to fetch related products");
            }
        };
        fetchRelated();
    }, [product]);

    useEffect(() => {
        if (!product?.slug) return;
        const fetchRelatedPosts = async () => {
            try {
                // Fetch posts linked via post_product_relations
                const res = await fetch(`/api/post_relations.php?product_slug=${encodeURIComponent(product.slug)}&lang=${lang}`);
                const data = await res.json();
                const linkedItems = (data.success && data.posts) ? data.posts.filter(p => p.slug) : [];

                // Sort: Industrial Installations first, then others
                const sorted = linkedItems.sort((a, b) => {
                    const aIsIndustrial = a.category === 'Industrial Installations' ? 0 : 1;
                    const bIsIndustrial = b.category === 'Industrial Installations' ? 0 : 1;
                    return aIsIndustrial - bIsIndustrial;
                });

                let finalList = sorted.slice(0, 6);

                // Backfill with random articles if fewer than 6
                if (finalList.length < 6) {
                    const allRes = await fetch(`/api/posts.php?lang=${lang}&limit=20`);
                    const allData = await allRes.json();
                    if (allData.success && allData.posts) {
                        const usedSlugs = new Set(finalList.map(p => p.slug));
                        const available = allData.posts.filter(p => !usedSlugs.has(p.slug));
                        const shuffled = available.sort(() => 0.5 - Math.random());
                        finalList = [...finalList, ...shuffled.slice(0, 6 - finalList.length)];
                    }
                }

                setRelatedPosts(finalList);
            } catch (error) {
                console.error("Failed to fetch related posts", error);
            }
        };
        fetchRelatedPosts();
    }, [product, lang]);

    if (loading) {
        return (
            <main className="min-h-screen bg-surface pt-32 pb-16 flex justify-center items-center">
                <span className="material-symbols-outlined text-primary animate-spin text-5xl">progress_activity</span>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen bg-surface pt-32 pb-16 text-center">
                <h1 className="text-4xl font-headline font-bold text-primary mb-4">
                    {lang === 'id' ? 'Produk Tidak Ditemukan' : 'Product Not Found'}
                </h1>
                <p className="text-on-surface-variant font-body mb-8">
                    {error || (lang === 'id' ? 'Produk yang Anda cari tidak tersedia.' : 'The requested product could not be found.')}
                </p>
                <Link to="/products" className="bg-primary text-white font-headline px-8 py-3 rounded-sm font-bold shadow-md hover:bg-primary/90 transition-colors">
                    {lang === 'id' ? 'Kembali ke Produk' : 'Back to Products'}
                </Link>
            </main>
        );
    }

    const whatsappMessage = `Saya melihat dari website atekatehnik.com. Halo Ateka Tehnik, saya ingin konsultasi detail mengenai produk: ${product.nama}.`;

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = product?.nama || 'Ateka Tehnik Product';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <main className="min-h-screen pt-20 bg-surface relative z-0">
                {/* Hero Section */}
                <section className="pt-10 pb-10 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            {/* Back Link */}
                            <div className="mb-8">
                                <Link to="/products" className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors font-headline font-bold text-sm uppercase tracking-widest group">
                                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                    {lang === 'id' ? 'Kembali ke Produk' : 'Back to Products'}
                                </Link>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                                    {product.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package')
                                        : product.kategori === 'Unit Mesin Tunggal' ? (lang === 'id' ? 'Unit Mesin Tunggal' : 'Single Machine Unit')
                                            : product.kategori === 'Peralatan Pendukung' ? (lang === 'id' ? 'Peralatan Pendukung' : 'Supporting Equipment')
                                                : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
                                </span>
                            </div>
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary mb-6 tracking-tighter leading-[1.1]">
                                {product.nama}
                            </h1>
                            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                                {lang === 'id'
                                    ? 'Kami memliliki produk paket lengkap, peralatan pendukung, unit mesin tunggal, dan suku cadang untuk kebutuhan penggilingan padi Anda. Harap membaca deskripsi, detail spesifikasi dan menanyakan stok untuk suku cadang!'
                                    : 'We offer complete package products, supporting equipment, single machine units, and spare parts for your rice milling needs. Please read the description, specification details and ask for stock availability for spare parts!'}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href={`https://wa.me/62881080634612?text=${encodeURIComponent(whatsappMessage)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackWaClick('product-detail', product.nama)}
                                    className="bg-[#25D366] text-white px-8 py-4 rounded-sm font-headline font-extrabold text-lg transition-all flex items-center gap-3 shadow-xl shadow-[#25D366]/20 hover:bg-[#1da851] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.4)] hover:-translate-y-1 group"
                                >
                                    <svg className="w-5 h-5 fill-current group-hover:animate-bounce" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp icon</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    {t('products.inquire') || (lang === 'id' ? 'Tanyakan Sekarang' : 'Ask Now')}
                                </a>

                                <Link
                                    to="/contact"
                                    state={{
                                        message: lang === 'id'
                                            ? `Halo Ateka Tehnik, saya ingin melakukan permintaan khusus untuk produk: ${product.nama}.`
                                            : `Hello Ateka Tehnik, I would like to make a custom request for the product: ${product.nama}.`
                                    }}
                                    className="bg-surface-container-highest text-primary px-8 py-4 rounded-sm font-headline font-extrabold text-lg hover:bg-outline-variant transition-all"
                                >
                                    {lang === 'id' ? 'Permintaan Khusus' : 'Custom Request'}
                                </Link>

                                {product.shopee_link && (
                                    <a
                                        href={product.shopee_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#ee4d2d] text-white px-8 py-4 rounded-sm font-headline font-extrabold text-lg hover:bg-[#cf4023] transition-all flex items-center gap-3 shadow-xl"
                                    >
                                        <span className="material-symbols-outlined">shopping_bag</span>
                                        {t('products.buyOnShopee') || (lang === 'id' ? 'Beli di Shopee' : 'Buy on Shopee')}
                                    </a>
                                )}
                            </div>
                            <div className="mt-10 grid grid-cols-3 gap-6 pt-10 border-t border-outline-variant/20">
                                <div>
                                    <p className="text-secondary font-headline font-bold text-2xl">98%</p>
                                    <p className="text-outline text-xs uppercase tracking-widest font-bold">Milling Recovery</p>
                                </div>
                                <div>
                                    <p className="text-secondary font-headline font-bold text-2xl">20+</p>
                                    <p className="text-outline text-xs uppercase tracking-widest font-bold">Years Experience</p>
                                </div>
                                <div>
                                    <p className="text-secondary font-headline font-bold text-2xl">24/7</p>
                                    <p className="text-outline text-xs uppercase tracking-widest font-bold">Support Ready</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 bg-surface-container-lowest hover:bg-primary text-on-surface-variant hover:text-white p-3 md:p-4 rounded-full shadow-sm md:shadow-xl hover:shadow-[0_10px_20px_-5px_rgba(0,31,91,0.3)] transition-all duration-300 z-30 group border border-outline-variant/20 hover:border-primary"
                                title={lang === 'id' ? 'Bagikan produk ini' : 'Share this product'}
                            >
                                <span className="material-symbols-outlined text-[20px] md:text-[24px] block group-hover:scale-110 transition-transform">share</span>
                            </button>
                            <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-2 scale-105 hidden lg:block"></div>
                            <div className="relative bg-surface-container-lowest p-2 md:p-4 rounded-lg shadow-xl md:shadow-2xl cursor-pointer group" onClick={() => { setIsModalOpen(true); setCurrentMediaIndex(0); }}>
                                {mediaItems.length > 0 ? (
                                    <>
                                        {isVideo(mediaItems[0]) ? (
                                            <div className="w-full aspect-[4/3] rounded-sm overflow-hidden bg-black relative">
                                                {renderMedia(mediaItems[0], "w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700", { muted: true, autoPlay: true, loop: true, playsInline: true, controls: false })}
                                            </div>
                                        ) : (
                                            <img
                                                alt={product.nama}
                                                className="w-full aspect-[4/3] object-cover rounded-sm grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                                src={mediaItems[0]}
                                            />
                                        )}
                                        {mediaItems.length > 1 && (
                                            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md z-10 flex items-center gap-1 shadow-lg">
                                                <span className="material-symbols-outlined text-[14px]">photo_library</span>
                                                {mediaItems.length}
                                            </div>
                                        )}
                                        <div className="absolute inset-x-2 inset-y-2 md:inset-x-4 md:inset-y-4 bg-[#001f5b]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm rounded-sm z-20 pointer-events-none">
                                            <div className="text-white flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-5xl shadow-black/50 drop-shadow-lg">zoom_in</span>
                                                <span className="font-headline font-bold tracking-widest text-sm uppercase shadow-black/50 drop-shadow-md text-center">
                                                    {lang === 'id' ? 'Lihat Semua Media' : 'View All Media'}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-outline py-20 bg-surface-container-lowest rounded-sm">
                                        <span className="material-symbols-outlined text-7xl mb-4 opacity-50">inventory_2</span>
                                        <span className="font-headline font-bold text-outline-variant">{lang === 'id' ? 'Tidak ada gambar' : 'No image available'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Detailed Description */}
                <section className="py-10 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4">
                                <h2 className="font-headline text-3xl font-extrabold text-primary sticky top-28">Engineering Excellence</h2>
                            </div>
                            <div className="lg:col-span-8 space-y-8">
                                <p className="text-xl text-on-surface leading-relaxed font-medium">
                                    {(t('productDetail.engineeringIntro') || '').replace('{product}', product?.nama || 'produk')}
                                </p>
                                {product.description && (
                                    <div
                                        className="text-on-surface-variant leading-relaxed text-lg prose prose-lg break-words"
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(product.description) }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Specifications */}
                {product.spesifikasi && product.spesifikasi.length > 0 && (
                    <section className="py-10 px-6 bg-surface">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-16">
                                <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">{t('productGrid.specLabel') || (lang === 'id' ? 'Spesifikasi Teknis' : 'Technical Specifications')}</h2>
                                <div className="h-1 w-20 bg-secondary"></div>
                            </div>
                            <div className="bg-surface-container-lowest shadow-sm rounded-lg border border-outline-variant/10 overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/20">
                                    {(() => {
                                        const parsedSpecs = product.spesifikasi.map(spec => {
                                            const parts = spec.split(':');
                                            return {
                                                component: parts[0]?.trim() || 'Specification',
                                                spec: parts.length > 1 ? parts.slice(1).join(':').trim() : ''
                                            };
                                        });
                                        const mid = Math.ceil(parsedSpecs.length / 2);
                                        const col1 = parsedSpecs.slice(0, mid);
                                        const col2 = parsedSpecs.slice(mid);

                                        return (
                                            <>
                                                {/* Column 1 */}
                                                <div className="p-0">
                                                    <div className="hidden sm:flex justify-between items-center p-4 sm:p-6 bg-surface-container-low">
                                                        <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Component</span>
                                                        <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Specification</span>
                                                    </div>
                                                    {col1.map((item, idx) => (
                                                        <div key={idx} className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b border-outline-variant/10 ${idx % 2 === 1 ? 'bg-surface-container-low/50' : ''}`}>
                                                            <span className="font-medium text-primary text-sm sm:text-base">{item.component}</span>
                                                            <span className="font-bold sm:text-right text-secondary text-sm sm:text-base">{item.spec}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Column 2 */}
                                                {col2.length > 0 ? (
                                                    <div className="p-0">
                                                        <div className="hidden md:flex justify-between items-center p-4 sm:p-6 bg-surface-container-low">
                                                            <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Component</span>
                                                            <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Specification</span>
                                                        </div>
                                                        {col2.map((item, idx) => (
                                                            <div key={idx} className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4 border-b border-outline-variant/10 ${idx % 2 === 1 ? 'bg-surface-container-low/50' : ''}`}>
                                                                <span className="font-medium text-primary text-sm sm:text-base">{item.component}</span>
                                                                <span className="font-bold sm:text-right text-secondary text-sm sm:text-base">{item.spec}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-0 hidden md:block border-l-0"></div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="py-10 px-6 bg-surface-container-low">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-4">
                                <div>
                                    <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">{lang === 'id' ? 'Produk Terkait' : 'Related Products'}</h2>
                                    <p className="text-on-surface-variant">{lang === 'id' ? 'Mungkin tertarik dengan produk berikut.' : 'You may be interested in the following products.'}</p>
                                </div>
                                <Link className="text-secondary font-bold flex items-center gap-2 hover:underline" to="/products">
                                    {lang === 'id' ? 'Lihat Katalog Penuh' : 'View Full Catalog'} <span className="material-symbols-outlined">north_east</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedProducts.map(relProduct => (
                                    <Link to={`/product/${relProduct.slug}`} key={relProduct.slug || relProduct.id} className="group block bg-white border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,31,91,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative">
                                        <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-lowest">
                                            {relProduct.gambar ? (
                                                <img src={relProduct.gambar.split(',')[0].trim()} alt={relProduct.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-lowest text-outline">
                                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md text-white ${relProduct.kategori === 'Paket' ? 'bg-gradient-to-r from-[#904d00] to-[#b86200]'
                                                    : relProduct.kategori === 'Unit Mesin Tunggal' ? 'bg-gradient-to-r from-[#1a237e] to-[#3949ab]'
                                                        : relProduct.kategori === 'Peralatan Pendukung' ? 'bg-gradient-to-r from-[#1b5e20] to-[#2e7d32]'
                                                            : 'bg-gradient-to-r from-[#001f5b] to-[#003399]'
                                                    }`}>
                                                    {relProduct.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package')
                                                        : relProduct.kategori === 'Unit Mesin Tunggal' ? (lang === 'id' ? 'Unit Mesin Tunggal' : 'Single Machine Unit')
                                                            : relProduct.kategori === 'Peralatan Pendukung' ? (lang === 'id' ? 'Peralatan Pendukung' : 'Supporting Equipment')
                                                                : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#001f5b]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        <div className="p-6 relative z-20 bg-white">
                                            <h3 className="text-xl font-bold text-[#001f5b] mb-2 line-clamp-2 leading-tight">{relProduct.nama}</h3>
                                            <p className="text-[#4a5568] text-sm line-clamp-2 mb-6 leading-relaxed bg-white">{relProduct.description}</p>
                                            <span className="text-secondary font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-[#001f5b] transition-colors relative z-30 inline-block bg-white pr-2 pb-2">
                                                {lang === 'id' ? 'Lihat Detail' : 'View Details'} <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform relative top-0.5 inline-block">arrow_forward</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Engineering Insights (Related Posts) */}
                {relatedPosts.length > 0 && (
                    <section className="py-10 px-6 bg-surface">
                        <div className="max-w-7xl mx-auto">
                            <div className="max-w-3xl mb-10">
                                <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-primary mb-4">
                                    {lang === 'id' ? 'Artikel Terkait' : 'Related Articles'}
                                </h2>
                                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                                    {lang === 'id' ? 'Berbagai tips, studi kasus, dan inovasi teknologi dari tim engineering kami.' : 'Various tips, case studies, and technology innovations from our engineering team.'}
                                </p>
                            </div>
                            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                                {relatedPosts.map((rPost) => (
                                    <Link to={`/post/${rPost.slug}`} key={rPost.slug || rPost.id} className="group flex bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-md hover:border-secondary transition-all duration-300">
                                        <div className="w-[120px] sm:w-[180px] shrink-0 bg-surface-container overflow-hidden relative min-h-[120px] sm:min-h-[140px]">
                                            {rPost.cover_image ? (
                                                <img
                                                    alt={rPost.title}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    src={rPost.cover_image}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-outline">
                                                    <span className="material-symbols-outlined text-2xl">image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-5 flex flex-col flex-grow justify-center">
                                            <div className="flex justify-between items-center mb-2 gap-2">
                                                <span className="text-[10px] sm:text-xs text-on-surface-variant font-medium whitespace-nowrap">
                                                    {new Date(rPost.publish_date || rPost.created_at || Date.now()).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="bg-secondary-fixed text-on-secondary-fixed text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">
                                                    {rPost.category || 'Insights'}
                                                </span>
                                            </div>
                                            <h3 className="font-headline font-bold text-sm sm:text-base text-primary mb-1 sm:mb-2 line-clamp-2 group-hover:text-secondary transition-colors leading-tight">
                                                {rPost.title}
                                            </h3>
                                            <p className="text-[11px] sm:text-xs text-on-surface-variant font-medium line-clamp-2 mb-3">
                                                {rPost.subtitle || (lang === 'id' ? 'Baca lebih lanjut mengenai artikel ini.' : 'Read more about this article.')}
                                            </p>
                                            <div className="mt-auto flex items-center gap-1.5 text-[11px] sm:text-xs text-secondary font-bold group-hover:gap-2 transition-all">
                                                {lang === 'id' ? 'Lihat Selengkapnya' : 'Read More'}
                                                <span className="material-symbols-outlined text-[14px] sm:text-base">arrow_forward</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="flex justify-center mt-10">
                                <Link to="/news" className="px-10 py-3 border border-primary-container text-primary-container font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all duration-300 active:scale-95">
                                    {lang === 'id' ? 'Lihat Semua Berita' : 'View All News'}
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface p-8 rounded-md max-w-sm w-full shadow-2xl relative mx-4 animate-in zoom-in duration-300">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-bold text-primary mb-6">{lang === 'id' ? 'Bagikan produk ini' : 'Share this product'}</h3>
                        <div className="grid grid-cols-3 gap-6 gap-y-8 mb-8">
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-on-surface hover:text-[#25D366] transition-colors">
                                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full hover:bg-[#25D366]/10">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp icon</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-center">WhatsApp</span>
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-on-surface hover:text-[#1877F2] transition-colors">
                                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full hover:bg-[#1877F2]/10">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-center">Facebook</span>
                            </a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-on-surface hover:text-[#0f1419] transition-colors">
                                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full hover:bg-[#0f1419]/10">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-center">X / Twitter</span>
                            </a>
                            <a href={`fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-on-surface hover:text-[#00B2FF] transition-colors">
                                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full hover:bg-[#00B2FF]/10">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 16 4 C 9.410156 4 4 9.136719 4 15.5 C 4 18.890625 5.570313 21.902344 8 24 L 8 28.625 L 12.4375 26.40625 C 13.566406 26.746094 14.746094 27 16 27 C 22.589844 27 28 21.863281 28 15.5 C 28 9.136719 22.589844 4 16 4 Z M 16 6 C 21.558594 6 26 10.265625 26 15.5 C 26 20.734375 21.558594 25 16 25 C 14.804688 25 13.664063 24.773438 12.59375 24.40625 L 12.1875 24.28125 L 10 25.375 L 10 23.125 L 9.625 22.8125 C 7.40625 21.0625 6 18.441406 6 15.5 C 6 10.265625 10.441406 6 16 6 Z M 14.875 12.34375 L 8.84375 18.71875 L 14.25 15.71875 L 17.125 18.8125 L 23.09375 12.34375 L 17.8125 15.3125 Z" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-center">Messenger</span>
                            </a>
                            <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareTitle)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-on-surface hover:text-[#E60023] transition-colors">
                                <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full hover:bg-[#E60023]/10">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.605 0 12.017 0z" /></svg>
                                </div>
                                <span className="text-[10px] font-medium text-center">Pinterest</span>
                            </a>
                            <button onClick={copyToClipboard} className={`flex flex-col items-center space-y-2 transition-colors ${isCopied ? 'text-[#25D366]' : 'text-on-surface hover:text-primary'}`}>
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isCopied ? 'bg-[#25D366]/10' : 'bg-surface-container hover:bg-primary/10'}`}>
                                    <span className="material-symbols-outlined">{isCopied ? 'check' : 'link'}</span>
                                </div>
                                <span className="text-[10px] font-medium text-center">{isCopied ? (lang === 'id' ? 'Disalin!' : 'Copied!') : (lang === 'id' ? 'Salin Tautan' : 'Copy Link')}</span>
                            </button>
                        </div>
                        <div className="flex items-center bg-surface-container-low p-2 rounded-sm w-full border border-outline-variant/50">
                            <input type="text" value={shareUrl} readOnly className="bg-transparent border-none w-full text-sm text-on-surface-variant outline-none px-2 overflow-hidden text-ellipsis" />
                            <button onClick={copyToClipboard} className={`font-bold text-sm px-4 py-1 rounded-sm transition-colors whitespace-nowrap ${isCopied ? 'text-[#25D366] bg-[#25D366]/10' : 'text-primary hover:bg-primary/10'}`}>
                                {isCopied ? <span className="material-symbols-outlined text-sm align-middle block">check</span> : 'COPY'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Media Modal */}
            {isModalOpen && mediaItems.length > 0 && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsModalOpen(false)}>
                    <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white font-bold tracking-widest text-sm uppercase drop-shadow-md">
                            {currentMediaIndex + 1} / {mediaItems.length}
                        </div>
                        <button
                            className="text-white hover:text-primary transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                        >
                            <span className="material-symbols-outlined text-2xl sm:text-3xl block">close</span>
                        </button>
                    </div>
                    
                    <div className="w-full h-full sm:h-auto sm:max-w-5xl relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-full h-full sm:h-[80vh] flex overflow-x-auto snap-x snap-mandatory hide-scrollbar smooth-scroll" 
                             onScroll={(e) => {
                                 const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                                 setCurrentMediaIndex(index);
                             }}
                             tabIndex={0}
                        >
                            {mediaItems.map((item, index) => (
                                <div key={index} id={`media-slide-${index}`} className="flex-none w-full h-full snap-center flex items-center justify-center p-0 sm:p-4 opacity-100 transition-opacity">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {isVideo(item) ? (
                                            <div className="w-full h-full sm:max-w-5xl bg-black rounded-none sm:rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                                                {renderMedia(item, "w-full max-h-full object-contain")}
                                            </div>
                                        ) : (
                                            <img
                                                src={item}
                                                alt={`${product.nama} - ${index + 1}`}
                                                className="w-full h-full sm:max-h-full object-contain rounded-none sm:rounded-lg shadow-2xl bg-black/20"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {mediaItems.length > 1 && (
                            <>
                                <button 
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all hidden sm:block disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={currentMediaIndex === 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const el = document.getElementById(`media-slide-${currentMediaIndex - 1}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                                </button>
                                <button 
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all hidden sm:block disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={currentMediaIndex === mediaItems.length - 1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const el = document.getElementById(`media-slide-${currentMediaIndex + 1}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                                    }}
                                >
                                    <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
                                </button>
                            </>
                        )}
                    </div>

                    {mediaItems.length > 1 && (
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
                            {mediaItems.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentMediaIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/40'}`}></div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ProductDetail;
