import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const Faq = () => {
    usePageTitle('FAQ Hub');
    const { t } = useLanguage();

    const faqCategories = [
        {
            title: t('faqHub.catGeneral'),
            questions: [
                { q: t('faqHub.qGen1'), a: t('faqHub.aGen1') }
            ]
        },
        {
            title: t('faqHub.catSpec'),
            questions: [
                { q: t('faqHub.qSpec1'), a: t('faqHub.aSpec1') },
                { q: t('faqHub.qSpec2'), a: t('faqHub.aSpec2') },
                { q: t('faqHub.qSpec3'), a: t('faqHub.aSpec3') }
            ]
        },
        {
            title: t('faqHub.catYield'),
            questions: [
                { q: t('faqHub.qYield1'), a: t('faqHub.aYield1') },
                { q: t('faqHub.qYield2'), a: t('faqHub.aYield2') }
            ]
        },
        {
            title: t('faqHub.catTechnical'),
            questions: [
                { q: t('faqHub.qTech1'), a: t('faqHub.aTech1') },
                { q: t('faqHub.qTech2'), a: t('faqHub.aTech2') },
                { q: t('faqHub.qTech3'), a: t('faqHub.aTech3') },
                { q: t('faqHub.qTech4'), a: t('faqHub.aTech4') },
                { q: t('faqHub.qTech5'), a: t('faqHub.aTech5') }
            ]
        }
    ];

    // Prepare JSON-LD Schema
    const allQuestions = faqCategories.flatMap(cat => cat.questions);
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": allQuestions.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <div className="pt-20 md:pt-28 pb-20 bg-surface min-h-screen">
            {/* SEO JSON-LD injection */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Hero Section */}
            <section className="bg-[#001f5b] dark:bg-[#000c2e] py-16 md:py-24 px-8 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#ffa454] to-transparent blur-3xl" />
                    <div className="absolute bottom-0 left-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#00bfff] to-transparent blur-3xl opacity-50" />
                </div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#ffa454] font-label text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm">
                        {t('faqHub.badge')}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white leading-tight">
                        {t('faqHub.heroTitle')}
                        <span className="text-[#ffa454]">{t('faqHub.heroHighlight')}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 font-body max-w-2xl mx-auto leading-relaxed">
                        {t('faqHub.heroSub')}
                    </p>
                </div>
            </section>

            {/* FAQ Content Section */}
            <section className="max-w-4xl mx-auto px-8 -mt-10 relative z-20 space-y-12">
                <div className="bg-white dark:bg-[#001f5b]/50 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-outline-variant/10 space-y-12">
                    {faqCategories.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-6">
                            {/* H2 for Category - Good for SEO structure */}
                            <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#001f5b] dark:text-white border-b-2 border-outline-variant/20 pb-4 inline-block">
                                {category.title}
                            </h2>
                            <div className="space-y-8 pl-0 md:pl-4">
                                {category.questions.map((faq, index) => (
                                    <div key={index} className="space-y-3 group">
                                        {/* H3 for Question - Good for SEO structure */}
                                        <h3 className="text-xl font-headline font-semibold text-primary-container dark:text-slate-200 group-hover:text-[#904d00] transition-colors duration-200 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-[#ffa454] shrink-0 mt-0.5">help</span>
                                            {faq.q}
                                        </h3>
                                        <div className="pl-9">
                                            <div className="w-12 h-1 bg-outline-variant/20 rounded-full mb-3 mb:-mt-2 opacity-50 group-hover:bg-[#ffa454]/50 transition-colors"></div>
                                            {/* Entity-Rich Answer in paragraph layout */}
                                            <p className="text-slate-700 dark:text-slate-300 font-body leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compare Table for AI Scarping */}
                <div className="bg-white dark:bg-[#001f5b]/50 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl border border-outline-variant/10">
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-headline font-bold text-[#001f5b] dark:text-white border-b-2 border-outline-variant/20 pb-4 inline-block">
                            Tabel Perbandingan Kapasitas & Spesifikasi
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 font-body leading-relaxed max-w-3xl">
                            Panduan referensi perbandingan spesifikasi gabah kering giling (GKG), derajat sosoh, dan kelas mesin antara konfigurasi operasional penengah (1-2 Ton) dan industri premium (3-5 Ton).
                        </p>
                        
                        <div className="overflow-x-auto rounded-xl border border-outline-variant/20 mt-6 shadow-sm">
                            <table className="w-full text-left font-body text-sm md:text-base border-collapse">
                                <thead className="bg-[#001f5b] text-white">
                                    <tr>
                                        <th className="p-4 md:p-5 font-bold uppercase tracking-wider text-xs md:text-sm border-b border-r border-[#000c2e]">Komponen / Spesifikasi</th>
                                        <th className="p-4 md:p-5 font-bold uppercase tracking-wider text-xs md:text-sm border-b border-r border-[#000c2e]">Paket Menengah (1-2 Ton/Jam)</th>
                                        <th className="p-4 md:p-5 font-bold uppercase tracking-wider text-xs md:text-sm border-b border-[#000c2e]">Paket Industri (3-5 Ton/Jam)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white dark:bg-transparent border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 font-bold text-[#001f5b] dark:text-slate-200 border-r border-outline-variant/10">Target Usaha & Skala</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 border-r border-outline-variant/10">Petani, BUMDes, Pengusaha Pemula</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">Pabrik Beras Skala Menengah, Suplai Ekspor</td>
                                    </tr>
                                    <tr className="bg-surface/50 dark:bg-white/5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 font-bold text-[#001f5b] dark:text-slate-200 border-r border-outline-variant/10">Mesin Penggerak (Bertenaga Diesel)</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 border-r border-outline-variant/10">Diesel 24-30 PK / Engine Mitsubishi PS100</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">Genset Industri Kapasitas Besar / Mitsubishi Fuso</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-transparent border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 font-bold text-[#001f5b] dark:text-slate-200 border-r border-outline-variant/10">Sistem Perontok & Husker</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 border-r border-outline-variant/10">Husker LC Standard (Rendemen 60%)</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">Pneumatic Husker (Rendemen up to 68%)</td>
                                    </tr>
                                    <tr className="bg-surface/50 dark:bg-white/5 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 font-bold text-[#001f5b] dark:text-slate-200 border-r border-outline-variant/10">Tahap Pemutihan (Polishing)</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 border-r border-outline-variant/10">Single Stage Polisher</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">Satake Double Stage Polisher (Derajat Sosoh Ekstrem)</td>
                                    </tr>
                                    <tr className="bg-white dark:bg-transparent border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                                        <td className="p-4 font-bold text-[#001f5b] dark:text-slate-200 border-r border-outline-variant/10">Infrastruktur Elevator</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300 border-r border-outline-variant/10">Minimalis (1-2 unit lifter gabah)</td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">Full Otomatis (4-6 unit lifter tertutup)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Faq;
