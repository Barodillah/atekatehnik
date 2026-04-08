const fs = require('fs');
const path = 'c:\\laragon\\www\\atekatehnik\\src\\pages\\ProductDetail.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1
content = content.replace(
    'const [relatedProducts, setRelatedProducts] = useState([]);',
    'const [relatedProducts, setRelatedProducts] = useState([]);\n    const [relatedPosts, setRelatedPosts] = useState([]);'
);

// 2
content = content.replace(
    '        fetchRelated();\n    }, [product]);\n\n    if (loading) {',
    `        fetchRelated();
    }, [product]);

    useEffect(() => {
        if (!product) return;
        const fetchRelatedPosts = async () => {
            try {
                const res = await fetch(\`/api/posts.php?lang=\${lang}&sort=views_asc&limit=2\`);
                const data = await res.json();
                if (data.success && data.posts) {
                    setRelatedPosts(data.posts.slice(0, 2));
                }
            } catch (err) {
                console.error("Failed to fetch related posts");
            }
        };
        fetchRelatedPosts();
    }, [lang, product]);

    if (loading) {`
);

// 3
const startStr = 'const ActionButtons = () => (';
const endStr = '</main>';
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

if (startIdx === -1 || content.indexOf(endStr, startIdx) === -1) {
    console.error('Error finding bounds for chunk 3');
    process.exit(1);
}

const replacement = `return (
        <>
            <main className="min-h-screen pt-20 bg-surface relative z-0">
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6">
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
                                    ? 'Unit penggilingan padi skala menengah andalan kami yang dirancang untuk tingkat pemulihan maksimum dan kerusakan butir minimal. Dirancang untuk operasi industri 24/7 yang berkelanjutan.' 
                                    : 'Our flagship medium-scale rice milling unit engineered for maximum recovery rates and minimal grain breakage. Designed for sustained 24/7 industrial operations.'}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href={\`https://wa.me/62881080634612?text=\${encodeURIComponent(whatsappMessage)}\`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackWaClick('product-detail', product.nama)}
                                    className="bg-secondary text-on-secondary px-8 py-4 rounded-sm font-headline font-extrabold text-lg flex items-center gap-3 shadow-xl shadow-secondary/20 hover:bg-secondary-container transition-all"
                                >
                                    {t('products.inquire') || (lang === 'id' ? 'Tanyakan Sekarang' : 'Ask Now')}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </a>
                                
                                <Link
                                    to="/contact"
                                    state={{
                                        message: lang === 'id' 
                                            ? \`Halo Ateka Tehnik, saya ingin melakukan permintaan khusus untuk produk: \${product.nama}.\` 
                                            : \`Hello Ateka Tehnik, I would like to make a custom request for the product: \${product.nama}.\`
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
                                    <p className="text-outline text-xs uppercase tracking-widest font-bold">Years Warranty</p>
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
                            <div className="relative bg-surface-container-lowest p-2 md:p-4 rounded-lg shadow-xl md:shadow-2xl cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                                {product.gambar ? (
                                    <>
                                        <img
                                            alt={product.nama}
                                            className="w-full aspect-[4/3] object-cover rounded-sm grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                            src={product.gambar}
                                        />
                                        <div className="absolute inset-0 bg-[#001f5b]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm rounded-sm m-2 md:m-4">
                                            <div className="text-white flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <span className="material-symbols-outlined text-5xl shadow-black/50 drop-shadow-lg">zoom_in</span>
                                                <span className="font-headline font-bold tracking-widest text-sm uppercase shadow-black/50 drop-shadow-md">
                                                    {lang === 'id' ? 'Lihat Gambar Full' : 'View Full Image'}
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
                <section className="py-24 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            <div className="lg:col-span-4">
                                <h2 className="font-headline text-3xl font-extrabold text-primary sticky top-28">Engineering Excellence</h2>
                            </div>
                            <div className="lg:col-span-8 space-y-8">
                                <p className="text-xl text-on-surface leading-relaxed font-medium">
                                    For over two decades, Ateka Tehnik has been at the forefront of agricultural engineering in
                                    Indonesia. The RMU Industri Menengah represents our commitment to bridging the gap between
                                    small-scale farming and massive industrial processing.
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
                    <section className="py-24 px-6 bg-surface">
                        <div className="max-w-7xl mx-auto">
                            <div className="mb-16">
                                <h2 className="font-headline text-4xl font-extrabold text-primary mb-4">{t('productGrid.specLabel') || (lang === 'id' ? 'Spesifikasi Teknis' : 'Technical Specifications')}</h2>
                                <div className="h-1 w-20 bg-secondary"></div>
                            </div>
                            <div className="overflow-x-auto bg-surface-container-lowest shadow-sm rounded-lg border border-outline-variant/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/20 min-w-[600px]">
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
                                                    <div className="flex justify-between items-center p-6 bg-surface-container-low min-w-full">
                                                        <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Component</span>
                                                        <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Specification</span>
                                                    </div>
                                                    {col1.map((item, idx) => (
                                                        <div key={idx} className={\`p-6 flex justify-between items-center border-b border-outline-variant/10 min-w-full \${idx % 2 === 1 ? 'bg-surface-container-low/50' : ''}\`}>
                                                            <span className="font-medium text-primary">{item.component}</span>
                                                            <span className="font-bold text-right text-secondary-container">{item.spec}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Column 2 */}
                                                {col2.length > 0 ? (
                                                    <div className="p-0">
                                                        <div className="hidden md:flex justify-between items-center p-6 bg-surface-container-low min-w-full">
                                                            <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Component</span>
                                                            <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">Specification</span>
                                                        </div>
                                                        {col2.map((item, idx) => (
                                                            <div key={idx} className={\`p-6 flex justify-between items-center border-b border-outline-variant/10 min-w-full \${idx % 2 === 1 ? 'bg-surface-container-low/50' : ''}\`}>
                                                                <span className="font-medium text-primary">{item.component}</span>
                                                                <span className="font-bold text-right text-secondary-container">{item.spec}</span>
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
                    <section className="py-24 px-6 bg-surface-container-low">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-4">
                                <div>
                                    <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">{lang === 'id' ? 'Model Serupa' : 'Related Models'}</h2>
                                    <p className="text-on-surface-variant">{lang === 'id' ? 'Bandingkan teknik presisi kami di seluruh seri.' : 'Compare our precision engineering across the range.'}</p>
                                </div>
                                <Link className="text-secondary font-bold flex items-center gap-2 hover:underline" to="/products">
                                    {lang === 'id' ? 'Lihat Katalog Penuh' : 'View Full Catalog'} <span className="material-symbols-outlined">north_east</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedProducts.map(relProduct => (
                                    <Link to={\`/product/\${relProduct.slug}\`} key={relProduct.slug || relProduct.id} className="group bg-surface-container-lowest rounded-sm p-2 transition-all hover:shadow-2xl flex flex-col h-full">
                                        <div className="aspect-[4/3] overflow-hidden mb-6 rounded-sm shrink-0">
                                            {relProduct.gambar ? (
                                                <img
                                                    alt={relProduct.nama}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    src={relProduct.gambar}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-lowest text-outline">
                                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <h3 className="font-headline font-bold text-xl text-primary mb-2 line-clamp-2">{relProduct.nama}</h3>
                                            <p className="text-on-surface-variant text-sm mb-4 line-clamp-2 flex-grow">{relProduct.description}</p>
                                            <div className="flex justify-between items-center mt-auto border-t border-outline-variant/10 pt-4">
                                                <span className="text-secondary font-bold text-sm">
                                                    {relProduct.kategori === 'Paket' ? (lang === 'id' ? 'Paket Lengkap' : 'Complete Package')
                                                        : relProduct.kategori === 'Unit Mesin Tunggal' ? (lang === 'id' ? 'Unit Mesin Tunggal' : 'Single Machine Unit')
                                                            : relProduct.kategori === 'Peralatan Pendukung' ? (lang === 'id' ? 'Peralatan Pendukung' : 'Supporting Equipment')
                                                                : (lang === 'id' ? 'Suku Cadang' : 'Spare Parts')}
                                                </span>
                                                <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">arrow_right_alt</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Engineering Insights (Related Posts) */}
                {relatedPosts.length > 0 && (
                    <section className="py-24 px-6 bg-surface">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="font-headline text-3xl font-extrabold text-primary mb-12 text-center">
                                {lang === 'id' ? 'Wawasan Teknik' : 'Engineering Insights'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {relatedPosts.map((rPost) => (
                                    <div key={rPost.slug} className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-low p-6 rounded-sm border-l-4 border-secondary group hover:shadow-lg transition-all">
                                        <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-sm">
                                            <img 
                                                alt={rPost.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                src={rPost.cover_image || 'https://via.placeholder.com/400x300'} 
                                            />
                                        </div>
                                        <div className="w-full flex-grow">
                                            <h4 className="font-headline font-bold text-xl text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">{rPost.title}</h4>
                                            <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{rPost.subtitle || (lang === 'id' ? 'Baca lebih lanjut mengenai artikel ini.' : 'Read more about this article.')}</p>
                                            <Link 
                                                to={\`/post/\${rPost.slug}\`}
                                                className="text-primary font-bold text-sm uppercase tracking-widest hover:text-secondary transition-colors inline-block mt-auto"
                                            >
                                                {lang === 'id' ? 'Baca Artikel' : 'Read Article'}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(path, content, 'utf8');
console.log('Update complete!');
