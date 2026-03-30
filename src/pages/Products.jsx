import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
    const { t } = useLanguage();
    return (
        <>
            {/* Hero Section */}
            <header className="pt-32 pb-24 px-8 bg-[linear-gradient(135deg,#000c2e_0%,#001f5b_100%)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img alt="Industrial Blueprint" className="w-full h-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuACevkjZk7yZIAwmZmumfgz06AAVsuXDrxGuG59nLxjRQ_01VP3iFbBmnDSfzheoc0Khkjx6RcfLuiX80ad8QTDEhgZAkv7ucKvGmtHrQBIb_6zPaoFI4pfgDvlh4A3GQ1gp8yuztfn8Oos0sCdC5U9K7GT4pLqbEvL63TNgbiH7jw7BmptTiUL7KeiQczx3qYO9gB_d3CP1Z83FpXYO2aA7am5FSFuGVmIjbAMn6I7dLKzXrCI_lbKUrDOlDZ0cltTyJd5Vl9eXP0" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-secondary-container font-label text-sm uppercase tracking-[0.2em] mb-4 block">{t('products.badge')}</span>
                    <h1 className="text-white font-headline text-5xl md:text-7xl font-extrabold tracking-tighter max-w-3xl leading-[1.1]">
                        {t('products.heroTitle')}
                    </h1>
                    <p className="text-on-primary-container mt-6 max-w-xl text-lg leading-relaxed">
                        {t('products.heroSub')}
                    </p>
                </div>
            </header>

            {/* Category Selector */}
            <section className="bg-surface-container-low py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
                    <button className="bg-primary-container text-white px-8 py-3 rounded-sm font-headline font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">settings_input_component</span>
                        {t('products.catRMU')}
                    </button>
                    <button className="bg-surface-container-highest text-primary-container px-8 py-3 rounded-sm font-headline font-bold flex items-center gap-2 hover:bg-secondary-fixed transition-colors">
                        <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                        {t('products.catComponents')}
                    </button>
                    <button className="bg-surface-container-highest text-primary-container px-8 py-3 rounded-sm font-headline font-bold flex items-center gap-2 hover:bg-secondary-fixed transition-colors">
                        <span className="material-symbols-outlined text-sm">build</span>
                        {t('products.catSupport')}
                    </button>
                </div>
            </section>

            {/* Product Grid */}
            <main className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Card 1 */}
                    <div className="bg-surface-container-lowest group flex flex-col">
                        <div className="relative h-80 overflow-hidden">
                            <img alt="RMU Industri Menengah" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7kGv6387DtPvE3BbF8ekC7enYusDtIBYZfd-FQNiXMXQIbXgU46D9A_TaAVGj6fFXx1S-nTL0EzdJKCt1uehtYRGSqPTUokRsrOeCgOzJEeffob5G2mSnaq7I7XNLmQXWuOCIgkL0u7urXumsVICdfYVDFqYoNLPfOrPTSNnIqXuuMfqGtbOzucGZCumV6qPNuFJMGbv4WlKyrsyhGF_sHhAhgPmFHmCczldtmmY5vCx_IK2XzW78HTcNjg7tn_gwxDfq23bqJb4" />
                            <div className="absolute top-4 left-4"><span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">Premium Selection</span></div>
                        </div>
                        <div className="p-8 flex-grow flex flex-col">
                            <h3 className="font-headline text-2xl font-extrabold text-primary-container mb-6">RMU Industri Menengah</h3>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Kapasitas</span><span className="text-primary-container font-bold">1,5 - 2,0 Ton/Jam</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Power</span><span className="text-primary-container font-bold">Diesel 40 HP</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Dimensi</span><span className="text-primary-container font-bold">4500 x 2200 x 3100</span></div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button className="bg-primary-container text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-primary transition-colors">{t('products.inquire')}</button>
                                <button className="text-secondary font-headline font-bold text-sm flex items-center justify-center gap-2 hover:underline"><span className="material-symbols-outlined text-sm">download</span>{t('products.downloadSpec')}</button>
                            </div>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-surface-container-lowest group flex flex-col">
                        <div className="relative h-80 overflow-hidden">
                            <img alt="RMU Premium" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt5wy0SC04xwE8r-CLgGN0p4sObSZymo2yWTJgSikEXaF6PrUYUP5f-U4rtGQrSLYNNHHweqGg03Hjdca1huMh4I-A5bIV0mjNgAfKWuc92fXKWqqB_Ke8qNv0O5Q5ct-TsklrFmrdk2UQf-ZGORhupvTAZFniy8ngXDyRB26J-duZL4TviotMvMsRi16wMzE3E9Yp5APPdw8Jgvf4x2Rs6511zjtlVeM1TiRDXVCXRe8IpwWPDBrxPTKJePjJyAHYXgmao5GWphc" />
                        </div>
                        <div className="p-8 flex-grow flex flex-col">
                            <h3 className="font-headline text-2xl font-extrabold text-primary-container mb-6">RMU High-End Premium</h3>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Kapasitas</span><span className="text-primary-container font-bold">3,5 - 5,0 Ton/Jam</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Power</span><span className="text-primary-container font-bold">Electric 75 kW</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Dimensi</span><span className="text-primary-container font-bold">8500 x 4000 x 5500</span></div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button className="bg-primary-container text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-primary transition-colors">{t('products.inquire')}</button>
                                <button className="text-secondary font-headline font-bold text-sm flex items-center justify-center gap-2 hover:underline"><span className="material-symbols-outlined text-sm">download</span>{t('products.downloadSpec')}</button>
                            </div>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-surface-container-lowest group flex flex-col">
                        <div className="relative h-80 overflow-hidden">
                            <img alt="Mobile RMU" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXNGa6-b9O7Tms5Y_ysWilJX4LwqtLYUo94yf3ahYLxG_mzB4DVi9-opya88zcVTv1GYRWdypnAaNWhS_N7Jx0i9U7Vrzm_fQaYDzwgsMJ5-TXlIf8HiRIM2TQQmaWhHw_t9rekYoiPiqt5eYsjeQbmvoAltOYc2XpMBGh-yc5ssSV-7E3pOFC_1061rcSddYQXw-Zn9Q9EL1xVdJqwiBOGVDbltaVPA_R65uzDhw_ECoElmbCLzDZpf2m5o6qnx0xgSUiP72pHSM" />
                            <div className="absolute top-4 left-4"><span className="bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">Mobile Solution</span></div>
                        </div>
                        <div className="p-8 flex-grow flex flex-col">
                            <h3 className="font-headline text-2xl font-extrabold text-primary-container mb-6">RMU Mobile Traktor</h3>
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Kapasitas</span><span className="text-primary-container font-bold">0,8 - 1,2 Ton/Jam</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Power</span><span className="text-primary-container font-bold">PTO / Diesel 24 HP</span></div>
                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/20"><span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Dimensi</span><span className="text-primary-container font-bold">3200 x 1800 x 2400</span></div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button className="bg-primary-container text-white py-3 font-headline font-bold text-sm tracking-tight hover:bg-primary transition-colors">{t('products.inquire')}</button>
                                <button className="text-secondary font-headline font-bold text-sm flex items-center justify-center gap-2 hover:underline"><span className="material-symbols-outlined text-sm">download</span>{t('products.downloadSpec')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Comparison Table */}
            <section className="bg-surface-container-low py-24 px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-headline text-4xl font-extrabold text-primary-container mb-12 text-center">{t('products.compareTitle')}</h2>
                    <div className="overflow-x-auto shadow-sm rounded-sm overflow-hidden">
                        <table className="w-full text-left bg-white border-collapse">
                            <thead>
                                <tr className="bg-primary-container text-white font-headline">
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thFeature')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thStandard')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thBusiness')}</th>
                                    <th className="p-6 font-bold uppercase tracking-wider text-xs">{t('products.thPremium')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-body">
                                <tr className="bg-surface border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Pre-Cleaner Stage</td><td className="p-6">Single Screen</td><td className="p-6">Dual Screen Vibratory</td><td className="p-6">Full Magnetic Destoner</td></tr>
                                <tr className="bg-white border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Milling Recovery</td><td className="p-6">62% - 64%</td><td className="p-6">65% - 68%</td><td className="p-6">69% - 71%</td></tr>
                                <tr className="bg-surface border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Polishing Type</td><td className="p-6">Friction Polisher</td><td className="p-6">Single Mist Polisher</td><td className="p-6">Dual Silky Polisher</td></tr>
                                <tr className="bg-white border-b border-outline-variant/10"><td className="p-6 font-semibold text-primary-container">Automation Level</td><td className="p-6">Manual Lever</td><td className="p-6">Semi-Auto PLC</td><td className="p-6">Full Digital Control Center</td></tr>
                                <tr className="bg-surface"><td className="p-6 font-semibold text-primary-container">Warranty Period</td><td className="p-6">12 Months</td><td className="p-6">24 Months</td><td className="p-6">36 Months + On-Site</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Support Bento Grid */}
            <section className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
                    <div className="md:col-span-2 md:row-span-2 bg-primary-container p-12 flex flex-col justify-end relative overflow-hidden group">
                        <img alt="Spare Parts" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2csb2bBc5wmPyeG-HeD-gTXq8JaQMqx_CEuBWfeRZiqj3nQItX4XE2AL4K-TFKTdTjUgCGnO_aia2qj4Xr-4tWxHQjeg_oQMGq1mj3Om3hmEcrcRoZElJgiAtJMBDt13YZsyvZFxhNmhLNnhSVfVFLZiy5P7SznBwTRfAgQS9LHVnbJ8xz7vO3GAG_KYqfJnlw2NBRiDIaQxTA9r0pP5P7YxnJ9OJu6GhYAjXoL7lbqjBkUsgL1BHo67lMjyviKrrxB4vn8-Wq94" />
                        <div className="relative z-10">
                            <h3 className="text-white font-headline text-3xl font-extrabold mb-4">{t('products.spareParts')}</h3>
                            <p className="text-on-primary-container mb-6 max-w-sm">{t('products.spareDesc')}</p>
                            <button className="bg-secondary-container text-on-secondary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-xs">{t('products.catalogDownload')}</button>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-surface-container-high p-8 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-4">support_agent</span>
                        <h4 className="font-headline text-xl font-bold text-primary-container mb-2">{t('products.support247')}</h4>
                        <p className="text-on-surface-variant text-sm">{t('products.supportDesc')}</p>
                    </div>
                    <div className="md:col-span-1 bg-white p-8 border border-outline-variant/20 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-secondary text-4xl mb-4">verified</span>
                        <h4 className="font-headline text-lg font-bold text-primary-container mb-2">{t('products.isoCertified')}</h4>
                        <p className="text-on-surface-variant text-xs">{t('products.isoDesc')}</p>
                    </div>
                    <div className="md:col-span-1 bg-secondary-fixed p-8 flex flex-col justify-center">
                        <span className="material-symbols-outlined text-on-secondary-fixed text-4xl mb-4">language</span>
                        <h4 className="font-headline text-lg font-bold text-on-secondary-fixed mb-2">{t('products.globalExport')}</h4>
                        <p className="text-on-secondary-fixed-variant text-xs">{t('products.globalDesc')}</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;
