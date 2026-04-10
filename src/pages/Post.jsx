import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import { parseMarkdown } from '../utils/markdownParser';

const Post = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const commentInputRef = useRef(null);

    // Feature States
    const [previewIndex, setPreviewIndex] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [views, setViews] = useState(0);
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentName, setCommentName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentSuccess, setCommentSuccess] = useState('');
    const [relatedInstallations, setRelatedInstallations] = useState([]);

    usePageTitle(post?.title || null);

    // ── Fetch Related Items ──────────────────────────────────
    useEffect(() => {
        if (!post) return;
        const fetchRelated = async () => {
            try {
                let url;
                if (post.category === 'Industrial Installations') {
                    url = `/api/posts.php?lang=${lang}&category=Industrial%20Installations&sort=views_asc&limit=4`;
                } else {
                    url = `/api/posts.php?lang=${lang}&sort=views_asc&limit=10`;
                }
                const res = await fetch(url);
                const data = await res.json();
                if (data.success && data.posts) {
                    const filtered = data.posts.filter(p => p.slug !== slug && (post.category === 'Industrial Installations' ? true : p.category !== 'Industrial Installations')).slice(0, 3);
                    setRelatedInstallations(filtered);
                }
            } catch (e) {
                console.error("Failed to fetch related posts");
            }
        };
        fetchRelated();
    }, [slug, lang, post?.category]);

    // ── Fetch Post ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/posts.php?slug=${slug}&lang=${lang}`);
                const data = await res.json();
                if (data.success && data.post) {
                    setPost(data.post);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                setError('Failed to load post data');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    // ── Track View & Fetch Engagement ────────────────────────────────
    useEffect(() => {
        if (!slug || loading || error) return;

        // Track the view
        fetch('/api/track_view.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page_type: 'post', slug }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) setViews(data.views);
            })
            .catch(() => { });

        // Fetch engagement data (likes, comments)
        fetch(`/api/post_actions.php?slug=${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setViews(data.views);
                    setLikes(data.likes);
                    setIsLiked(data.isLiked);
                    setComments(data.comments);
                }
            })
            .catch(() => { });
    }, [slug, loading, error]);

    // ── Like Handler ─────────────────────────────────────────────────
    const handleLike = async () => {
        try {
            const res = await fetch(`/api/post_actions.php?action=like&slug=${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.success) {
                setLikes(data.likes);
                setIsLiked(data.isLiked);
            }
        } catch (err) {
            // Fallback: toggle locally
            setIsLiked(!isLiked);
            setLikes(isLiked ? likes - 1 : likes + 1);
        }
    };

    // ── Scroll to Comments ───────────────────────────────────────────
    const scrollToComments = () => {
        if (commentInputRef.current) {
            commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                commentInputRef.current.focus();
            }, 500);
        }
    };

    // ── Comment: Open Confirmation Modal ─────────────────────────────
    const handleCommentFormSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setShowCommentModal(true);
    };

    // ── Comment: Submit to API ───────────────────────────────────────
    const handleCommentConfirm = async () => {
        if (!isAnonymous && !commentName.trim()) return;

        setCommentSubmitting(true);
        try {
            const res = await fetch(`/api/post_actions.php?action=comment&slug=${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: isAnonymous ? 'Anonymous' : commentName.trim(),
                    is_anonymous: isAnonymous,
                    comment_text: newComment.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setCommentSuccess(data.message || 'Comment submitted! Waiting for approval.');
                setNewComment('');
                setCommentName('');
                setIsAnonymous(false);
                setShowCommentModal(false);
                // Auto-hide success message after 5s
                setTimeout(() => setCommentSuccess(''), 5000);
            } else {
                alert(data.error || 'Failed to submit comment.');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setCommentSubmitting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = post?.title || 'Check out this post';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (loading) {
        return (
            <main className="max-w-[1440px] mx-auto pt-40 pb-40 flex justify-center items-center">
                <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="max-w-[1440px] mx-auto pt-40 pb-40 text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">{t('postPage.notFound')}</h1>
                <p className="text-on-surface-variant mb-8">{error || t('postPage.notFoundDesc')}</p>
                <Link to="/portfolio" className="bg-primary text-white px-8 py-3 rounded-sm font-bold">
                    {t('postPage.backToPortfolio')}
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-[1440px] mx-auto pt-20"> {/* Added pt-20 to account for navbar */}
            {/* Hero Section */}
            <section className="relative h-[819px] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0 bg-surface-container">
                    {post.cover_image ? (
                        <img alt={post.title} className="w-full h-full object-cover"
                            src={post.cover_image} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col text-outline">
                            <span className="material-symbols-outlined text-6xl mb-2">image</span>
                            <span>{t('postPage.noCoverImage')}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
                </div>
                <div className="relative z-10 w-full px-8 md:px-20 pb-16">
                    <div className="flex items-center space-x-4 mb-6">
                        <span
                            className="bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                            {post.category}
                        </span>
                        <span className="text-white/70 text-sm font-medium tracking-wide">
                            {new Date(post.publish_date || post.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <h1
                        className="text-white text-4xl md:text-7xl font-extrabold max-w-5xl leading-[1.1] tracking-tighter mb-4 font-headline">
                        {post.title}
                    </h1>
                    <p className="text-white/80 text-lg md:text-2xl font-light max-w-3xl leading-relaxed">
                        {post.subtitle}
                    </p>
                </div>
            </section>

            {/* Introduction & Overview */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-12 px-8 md:px-20 py-24 bg-surface">
                <div className="md:col-span-8">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-primary tracking-tight font-headline">
                            {post.category === 'Industrial Installations' ? t('postPage.projectOverview') :
                                post.category === 'Product News' ? (lang === 'id' ? 'Ringkasan Berita' : 'News Overview') :
                                    post.category === 'Maintenance Tips' ? (lang === 'id' ? 'Panduan Perawatan' : 'Maintenance Guide') :
                                        post.category === 'Company Update' ? (lang === 'id' ? 'Detail Pembaruan' : 'Update Details') :
                                            t('postPage.projectOverview')}
                        </h2>
                        {/* Actions Bar */}
                        <div className="flex items-center space-x-6 py-4 border-y border-outline-variant/30 my-8">
                            <div className="flex items-center space-x-2 text-on-surface-variant">
                                <span className="material-symbols-outlined">visibility</span>
                                <span className="font-bold">{views}</span>
                            </div>
                            <button onClick={handleLike} className={`flex items-center space-x-2 ${isLiked ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary transition-colors`}>
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }} >thumb_up</span>
                                <span className="font-bold">{likes}</span>
                            </button>
                            <button onClick={scrollToComments} className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">chat_bubble_outline</span>
                                <span className="font-bold">{comments.length}</span>
                            </button>
                            <button onClick={() => setShowShareModal(true)} className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">share</span>
                                <span className="font-bold">{t('postPage.share')}</span>
                            </button>
                        </div>

                        <div
                            className="prose prose-lg text-on-surface-variant leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
                        />

                    </div>
                </div>
                {post.deliverables && post.deliverables.length > 0 && (
                    <div className="md:col-span-4">
                        <div className="bg-surface-container-low p-8 rounded-sm space-y-6">
                            <h3 className="text-xs font-black tracking-[0.2em] text-secondary uppercase font-headline">{t('postPage.keyDeliverables')}</h3>
                            <ul className="space-y-4">
                                {post.deliverables.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3">
                                        <span className="material-symbols-outlined text-secondary scale-90">check_circle</span>
                                        <span className="text-sm font-medium text-on-surface">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </section>
            {post.techSpecs && post.techSpecs.length > 0 && (
                <section className="bg-primary px-6 md:px-20 py-16 md:py-24 text-white overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-full md:w-1/2 h-full opacity-5 md:opacity-10 pointer-events-none">
                        <img alt="Blueprints" className="w-full h-full object-cover"
                            data-alt="Technical blueprint and engineering schematic of an industrial machine assembly with precise lines and measurements"
                            src="https://atekatehnik.com/wp-content/uploads/gambar_hero_ai.jpeg" />
                    </div>
                    <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-0 mb-10 md:mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3 md:space-x-4 font-headline m-0 shrink-0">
                                <span className="w-8 md:w-12 h-0.5 bg-secondary-container inline-block"></span>
                                <span>{t('postPage.techSpecs')}</span>
                            </h2>
                            {/* Removed Related Products rendering from here */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-px md:bg-white/10">
                            {post.techSpecs.map((spec, index) => (
                                <div key={index} className={`bg-primary py-6 md:py-10 ${index % 3 === 0 ? 'md:pr-8' : index % 3 === 1 ? 'md:px-8' : 'md:pl-8'}`}>
                                    <span
                                        className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">
                                        {spec.header || `Spec ${index + 1}`}
                                    </span>
                                    <div className="text-4xl md:text-5xl font-black mb-2 whitespace-pre-wrap leading-tight">{spec.spec_value} <span
                                        className="text-lg md:text-xl font-medium opacity-50">{spec.unit}</span></div>
                                    <p className="text-sm text-white/60 leading-relaxed">{spec.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Related Products Section (Independent) */}
            {post.related_products && post.related_products.length > 0 && (
                <section className="px-8 md:px-20 py-10 bg-surface border-b border-outline-variant/10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-primary tracking-tight font-headline mb-3">
                                {lang === 'id' ? 'Peralatan & Mesin Terkait' : 'Related Equipment & Machines'}
                            </h2>
                            <p className="text-on-surface-variant font-body">
                                {lang === 'id' ? 'Jelajahi produk yang kami rekomendasikan khusus untuk kebutuhan di atas.' : 'Explore recommend products tailored for the needs above.'}
                            </p>
                        </div>
                        <Link to="/products" className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center space-x-2 group mt-6 md:mt-0">
                            <span>{t('postPage.viewEquipment') || (lang === 'id' ? 'Lihat Katalog Peralatan' : 'Explore Equipment Catalog')}</span>
                            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {post.related_products.map((prod) => (
                            <Link
                                key={prod.product_slug}
                                to={`/product/${prod.product_slug}`}
                                className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col relative overflow-hidden h-full"
                            >
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-surface rounded-lg overflow-hidden relative border border-outline-variant/10">
                                        {prod.gambar ? (
                                            <img src={prod.gambar.split(',')[0].trim()} alt={prod.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-outline bg-surface-container-highest">
                                                <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow justify-start">
                                        <h3 className="text-sm font-bold text-primary font-headline line-clamp-2 leading-tight group-hover:text-secondary transition-colors mb-1">
                                            {prod.nama}
                                        </h3>
                                        <p className="text-[11px] text-on-surface-variant line-clamp-2 font-body leading-relaxed w-full">
                                            {prod.description || (lang === 'id' ? 'Unit industri berkualitas tinggi.' : 'High quality industrial unit.')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-3">
                                    <span className="text-[9px] font-bold text-secondary tracking-widest uppercase">
                                        {lang === 'id' ? 'Lihat Spesifikasi' : 'View Specifications'}
                                    </span>
                                    <span className="material-symbols-outlined text-[14px] text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {/* Media Gallery */}
            {post.phases && post.phases.length > 0 && (
                <section className="px-8 md:px-20 py-24 bg-surface-container-low">
                    <h2 className="text-3xl font-bold text-primary mb-12 tracking-tight font-headline">{t('postPage.mediaGallery')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {post.phases.map((phase, index) => (
                            <div key={index}
                                className={`relative group overflow-hidden cursor-pointer aspect-square ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                                onClick={() => setPreviewIndex(index)}
                            >
                                <img alt={phase.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    src={phase.image_url || 'https://via.placeholder.com/800'} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                    <div className="bg-white/15 backdrop-blur-sm p-3 md:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                                        <span className="material-symbols-outlined text-white text-2xl md:text-3xl block">zoom_in</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    <h4 className="text-white font-bold text-sm md:text-base font-headline line-clamp-2">{phase.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            {/* Result & Impact */}
            {post.impact && (
                <section className="px-8 md:px-20 py-24 flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2">
                        <h2 className="text-4xl font-extrabold text-primary mb-8 tracking-tight font-headline">{post.impact.title}</h2>
                        <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(post.impact.description) }} />
                            {post.impact.stats && post.impact.stats.length > 0 && (
                                <div className="grid grid-cols-2 gap-8 py-4">
                                    {post.impact.stats.map((stat, i) => (
                                        <div key={i}>
                                            <div className="text-secondary text-3xl font-black">{stat.stat_value}</div>
                                            <div className="text-xs uppercase tracking-widest font-bold">{stat.stat_label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 relative">
                        <div className="aspect-square bg-surface-container-highest flex items-center justify-center p-12">
                            <div
                                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10">
                            </div>
                            <img alt="Industrial Tech" className="shadow-2xl z-10 w-full rounded-sm object-cover aspect-video"
                                src={post.impact.image_url || 'https://via.placeholder.com/600x400'} />
                            <div className="absolute -bottom-6 -left-6 bg-secondary-container p-8 z-20 hidden md:block">
                                <span className="material-symbols-outlined text-white text-4xl"
                                    style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            {/* Comments Section */}
            <section className="px-8 md:px-20 py-24 bg-surface max-w-5xl mx-auto w-full">
                <div className="pt-8">
                    <h3 className="text-2xl font-bold text-primary mb-8 font-headline">{t('postPage.comments')} ({comments.length})</h3>

                    {/* Success Message */}
                    {commentSuccess && (
                        <div className="bg-secondary/10 border border-secondary/30 text-secondary px-6 py-4 rounded-sm mb-8 flex items-center space-x-3">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-medium">{commentSuccess}</span>
                        </div>
                    )}

                    <form onSubmit={handleCommentFormSubmit} className="mb-12">
                        <textarea
                            ref={commentInputRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-sm p-6 text-on-surface focus:outline-none focus:border-primary resize-none text-lg"
                            placeholder={t('postPage.addComment')}
                            rows="4"
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button type="submit" disabled={!newComment.trim()} className="bg-primary text-white px-8 py-3 rounded-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('postPage.postComment')}</button>
                        </div>
                    </form>

                    {comments.length === 0 && !commentSuccess && (
                        <div className="text-center py-12 text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">forum</span>
                            <p>{t('postPage.noComments')}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-surface-container-low p-6 rounded-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-on-surface text-lg">{comment.user}</span>
                                    <span className="text-sm text-on-surface-variant">{comment.date}</span>
                                </div>
                                <p className="text-on-surface-variant leading-relaxed">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Projects */}
            {relatedInstallations.length > 0 && (
                <section className="px-8 md:px-20 py-24 border-t border-outline-variant/20">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
                            {post.category === 'Industrial Installations' ? t('postPage.otherInstallations') : (lang === 'id' ? 'Berita & Pembaruan Lainnya' : 'Other News & Updates')}
                        </h2>
                        <Link className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center space-x-2 group"
                            to="/news">
                            <span>{post.category === 'Industrial Installations' ? t('postPage.viewAllProjects') : (lang === 'id' ? 'Lihat Semua Berita' : 'View All News')}</span>
                            <span
                                className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedInstallations.map(project => (
                            <Link to={`/post/${project.slug}`} key={project.id} className="group block bg-surface-container-low border border-outline-variant/30 rounded-sm overflow-hidden hover:shadow-xl transition-all">
                                <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-lowest">
                                    <img src={project.cover_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000'} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 font-bold text-[10px] tracking-widest uppercase text-primary">
                                        {project.category === 'Industrial Installations' ? (project.location || 'Indonesia') : project.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">{project.title}</h3>
                                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-4">{project.subtitle}</p>
                                    <span className="text-secondary font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                                        {project.category === 'Industrial Installations' ? t('postPage.readCaseStudy') : (lang === 'id' ? 'Baca Selengkapnya' : 'Read More')} <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {/* CTA Section */}
            <section className="bg-surface-container-low px-8 md:px-20 py-32 flex flex-col items-center text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tighter font-headline whitespace-pre-line">{t('postPage.ctaTitle')}</h2>
                <p className="text-on-surface-variant max-w-2xl mb-12 text-lg">{t('postPage.ctaDesc')}</p>
                <Link to="/contact"
                    className="bg-secondary text-white px-10 py-5 rounded-sm font-black text-sm tracking-[0.2em] uppercase hover:bg-secondary/90 transition-all shadow-xl hover:-translate-y-1 block">
                    {t('postPage.ctaBtn')}
                </Link>
            </section>

            {/* Comment Confirmation Modal */}
            {showCommentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface p-8 rounded-md max-w-md w-full shadow-2xl relative mx-4">
                        <button onClick={() => setShowCommentModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-bold text-primary mb-2">{t('postPage.confirmComment')}</h3>
                        <p className="text-on-surface-variant text-sm mb-6">{t('postPage.commentReview')}</p>

                        {/* Preview */}
                        <div className="bg-surface-container-low p-4 rounded-sm mb-6 border border-outline-variant/30">
                            <p className="text-on-surface text-sm italic">"{newComment}"</p>
                        </div>

                        {/* Anonymous Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-on-surface font-medium">{t('postPage.postAsAnonymous')}</span>
                            <button
                                type="button"
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isAnonymous ? 'bg-primary' : 'bg-outline-variant'}`}
                            >
                                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Name Input (only if not anonymous) */}
                        {!isAnonymous && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-on-surface mb-2">{t('postPage.yourName')}</label>
                                <input
                                    type="text"
                                    value={commentName}
                                    onChange={(e) => setCommentName(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-sm p-3 text-on-surface focus:outline-none focus:border-primary"
                                    placeholder={t('postPage.enterName')}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCommentModal(false)}
                                className="flex-1 border border-outline-variant text-on-surface-variant px-6 py-3 rounded-sm font-bold hover:bg-surface-container-low transition-colors"
                            >
                                {t('postPage.cancel')}
                            </button>
                            <button
                                onClick={handleCommentConfirm}
                                disabled={(!isAnonymous && !commentName.trim()) || commentSubmitting}
                                className="flex-1 bg-primary text-white px-6 py-3 rounded-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {commentSubmitting ? (
                                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        <span>{t('postPage.submit')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface p-8 rounded-md max-w-sm w-full shadow-2xl relative mx-4">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-bold text-primary mb-6">{t('postPage.sharePost')}</h3>
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
                                <span className="text-[10px] font-medium text-center">{isCopied ? t('postPage.copied') : t('postPage.copyLink')}</span>
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

            {/* Image Preview Modal with Slideshow */}
            {previewIndex !== null && post.phases && post.phases[previewIndex] && (() => {
                const currentPhase = post.phases[previewIndex];
                const total = post.phases.length;
                const goPrev = (e) => { e.stopPropagation(); setPreviewIndex((previewIndex - 1 + total) % total); };
                const goNext = (e) => { e.stopPropagation(); setPreviewIndex((previewIndex + 1) % total); };
                const handleKey = (e) => {
                    if (e.key === 'ArrowLeft') goPrev(e);
                    else if (e.key === 'ArrowRight') goNext(e);
                    else if (e.key === 'Escape') setPreviewIndex(null);
                };
                return (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
                        onClick={() => setPreviewIndex(null)}
                        onKeyDown={handleKey}
                        tabIndex={0}
                        ref={(el) => el && el.focus()}
                    >
                        {/* Close */}
                        <button onClick={() => setPreviewIndex(null)} className="absolute top-5 right-5 z-20 text-white/40 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>

                        {/* Counter */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-white/50 text-sm font-medium tracking-widest">
                            {previewIndex + 1} / {total}
                        </div>

                        {/* Prev Button */}
                        {total > 1 && (
                            <button
                                onClick={goPrev}
                                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all hover:scale-110"
                            >
                                <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                            </button>
                        )}

                        {/* Next Button */}
                        {total > 1 && (
                            <button
                                onClick={goNext}
                                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-all hover:scale-110"
                            >
                                <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                            </button>
                        )}

                        {/* Image + Description */}
                        <div className="flex flex-col items-center max-w-5xl w-full px-16 md:px-20" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={currentPhase.image_url}
                                alt={currentPhase.title}
                                className="max-w-full max-h-[70vh] object-contain rounded-sm shadow-2xl"
                            />
                            <div className="mt-6 text-center max-w-2xl">
                                <h3 className="text-white font-bold text-lg md:text-xl font-headline mb-2">{currentPhase.title}</h3>
                                {currentPhase.description && (
                                    <p className="text-white/60 text-sm md:text-base leading-relaxed">{currentPhase.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Dot Indicators */}
                        {total > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                                {post.phases.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setPreviewIndex(i); }}
                                        className={`rounded-full transition-all duration-300 ${i === previewIndex ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}
        </main>
    );
};

export default Post;
