'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, ShieldCheck, CheckCircle2, Send, Building2, MapPin, Truck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: string;
}

export function QuoteModal({ isOpen, onClose, initialProduct = '' }: QuoteModalProps) {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(initialProduct || 'Medi Bath Body Wipes');
  const [quantity, setQuantity] = useState(500);
  const [organizationType, setOrganizationType] = useState('Hospital / Clinic');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Rajapalayam');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
    }
  }, [initialProduct]);

  if (!isOpen) return null;

  // Approximate tier price estimation logic
  const getUnitRateEstimate = () => {
    let baseRate = 180;
    if (selectedProduct.includes('Medi Bath')) baseRate = 140;
    else if (selectedProduct.includes('400 Gram') || selectedProduct.includes('Cotton Roll')) baseRate = 220;
    else if (selectedProduct.includes('Gamjee')) baseRate = 260;
    else if (selectedProduct.includes('Gauze')) baseRate = 110;
    else if (selectedProduct.includes('Clothing') || selectedProduct.includes('Gown')) baseRate = 190;

    if (quantity >= 2000) return baseRate * 0.78; // 22% bulk discount
    if (quantity >= 1000) return baseRate * 0.85; // 15% discount
    if (quantity >= 500) return baseRate * 0.92; // 8% discount
    return baseRate;
  };

  const unitPrice = Math.round(getUnitRateEstimate());
  const estimatedTotal = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast(
        'B2B Quote Request Submitted!',
        `Reference #SLS-${Math.floor(100000 + Math.random() * 900000)}. Our sales executive will call ${phone} within 2 hours with the official GST quotation.`,
        'success'
      );
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0F172A] via-emerald-950 to-teal-900 text-white p-5 border-b border-emerald-500/20 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/30 flex items-center gap-1">
                  <Calculator className="h-3 w-3" /> Wholesale B2B Calculator
                </span>
                <span className="text-xs text-emerald-400 font-mono">ISO 13485 Certified</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Request Wholesale B2B Quote</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#2563EB]" /> Shri Lathikka Surgicals • Direct Factory Rates
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Product Selection & Calculator */}
            <div className="space-y-3 bg-secondary/30 p-4 rounded-lg border border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#2563EB]" /> Product & Volume Configurator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground">Select Product Category</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="Medi Bath Body Wipes">Medi Bath Antibacterial Body Wipes</option>
                    <option value="400 Gram Surgical Cotton Roll">400 Gram Surgical Absorbent Cotton Roll</option>
                    <option value="Surgical Cotton Balls (Pre-cut)">Surgical Cotton Balls (Pre-cut IP/BP)</option>
                    <option value="Gauze Bandage Rolls & Swabs">Gauze Bandage Rolls & Swabs</option>
                    <option value="Cotton Gamjee Rolls & Pads">Cotton Gamjee Tissue Rolls & Pads</option>
                    <option value="Medical & Surgical Clothing">Medical Surgical Clothing (Surgeon Gowns/Caps)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground">Estimated Order Quantity (Units)</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Price Calculation Box */}
              <div className="mt-2 p-3 bg-background/80 rounded-md border border-[#2563EB]/30 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Estimated Tier Price: </span>
                  <span className="font-mono font-bold text-foreground">₹{unitPrice} / unit</span>
                  <span className="text-[10px] text-emerald-500 font-semibold ml-2">
                    {quantity >= 1000 ? 'Bulk Wholesale Tier Applied' : 'Standard B2B Tier'}
                  </span>

                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Approx Total (Excl. GST): </span>
                  <span className="font-mono font-bold text-[#2563EB] text-sm">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2563EB]" /> Facility & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Person Name"
                  placeholder="e.g. Dr. K. Meenakshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number (WhatsApp Preferred)"
                  placeholder="+91 94431 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-3.5 w-3.5" />}
                  required
                />
                <Input
                  label="Hospital / Organization Email"
                  placeholder="purchase@lathikkasurgicals.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Organization Type</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                  >
                    <option value="Hospital / Clinic">Hospital / Nursing Home / Clinic</option>
                    <option value="Wholesale Distributor / Stockist">Wholesale Distributor / Stockist</option>
                    <option value="Retail Pharmacy">Retail Pharmacy Chain</option>
                    <option value="Government Procurement">Government Medical Tender</option>
                    <option value="Individual Buyer">Individual Bulk Caregiver</option>
                  </select>
                </div>
                <Input
                  label="Delivery City / District"
                  placeholder="Rajapalayam / Madurai / Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leftIcon={<MapPin className="h-3.5 w-3.5" />}
                  required
                />
                <Input
                  label="State / Region"
                  placeholder="Tamil Nadu"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quality Commitment Badges */}
            <div className="p-3 bg-secondary/20 rounded-md border border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB]" /> Direct Factory Dispatch from Rajapalayam
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> ISO 13485 & CE Quality Assurance
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-border">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                rightIcon={<Send className="h-4 w-4" />}
              >
                Request Official GST Quotation
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
