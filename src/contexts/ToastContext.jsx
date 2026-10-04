import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
          {toasts.map((toast) => {
            let bgColor, icon, textColor;
            switch (toast.type) {
              case 'success':
                bgColor = 'bg-green-50 border-green-200';
                textColor = 'text-green-800';
                icon = <span className="material-symbols-outlined text-green-500">check_circle</span>;
                break;
              case 'error':
                bgColor = 'bg-red-50 border-red-200';
                textColor = 'text-red-800';
                icon = <span className="material-symbols-outlined text-red-500">error</span>;
                break;
              case 'warning':
                bgColor = 'bg-amber-50 border-amber-200';
                textColor = 'text-amber-800';
                icon = <span className="material-symbols-outlined text-amber-500">warning</span>;
                break;
              default:
                bgColor = 'bg-blue-50 border-blue-200';
                textColor = 'text-blue-800';
                icon = <span className="material-symbols-outlined text-blue-500">info</span>;
            }

            return (
              <div
                key={toast.id}
                className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColor} ${textColor} animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto`}
              >
                <div className="shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 text-sm font-medium">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
