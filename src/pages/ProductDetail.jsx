import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProductDetail = () => {
    const { slug } = useParams();
    const { t, lang } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageRatio, setImageRatio] = useState('vertical');
    const [relatedProducts, setRelatedProducts] = useState([]);

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
            } catch (err) {
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
            }).catch(() => {});
        }
    }, [slug, loading, error, product]);

    useEffect(() => {
        if (product?.gambar) {
            const img = new Image();
            img.src = product.gambar;
            img.onload = () => {
                setImageRatio(img.width > img.height ? 'horizontal' : 'vertical');
            };
        }
    }, [product]);

    // Fetch related products after product details are loaded
    useEffect(() => {
        if (!product || !product.kategori) return;

        const fetchRelated = async () => {
            try {
                const res = await fetch(`/api/products.php?kategori=${encodeURIComponent(product.kategori)}&limit=4`);
                const data = await res.json();
                if (data.success && data.products) {
                    const filtered = data.products.filter(p => p.slug !== product.slug).slice(0, 3);
                    setRelatedProducts(filtered);
                }
            } catch (err) {
                console.error("Failed to fetch related products");
            }
        };
        fetchRelated();
    }, [product]);

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

    const whatsappMessage = `Halo Ateka Tehnik, saya ingin konsultasi detail mengenai produk: ${product.nama}.`;

    const ActionButtons = () => (
        <div className={`mt-auto flex flex-col sm:flex-row gap-4 pt-6 flex-wrap ${imageRatio === 'horizontal' ? 'border-t border-outline-variant/10 mt-6' : ''}`}>
            {product.shopee_link && (
                <a
                    href={product.shopee_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[200px] bg-white border-2 border-[#ee4d2d] text-[#ee4d2d] px-6 py-4 rounded-xl font-headline font-bold text-sm tracking-widest uppercase hover:bg-[#ee4d2d] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg text-center group"
                >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
                    {t('products.buyOnShopee') || (lang === 'id' ? 'Beli di Shopee' : 'Buy on Shopee')}
                </a>
            )}

            {product.kategori === 'Paket' && (
                <Link
                    to="/contact"
                    className="flex-1 min-w-[200px] bg-white border-2 border-[#904d00] text-[#904d00] px-6 py-4 rounded-xl font-headline font-bold text-sm tracking-widest uppercase hover:bg-[#904d00] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-lg text-center group"
                >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">edit_document</span>
                    {lang === 'id' ? 'Permintaan Khusus' : 'Custom Request'}
                </Link>
            )}

            <a
                href={`https://wa.me/6288108063461?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] bg-[#25D366] text-white px-6 py-4 rounded-xl font-headline font-extrabold text-sm tracking-widest uppercase hover:bg-[#1da851] hover:shadow-[0_15px_30px_-5px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-center group"
            >
                <svg className="w-5 h-5 fill-current group-hover:animate-bounce" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>WhatsApp icon</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                {t('products.inquire') || (lang === 'id' ? 'Tanyakan Sekarang' : 'Ask Now')}
            </a>
        </div>
    );

    return (
        <>
        <main className="min-h-screen pt-32 pb-24 bg-surface relative z-0">
            <div className="absolute top-0 left-0 right-0 h-[45vh] lg:h-[55vh] bg-[linear-gradient(135deg,#000c2e_0%,#001f5b_100%)] -z-10 overflow-hidden">
                {product && product.gambar && (
                    <img
                        src={product.gambar}
                        alt="Product Background"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay scale-110 blur-[2px]"
                    />
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Back Link */}
                <Link to="/products" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-headline font-bold text-sm uppercase tracking-widest mb-10 group">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    {lang === 'id' ? 'Kembali ke Produk' : 'Back to Products'}
                </Link>

                <div className={`bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative w-full flex flex-col ${imageRatio === 'horizontal' ? '' : 'lg:flex-row'} p-6 lg:p-12 gap-10 lg:gap-16 border border-outline-variant/10`}>

                    {/* Product Image Section */}
                    <div className={`shrink-0 relative rounded-2xl overflow-hidden bg-surface shadow-inner border border-outline-variant/20 ${imageRatio === 'horizontal' ? 'w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9]' : 'w-full lg:w-5/12 aspect-square lg:aspect-[4/5]'}`}>
                        {product.gambar ? (
                            <div
                                className="w-full h-full relative group cursor-pointer overflow-hidden flex items-center justify-center bg-white"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    src={product.gambar}
                                    alt={product.nama}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[#001f5b]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                    <div className="text-white flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-5xl shadow-black/50 drop-shadow-lg">zoom_in</span>
                                        <span className="font-headline font-bold tracking-widest text-sm uppercase shadow-black/50 drop-shadow-md">
                                            {lang === 'id' ? 'Lihat Gambar Full' : 'View Full Image'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-outline py-20 bg-surface-container-lowest">
                                <span className="material-symbols-outlined text-7xl mb-4 opacity-50">inventory_2</span>
                                <span className="font-headline font-bold text-outline-variant">{lang === 'id' ? 'Tidak ada gambar' : 'No image available'}</span>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 z-10">
                            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full shadow-md text-white ${product.kategori === 'Paket' ? 'bg-gradient-to-r from-[#904d00] to-[#b86200]' : 'bg-gradient-to-r from-[#001f5b] to-[#003399]'}`}>
                                {product.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package') : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className={`w-full flex ${imageRatio === 'horizontal' ? 'flex-col lg:flex-row gap-10 lg:gap-16' : 'lg:w-7/12 flex-col'} relative bg-transparent`}>
                        
                        {/* Title & Description */}
                        <div className={`flex flex-col ${imageRatio === 'horizontal' ? 'w-full lg:w-1/2' : ''}`}>
                            <div className="mb-8 border-b border-outline-variant/10 pb-8">
                                <h1 className="text-4xl lg:text-5xl font-headline font-black text-[#001f5b] mb-4 leading-[1.1] tracking-tight">
                                    {product.nama}
                                </h1>
                                <div className="flex items-center gap-2 text-secondary font-headline font-bold text-sm tracking-widest uppercase">
                                    <span className="material-symbols-outlined text-base">verified</span>
                                    {lang === 'id' ? 'Kualitas Industrial' : 'Industrial Grade'}
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mb-10 text-[#4a5568] font-body leading-relaxed text-lg whitespace-pre-line">
                                    {product.description}
                                </div>
                            )}

                        </div>

                        {/* Specifications */}
                        <div className={`flex flex-col ${imageRatio === 'horizontal' ? 'w-full lg:w-1/2 bg-surface p-6 lg:p-8 rounded-2xl border border-outline-variant/10' : 'flex-grow'}`}>
                            {product.spesifikasi && product.spesifikasi.length > 0 && (
                                <div className={`${imageRatio === 'horizontal' ? '' : 'mb-12 flex-grow'}`}>
                                    <h3 className="text-sm font-black tracking-[0.2em] text-[#904d00] uppercase font-headline mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">architecture</span>
                                        {t('productGrid.specLabel') || (lang === 'id' ? 'Spesifikasi Teknis' : 'Technical Specifications')}
                                    </h3>
                                    <div className={`grid grid-cols-1 gap-4 ${imageRatio === 'horizontal' ? '' : 'sm:grid-cols-2'}`}>
                                        {product.spesifikasi.map((spec, i) => (
                                            <div key={i} className={`flex items-start gap-3 bg-surface p-4 rounded-xl border border-outline-variant/30 hover:border-secondary/50 transition-all group ${imageRatio === 'horizontal' ? 'bg-white shadow-sm' : 'hover:bg-surface-container-lowest hover:shadow-sm'}`}>
                                                <div className="bg-[#001f5b]/5 text-[#001f5b] p-2 rounded-lg group-hover:bg-[#001f5b] group-hover:text-white transition-colors shrink-0">
                                                    <span className="material-symbols-outlined text-lg block">check</span>
                                                </div>
                                                <div className="text-[#2d3748] text-[15px] font-medium leading-snug font-body pt-1">{spec}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <ActionButtons />
                        </div>

                    </div>
                </div>

            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-32">
                    <div className="flex justify-between items-end mb-12 border-b border-outline-variant/20 pb-4">
                        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
                            {lang === 'id' ? 'Produk Terkait' : 'Related Products'}
                        </h2>
                        <Link className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center space-x-2 group"
                            to="/products">
                            <span>{lang === 'id' ? 'Lihat Semua' : 'View All'}</span>
                            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProducts.map(relProduct => (
                            <Link to={`/product/${relProduct.slug}`} key={relProduct.id} className="group block bg-white border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,31,91,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative">
                                <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-lowest">
                                    {relProduct.gambar ? (
                                        <img src={relProduct.gambar} alt={relProduct.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-lowest text-outline">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md text-white ${relProduct.kategori === 'Paket' ? 'bg-gradient-to-r from-[#904d00] to-[#b86200]' : 'bg-gradient-to-r from-[#001f5b] to-[#003399]'}`}>
                                            {relProduct.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package') : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
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
            )}

        </main>

        {/* Fullscreen Image Modal */}
        {isModalOpen && product?.gambar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-all duration-300" onClick={() => setIsModalOpen(false)}>
                <button
                    className="absolute top-6 right-6 text-white hover:text-primary transition-colors bg-black/50 p-2 rounded-full cursor-pointer z-10"
                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                >
                    <span className="material-symbols-outlined text-3xl block">close</span>
                </button>
                <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <img
                        src={product.gambar}
                        alt={product.nama}
                        className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl animate-in zoom-in duration-300"
                    />
                </div>
            </div>
        )}
        </>
    );
};

export default ProductDetail;
