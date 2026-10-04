import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: 'Konfirmasi',
    type: 'danger', // 'danger' | 'warning' | 'info'
    resolve: null,
  });

  const confirmDialog = useCallback((message, title = 'Konfirmasi', type = 'danger') => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title,
        type,
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirmDialog }}>
      {children}
      {confirmState.isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm transition-opacity" 
            onClick={() => handleClose(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {confirmState.type === 'danger' && (
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                  </div>
                )}
                {confirmState.type === 'warning' && (
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">info</span>
                  </div>
                )}
                {confirmState.type === 'info' && (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">help</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{confirmState.title}</h3>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {confirmState.message}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm cursor-pointer ${
                    confirmState.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmState.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};
