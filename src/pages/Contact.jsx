import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';

const Contact = () => {
    const { t, lang } = useLanguage();
    usePageTitle(lang === 'id' ? 'Hubungi Kami' : 'Contact Us');

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        capacity: '',
        location: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    lang: lang || 'id'
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '', company: '', capacity: '', location: '', email: '', phone: '', message: ''
                });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
            console.error('Submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="pt-24">
            {/* Hero Section */}
            <section className="relative py-24 px-8 overflow-hidden bg-[linear-gradient(135deg,#000c2e_0%,#001f5b_100%)]">
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-white tracking-tighter max-w-3xl mb-6">
                        {t('contactPage.heroTitle')}
                    </h1>
                    <p className="text-on-primary-container text-lg md:text-xl font-body max-w-2xl opacity-90">
                        {t('contactPage.heroSub')}
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none hidden md:block">
                    <img alt="Technical blueprint lines and industrial machinery schematics"
                        className="w-full h-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuACevkjZk7yZIAwmZmumfgz06AAVsuXDrxGuG59nLxjRQ_01VP3iFbBmnDSfzheoc0Khkjx6RcfLuiX80ad8QTDEhgZAkv7ucKvGmtHrQBIb_6zPaoFI4pfgDvlh4A3GQ1gp8yuztfn8Oos0sCdC5U9K7GT4pLqbEvL63TNgbiH7jw7BmptTiUL7KeiQczx3qYO9gB_d3CP1Z83FpXYO2aA7am5FSFuGVmIjbAMn6I7dLKzXrCI_lbKUrDOlDZ0cltTyJd5Vl9eXP0" />
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 px-8 bg-surface">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Form */}
                    <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 shadow-sm rounded-sm">
                        <h2 className="text-3xl font-headline font-bold text-primary-container mb-8">{t('contactPage.formTitle')}</h2>

                        {submitStatus === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded flex items-start">
                                <span className="material-symbols-outlined mr-2 text-green-600">check_circle</span>
                                <div>
                                    <p className="font-bold">{t('contactPage.successTitle')}</p>
                                    <p className="text-sm">{t('contactPage.successDesc')}</p>
                                </div>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded flex items-start">
                                <span className="material-symbols-outlined mr-2 text-red-600">error</span>
                                <div>
                                    <p className="font-bold">{t('contactPage.errorTitle')}</p>
                                    <p className="text-sm">{t('contactPage.errorDesc')}</p>
                                </div>
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelName')} *</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none disabled:opacity-50" placeholder="Budi Santoso" type="text" disabled={isSubmitting} />
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelCompany')}</label>
                                    <input name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none disabled:opacity-50" placeholder="PT. Maju Pangan" type="text" disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelCapacity')}</label>
                                    <select name="capacity" value={formData.capacity} onChange={handleInputChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none appearance-none disabled:opacity-50" disabled={isSubmitting}>
                                        <option value="">{t('contactPage.selectCapacity')}</option>
                                        <option value="1-5 Ton/Hour">1-5 Ton/Hour</option>
                                        <option value="5-15 Ton/Hour">5-15 Ton/Hour</option>
                                        <option value="15+ Ton/Hour">15+ Ton/Hour</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelLocation')}</label>
                                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none disabled:opacity-50" placeholder={t('contactPage.placeholderLocation')} type="text" disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelEmail')} *</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none disabled:opacity-50" placeholder="name@company.com" type="email" disabled={isSubmitting} />
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelPhone')} *</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none disabled:opacity-50" placeholder="+62 812-XXXX-XXXX" type="tel" disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">{t('contactPage.labelMessage')} *</label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} required className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none resize-none disabled:opacity-50" placeholder={t('contactPage.messagePlaceholder')} rows={4} disabled={isSubmitting}></textarea>
                            </div>
                            <button disabled={isSubmitting} className="w-full bg-secondary-container text-on-secondary-container font-headline font-extrabold text-lg py-5 rounded-sm hover:bg-secondary transition-colors duration-300 shadow-lg tracking-tight uppercase disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" type="submit">
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-on-secondary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mengirim...
                                    </>
                                ) : (
                                    t('contactPage.submitBtn')
                                )}
                            </button>
                        </form>
                    </div>
                    {/* Right: Office Details */}
                    <div className="lg:col-span-5 space-y-12">
                        <div>
                            <h3 className="text-sm font-label font-bold text-secondary uppercase tracking-[0.2em] mb-6">{t('contactPage.hqLabel')}</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary-container mt-1">location_on</span>
                                    <div>
                                        <p className="font-headline font-bold text-lg text-primary-container">{t('contactPage.hqTitle')}</p>
                                        <p className="text-on-surface-variant font-body mt-1">Jl. Grompol - Jambangan, Gondang, Kedungjeruk, Kec. Mojogedang,<br />Kabupaten Karanganyar, Jawa Tengah</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary-container mt-1">call</span>
                                    <div>
                                        <p className="font-headline font-bold text-lg text-primary-container">{t('contactPage.waSupport')}</p>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            <a href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik,com.%20Halo%20Ateka%20Tehnik." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D366] hover:underline">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                +62 881-0806-34612
                                            </a>
                                            <a href="tel:+62881080634612" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-container hover:underline">
                                                <span className="material-symbols-outlined text-base">phone_in_talk</span>
                                                {t('contact.call')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary-container mt-1">mail</span>
                                    <div>
                                        <p className="font-headline font-bold text-lg text-primary-container">{t('contactPage.emailLabel')}</p>
                                        <a href="mailto:info@atekatehnik.com" className="text-on-surface-variant font-body mt-1 hover:text-secondary hover:underline transition-colors inline-block">info@atekatehnik.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface-container-low p-8 rounded-sm">
                            <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em] mb-4">{t('contactPage.exportTitle')}</h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                                {t('contactPage.exportDesc')}
                            </p>
                            <div className="flex gap-2">
                                <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Asia Pacific</span>
                                <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Africa</span>
                                <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Europe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-[500px] w-full bg-surface-container-high relative">
                <div className="absolute inset-0 bg-gray-200">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.5504884237557!2d110.97146737501566!3d-7.514770374144991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1bcc306b1955%3A0xdde6bfbc97d7a0e8!2sCV.%20ATEKA%20TEHNIK!5e0!3m2!1sid!2sid!4v1774846118049!5m2!1sid!2sid" className="w-full h-full border-0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div className="absolute inset-0 bg-primary-container/10 pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 bg-white p-6 shadow-xl max-w-sm">
                    <p className="font-headline font-extrabold text-primary-container text-xl">{t('contactPage.visitTitle')}</p>
                    <p className="text-sm text-on-surface-variant mt-2 font-body">{t('contactPage.visitDesc')}</p>
                </div>
            </section>
        </main>
    );
};

export default Contact;
