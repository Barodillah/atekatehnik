import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const News = () => {
    const { t, lang } = useLanguage();
    usePageTitle(lang === 'id' ? 'Berita & Pembaruan' : 'News & Updates');

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, views_asc -> mapping to backend, views_desc? backend currently supports created_at DESC or views_asc. We can do client side if API is limited.
    const [category, setCategory] = useState('');
    const [visibleCount, setVisibleCount] = useState(10); // Start with 10 (1 featured + 9 grid)

    const categories = ['Maintenance Tips', 'Product News', 'Company Update', 'Insight'];

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                // Fetch up to 50 items to allow client-side filtering/sorting if needed, or rely on API.
                // Since this is a public marketing page, we'll fetch a batch.
                let url = `/api/posts.php?lang=${lang}&limit=100&exclude_category=Industrial Installations`;
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (data.success) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [lang]);

    // Derived states
    let displayedPosts = [...posts];

    // Filter by Category
    if (category) {
        displayedPosts = displayedPosts.filter(p => p.category === category);
    }

    // Sort
    if (sortBy === 'newest') {
        displayedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
        displayedPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'most_viewed') {
        // Fallback to views if available from our new stats
        displayedPosts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    const featuredPost = displayedPosts.length > 0 ? displayedPosts[0] : null;
    const gridPosts = displayedPosts.slice(1, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 9);
    };

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-background">
                <span className="material-symbols-outlined text-primary animate-spin text-5xl">progress_activity</span>
            </main>
        );
    }

    return (
        <main className="pt-24 pb-12 bg-surface font-body text-on-surface min-h-screen">
            <div className="max-w-7xl mx-auto px-8">
                
                {/* Filter Bar */}
                <section className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/20 pt-8">
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary-container">
                        {lang === 'id' ? 'Berita & Pembaruan' : 'News & Updates'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">
                            {lang === 'id' ? 'Filter :' : 'Filter By:'}
                        </span>
                        
                        {/* Sort Buttons */}
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`px-4 py-1.5 rounded-full font-label text-sm font-semibold transition-colors ${sortBy === 'newest' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}
                        >
                            {lang === 'id' ? 'Terbaru' : 'Newest'}
                        </button>
                        <button
                            onClick={() => setSortBy('oldest')}
                            className={`px-4 py-1.5 rounded-full font-label text-sm font-semibold transition-colors ${sortBy === 'oldest' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}
                        >
                            {lang === 'id' ? 'Terlama' : 'Oldest'}
                        </button>
                        <button
                            onClick={() => setSortBy('most_viewed')}
                            className={`px-4 py-1.5 rounded-full font-label text-sm font-semibold transition-colors ${sortBy === 'most_viewed' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}
                        >
                            {lang === 'id' ? 'Terpopuler' : 'Most Viewed'}
                        </button>

                        {/* Category Dropdown */}
                        <div className="relative group">
                            <button className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-label text-sm font-semibold transition-colors ${category !== '' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}>
                                {category === '' ? (lang === 'id' ? 'Kategori' : 'Category') : category}
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest shadow-xl rounded-sm border border-outline-variant/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                <button 
                                    onClick={() => setCategory('')} 
                                    className={`w-full text-left px-4 py-3 text-sm font-label hover:bg-surface-container-low transition-colors ${category === '' ? 'font-bold bg-secondary-fixed/30 text-primary' : 'text-on-surface-variant'}`}
                                >
                                    {lang === 'id' ? 'Semua Kategori' : 'All Categories'}
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setCategory(cat)} 
                                        className={`w-full text-left px-4 py-3 text-sm font-label hover:bg-surface-container-low transition-colors ${category === cat ? 'font-bold bg-secondary-fixed/50 text-primary' : 'text-on-surface-variant'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* No Data State */}
                {displayedPosts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">article</span>
                        <h2 className="text-2xl font-headline font-bold text-primary-container mb-2">
                            {lang === 'id' ? 'Tidak ada berita' : 'No news found'}
                        </h2>
                        <p>{lang === 'id' ? 'Coba ubah opsi filter Anda.' : 'Try changing your filter options.'}</p>
                    </div>
                )}

                {/* Featured Article */}
                {featuredPost && (
                    <section className="mb-16">
                        <Link to={`/post/${featuredPost.slug}`} className="group block overflow-hidden bg-surface-container-lowest shadow-[0_32px_32px_rgba(25,28,29,0.04)] rounded-sm flex flex-col lg:flex-row border-l-4 border-secondary hover:shadow-[0_32px_32px_rgba(25,28,29,0.1)] transition-all duration-300">
                            <div className="lg:w-2/3 h-[300px] lg:h-auto relative overflow-hidden bg-surface-container shrink-0">
                                {featuredPost.cover_image ? (
                                    <img 
                                        alt={featuredPost.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        src={featuredPost.cover_image} 
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-outline">
                                        <span className="material-symbols-outlined text-5xl">image</span>
                                    </div>
                                )}
                            </div>
                            <div className="lg:w-1/3 p-6 md:p-10 flex flex-col justify-center bg-surface-container-lowest grow">
                                <span className="inline-block px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-label font-black tracking-[0.2em] uppercase mb-4 w-fit">
                                    {featuredPost.category}
                                </span>
                                <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-primary-container leading-tight mb-4 group-hover:text-secondary transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-on-surface-variant text-sm md:text-base mb-8 leading-relaxed line-clamp-3">
                                    {featuredPost.subtitle}
                                </p>
                                <div className="flex items-center gap-6 mt-auto text-on-surface-variant/60 font-label text-sm">
                                    <div className="flex items-center gap-1.5" title="Views">
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                        <span>{featuredPost.view_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Likes">
                                        <span className="material-symbols-outlined text-lg">thumb_up</span>
                                        <span>{featuredPost.like_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Comments">
                                        <span className="material-symbols-outlined text-lg">mode_comment</span>
                                        <span>{featuredPost.comment_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* News Grid */}
                {gridPosts.length > 0 && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {gridPosts.map((post) => (
                            <Link to={`/post/${post.slug}`} key={post.id} className="flex flex-col bg-surface hover:bg-surface-container-low transition-colors duration-300 group border border-outline-variant/10 rounded-sm overflow-hidden">
                                <div className="aspect-video w-full mb-6 overflow-hidden bg-surface-container">
                                    {post.cover_image ? (
                                        <img 
                                            alt={post.title}
                                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                                            src={post.cover_image} 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-outline">
                                            <span className="material-symbols-outlined text-3xl">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 pb-6 flex flex-col flex-grow">
                                    <span className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-3 block">
                                        {post.category}
                                    </span>
                                    <h3 className="font-headline text-xl font-bold text-primary-container mb-3 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 flex-grow">
                                        {post.subtitle}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                                        <div className="flex items-center gap-4 text-on-surface-variant/60">
                                            <div className="flex items-center gap-1 text-xs" title="Views">
                                                <span className="material-symbols-outlined text-base">visibility</span>
                                                {post.view_count || 0}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs" title="Likes">
                                                <span className="material-symbols-outlined text-base">thumb_up</span>
                                                {post.like_count || 0}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs" title="Comments">
                                                <span className="material-symbols-outlined text-base">mode_comment</span>
                                                {post.comment_count || 0}
                                            </div>
                                        </div>
                                        <span className="text-xs font-label text-on-surface-variant/70">
                                            {new Date(post.publish_date || post.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </section>
                )}

                {/* Load More Section */}
                {displayedPosts.length > visibleCount && (
                    <div className="flex justify-center mt-20">
                        <button
                            onClick={handleLoadMore}
                            className="px-10 py-3 border border-primary-container text-primary-container bg-transparent font-headline font-bold text-sm uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all duration-300 active:scale-95 cursor-pointer"
                        >
                            {lang === 'id' ? 'Muat Lebih Banyak' : 'Load More Updates'}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default News;
