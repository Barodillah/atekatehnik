import React from 'react';

const DashboardHome = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h2>
          <p className="text-on-surface-variant font-body">Operational performance and lead distribution metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface-container-highest text-primary text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-outline-variant transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-primary-container text-on-primary text-xs font-bold uppercase tracking-widest rounded-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Total Leads</span>
            <div className="p-2 bg-secondary-fixed text-on-secondary-fixed rounded-sm">
              <span className="material-symbols-outlined">person_search</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">1,284</h3>
            <p className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +12.5% from last month
            </p>
          </div>
        </div>
        {/* Active Projects */}
        <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Active Projects</span>
            <div className="p-2 bg-primary-fixed text-on-primary-fixed rounded-sm">
              <span className="material-symbols-outlined">precision_manufacturing</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">42</h3>
            <p className="text-xs text-primary-container/60 font-medium mt-1">8 completion due this week</p>
          </div>
        </div>
        {/* Product Sales */}
        <div className="bg-primary-container p-6 flex flex-col justify-between h-40 text-on-primary group transition-all hover:shadow-xl hover:shadow-primary/20">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-on-primary/60 uppercase tracking-widest">Units Sold</span>
            <div className="p-2 bg-secondary-container text-on-secondary-container rounded-sm">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold tracking-tighter">312</h3>
            <p className="text-xs text-secondary-container font-medium mt-1">Ateka Milling Machine Gen 4</p>
          </div>
        </div>
        {/* Conversion Rate */}
        <div className="bg-surface-container-lowest p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Efficiency</span>
            <div className="p-2 bg-surface-container-highest text-primary rounded-sm">
              <span className="material-symbols-outlined">insights</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">88%</h3>
            <p className="text-xs text-error font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_down</span> -2% system latency
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Acquisition Chart */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-lg p-8">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary-container"></span>
              Monthly Lead Acquisition
            </h4>
            <div className="flex gap-4 text-[10px] font-label font-bold text-outline">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-primary-container rounded-full"></span> QUALIFIED</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary-container rounded-full"></span> RAW</span>
            </div>
          </div>
          {/* Simplified Bar Chart CSS Layout */}
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "45%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "65%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase">Jan</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "55%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "75%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase">Feb</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "85%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "95%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase text-primary font-bold">Mar</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "40%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "60%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase">Apr</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "65%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "80%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase">May</span>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-surface-container-highest relative flex items-end">
                <div className="w-full bg-primary-container rounded-t-sm" style={{ height: "75%" }}></div>
                <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm" style={{ height: "90%" }}></div>
              </div>
              <span className="text-[10px] font-label text-outline uppercase">Jun</span>
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <div className="bg-surface-container-low rounded-lg p-6 flex flex-col">
          <h4 className="text-lg font-bold text-primary mb-6">Recent Activity</h4>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {/* Activity Item */}
            <div className="flex gap-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-secondary-fixed rounded-full flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <span className="material-symbols-outlined text-xl">contact_page</span>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/30 group-last:hidden"></div>
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-primary">New Lead: PT. Sawah Makmur</p>
                <p className="text-xs text-on-surface-variant mt-1">Rice Mill inquiry - Gen 4 machinery spec requested.</p>
                <span className="text-[10px] text-outline font-label uppercase mt-2 block">2 Minutes Ago</span>
              </div>
            </div>
            {/* Activity Item */}
            <div className="flex gap-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center text-on-primary-fixed shrink-0">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/30 group-last:hidden"></div>
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-primary">Project Completed</p>
                <p className="text-xs text-on-surface-variant mt-1">Installation at Medan Facility finalized.</p>
                <span className="text-[10px] text-outline font-label uppercase mt-2 block">1 Hour Ago</span>
              </div>
            </div>
            {/* Activity Item */}
            <div className="flex gap-4 group">
              <div className="relative">
                <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-xl">edit_square</span>
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/30 group-last:hidden"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Blog Published</p>
                <p className="text-xs text-on-surface-variant mt-1">"Efficiency in Modern Rice Processing"</p>
                <span className="text-[10px] text-outline font-label uppercase mt-2 block">Yesterday</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 text-xs font-bold text-primary-container hover:text-secondary transition-colors uppercase tracking-widest text-center border-t border-outline-variant/20 pt-4">
            View All Activity
          </button>
        </div>
      </div>

      {/* Featured Product Slot */}
      <div className="bg-primary-container relative overflow-hidden rounded-lg min-h-[400px] flex items-center">
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-20 pointer-events-none">
          <img
            alt="Technical Drawing Background"
            className="w-full h-full object-cover mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtdNy3OfX3zStgDUwt4bpJcTpGNWnZwmB9phP5I66C8r9h4VBljrltVc15z4xcn1sqhGwGI6B093nqVfMSR58xe-XXUorwf5Y65VCgzoddmoCYA08AMX1F9-jdXzPDaSjmcgrswzpxld2CAjhIWUc-n4cDALMaFP-2uSosy95mIQ6gxzydYHAwTPAnmRoIVVOJ7FJgw_wji1siBrDxtdiwe7JvwFVk3Oc13tWGBVR0RkShqHIFrV5vdwhvfofdkdjoRh1EINIdD94"
          />
        </div>
        <div className="relative z-10 p-12 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
            Product Spotlight
          </div>
          <h2 className="text-5xl font-headline font-extrabold text-white tracking-tighter leading-tight">
            Ateka Milling <br /> <span className="text-secondary-container">Generation 4</span>
          </h2>
          <p className="text-on-primary-container/80 text-lg leading-relaxed">
            Setting a new benchmark in efficiency with 99.8% precision husking and integrated IoT monitoring.
          </p>
          <div className="flex gap-8 pt-4">
            <div className="space-y-1">
              <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Efficiency</span>
              <p className="text-xl font-bold text-white">+15.2%</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Leads Generated</span>
              <p className="text-xl font-bold text-white">412</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Status</span>
              <p className="text-xl font-bold text-secondary-container">High Demand</p>
            </div>
          </div>
          <button className="bg-white text-primary px-8 py-3 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-secondary-container hover:text-white transition-all transform hover:-translate-y-1">
            View Product Analytics
          </button>
        </div>
        <div className="absolute top-20 right-40 z-20 space-y-20 hidden xl:block">
          <div className="bg-surface-container-lowest/10 backdrop-blur-md border border-white/20 p-3 rounded-sm flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 bg-secondary-container rounded-full"></div>
            <span className="text-[10px] font-label text-white uppercase tracking-tighter">Optical Sensors Ready</span>
          </div>
          <div className="bg-surface-container-lowest/10 backdrop-blur-md border border-white/20 p-3 rounded-sm flex items-center gap-3 translate-x-12">
            <div className="w-2 h-2 bg-secondary-container rounded-full"></div>
            <span className="text-[10px] font-label text-white uppercase tracking-tighter">Steel Alloy Integrity: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
