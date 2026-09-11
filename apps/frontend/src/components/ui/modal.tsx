'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size = 'md',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const effectiveWidth = maxWidth || size;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ type: 'spring', duration: 0.25, damping: 25 }}
            className={`relative w-full ${maxWidthClasses[effectiveWidth]} bg-popover border border-border rounded-t-2xl sm:rounded-md shadow-2xl overflow-hidden z-10 max-h-[92dvh] sm:max-h-[90vh] flex flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-0`}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2.5 sm:hidden" />

            {(title || description) && (
              <div className="p-3.5 sm:p-4 border-b border-border/80 flex items-start justify-between shrink-0">
                <div className="pr-2">
                  {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
                  {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                  title="Close Dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="p-3.5 sm:p-5 overflow-y-auto touch-scroll">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}

