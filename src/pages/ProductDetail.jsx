import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProductDetail = () => {
    const { slug } = useParams();
    const { t, lang } = useLanguage();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    return (
        <main className="min-h-screen pt-32 pb-24 bg-surface relative">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* Back Link */}
                <Link to="/products" className="inline-flex items-center gap-2 text-outline-variant hover:text-primary transition-colors font-headline font-bold text-sm uppercase tracking-widest mb-12 group">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    {lang === 'id' ? 'Kembali' : 'Back'}
                </Link>

                <div className="bg-surface-container-lowest rounded-sm shadow-2xl relative w-full overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left: Product Image */}
                    <div className="w-full md:w-1/2 shrink-0 bg-surface-container relative aspect-square md:aspect-auto">
                        {product.gambar ? (
                            <img 
                                src={product.gambar} 
                                alt={product.nama} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-outline py-20 bg-surface-container-high">
                                <span className="material-symbols-outlined text-7xl mb-4">inventory_2</span>
                                <span className="font-headline font-bold">{lang === 'id' ? 'Tidak ada gambar' : 'No image available'}</span>
                            </div>
                        )}
                        <div className="absolute top-6 left-6">
                            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md text-white ${product.kategori === 'Paket' ? 'bg-[#904d00]' : 'bg-[#001f5b]'}`}>
                                {product.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package') : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
                            </span>
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative bg-white">
                        
                        <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-6 leading-tight tracking-tight">
                            {product.nama}
                        </h1>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-10 text-on-surface-variant font-body leading-relaxed text-lg whitespace-pre-line">
                                {product.description}
                            </div>
                        )}

                        {/* Specifications */}
                        {product.spesifikasi && product.spesifikasi.length > 0 && (
                            <div className="space-y-4 mb-12 flex-grow">
                                <p className="text-sm font-bold tracking-[0.2em] text-secondary uppercase font-headline">
                                    {t('productGrid.specLabel') || (lang === 'id' ? 'Spesifikasi Teknis' : 'Technical Specifications')}
                                </p>
                                <ul className="space-y-4 bg-surface-container-low p-6 rounded-sm border border-outline-variant/10">
                                    {product.spesifikasi.map((spec, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <span className="material-symbols-outlined text-secondary text-lg mt-0.5">check_circle</span>
                                            <span className="text-on-surface text-base font-medium leading-relaxed font-body">{spec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t border-outline-variant/20 pt-8 mt-auto flex flex-col sm:flex-row gap-4">
                            {product.shopee_link ? (
                                <a 
                                    href={product.shopee_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-surface-container-high border-2 border-surface-container-highest text-primary-container px-6 py-4 font-headline font-bold text-sm tracking-widest uppercase hover:bg-surface-container-highest hover:text-primary transition-all flex items-center justify-center gap-3 shadow-sm text-center"
                                >
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                    {t('products.buyOnShopee') || (lang === 'id' ? 'Beli di Shopee' : 'Buy on Shopee')}
                                </a>
                            ) : null}

                            <a 
                                href={`https://wa.me/6288108063461?text=${encodeURIComponent(whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-primary text-white px-6 py-4 font-headline font-extrabold text-sm tracking-widest uppercase hover:bg-[#904d00] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-center"
                            >
                                <span className="material-symbols-outlined">chat</span>
                                {t('products.inquire') || (lang === 'id' ? 'Tanyakan Sekarang' : 'Inquire Now')}
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
};

export default ProductDetail;
