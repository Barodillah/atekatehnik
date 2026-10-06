import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dbStatus, setDbStatus] = useState('checking'); // 'checking', 'online', 'error'
  const [activeDb, setActiveDb] = useState('');
  const [dbErrorDetail, setDbErrorDetail] = useState('');
  const [primaryError, setPrimaryError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  const images = [
    "https://atekatehnik.com/wp-content/uploads/herobarukecil_1.jpeg",
    "https://atekatehnik.com/wp-content/uploads/herobarukecil_2.jpeg",
    "https://atekatehnik.com/wp-content/uploads/hero_size_kecil.jpeg",
    "https://atekatehnik.com/wp-content/uploads/hero_baru_kecil_lagi_4.jpg",
    "https://atekatehnik.com/wp-content/uploads/hero_baru_kecil_lagi_3.jpeg",
    "https://atekatehnik.com/wp-content/uploads/hero_baru_kecil_lagi_5.jpg",
    "https://atekatehnik.com/wp/uploads/asset_6ac365b8c6fa36.79078384.png"
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/db_status.php');
        const data = await res.json();
        if (data.status === 'connected') {
          setDbStatus('online');
          setActiveDb(data.active_db);
          if (data.active_db === 'fallback') {
            setPrimaryError(data.primary_error || 'Unknown Error');
          }
        } else {
          setDbStatus('error');
          setDbErrorDetail(data.error_detail || 'Unknown error from server');
        }
      } catch (err) {
        setDbStatus('error');
        setDbErrorDetail(err.message || 'Fetch failed');
      }
    };
    checkDb();
  }, []);

  const handleDbClick = () => {
    if (dbStatus === 'error' || (dbStatus === 'online' && activeDb === 'fallback')) {
      setIsPinModalOpen(true);
      setPinInput('');
      setPinError('');
      setShowErrorDetail(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2098') {
      setShowErrorDetail(true);
      setPinError('');
    } else {
      setPinError('PIN Salah.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Login gagal. Periksa kembali kredensial Anda.');
      }
    } catch (err) {
      setError('Koneksi ke server gagal. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-body selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Fullscreen Background Slider */}
      {images.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src={img}
            alt="Ateka Tehnik Factory"
            className="w-full h-full object-cover"
          />
          {/* Light Overlay for better contrast */}
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
        </div>
      ))}

      <div className="w-full max-w-md bg-white shadow-2xl z-10 rounded-sm overflow-hidden flex flex-col mx-4">
        {/* Header Block */}
        <div className="bg-blue-950 px-10 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtdNy3OfX3zStgDUwt4bpJcTpGNWnZwmB9phP5I66C8r9h4VBljrltVc15z4xcn1sqhGwGI6B093nqVfMSR58xe-XXUorwf5Y65VCgzoddmoCYA08AMX1F9-jdXzPDaSjmcgrswzpxld2CAjhIWUc-n4cDALMaFP-2uSosy95mIQ6gxzydYHAwTPAnmRoIVVOJ7FJgw_wji1siBrDxtdiwe7JvwFVk3Oc13tWGBVR0RkShqHIFrV5vdwhvfofdkdjoRh1EINIdD94"
              alt="Blueprint"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>

          <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-sm shadow-lg mb-6 relative z-10">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tighter uppercase font-headline relative z-10">Industrial Admin</h1>
          <p className="text-[10px] text-orange-400 font-medium tracking-widest uppercase mt-2 relative z-10">Ateka Tehnik Command Center</p>
        </div>

        {/* Login Form */}
        <div className="px-10 py-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Administrator ID</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@atekatehnik.com"
                  className="w-full bg-surface-container-low border-none rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all text-primary font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Security Pin</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border-none rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all text-primary font-semibold font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3.5 mt-4 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Memverifikasi...
                </>
              ) : (
                <>
                  Autentikasi Sistem
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low py-4 px-6 border-t border-outline-variant/10 flex justify-between items-center">
          <p className="text-[10px] font-bold font-label uppercase text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Secure 256-bit AES
          </p>
          <div
            onClick={handleDbClick}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border transition-colors ${
              dbStatus === 'checking' ? 'border-slate-200 text-slate-500 bg-slate-50' :
              dbStatus === 'online' ? (activeDb === 'fallback' ? 'border-amber-200 text-amber-700 bg-amber-50 cursor-pointer hover:bg-amber-100' : 'border-green-200 text-green-700 bg-green-50') :
              'border-red-200 text-red-700 bg-red-50 cursor-pointer hover:bg-red-100'
            }`}
            title={dbStatus === 'error' ? 'Klik untuk diagnosa' : (activeDb === 'fallback' ? 'Klik untuk melihat detail fallback' : 'Status Database')}
          >
            <span className={`w-2 h-2 rounded-full ${
              dbStatus === 'checking' ? 'bg-slate-400 animate-pulse' :
              dbStatus === 'online' ? (activeDb === 'fallback' ? 'bg-amber-500' : 'bg-green-500') :
              'bg-red-500 animate-pulse'
            }`}></span>
            {dbStatus === 'checking' ? 'Checking DB' : dbStatus === 'online' ? (activeDb === 'fallback' ? 'DB CADANGAN' : 'DB UTAMA') : 'DB Offline'}
          </div>
        </div>
      </div>

      {/* PIN Diagnostic Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsPinModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            {!showErrorDetail ? (
              <form onSubmit={handlePinSubmit}>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Diagnostic Akses</h3>
                <p className="text-sm text-slate-500 mb-4">Masukkan akses untuk melihat detail error database.</p>

                {pinError && (
                  <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs font-bold rounded-sm border border-red-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {pinError}
                  </div>
                )}

                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
                  maxLength={4}
                  autoFocus
                />

                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsPinModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-sm text-sm font-bold hover:bg-slate-200 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-sm text-sm font-bold hover:bg-blue-800 transition-colors">Verifikasi</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${dbStatus === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                    <span className="material-symbols-outlined">warning</span>
                    {dbStatus === 'error' ? 'Database Error' : 'Database Cadangan Aktif'}
                  </h3>
                  <button onClick={() => setIsPinModalOpen(false)} className="text-slate-400 hover:text-slate-700"><span className="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-sm overflow-x-auto whitespace-pre-wrap">
                  {dbStatus === 'error' ? dbErrorDetail : `Primary Database Error:\n${primaryError}`}
                </div>
                <button onClick={() => setIsPinModalOpen(false)} className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-sm text-sm font-bold hover:bg-slate-200 transition-colors">Tutup</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
