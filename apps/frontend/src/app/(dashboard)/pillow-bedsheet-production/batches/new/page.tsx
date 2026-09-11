'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreatePillowBedsheetBatch } from '@/hooks/usePillowBedsheetProduction';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useToast } from '@/components/ui/toast';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import {
  ArrowLeft,
  Bed,
  Scissors,
  Layers,
  Calculator,
  Boxes,
  Users,
  Building2,
  CheckCircle2,
  Hash,
  Coins,
  DollarSign,
  UserCheck,
  FileText,
  Calendar,
  Truck,
  User,
  Sparkles,
  Check,
} from 'lucide-react';
import { pillowBedsheetProductionService, PillowBedsheetProductType } from '@/services/pillow-bedsheet-production.service';

const STANDARD_BED_SHEET_PRODUCTS = [
  'Hospital Cotton Bed Sheet 240cm x 150cm',
  'Bleached Surgical Bed Sheet 220cm x 140cm',
  'Patient Room Fitted Bed Sheet 200cm x 120cm',
  'ICU Sterile Flat Bed Sheet 250cm x 160cm',
  'Cotton Twill Clinic Bed Sheet 230cm x 140cm',
];

const STANDARD_PILLOW_COVER_PRODUCTS = [
  'Standard Envelope Pillow Cover 45cm x 70cm',
  'Surgical Pillow Slip 50cm x 75cm (Flap Style)',
  'Waterproof Reusable Pillow Cover 45cm x 65cm',
  'Medical Cotton Pillow Cover 40cm x 60cm',
];

const STANDARD_ITEM_TYPES = ['22x16', '23x17', '28x27', '22x14'];

function CreatePillowBedsheetBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executorType = (searchParams.get('executorType') as 'WORKERS' | 'COMPANY') || 'WORKERS';
  const workerNames = searchParams.get('workerNames') || '';
  const workerIds = searchParams.get('workerIds') ? searchParams.get('workerIds')!.split(',') : [];
  const companyName = searchParams.get('companyName') || '';
  const companyId = searchParams.get('companyId') || '';
  const initialDeliveryPerson = searchParams.get('deliveryPerson') || '';
  const initialVehicleNumber = searchParams.get('vehicleNumber') || '';

  const { toast } = useToast();
  const createBatchMutation = useCreatePillowBedsheetBatch();
  const { data: rawMaterialsData } = useRawMaterials({ limit: 100 });

  // Finished products from materials inventory
  const inventoryFinishedProducts = useMemo(() => {
    return (rawMaterialsData?.items || []).filter(
      (m: any) =>
        m.name?.toLowerCase().includes('sheet') ||
        m.name?.toLowerCase().includes('pillow') ||
        m.name?.toLowerCase().includes('bed') ||
        m.category?.name?.toLowerCase().includes('finish')
    );
  }, [rawMaterialsData]);

  // Product Mode: Bed Sheet vs Pillow Cover
  const [productType, setProductType] = useState<PillowBedsheetProductType>('BED_SHEET');

  // Batch General Information
  const [batchNumber, setBatchNumber] = useState('');
  const [productName, setProductName] = useState(STANDARD_BED_SHEET_PRODUCTS[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Jobwork / Notebook Parameters (Top 4 standard parameters)
  const [dcNo, setDcNo] = useState('DC-PBS-01');
  const [dcDate, setDcDate] = useState(new Date().toISOString().split('T')[0]);
  const [ends, setEnds] = useState('1140');
  const [itemType, setItemType] = useState('22x16');

  // Company Logistics
  const [deliveryPerson, setDeliveryPerson] = useState(initialDeliveryPerson);
  const [vehicleNumber, setVehicleNumber] = useState(initialVehicleNumber);

  // Raw Material Roll Intake Inputs
  const [weightKg, setWeightKg] = useState<number | ''>(50); // kg
  const [gsm, setGsm] = useState<number | ''>(130); // gsm
  const [rollWidth, setRollWidth] = useState<number | ''>(150); // width dimension
  const [rollWidthUom, setRollWidthUom] = useState('cm'); // cm, m, inch

  // Bed Sheet Sizing
  const [bedSheetLength, setBedSheetLength] = useState<number | ''>(2.4);
  const [bedSheetLengthUom, setBedSheetLengthUom] = useState<'m' | 'cm'>('m');

  // Pillow Cover Sizing
  const [pillowCoverCuttingLength, setPillowCoverCuttingLength] = useState<number | ''>(0.8);
  const [pillowCoverCuttingLengthUom, setPillowCoverCuttingLengthUom] = useState<'m' | 'cm'>('m');
  const [cuttingCount, setCuttingCount] = useState<number | ''>(2);

  // Salary Rate
  const [salaryRatePerUnit, setSalaryRatePerUnit] = useState<number | ''>(
    productType === 'BED_SHEET' ? 4.5 : 1.25
  );

  // When switching product mode, update default product name & rate
  const handleProductTypeChange = (type: PillowBedsheetProductType) => {
    setProductType(type);
    if (type === 'BED_SHEET') {
      setProductName(STANDARD_BED_SHEET_PRODUCTS[0]);
      setSalaryRatePerUnit(4.5);
    } else {
      setProductName(STANDARD_PILLOW_COVER_PRODUCTS[0]);
      setSalaryRatePerUnit(1.25);
    }
  };

  // Auto-generate batch code
  useEffect(() => {
    const d = new Date();
    const rand = Math.floor(100 + Math.random() * 900);
    const prefix = productType === 'BED_SHEET' ? 'PBS-BS' : 'PBS-PC';
    setBatchNumber(`${prefix}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rand}`);
  }, [productType]);

  // Pre-populate notes
  useEffect(() => {
    if (workerNames && !notes) {
      setNotes(`Assigned Workforce: ${workerNames}`);
    } else if (companyName && !notes) {
      setNotes(`Assigned Jobworking Company: ${companyName}`);
    }
  }, [workerNames, companyName, notes]);

  // Mathematical Calculations
  const calculations = useMemo(() => {
    return pillowBedsheetProductionService.calculateCalculations(
      Number(weightKg) || 0,
      Number(gsm) || 0,
      Number(rollWidth) || 0,
      rollWidthUom,
      productType,
      Number(bedSheetLength) || 0,
      bedSheetLengthUom,
      Number(pillowCoverCuttingLength) || 0,
      pillowCoverCuttingLengthUom,
      Number(cuttingCount) || 1
    );
  }, [
    weightKg,
    gsm,
    rollWidth,
    rollWidthUom,
    productType,
    bedSheetLength,
    bedSheetLengthUom,
    pillowCoverCuttingLength,
    pillowCoverCuttingLengthUom,
    cuttingCount,
  ]);

  const { totalLength, outputQuantity, remnantLength } = calculations;

  // Salary Calculations
  const assignedWorkersList = useMemo(() => {
    if (!workerNames) return [];
    return workerNames.split(',').map((s) => s.trim()).filter(Boolean);
  }, [workerNames]);

  const totalSalary = useMemo(() => {
    const rate = Number(salaryRatePerUnit) || 0;
    return Number((outputQuantity * rate).toFixed(2));
  }, [outputQuantity, salaryRatePerUnit]);

  const workerSalaryShare = useMemo(() => {
    const count = assignedWorkersList.length || 1;
    return Number((totalSalary / count).toFixed(2));
  }, [totalSalary, assignedWorkersList.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast('Required Field', 'Please specify a product name', 'warning');
      return;
    }

    if (!weightKg || Number(weightKg) <= 0) {
      toast('Invalid Weight', 'Please enter a valid roll weight in KG', 'warning');
      return;
    }

    if (!gsm || Number(gsm) <= 0) {
      toast('Invalid GSM', 'Please enter a valid fabric GSM (e.g. 120-160)', 'warning');
      return;
    }

    if (!rollWidth || Number(rollWidth) <= 0) {
      toast('Invalid Width', 'Please enter a valid roll width', 'warning');
      return;
    }

    if (productType === 'BED_SHEET') {
      if (!bedSheetLength || Number(bedSheetLength) <= 0) {
        toast('Invalid Bed Sheet Length', 'Please enter a valid bed sheet length', 'warning');
        return;
      }
    } else {
      if (!pillowCoverCuttingLength || Number(pillowCoverCuttingLength) <= 0) {
        toast('Invalid Cutting Length', 'Please enter a valid pillow cover cutting length (PCL)', 'warning');
        return;
      }
      if (!cuttingCount || Number(cuttingCount) <= 0) {
        toast('Invalid Cutting Count', 'Please enter number of cuts/pieces per cutting length', 'warning');
        return;
      }
    }

    try {
      await createBatchMutation.mutateAsync({
        batchNumber: batchNumber.trim() || undefined,
        productName: productName.trim(),
        productType,
        weightKg: Number(weightKg),
        gsm: Number(gsm),
        rollWidth: Number(rollWidth),
        rollWidthUom,
        bedSheetLength: productType === 'BED_SHEET' ? Number(bedSheetLength) : undefined,
        bedSheetLengthUom: productType === 'BED_SHEET' ? bedSheetLengthUom : undefined,
        pillowCoverCuttingLength:
          productType === 'PILLOW_COVER' ? Number(pillowCoverCuttingLength) : undefined,
        pillowCoverCuttingLengthUom:
          productType === 'PILLOW_COVER' ? pillowCoverCuttingLengthUom : undefined,
        cuttingCount: productType === 'PILLOW_COVER' ? Number(cuttingCount) : undefined,
        salaryRatePerUnit: Number(salaryRatePerUnit) || 0,
        executorType,
        workerIds: workerIds.length > 0 ? workerIds : undefined,
        workerNames: workerNames || undefined,
        companyId: companyId || undefined,
        companyName: companyName || undefined,
        deliveryPerson: deliveryPerson.trim() || undefined,
        vehicleNumber: vehicleNumber.trim() || undefined,
        dcNo: dcNo.trim() || undefined,
        dcDate: dcDate || undefined,
        ends: ends.trim() || undefined,
        itemType: itemType.trim() || undefined,
        startDate,
        targetDate: targetDate || undefined,
        notes: notes || undefined,
      });

      toast(
        'Batch Started',
        `${productType === 'BED_SHEET' ? 'Bed Sheet' : 'Pillow Cover'} Batch ${batchNumber} started successfully!`,
        'success'
      );
      router.push('/job-work');
    } catch (err: any) {
      toast('Creation Failed', err?.message || 'Could not start batch', 'error');
    }
  };

  const productDropdownOptions = useMemo(() => {
    const presets =
      productType === 'BED_SHEET'
        ? STANDARD_BED_SHEET_PRODUCTS
        : STANDARD_PILLOW_COVER_PRODUCTS;

    return [
      ...presets.map((p) => ({ value: p, label: p })),
      ...inventoryFinishedProducts.map((p: any) => ({
        value: p.name,
        label: `${p.name} (${p.sku})`,
      })),
    ];
  }, [productType, inventoryFinishedProducts]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Create Pillow Cover & Bed Sheet Batch
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Step 2: Roll Intake & Sizing
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pillow-bedsheet-production">
            <Button variant="outline" size="sm" className="text-xs">
              View All Batches
            </Button>
          </Link>
        </div>
      </div>

      {/* Step 1 Handler Summary Confirmation Banner */}
      <Card className="p-4 border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                executorType === 'WORKERS'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              {executorType === 'WORKERS' ? (
                <Users className="h-4.5 w-4.5" />
              ) : (
                <Building2 className="h-4.5 w-4.5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {executorType === 'WORKERS'
                    ? 'Internal Factory Workforce'
                    : 'Jobworking Company / Outsourced Vendor'}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    executorType === 'WORKERS'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                  }`}
                >
                  Step 1 Handler Confirmed
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-foreground mt-0.5">
                {executorType === 'WORKERS'
                  ? workerNames || 'All Assigned Factory Operators'
                  : companyName || 'Registered Textile Partner Mill'}
              </p>
            </div>
          </div>

          <Link href="/job-work">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground">
              Change Handler
            </Button>
          </Link>
        </div>

        {/* Carrier Details if Outsourced to Job Working Company */}
        {executorType === 'COMPANY' && (
          <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-500/5 p-3 rounded-md border border-blue-500/15">
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Delivery Person / Driver Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Transport Vehicle Number
              </label>
              <Input
                type="text"
                placeholder="e.g. TN-38-BZ-4412"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="h-8 text-xs font-mono uppercase bg-background"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Product Mode Switcher: Bed Sheet vs Pillow Cover */}
      <Card className="p-4 border-border bg-card space-y-3 ring-1 ring-purple-500/20">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Select Production Product Line
            </h2>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Determines cutting division formula & output unit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Bed Sheet */}
          <button
            type="button"
            onClick={() => handleProductTypeChange('BED_SHEET')}
            className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
              productType === 'BED_SHEET'
                ? 'border-purple-600 dark:border-purple-500 bg-purple-500/10 shadow-xs ring-1 ring-purple-500'
                : 'border-border bg-card hover:bg-secondary/40'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                productType === 'BED_SHEET'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Bed className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Bed Sheet Production</span>
                {productType === 'BED_SHEET' && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Calculate total output by single piece length: <span className="font-mono font-semibold text-foreground">Output = Total Length ÷ BS Length</span>
              </p>
            </div>
          </button>

          {/* Option 2: Pillow Cover */}
          <button
            type="button"
            onClick={() => handleProductTypeChange('PILLOW_COVER')}
            className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
              productType === 'PILLOW_COVER'
                ? 'border-purple-600 dark:border-purple-500 bg-purple-500/10 shadow-xs ring-1 ring-purple-500'
                : 'border-border bg-card hover:bg-secondary/40'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                productType === 'PILLOW_COVER'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Scissors className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Pillow Cover Production</span>
                {productType === 'PILLOW_COVER' && (
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Multi-piece cutting length & count sizing
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* Notebook Jobwork Parameters (Top 4 Red Circle Data) */}
      <Card className="p-5 border-border bg-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Job Work Production Parameters (DC, Ends & Item Type)
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
            Production Specs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. DC Number */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              D.C. No. <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={dcNo}
              onChange={(e) => setDcNo(e.target.value)}
              placeholder="e.g. DC-PBS-01"
              className="h-9 font-mono text-xs"
              required
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Challan Reference (e.g. D.C. No. 05)
            </span>
          </div>

          {/* DC Date */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              D.C. Date
            </label>
            <Input
              type="date"
              value={dcDate}
              onChange={(e) => setDcDate(e.target.value)}
              className="h-9 text-xs"
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Challan issue / dispatch date
            </span>
          </div>

          {/* 2. Ends */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Ends <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={ends}
              onChange={(e) => setEnds(e.target.value)}
              placeholder="1140"
              className="h-9 font-mono text-xs font-semibold"
              required
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">
              e.g. 1140 or 1140 E
            </span>
          </div>

          {/* 3. Item Type */}
          <div>
            <MasterEntityDropdown
              label="3. Item Type (Mesh / Construction)"
              value={itemType}
              onChange={setItemType}
              storageKey="jobwork_item_types"
              options={STANDARD_ITEM_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Select Construction / Mesh..."
              hint="Weave construction / mesh density"
              required
            />
          </div>
        </div>
      </Card>

      <form id="pillow-bedsheet-batch-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Batch & Product Details */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Hash className="h-4 w-4 text-purple-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Batch & Product Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="PBS-2026-001"
                className="h-9 font-mono text-xs"
                required
              />
            </div>

            <div>
              <MasterEntityDropdown
                label="Product Specification"
                value={productName}
                onChange={setProductName}
                storageKey={
                  productType === 'BED_SHEET'
                    ? 'pillow_bedsheet_products_bs'
                    : 'pillow_bedsheet_products_pc'
                }
                options={productDropdownOptions}
                placeholder="Select Product Specification..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Target Completion Date
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Section 1: Raw Material Roll Intake & Automated Length Formula */}
        <Card className="p-5 border-border bg-card space-y-4 ring-1 ring-purple-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Raw Material Roll Intake & Length Calculation
              </h2>
            </div>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Formula: (((Weight × 1000) ÷ Width in m) ÷ GSM)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Weight in KG */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Roll Weight (KG) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                min={0.1}
                step="any"
                placeholder="e.g. 50"
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Total gross weight of fabric roll in kilograms
              </span>
            </div>

            {/* GSM */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Fabric GSM (g/m²) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={gsm}
                onChange={(e) => setGsm(e.target.value === '' ? '' : Number(e.target.value))}
                min={1}
                step="any"
                placeholder="e.g. 130"
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Grams per square meter density (e.g. 120, 130, 140)
              </span>
            </div>

            {/* Roll Width */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Roll Width <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={rollWidth}
                  onChange={(e) => setRollWidth(e.target.value === '' ? '' : Number(e.target.value))}
                  min={1}
                  step="any"
                  placeholder="150"
                  className="h-9 font-mono text-xs flex-1"
                  required
                />
                <select
                  value={rollWidthUom}
                  onChange={(e) => setRollWidthUom(e.target.value)}
                  className="h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="inch">inch</option>
                </select>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Normalized width: {pillowBedsheetProductionService.normalizeWidthToMeters(Number(rollWidth) || 0, rollWidthUom)} m
              </span>
            </div>
          </div>

          {/* Dynamic Computed Roll Length Banner */}
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-foreground">
                  Calculated Total Linear Roll Length:
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {totalLength.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-foreground ml-1 font-mono">Meters</span>
            </div>
          </div>
        </Card>

        {/* Section 2: Output Sizing & Quantity Calculation */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. {productType === 'BED_SHEET' ? 'Bed Sheet Sizing & Output' : 'Pillow Cover Sizing & Output'}
              </h2>
            </div>
          </div>

          {/* If Bed Sheet */}
          {productType === 'BED_SHEET' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Bed Sheet Length (BS Length) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={bedSheetLength}
                    onChange={(e) => setBedSheetLength(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0.1}
                    step="any"
                    placeholder="2.4"
                    className="h-9 font-mono text-xs flex-1"
                    required
                  />
                  <select
                    value={bedSheetLengthUom}
                    onChange={(e) => setBedSheetLengthUom(e.target.value as any)}
                    className="h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="m">Meters</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Standard bed sheet single piece length (e.g. 2.4m = 240cm)
                </span>
              </div>

              {/* Bed Sheet Calculated Result Box */}
              <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">
                    Calculated Bed Sheets Output:
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {outputQuantity}
                  </span>
                  <span className="text-xs font-semibold text-foreground ml-1">Pieces</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Remnant: {remnantLength}m
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* If Pillow Cover */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pillow Cover Cutting Length (PCL) */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Cutting Length (PCL) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pillowCoverCuttingLength}
                    onChange={(e) =>
                      setPillowCoverCuttingLength(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    min={0.1}
                    step="any"
                    placeholder="0.8"
                    className="h-9 font-mono text-xs flex-1"
                    required
                  />
                  <select
                    value={pillowCoverCuttingLengthUom}
                    onChange={(e) => setPillowCoverCuttingLengthUom(e.target.value as any)}
                    className="h-9 px-2 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="m">Meters</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Pillow cover cutting length per stroke
                </span>
              </div>

              {/* Cutting Count */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Cutting Count Multiplier <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={cuttingCount}
                  onChange={(e) => setCuttingCount(e.target.value === '' ? '' : Number(e.target.value))}
                  min={1}
                  step={1}
                  placeholder="2"
                  className="h-9 font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Pieces produced per cutting length (e.g. 2 or 4 covers)
                </span>
              </div>

              {/* Pillow Cover Calculated Result Box */}
              <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">
                    Total Output Quantity:
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {outputQuantity}
                  </span>
                  <span className="text-xs font-semibold text-foreground ml-1">Pillow Covers</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    Remnant: {remnantLength}m
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Section 3: Salary per Quantity Engine */}
        <Card className="p-5 border-border bg-card space-y-4 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                3. Salary Engine (Wage per Quantity)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Formula: Output Quantity × Rate per Piece
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Salary Rate per Quantity (₹ / piece) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">₹</span>
                <Input
                  type="number"
                  value={salaryRatePerUnit}
                  onChange={(e) => setSalaryRatePerUnit(e.target.value === '' ? '' : Number(e.target.value))}
                  min={0.01}
                  step="any"
                  placeholder="e.g. 4.50"
                  className="h-9 font-mono text-xs pl-7"
                  required
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Standard processing piece rate (e.g. ₹4.50 per bed sheet, ₹1.25 per pillow cover)
              </span>
            </div>

            {/* Total Salary Payable Card */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Total Salary Payable:
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {outputQuantity} pcs × ₹{Number(salaryRatePerUnit) || 0}
                </span>
                {assignedWorkersList.length > 1 && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-1">
                    Worker Share ({assignedWorkersList.length} workers): ₹{workerSalaryShare} each
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{totalSalary.toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Total Disbursed
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Operational Notes */}
        <Card className="p-5 border-border bg-card space-y-4">
          <label className="text-xs font-medium text-foreground block">
            Batch Production Notes / Fabric Instructions (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions for cutting, hem stitching, folding, packaging, or customer delivery requirements..."
            rows={3}
            className="w-full text-xs font-mono p-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/job-work">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            isLoading={createBatchMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-5 shadow-xs"
          >
            Start {productType === 'BED_SHEET' ? 'Bed Sheet' : 'Pillow Cover'} Batch
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePillowBedsheetBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground font-mono text-xs">
          Loading Batch Initialization...
        </div>
      }
    >
      <CreatePillowBedsheetBatchContent />
    </Suspense>
  );
}
