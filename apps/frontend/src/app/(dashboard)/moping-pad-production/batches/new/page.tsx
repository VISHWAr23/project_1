'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateMopingPadBatch } from '@/hooks/useMopingPadProduction';
import { useStorageLocations, useRawMaterials } from '@/hooks/useRawMaterials';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Sparkles,
  Scissors,
  Layers,
  Calculator,
  Boxes,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Hash,
  Clock,
  MapPin,
  HelpCircle,
} from 'lucide-react';

const STANDARD_MOPING_PAD_PRODUCTS = [
  'Heavy-Duty Surgical Moping Pad 40cm',
  'Moping Pad - 30cm x 30cm (12 ply)',
  'Moping Pad - 25cm x 25cm (8 ply)',
  'Standard Cleanroom Mop Pad 30cm',
  'Microfiber Absorbent Mop Pad 35cm',
  'Sterile Laparotomy Sponge / Moping Pad with Loop',
  'X-Ray Detectable Abdominal Mop Pad 30x30cm',
];

const STANDARD_WAREHOUSE_LOCATIONS = [
  'Cutting & Pinning Section (Floor 1)',
  'Main Warehouse - Raw Storage',
  'Finished Goods Warehouse (Bay A)',
  'Finished Goods Warehouse (Bay B)',
  'Bleaching Yard & Drying Floor',
  'Packaging & Sterile Bay',
  'Transit & Dispatch Storage',
];

function CreateMopingPadBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executorType = (searchParams.get('executorType') as 'WORKERS' | 'COMPANY') || 'WORKERS';
  const workerNames = searchParams.get('workerNames') || '';
  const workerIds = searchParams.get('workerIds') ? searchParams.get('workerIds')!.split(',') : [];
  const companyName = searchParams.get('companyName') || '';
  const companyId = searchParams.get('companyId') || '';

  const { toast } = useToast();
  const createBatchMutation = useCreateMopingPadBatch();
  const { data: storageLocationsData = [] } = useStorageLocations();
  const { data: rawMaterialsData } = useRawMaterials({ limit: 100 });

  // Finished products from materials inventory
  const inventoryFinishedProducts = useMemo(() => {
    return (rawMaterialsData?.items || []).filter(
      (m: any) =>
        m.name?.toLowerCase().includes('mop') ||
        m.name?.toLowerCase().includes('pad') ||
        m.category?.name?.toLowerCase().includes('finish')
    );
  }, [rawMaterialsData]);

  // Combined warehouse locations list
  const allWarehouseLocations = useMemo(() => {
    const fromApi = storageLocationsData.map((l: any) => l.name);
    const combined = Array.from(new Set([...STANDARD_WAREHOUSE_LOCATIONS, ...fromApi]));
    return combined;
  }, [storageLocationsData]);

  // Batch General Information
  const [batchNumber, setBatchNumber] = useState('');
  const [productName, setProductName] = useState(STANDARD_MOPING_PAD_PRODUCTS[0]);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState(STANDARD_WAREHOUSE_LOCATIONS[0]);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [notes, setNotes] = useState('');

  // Raw Material Intake State: 'ROLL' vs 'PIECES'
  const [materialType, setMaterialType] = useState<'ROLL' | 'PIECES'>('ROLL');

  // Roll Form Inputs
  const [rollWidth, setRollWidth] = useState<number | ''>(100);
  const [rollWidthUom, setRollWidthUom] = useState('cm');
  const [rollLength, setRollLength] = useState<number | ''>(150);
  const [rollLengthUom, setRollLengthUom] = useState('m');

  // Pieces Form Inputs
  const [pieceWidth, setPieceWidth] = useState<number | ''>(50);
  const [pieceWidthUom, setPieceWidthUom] = useState('cm');
  const [pieceLength, setPieceLength] = useState<number | ''>(2.5);
  const [pieceLengthUom, setPieceLengthUom] = useState('m');
  const [pieceCount, setPieceCount] = useState<number | ''>(40);

  // Pinning Size Input
  const [pinningSize, setPinningSize] = useState<number | ''>(0.4);
  const [pinningSizeUom, setPinningSizeUom] = useState<'m' | 'cm'>('m');

  // Auto-generate initial batch number
  useEffect(() => {
    const d = new Date();
    const rand = Math.floor(100 + Math.random() * 900);
    setBatchNumber(`MPP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rand}`);
  }, []);

  // Pre-populate notes with handler info
  useEffect(() => {
    if (workerNames && !notes) {
      setNotes(`Assigned In-House Workforce: ${workerNames}`);
    } else if (companyName && !notes) {
      setNotes(`Assigned Jobworking Vendor: ${companyName}`);
    }
  }, [workerNames, companyName, notes]);

  // Live Calculations
  const calculatedTotalLength = useMemo(() => {
    if (materialType === 'ROLL') {
      return Number(rollLength) || 0;
    } else {
      let lengthM = Number(pieceLength) || 0;
      if (pieceLengthUom === 'cm') {
        lengthM = lengthM / 100;
      }
      const count = Number(pieceCount) || 0;
      return Number((count * lengthM).toFixed(3));
    }
  }, [materialType, rollLength, pieceLength, pieceLengthUom, pieceCount]);

  const { outputQuantity, remnantLength } = useMemo(() => {
    let sizeM = Number(pinningSize) || 0;
    if (pinningSizeUom === 'cm') {
      sizeM = sizeM / 100;
    }
    if (sizeM <= 0 || calculatedTotalLength <= 0) {
      return { outputQuantity: 0, remnantLength: 0 };
    }
    const qty = Math.floor(calculatedTotalLength / sizeM);
    const remnant = Number((calculatedTotalLength % sizeM).toFixed(3));
    return { outputQuantity: qty, remnantLength: remnant };
  }, [calculatedTotalLength, pinningSize, pinningSizeUom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast('Required Field', 'Please enter a product name', 'warning');
      return;
    }

    if (materialType === 'ROLL') {
      if (!rollLength || Number(rollLength) <= 0) {
        toast('Invalid Roll Length', 'Please enter a valid roll length greater than 0', 'warning');
        return;
      }
      if (!rollWidth || Number(rollWidth) <= 0) {
        toast('Invalid Roll Width', 'Please enter a valid roll width', 'warning');
        return;
      }
    } else {
      if (!pieceLength || Number(pieceLength) <= 0) {
        toast('Invalid Piece Length', 'Please enter a valid piece length', 'warning');
        return;
      }
      if (!pieceCount || Number(pieceCount) <= 0) {
        toast('Invalid Pieces Count', 'Please enter number of pieces greater than 0', 'warning');
        return;
      }
    }

    if (!pinningSize || Number(pinningSize) <= 0) {
      toast('Invalid Pinning Size', 'Please enter a valid pinning size', 'warning');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        batchNumber: batchNumber.trim() || undefined,
        productName: productName.trim(),
        materialType,
        rollWidth: rollWidth === '' ? undefined : Number(rollWidth),
        rollWidthUom,
        rollLength: rollLength === '' ? undefined : Number(rollLength),
        rollLengthUom,
        pieceLength: pieceLength === '' ? undefined : Number(pieceLength),
        pieceLengthUom,
        pieceWidth: pieceWidth === '' ? undefined : Number(pieceWidth),
        pieceWidthUom,
        pieceCount: pieceCount === '' ? undefined : Number(pieceCount),
        pinningSize: Number(pinningSize),
        pinningSizeUom,
        executorType,
        workerIds: workerIds.length > 0 ? workerIds : undefined,
        workerNames: workerNames || undefined,
        companyId: companyId || undefined,
        companyName: companyName || undefined,
        startDate,
        targetDate: targetDate || undefined,
        warehouseLocation: warehouseLocation || undefined,
        notes: notes || undefined,
      });

      toast('Batch Created', `Moping Pad Batch ${batchNumber} started successfully`, 'success');
      router.push('/job-work');
    } catch (err: any) {
      toast('Creation Failed', err?.message || 'Could not create batch', 'error');
    }
  };

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
                Create Moping Pad Batch
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                New Manufacturing Run
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dual-mode raw material intake (Roll or Pieces) with automated pinning size output calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/job-work">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            form="moping-pad-form"
            type="submit"
            size="sm"
            disabled={createBatchMutation.isPending}
            className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{createBatchMutation.isPending ? 'Commencing Run...' : 'Commence Production Run'}</span>
          </Button>
        </div>
      </div>

      {/* Pre-Assigned Workforce / Vendor Banner */}
      <Card className="p-3.5 bg-card border-border/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <span className="text-xs font-bold text-foreground">
                  {executorType === 'WORKERS' ? 'In-House Production Workforce' : 'Jobworking Partner Company'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
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
                  ? workerNames || 'All Available Floor Technicians'
                  : companyName || 'Registered Partner Vendor'}
              </p>
            </div>
          </div>

          <Link href="/job-work">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground hover:text-foreground">
              Change Handler
            </Button>
          </Link>
        </div>
      </Card>

      <form id="moping-pad-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Batch General Info */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Hash className="h-4 w-4 text-amber-600" />
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
                placeholder="MPP-2026-001"
                className="h-9 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Product Specification <span className="text-red-500">*</span>
              </label>
              <select
                value={isCustomProduct ? '__CUSTOM__' : productName}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomProduct(true);
                    setProductName('');
                  } else {
                    setIsCustomProduct(false);
                    setProductName(e.target.value);
                  }
                }}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="" disabled>Select Finished Product Specification...</option>
                <optgroup label="Standard Finished Products">
                  {STANDARD_MOPING_PAD_PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                </optgroup>
                {inventoryFinishedProducts.length > 0 && (
                  <optgroup label="Inventory Finished Goods">
                    {inventoryFinishedProducts.map((p: any) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__CUSTOM__">➕ Enter Custom Specification...</option>
              </select>

              {isCustomProduct && (
                <Input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter custom product specification..."
                  className="h-8 text-xs mt-1.5"
                  required
                  autoFocus
                />
              )}
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

        {/* Raw Material Intake: Roll Form vs Pieces Form */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Raw Material Intake Form
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Select how raw fabric was received for this batch
            </span>
          </div>

          {/* Intake Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1: Roll Form */}
            <button
              type="button"
              onClick={() => setMaterialType('ROLL')}
              className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
                materialType === 'ROLL'
                  ? 'border-amber-600 dark:border-amber-500 bg-amber-500/5 shadow-xs ring-1 ring-amber-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  materialType === 'ROLL'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">1. Roll Form</span>
                  {materialType === 'ROLL' && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Continuous raw fabric roll. Total length equals the single continuous roll length.
                </p>
              </div>
            </button>

            {/* Mode 2: Pieces Form */}
            <button
              type="button"
              onClick={() => setMaterialType('PIECES')}
              className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
                materialType === 'PIECES'
                  ? 'border-amber-600 dark:border-amber-500 bg-amber-500/5 shadow-xs ring-1 ring-amber-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  materialType === 'PIECES'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Scissors className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">2. Pieces Form</span>
                  {materialType === 'PIECES' && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pre-cut fabric strips/pieces. Total length equals count × length of each piece.
                </p>
              </div>
            </button>
          </div>

          {/* Conditional Inputs Based on Intake Mode */}
          {materialType === 'ROLL' ? (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Roll Form Specifications</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Formula: Total Length = Roll Length
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roll Width */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Roll Width <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={rollWidth}
                      onChange={(e) =>
                        setRollWidth(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="100"
                      className="h-9 font-mono text-xs"
                      required
                    />
                    <select
                      value={rollWidthUom}
                      onChange={(e) => setRollWidthUom(e.target.value)}
                      className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                    >
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Fabric width across the roll
                  </span>
                </div>

                {/* Roll Length */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Roll Length <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={rollLength}
                      onChange={(e) =>
                        setRollLength(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="150"
                      className="h-9 font-mono text-xs"
                      required
                    />
                    <select
                      value={rollLengthUom}
                      onChange={(e) => setRollLengthUom(e.target.value)}
                      className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                    >
                      <option value="m">meters (m)</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Total continuous linear meters
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Pieces Form Specifications</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Formula: Total Length = Count × Piece Length
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Piece Length */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Length per Piece <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pieceLength}
                      onChange={(e) =>
                        setPieceLength(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="2.5"
                      className="h-9 font-mono text-xs"
                      required
                    />
                    <select
                      value={pieceLengthUom}
                      onChange={(e) => setPieceLengthUom(e.target.value)}
                      className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                    >
                      <option value="m">m</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Length of each individual cut strip
                  </span>
                </div>

                {/* Piece Width */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Width per Piece <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={pieceWidth}
                      onChange={(e) =>
                        setPieceWidth(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="50"
                      className="h-9 font-mono text-xs"
                      required
                    />
                    <select
                      value={pieceWidthUom}
                      onChange={(e) => setPieceWidthUom(e.target.value)}
                      className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                    >
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Strip width
                  </span>
                </div>

                {/* Piece Count */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Pieces Count <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={pieceCount}
                    onChange={(e) =>
                      setPieceCount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="40"
                    className="h-9 font-mono text-xs"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Number of pieces supplied
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Total Length Highlight Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-foreground">
                Evaluated Total Fabric Length:
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-foreground">
                {calculatedTotalLength.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">meters</span>
              {materialType === 'PIECES' && (
                <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                  ({pieceCount || 0} pcs × {pieceLength || 0} {pieceLengthUom})
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Pinning Sizing & Output Quantity Engine */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Calculator className="h-4 w-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pinning Size & Output Quantity Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pinning Size Input */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Pinning Size (Cut per Pad) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pinningSize}
                  onChange={(e) =>
                    setPinningSize(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.4"
                  className="h-9 font-mono text-xs"
                  required
                />
                <select
                  value={pinningSizeUom}
                  onChange={(e) => setPinningSizeUom(e.target.value as 'm' | 'cm')}
                  className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                >
                  <option value="m">meters (m)</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Length of fabric required for each finished moping pad
              </span>
            </div>

            {/* Live Formula Display Card */}
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">
                  Calculation Formula
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Total Length ÷ Pinning Size
                </span>
              </div>
              <div className="text-xs font-mono text-foreground mt-1">
                {calculatedTotalLength.toFixed(2)}m ÷{' '}
                {pinningSizeUom === 'cm'
                  ? `${(Number(pinningSize) / 100).toFixed(2)}m (${pinningSize}cm)`
                  : `${pinningSize || 0}m`}{' '}
                ={' '}
                <strong className="text-amber-600 dark:text-amber-400 text-sm font-bold">
                  {outputQuantity} Pads
                </strong>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Fabric Remnant: <strong className="font-mono text-foreground">{remnantLength}m</strong>
              </div>
            </div>
          </div>

          {/* Interactive Metric Summary Strips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/70">
              <span className="text-[11px] text-muted-foreground block">Raw Material Type</span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                {materialType === 'ROLL' ? 'Continuous Roll' : 'Pre-cut Pieces'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 border border-border/70">
              <span className="text-[11px] text-muted-foreground block">Evaluated Length</span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                {calculatedTotalLength.toFixed(2)} m
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block">
                Calculated Output
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                {outputQuantity} Pads
              </span>
            </div>

            <div className="p-3 rounded-lg bg-secondary/50 border border-border/70">
              <span className="text-[11px] text-muted-foreground block">Scrap / Remnant</span>
              <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                {remnantLength} m
              </span>
            </div>
          </div>
        </Card>

        {/* Additional Logistics / Notes */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Warehouse / Storage Location
              </label>
              <select
                value={isCustomLocation ? '__CUSTOM__' : warehouseLocation}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomLocation(true);
                    setWarehouseLocation('');
                  } else {
                    setIsCustomLocation(false);
                    setWarehouseLocation(e.target.value);
                  }
                }}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="" disabled>Select Warehouse Storage Location...</option>
                {allWarehouseLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value="__CUSTOM__">➕ Enter Custom Location...</option>
              </select>

              {isCustomLocation && (
                <Input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="Enter custom warehouse location..."
                  className="h-8 text-xs mt-1.5"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Operational Notes & Instructions
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special pinning or quality instructions..."
                className="h-9 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/job-work">
            <Button type="button" variant="outline" size="sm" className="h-9 px-4 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={createBatchMutation.isPending}
            className="h-9 px-5 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{createBatchMutation.isPending ? 'Commencing Run...' : 'Commence Production Run'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateMopingPadBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading Moping Pad Production Setup...
        </div>
      }
    >
      <CreateMopingPadBatchContent />
    </Suspense>
  );
}
