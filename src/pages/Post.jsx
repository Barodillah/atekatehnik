import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Post = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                // Fetch via proxy using slug
                const res = await fetch(`/api/posts.php?slug=${slug}`);
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
                <h1 className="text-4xl font-bold text-primary mb-4">Post Not Found</h1>
                <p className="text-on-surface-variant mb-8">{error || 'The requested article could not be found.'}</p>
                <Link to="/portfolio" className="bg-primary text-white px-8 py-3 rounded-sm font-bold">
                    Back to Portfolio
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
                            <span>No Cover Image</span>
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
                            {new Date(post.publish_date || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                        <h2 className="text-3xl font-bold text-primary tracking-tight font-headline">Project Overview</h2>
                        <div
                            className="prose prose-lg text-on-surface-variant leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </div>
                {post.deliverables && post.deliverables.length > 0 && (
                    <div className="md:col-span-4">
                        <div className="bg-surface-container-low p-8 rounded-sm space-y-6">
                            <h3 className="text-xs font-black tracking-[0.2em] text-secondary uppercase font-headline">Key Deliverables</h3>
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
                <section className="bg-primary px-8 md:px-20 py-24 text-white overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <img alt="Blueprints" className="w-full h-full object-cover"
                            data-alt="Technical blueprint and engineering schematic of an industrial machine assembly with precise lines and measurements"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx1hhalQM1JiLOzLrYXzby7sFwK7RDpApeAg3Px_wtKsuVXQHfhAP-_S89BUIDnK8vg1V9TqdWxbKCgn6PjWYGQaT2U7jwbMOvbkpr8gN_4FGjb5GoCJn6OSKot5WtyEycYZswnpTnFU2IszlAZYjVa4PcoQB3MUVE2Gwu6FwkX0zgRETmm7WJIIFl0LJgqiWZedn-0a_r0Ha0LeaAsSikHd6TDAfpPi5hxIZcc2MjGS7xTTl7azWRg2ifJ30JrpBb596tOB93JxU" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-16 tracking-tight flex items-center space-x-4 font-headline">
                            <span className="w-12 h-0.5 bg-secondary-container inline-block"></span>
                            <span>Technical Specifications</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
                            {post.techSpecs.map((spec, index) => (
                                <div key={index} className={`bg-primary py-10 ${index % 3 === 0 ? 'pr-8' : index % 3 === 1 ? 'px-8' : 'pl-8'}`}>
                                    <span
                                        className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">
                                        {spec.header || `Spec ${index + 1}`}
                                    </span>
                                    <div className="text-5xl font-black mb-2 whitespace-pre-wrap">{spec.spec_value} <span
                                        className="text-xl font-medium opacity-50">{spec.unit}</span></div>
                                    <p className="text-sm text-white/60">{spec.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            {/* Process Gallery: Bento Grid */}
            {post.phases && post.phases.length > 0 && (
                <section className="px-8 md:px-20 py-24 bg-surface-container-low">
                    <h2 className="text-3xl font-bold text-primary mb-12 tracking-tight font-headline">Installation Phases</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[800px]">
                        {post.phases.map((phase, index) => (
                            <div key={index} className={`relative group overflow-hidden ${index === 0 ? 'md:col-span-2 md:row-span-2' : index === 1 ? 'md:col-span-2' : ''}`}>
                                <img alt={phase.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    src={phase.image_url || 'https://via.placeholder.com/800'} />
                                <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
                                    <span className="text-secondary-container font-bold text-xs uppercase tracking-widest">Phase
                                        0{index + 1}</span>
                                    <h4 className="text-white font-bold text-xl font-headline">{phase.title}</h4>
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
                            <p dangerouslySetInnerHTML={{ __html: post.impact.description }} />
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
            {/* Related Projects */}
            <section className="px-8 md:px-20 py-24 border-t border-outline-variant/20">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">Other Recent Installations</h2>
                    <Link className="text-secondary font-bold text-sm tracking-widest uppercase flex items-center space-x-2 group"
                        to="/portfolio">
                        <span>View all projects</span>
                        <span
                            className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </Link>
                </div>
                {/* Omitted dynamic related for brevity, left as link to portfolio */}
            </section>
            {/* CTA Section */}
            <section className="bg-surface-container-low px-8 md:px-20 py-32 flex flex-col items-center text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tighter font-headline">Ready to Optimize Your
                    Output?</h2>
                <p className="text-on-surface-variant max-w-2xl mb-12 text-lg">Ateka Tehnik provides end-to-end engineering
                    solutions for the agricultural industry. From design to commissioning, we deliver precision.</p>
                <Link to="/contact"
                    className="bg-secondary text-white px-10 py-5 rounded-sm font-black text-sm tracking-[0.2em] uppercase hover:bg-secondary/90 transition-all shadow-xl hover:-translate-y-1 block">
                    Consult Your Project
                </Link>
            </section>
        </main>
    );
};

export default Post;
