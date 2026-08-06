'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, Send, Package, Sparkles, Building2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  fullDetails: string;
  features: string[];
  specs: { label: string; value: string }[];
  packaging: string;
  minOrder: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
}

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote: (productName: string) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onOpenQuote }: ProductDetailModalProps) {
  const { toast } = useToast();
  const [inquirerName, setInquirerName] = useState('');
  const [inquirerPhone, setInquirerPhone] = useState('');
  const [inquirerEmail, setInquirerEmail] = useState('');
  const [inquirerMsg, setInquirerMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast(
        'Enquiry Received!',
        `Thank you ${inquirerName || 'Valued Customer'}. Our surgical sales team will contact you shortly regarding ${product.name}.`,
        'success'
      );
      setInquirerName('');
      setInquirerPhone('');
      setInquirerEmail('');
      setInquirerMsg('');
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden my-8"
        >
          {/* Top Bar Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-black flex items-center gap-1 font-semibold">
                    <Sparkles className="h-3 w-3" /> {product.badge}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{product.name}</h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Shri Lathikka Surgicals • Rajapalayam Quality Certified
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Overview & Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#2563EB]" /> Product Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.fullDetails}
                </p>

                {/* Key Product Features */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Key Advantages & Standards
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-foreground bg-secondary/40 p-2 rounded-md border border-border/50">
                        <CheckCircle2 className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Specs Column */}
              <div className="bg-secondary/30 p-4 rounded-lg border border-border space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB]" /> Technical Specs
                </h4>

                <div className="space-y-2 text-xs">
                  {product.specs.map((sp, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">{sp.label}</span>
                      <span className="font-semibold text-foreground text-right">{sp.value}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Packaging</span>
                    <span className="font-semibold text-foreground">{product.packaging}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Min. B2B Order</span>
                    <span className="font-semibold text-emerald-500">{product.minOrder}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    onClick={() => {
                      onClose();
                      onOpenQuote(product.name);
                    }}
                    rightIcon={<Truck className="h-4 w-4" />}
                  >
                    Request Bulk Pricing Quote
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Enquiry Form inside Modal */}
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Send className="h-4 w-4 text-[#2563EB]" /> Quick B2B Product Inquiry
              </h3>
              <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Name"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={inquirerName}
                  onChange={(e) => setInquirerName(e.target.value)}
                  required
                />
                <Input
                  label="Phone / WhatsApp"
                  placeholder="+91 98765 43210"
                  value={inquirerPhone}
                  onChange={(e) => setInquirerPhone(e.target.value)}
                  required
                />
                <Input
                  label="Hospital / Company Email"
                  placeholder="procurement@cityhospital.com"
                  type="email"
                  value={inquirerEmail}
                  onChange={(e) => setInquirerEmail(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Requirement / Target Delivery Date</label>
                  <input
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="e.g. 500 Packs required for Rajapalayam hospital"
                    value={inquirerMsg}
                    onChange={(e) => setInquirerMsg(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex justify-end gap-3">
                  <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} rightIcon={<Send className="h-3.5 w-3.5" />}>
                    Submit Instant Inquiry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
