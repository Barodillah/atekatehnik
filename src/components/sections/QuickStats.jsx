import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const AnimatedCounter = ({ end, duration = 2000, suffix = '', isFloat = false }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress); // easeOut
            const currentVal = easeProgress * end;
            
            setCount(isFloat ? currentVal : Math.floor(currentVal));
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [isVisible, end, duration, isFloat]);

    return (
        <span ref={countRef}>
            {isFloat ? count.toFixed(1) : count}{suffix}
        </span>
    );
};

const QuickStats = () => {
    const { t, lang } = useLanguage();

    return (
        <section className="bg-surface relative py-12 md:py-16 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 w-full">
                <div className="bg-white/80 backdrop-blur-md border border-outline-variant/30 rounded-sm shadow-sm p-4 md:p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
                        <div className="flex flex-col items-center justify-start p-2 md:p-4">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-secondary mb-1 md:mb-2">
                                <AnimatedCounter end={20} suffix="+" />
                            </div>
                            <div className="text-xs md:text-sm font-label uppercase tracking-widest text-outline leading-tight">{t('about.statYears')}</div>
                        </div>
                        <div className="flex flex-col items-center justify-start p-2 md:p-4">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-secondary mb-1 md:mb-2">
                                <AnimatedCounter end={500} suffix="+" />
                            </div>
                            <div className="text-xs md:text-sm font-label uppercase tracking-widest text-outline leading-tight">{lang === 'id' ? 'Pelanggan' : 'Customers'}</div>
                        </div>
                        <div className="flex flex-col items-center justify-start p-2 md:p-4">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-secondary mb-1 md:mb-2 flex items-center justify-center">
                                <AnimatedCounter end={1.8} suffix="k+" isFloat={true} />
                            </div>
                            <div className="text-xs md:text-sm font-label uppercase tracking-widest text-outline leading-tight">{lang === 'id' ? 'Proyek & Produk Terjual' : 'Projects & Products Sold'}</div>
                        </div>
                        <div className="flex flex-col items-center justify-start p-2 md:p-4">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-secondary mb-1 md:mb-2">
                                <AnimatedCounter end={34} />
                            </div>
                            <div className="text-xs md:text-sm font-label uppercase tracking-widest text-outline leading-tight">{t('about.statProvinces')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuickStats;
