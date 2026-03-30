import React from 'react';
import { Link } from 'react-router-dom';

const Post = () => {
    return (
        <main className="max-w-[1440px] mx-auto pt-20"> {/* Added pt-20 to account for navbar */}
            {/* Hero Section */}
            <section className="relative h-[819px] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img alt="Rice Milling Machine" className="w-full h-full object-cover"
                        data-alt="Massive yellow industrial rice milling unit RMU inside a modern clean facility with polished concrete floors and high ceilings"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE-INfWyi8TEd-7HUr8iyg0-3HAJbdQPFydtf040Nji7BZzvBVi0acb4vKmEXPK3BUHDey0tn3spe2VnmrTzo_dXN7owuH6Bh5Oie34451GW8jHQTMTi9HsNaO62_Z8e2BVpk_ULIjqJfLRIJbV98Rdkf-ws3puHogguA0brOO09K4DXEggVps8kmqtdDFat-vYZAawW59AGuUF3tbHB-fbbEh5zmkkBowvuBLyQo1RzDt_ASoAjbf8gCwRk5p9Pt3_0gcVBNRzfc" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
                </div>
                <div className="relative z-10 w-full px-8 md:px-20 pb-16">
                    <div className="flex items-center space-x-4 mb-6">
                        <span
                            className="bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">Industrial
                            Installations</span>
                        <span className="text-white/70 text-sm font-medium tracking-wide">October 14, 2024</span>
                    </div>
                    <h1
                        className="text-white text-4xl md:text-7xl font-extrabold max-w-5xl leading-[1.1] tracking-tighter mb-4 font-headline">
                        Modernizing Agriculture: 5 Ton/Hr RMU Installation in Karawang
                    </h1>
                    <p className="text-white/80 text-lg md:text-2xl font-light max-w-3xl leading-relaxed">
                        A Case Study in Industrial Precision and National Food Security
                    </p>
                </div>
            </section>
            {/* Introduction & Overview */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-12 px-8 md:px-20 py-24 bg-surface">
                <div className="md:col-span-8">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-primary tracking-tight font-headline">Project Overview</h2>
                        <div className="prose prose-lg text-on-surface-variant leading-relaxed">
                            <p className="text-xl leading-relaxed font-light">
                                In the heart of Karawang's agricultural hub, Ateka Tehnik has successfully commissioned a
                                state-of-the-art Rice Milling Unit (RMU) with a 5-ton per hour capacity. This installation
                                represents a significant leap forward for local milling capabilities, focusing on maximizing
                                yield and minimizing broken grains through precision automation.
                            </p>
                            <p className="font-normal mt-4">
                                The client required a solution that could handle high-moisture paddy while maintaining
                                export-quality finish. Our team implemented a multi-stage Satake-integrated system that
                                features advanced hulling, whitening, and color sorting technologies. This project
                                underscores our commitment to strengthening the national food supply chain through
                                engineering excellence.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-4">
                    <div className="bg-surface-container-low p-8 rounded-sm space-y-6">
                        <h3 className="text-xs font-black tracking-[0.2em] text-secondary uppercase font-headline">Key Deliverables</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <span className="material-symbols-outlined text-secondary scale-90">check_circle</span>
                                <span className="text-sm font-medium text-on-surface">Integrated Control Panel Assembly</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="material-symbols-outlined text-secondary scale-90">check_circle</span>
                                <span className="text-sm font-medium text-on-surface">Custom Heavy-Duty Foundations</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="material-symbols-outlined text-secondary scale-90">check_circle</span>
                                <span className="text-sm font-medium text-on-surface">Automated Grain Flow Management</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="material-symbols-outlined text-secondary scale-90">check_circle</span>
                                <span className="text-sm font-medium text-on-surface">Precision Satake Alignment</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            {/* Technical Specification Blueprint */}
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
                        <div className="bg-primary py-10 pr-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">System
                                Throughput</span>
                            <div className="text-5xl font-black mb-2">5.0 <span
                                    className="text-xl font-medium opacity-50">T/Hr</span></div>
                            <p className="text-sm text-white/60">Optimized for Long Grain Paddy</p>
                        </div>
                        <div className="bg-primary py-10 px-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">Core
                                Technology</span>
                            <div className="text-3xl font-bold mb-2">SATAKE PREMIUM</div>
                            <p className="text-sm text-white/60">Japanese Precision Milling Technology</p>
                        </div>
                        <div className="bg-primary py-10 pl-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">Power
                                Consumption</span>
                            <div className="text-5xl font-black mb-2">75 <span className="text-xl font-medium opacity-50">kW</span>
                            </div>
                            <p className="text-sm text-white/60">High-Efficiency Electric Drives</p>
                        </div>
                        <div className="bg-primary py-10 pr-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">Automation
                                Level</span>
                            <div className="text-3xl font-bold mb-2">Level 4 PLC</div>
                            <p className="text-sm text-white/60">Full remote monitoring capability</p>
                        </div>
                        <div className="bg-primary py-10 px-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">Broken
                                Grain Rate</span>
                            <div className="text-5xl font-black mb-2">&lt; 3 <span
                                    className="text-xl font-medium opacity-50">%</span></div>
                            <p className="text-sm text-white/60">Industry-leading output quality</p>
                        </div>
                        <div className="bg-primary py-10 pl-8">
                            <span
                                className="text-secondary-container text-xs font-bold uppercase tracking-widest mb-2 block">Install
                                Duration</span>
                            <div className="text-5xl font-black mb-2">45 <span
                                    className="text-xl font-medium opacity-50">Days</span></div>
                            <p className="text-sm text-white/60">From foundation to commissioning</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Process Gallery: Bento Grid */}
            <section className="px-8 md:px-20 py-24 bg-surface-container-low">
                <h2 className="text-3xl font-bold text-primary mb-12 tracking-tight font-headline">Installation Phases</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[800px]">
                    <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
                        <img alt="Structural Assembly"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            data-alt="Industrial workers assembling heavy steel frames for a massive machine in a large warehouse with sparks from welding"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfxcTx7w1cA4SG4aiorCrKrmbXyXuVbLes-Gu_4k0XI1xCUhD1dkK1oAz5ZBENYk0UfPiMTLLxBfP0ADWlsxHZD9I5WrxAyerERpUmNI_q8OidwqDsToJ1PV2iUxZ88z-smV-v_rq-7oocXzIx_PXoxiNN7u9L9KWuEJ7KQRD8Y2HLAkcKw2GsFUMor9zw3d8bGN4wemvtGouZy0dw_4H3EllZsdVdPrZjAC7TUKBhLkEUYvc5RmJ_eSYwDXeMcwa5OvzZcjO_cZI" />
                        <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <span className="text-secondary-container font-bold text-xs uppercase tracking-widest">Phase
                                01</span>
                            <h4 className="text-white font-bold text-xl font-headline">Structural Foundation</h4>
                        </div>
                    </div>
                    <div className="md:col-span-2 relative group overflow-hidden">
                        <img alt="Component Calibration"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            data-alt="Close up of an engineer calibrating technical equipment with a laptop and digital sensor in an industrial setting"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh06b857LiNXRDX0LkdacauubJPqq-mC3pvmTNxZ9YukGOHSlBI3IFdA7hpOB2Ix-eV2665fm1pWoiudFTWlLY-a5y3hGg5m2ZQsVwyG7kDBEJVhY5_CT7BbWHznkF2xfVn4cIZqoWezp9ghGUq2hj3Km2p_MpnZ44tXKpL7cGSlGa5Atwb0h8HI4AWKPQH3VI6jBk0yVbDGufVSgJ9ljhnwRww6fcSEFKi_Uo_U5a6UoXfOTpFNF17-bEkmFj0krskskg9Fg5vYw" />
                        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <span className="text-secondary-container font-bold text-xs uppercase tracking-widest">Phase
                                02</span>
                            <h4 className="text-white font-bold text-lg font-headline">Component Precision Calibration</h4>
                        </div>
                    </div>
                    <div className="relative group overflow-hidden">
                        <img alt="Control Systems"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            data-alt="A brightly lit electrical control panel with many wires and switches inside an industrial machine unit"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJn2MsRbad6EqMnVINqNQOo919bZPtuadco2CcBtD3vueJlp278R75NQd6QL6pqw_zD-IF35GPpG4zhWsCN2063P7PoNunKBTIM1cbah_qNhcfqCMrAngicPRgk56g31SomsjplED40dGr40HNK9JuU9GgUrLKRIKvkZLuvGLHZYfHNu6RTJqTGSGXWrCKHsMwzZxb4qOndmAKvlqLIxh0l1Dyjt6eIbtB6b_yTbjMyNJykYk6lmgtCH1lf2v4ZqJOeTxnErAvBDw" />
                        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <span className="text-secondary-container font-bold text-xs uppercase tracking-widest">Phase
                                03</span>
                            <h4 className="text-white font-bold text-lg font-headline">Wiring &amp; Logic</h4>
                        </div>
                    </div>
                    <div className="relative group overflow-hidden">
                        <img alt="Final Testing"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            data-alt="A clean pile of white polished rice grains pouring from a metal industrial spout under bright light"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1DsiGvt3obOazr8zTGxLdkcjylm_l8FgU0hhUVggSoeUy8Gh-MFtg4Bwd2y2HwvadtvWL7Uk-hFwDKHcC20wAwEOTiXtb5ZXOU3RvXfeIiG6-FOLRW909D-f6koFTFKBSESUXl9F2ebcvehLIiDQ-rkiayPyIKLhWGeBosk5Zds-SHd26V2DT63mMM0ZXh41a-4I7BscMbCQ5jRXJtCKzaDI9m7tapr-Zj4sEa4Oh4pLEav9yBeyhrbdeKEetT3nYiwswn-3JC1k" />
                        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <span className="text-secondary-container font-bold text-xs uppercase tracking-widest">Phase
                                04</span>
                            <h4 className="text-white font-bold text-lg font-headline">Final Quality Test</h4>
                        </div>
                    </div>
                </div>
            </section>
            {/* Result & Impact */}
            <section className="px-8 md:px-20 py-24 flex flex-col md:flex-row items-center gap-16">
                <div className="w-full md:w-1/2">
                    <h2 className="text-4xl font-extrabold text-primary mb-8 tracking-tight font-headline">The Impact of Precision</h2>
                    <div className="space-y-6 text-on-surface-variant leading-relaxed text-lg">
                        <p>Post-installation metrics demonstrate a transformative shift in the facility's output. By
                            migrating from legacy systems to our 5 Ton/Hr RMU, the client achieved a remarkable <strong>22%
                                increase in total milling recovery</strong>.</p>
                        <div className="grid grid-cols-2 gap-8 py-4">
                            <div>
                                <div className="text-secondary text-3xl font-black">+20%</div>
                                <div className="text-xs uppercase tracking-widest font-bold">Purity Gain</div>
                            </div>
                            <div>
                                <div className="text-secondary text-3xl font-black">-15%</div>
                                <div className="text-xs uppercase tracking-widest font-bold">Waste Reduction</div>
                            </div>
                        </div>
                        <p>Moreover, the integration of automated dust collection systems improved the air quality within
                            the facility by 80%, ensuring a safer and more productive environment for the mill operators.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-square bg-surface-container-highest flex items-center justify-center p-12">
                        <div
                            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10">
                        </div>
                        <img alt="Industrial Tech" className="shadow-2xl z-10 w-full rounded-sm"
                            data-alt="Digital display on an industrial machine showing real-time data charts and green status indicators"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQpceALQYi4V8jnSlHkdz-fbwAcDUzHZUd0arjpt4AykVjuAvjsQEgry4Esx5cn_5mYoDDMmTbBBGmGRHw-SQQ4DbZk8EppTUh2jbWRUSvrM0e4jtkjjEYmE5Jlc3MuFEwqhV6mgIPvIsdqmgdCRIGv7joN3fjfJ3K4BUV1MR7kex_qbi0oDuWSSQTVoV0rIDvsPUwCPSsAe1aBiBFM7iZF1icDILJ92kSfnp6hwsHgAWcYfNaiiU2NLPxnHJPzZKeproqoPWAFBY" />
                        <div className="absolute -bottom-6 -left-6 bg-secondary-container p-8 z-20 hidden md:block">
                            <span className="material-symbols-outlined text-white text-4xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                        </div>
                    </div>
                </div>
            </section>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Related 1 */}
                    <Link to="/post" className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-secondary transition-all duration-500 flex flex-col text-left">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img alt="Silo System" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                data-alt="Row of massive stainless steel industrial storage silos under a clear blue sky"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBawnZtU44MwWmKh5QM8leOod6AwLYAb6kF_ZfPy6QDqV46quK38aZpIlrIbdjclN78w12WvGX4zccRHHFHK6X8eKruwSzU7B1uNmWFVDKWWTwCzNZukpnBTJgm8bi2NzKvCpygvDSemvuInPC9vOWBe-xAC_OYqgd-hQTBcEsjgtl5dAQA2w1qwA2-KWXxAEfOa_o8DfYq07FPNjxGIEj5pEPXqV7o_iQvkUfigeR5N3F2XYKhY9O_JQFwwK7f0eRut2QU7juNBCQ" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">Storage Solutions</span>
                                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Aug 12, 2024</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-primary mb-2 line-clamp-2">10,000 Ton Silo Complex, Lampung</h3>
                            <p className="text-xs font-label text-on-surface-variant font-medium mb-4 line-clamp-2">Complete automated storage and aeration system for large-scale grain preservation.</p>
                            <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2 text-on-surface-variant text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span><span className="truncate">Lampung</span>
                            </div>
                        </div>
                    </Link>
                    {/* Related 2 */}
                    <Link to="/post" className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-secondary transition-all duration-500 flex flex-col text-left">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img alt="Factory Interior" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                data-alt="Large-scale automated conveyor system in a modern food processing factory with yellow accents"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqQNt8tpWgk29nVeETwImfbWrYBqxDZoK5N94sH16E9HOnyOlpB4KqyaxR58HkJM2x5OaIPlIa3d3HXMHYuxX_-mKXemaKQJ8DSo-UinEtQpM4LpeL1mBvqYsMocp8ZWPae08bIHBXgp5b6vcmhQZ1MQ4wpG7PyOhd_yGX61LtXNWvSy1zAAJ1tw4LhbYBlPUDO2ddISDG_6vvNVEdvRShSYw3imXcshrf_Tl_c1NbxkDw913VLbOmlr-fWO7K6Tb8BYxCuvYMY-8" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-primary-container text-on-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">Automation</span>
                                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Aug 28, 2024</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-primary mb-2 line-clamp-2">Conveyor Integration, Medan</h3>
                            <p className="text-xs font-label text-on-surface-variant font-medium mb-4 line-clamp-2">High-speed distribution line reducing manual handling by 65%.</p>
                            <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2 text-on-surface-variant text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span><span className="truncate">Medan</span>
                            </div>
                        </div>
                    </Link>
                    {/* Related 3 */}
                    <Link to="/post" className="group bg-surface-container-lowest rounded-sm overflow-hidden border border-outline-variant/20 hover:shadow-xl hover:border-secondary transition-all duration-500 flex flex-col text-left">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img alt="Sorting Machine" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                data-alt="Interior of a high-tech grain sorting machine with multiple chutes and optical sensors"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsDK1RMm9ML5u7f62pkbDEfMq-KIQ5QA0Zk5jspJeuCrfZMXEPwtL0zDaFUbf-2xqlrPnGmYDuDtYJ7RqaP171L8o6eht241IDypp6BF8ZdRY5PkFbqkeG4SLPzGMAvzKUbIFOd_WLkHMDQsxdcQuDK_AziBzmmUZeHcY6hS9fR25EaFZlvb_G8LX9o0JjginjDXkigzXc4WPkbl0dpwRepSc94q2v6MNhrnI3rOlrzu3LamvZD9KGfbn5_TCrQePLWf043NiL0vc" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter truncate max-w-[60%]">Precision Sorting</span>
                                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Sep 10, 2024</span>
                            </div>
                            <h3 className="font-headline font-bold text-lg text-primary mb-2 line-clamp-2">Color Sorter Upgrade, Subang</h3>
                            <p className="text-xs font-label text-on-surface-variant font-medium mb-4 line-clamp-2">Retrofitting existing lines with AI-powered impurity detection.</p>
                            <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2 text-on-surface-variant text-sm">
                                <span className="material-symbols-outlined text-sm">location_on</span><span className="truncate">Subang</span>
                            </div>
                        </div>
                    </Link>
                </div>
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
