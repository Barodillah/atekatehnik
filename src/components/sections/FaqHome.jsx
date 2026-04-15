import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const FaqHome = () => {
    const { t, lang } = useLanguage();
    const [openIndex, setOpenIndex] = useState(0); // First item open by default

    const faqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    // JSON-LD for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <section className="py-20 bg-surface relative overflow-hidden">
            {/* SEO JSON-LD injection */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <div className="max-w-4xl mx-auto px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-[#001f5b] dark:text-white">
                        {t('faq.title')}
                    </h2>
                    <p className="text-lg text-outline-variant max-w-2xl mx-auto font-body">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="space-y-4 bg-white dark:bg-[#000c2e] p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/10">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border-b border-outline-variant/10 last:border-b-0 pb-4 last:pb-0 transition-all duration-300`}
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex justify-between items-center text-left py-4 focus:outline-none group"
                                aria-expanded={openIndex === index}
                            >
                                <h3 className={`text-lg md:text-xl font-headline font-bold pr-8 transition-colors ${openIndex === index ? 'text-[#904d00]' : 'text-primary-container dark:text-slate-200 group-hover:text-[#904d00]'}`}>
                                    {faq.q}
                                </h3>
                                <span className={`material-symbols-outlined shrink-0 transition-transform duration-300 text-outline-variant group-hover:text-[#904d00] ${openIndex === index ? 'rotate-180 text-[#904d00]' : ''}`}>
                                    expand_more
                                </span>
                            </button>
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="overflow-hidden">
                                    <p className="text-slate-700 dark:text-slate-300 font-body leading-relaxed pb-4">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to="/faq"
                        className="inline-flex items-center gap-2 bg-[#001f5b] hover:bg-[#000c2e] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#001f5b]/20"
                    >
                        {t('faq.readMore')}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FaqHome;
