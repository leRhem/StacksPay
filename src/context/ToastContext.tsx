import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../components/Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.showToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, action, duration = 5000 }: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, action, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-right
                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-200' : ''}
                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : ''}
                ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  {toast.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  {toast.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                  {toast.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{toast.title}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{toast.message}</p>
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="mt-2 text-xs font-bold underline hover:opacity-80"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Icons.X />
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
