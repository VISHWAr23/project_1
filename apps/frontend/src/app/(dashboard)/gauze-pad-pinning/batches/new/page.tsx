'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGauzePadPinningBatch } from '@/hooks/useGauzePadPinning';
import { useStorageLocations, useRawMaterials } from '@/hooks/useRawMaterials';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
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
} from 'lucide-react';

const STANDARD_GAUZE_PAD_PRODUCTS = [
  'Sterile Gauze Swab Pad 10x10cm (12 Ply)',
  'Gauze Sponge Pad 7.5x7.5cm (8 Ply)',
  'Gauze Swab Pad 5x5cm (8 Ply)',
  'Abdominal Gauze Pad 20x20cm (16 Ply)',
  'X-Ray Detectable Gauze Pad 10x10cm',
  'Sterile Gauze Packing Strip (5cm x 5m)',
];

const STANDARD_GAUZE_PAD_LOCATIONS = [
  'Warehouse Floor B - Gauze Pad Section',
  'Main Warehouse - Raw Storage',
  'Cutting & Pinning Section (Floor 1)',
  'Finished Goods Warehouse (Bay A)',
  'Finished Goods Warehouse (Bay B)',
  'Packaging & Sterile Bay',
];

function CreateGauzePadPinningBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executorType = (searchParams.get('executorType') as 'WORKERS' | 'COMPANY') || 'WORKERS';
  const workerNames = searchParams.get('workerNames') || '';
  const workerIds = searchParams.get('workerIds') ? searchParams.get('workerIds')!.split(',') : [];
  const companyName = searchParams.get('companyName') || '';
  const companyId = searchParams.get('companyId') || '';

  const { toast } = useToast();
  const createBatchMutation = useCreateGauzePadPinningBatch();
  const { data: storageLocationsData = [] } = useStorageLocations();
  const { data: rawMaterialsData } = useRawMaterials({ limit: 100 });

  // Finished products from materials inventory
  const inventoryFinishedProducts = useMemo(() => {
    return (rawMaterialsData?.items || []).filter(
      (m: any) =>
        m.name?.toLowerCase().includes('gauze') ||
        m.name?.toLowerCase().includes('pad') ||
        m.category?.name?.toLowerCase().includes('finish')
    );
  }, [rawMaterialsData]);

  // Combined warehouse locations list
  const allWarehouseLocations = useMemo(() => {
    const fromApi = storageLocationsData.map((l: any) => l.name);
    const combined = Array.from(new Set([...STANDARD_GAUZE_PAD_LOCATIONS, ...fromApi]));
    return combined;
  }, [storageLocationsData]);

  // Batch General Information
  const [batchNumber, setBatchNumber] = useState('');
  const [productName, setProductName] = useState(STANDARD_GAUZE_PAD_PRODUCTS[0]);
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState(STANDARD_GAUZE_PAD_LOCATIONS[0]);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [notes, setNotes] = useState('');

  // Raw Material Intake State: 'ROLL' vs 'PIECES'
  const [materialType, setMaterialType] = useState<'ROLL' | 'PIECES'>('ROLL');

  // Roll Form Inputs
  const [rollWidth, setRollWidth] = useState<number | ''>(100);
  const [rollWidthUom, setRollWidthUom] = useState('cm');
  const [rollLength, setRollLength] = useState<number | ''>(120);
  const [rollLengthUom, setRollLengthUom] = useState('m');

  // Pieces Form Inputs
  const [pieceWidth, setPieceWidth] = useState<number | ''>(60);
  const [pieceWidthUom, setPieceWidthUom] = useState('cm');
  const [pieceLength, setPieceLength] = useState<number | ''>(3);
  const [pieceLengthUom, setPieceLengthUom] = useState('m');
  const [pieceCount, setPieceCount] = useState<number | ''>(30);

  // Operations: Pinning Size & Cutting Size
  const [pinningSize, setPinningSize] = useState<number | ''>(0.3);
  const [pinningSizeUom, setPinningSizeUom] = useState<'m' | 'cm'>('m');
  const [cuttingSize, setCuttingSize] = useState<number | ''>(2);

  // Salary Rate
  const [salaryRatePerPiece, setSalaryRatePerPiece] = useState<number | ''>(1.5);

  // Auto-generate batch code
  useEffect(() => {
    const d = new Date();
    const rand = Math.floor(100 + Math.random() * 900);
    setBatchNumber(`GPP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rand}`);
  }, []);

  // Pre-populate notes with handler info
  useEffect(() => {
    if (workerNames && !notes) {
      setNotes(`Assigned Workforce: ${workerNames}`);
    } else if (companyName && !notes) {
      setNotes(`Assigned Vendor: ${companyName}`);
    }
  }, [workerNames, companyName, notes]);

  // Calculations
  const calculatedTotalLength = useMemo(() => {
    if (materialType === 'ROLL') {
      return Number(rollLength) || 0;
    } else {
      let lengthM = Number(pieceLength) || 0;
      if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
      const count = Number(pieceCount) || 0;
      return Number((count * lengthM).toFixed(3));
    }
  }, [materialType, rollLength, pieceLength, pieceLengthUom, pieceCount]);

  const { piecesAfterPinning, outputQuantity, remnantLength } = useMemo(() => {
    let sizeM = Number(pinningSize) || 0;
    if (pinningSizeUom === 'cm') sizeM = sizeM / 100;
    const cuts = Number(cuttingSize) || 1;

    if (sizeM <= 0 || calculatedTotalLength <= 0 || cuts <= 0) {
      return { piecesAfterPinning: 0, outputQuantity: 0, remnantLength: 0 };
    }

    const pinningPieces = Math.floor(calculatedTotalLength / sizeM);
    const finalQty = Math.floor(pinningPieces / cuts);
    const remnant = Number((calculatedTotalLength % (sizeM * cuts)).toFixed(3));

    return { piecesAfterPinning: pinningPieces, outputQuantity: finalQty, remnantLength: remnant };
  }, [calculatedTotalLength, pinningSize, pinningSizeUom, cuttingSize]);

  // Salary Calculations
  const assignedWorkersList = useMemo(() => {
    if (!workerNames) return [];
    return workerNames.split(',').map((s) => s.trim()).filter(Boolean);
  }, [workerNames]);

  const workerCount = assignedWorkersList.length || 1;

  const { totalSalary, workerSalaryShare } = useMemo(() => {
    const rate = Number(salaryRatePerPiece) || 0;
    const total = Number((outputQuantity * rate).toFixed(2));
    const share = Number((total / workerCount).toFixed(2));
    return { totalSalary: total, workerSalaryShare: share };
  }, [outputQuantity, salaryRatePerPiece, workerCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast('Required Field', 'Please enter product name', 'warning');
      return;
    }

    if (materialType === 'ROLL') {
      if (!rollLength || Number(rollLength) <= 0) {
        toast('Invalid Length', 'Please enter a valid roll length', 'warning');
        return;
      }
    } else {
      if (!pieceLength || Number(pieceLength) <= 0 || !pieceCount || Number(pieceCount) <= 0) {
        toast('Invalid Intake', 'Please enter valid piece length and pieces count', 'warning');
        return;
      }
    }

    if (!pinningSize || Number(pinningSize) <= 0) {
      toast('Invalid Pinning Size', 'Please enter pinning size greater than 0', 'warning');
      return;
    }

    if (!cuttingSize || Number(cuttingSize) <= 0) {
      toast('Invalid Cutting Size', 'Please enter cutting size greater than 0', 'warning');
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
        cuttingSize: Number(cuttingSize),
        salaryRatePerPiece: Number(salaryRatePerPiece) || 0,
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

      toast('Batch Created', `Gauze Pad Pinning Batch ${batchNumber} started successfully`, 'success');
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
                Create Gauze Pad Pinning Batch
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Pad Pinning & Sizing
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dual division operation (Total Length ÷ Pinning Size ÷ Cutting Size) with real-time salary per output piece and worker split.
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
            form="gauze-pad-pinning-form"
            type="submit"
            size="sm"
            disabled={createBatchMutation.isPending}
            className="h-8 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{createBatchMutation.isPending ? 'Commencing...' : 'Commence Pinning Run'}</span>
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

      <form id="gauze-pad-pinning-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Batch General Details */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Hash className="h-4 w-4 text-cyan-600" />
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
                placeholder="GPP-2026-001"
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
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="" disabled>Select Finished Product Specification...</option>
                <optgroup label="Standard Finished Products">
                  {STANDARD_GAUZE_PAD_PRODUCTS.map((prod) => (
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

        {/* Raw Material Intake: Rolls or Pieces */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-cyan-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Raw Material Intake Form
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Select how raw gauze was received for pinning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1: Roll Form */}
            <button
              type="button"
              onClick={() => setMaterialType('ROLL')}
              className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
                materialType === 'ROLL'
                  ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-500/5 shadow-xs ring-1 ring-cyan-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  materialType === 'ROLL'
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">1. Roll Form</span>
                  {materialType === 'ROLL' && (
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Continuous raw gauze roll. Total length equals the single continuous roll length.
                </p>
              </div>
            </button>

            {/* Mode 2: Pieces Form */}
            <button
              type="button"
              onClick={() => setMaterialType('PIECES')}
              className={`p-3.5 rounded-lg border text-left transition-all relative flex items-start gap-3 ${
                materialType === 'PIECES'
                  ? 'border-cyan-600 dark:border-cyan-500 bg-cyan-500/5 shadow-xs ring-1 ring-cyan-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  materialType === 'PIECES'
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Scissors className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">2. Pieces Form</span>
                  {materialType === 'PIECES' && (
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pre-cut gauze strips. Total length equals count × length of each piece.
                </p>
              </div>
            </button>
          </div>

          {materialType === 'ROLL' ? (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/70 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(e) => setRollWidth(e.target.value === '' ? '' : Number(e.target.value))}
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
                </div>

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
                      onChange={(e) => setRollLength(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="120"
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
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/70 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      onChange={(e) => setPieceLength(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="3"
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
                </div>

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
                      onChange={(e) => setPieceWidth(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="60"
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
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Pieces Count <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={pieceCount}
                    onChange={(e) => setPieceCount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="30"
                    className="h-9 font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Evaluated Total Length */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-cyan-600" />
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

        {/* Pinning Size & Cutting Size Dual Division Engine */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Scissors className="h-4 w-4 text-cyan-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pinning & Cutting Dual Division Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Input 1: Pinning Size */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Pinning Size (Divisor 1) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pinningSize}
                  onChange={(e) => setPinningSize(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.3"
                  className="h-9 font-mono text-xs"
                  required
                />
                <select
                  value={pinningSizeUom}
                  onChange={(e) => setPinningSizeUom(e.target.value as 'm' | 'cm')}
                  className="h-9 px-2 text-xs rounded-md border border-input bg-background font-mono shrink-0"
                >
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Primary fold/pinning spacing
              </span>
            </div>

            {/* Input 2: Cutting Size */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Cutting Size (Divisor 2) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={cuttingSize}
                onChange={(e) => setCuttingSize(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2"
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Secondary cuts / folding divisor factor
              </span>
            </div>

            {/* Live Dual Division Formula Card */}
            <div className="p-3.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-300">
                  Dual Division Formula
                </span>
                <div className="text-xs font-mono text-foreground mt-1">
                  ({calculatedTotalLength.toFixed(2)}m ÷ {pinningSize || 0}m) ÷ {cuttingSize || 1}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  = {piecesAfterPinning} pcs ÷ {cuttingSize || 1} cuts
                </div>
              </div>
              <div className="mt-2 pt-1 border-t border-cyan-500/15 flex items-baseline justify-between">
                <span className="text-[10px] text-muted-foreground">Output:</span>
                <strong className="text-sm font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {outputQuantity} Gauze Pads
                </strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Salary Engine: Rate per Output Quantity & Worker Split */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Salary Engine (Per Output Quantity with Equal Worker Split)
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              {workerCount} Assigned Worker{workerCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input: Salary Rate per Piece */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Salary Rate per Output Pad (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={salaryRatePerPiece}
                  onChange={(e) =>
                    setSalaryRatePerPiece(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="1.50"
                  className="pl-7 h-9 font-mono text-xs"
                  required
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Rate paid per finished gauze pad cut
              </span>
            </div>

            {/* Total Salary Display */}
            <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  Total Accrued Batch Salary
                </span>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {outputQuantity} pads × ₹{Number(salaryRatePerPiece || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Equal Split per Assigned Worker */}
            <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">
                  Equal Split per Worker
                </span>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  ₹{totalSalary.toFixed(2)} ÷ {workerCount} member{workerCount > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                ₹{workerSalaryShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ person</span>
              </div>
            </div>
          </div>

          {/* Assigned Worker Split Details */}
          {assignedWorkersList.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-foreground block mb-2">
                Individual Workforce Distribution:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {assignedWorkersList.map((name, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-secondary/50 border border-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-foreground truncate">{name}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      ₹{workerSalaryShare.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                placeholder="Add instructions..."
                className="h-9 text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Submit Bar */}
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
            className="h-9 px-5 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{createBatchMutation.isPending ? 'Commencing Run...' : 'Commence Pinning Run'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateGauzePadPinningBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading Gauze Pad Pinning Setup...
        </div>
      }
    >
      <CreateGauzePadPinningBatchContent />
    </Suspense>
  );
}
