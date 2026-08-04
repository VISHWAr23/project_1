'use client';

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const defaultToastContext: ToastContextType = {
  toast: () => {},
  removeToast: () => {},
};

const ToastContext = createContext<ToastContextType>(defaultToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-[#3ECF8E]" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    error: <AlertCircle className="h-4 w-4 text-rose-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="pointer-events-auto flex items-start justify-between p-3.5 rounded-lg bg-popover border border-border shadow-xl text-foreground text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{icons[t.type]}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{t.title}</h4>
                  {t.description && <p className="text-muted-foreground text-[11px] mt-0.5">{t.description}</p>}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors ml-2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
