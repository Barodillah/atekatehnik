import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden font-body selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-950/5 skew-x-12 translate-x-32 hidden md:block"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white shadow-2xl z-10 rounded-sm overflow-hidden flex flex-col">
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
        <div className="bg-surface-container-low py-4 text-center border-t border-outline-variant/10">
          <p className="text-[10px] font-bold font-label uppercase text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Secure Environment 256-bit AES
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
