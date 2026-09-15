'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateDryingBatch } from '@/hooks/useDrying';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useToast } from '@/components/ui/toast';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import {
  ArrowLeft,
  Sun,
  Wind,
  Calculator,
  Boxes,
  Users,
  Building2,
  CheckCircle2,
  Hash,
  Coins,
  Check,
  UserCheck,
  Percent,
  FileText,
  Calendar,
  Truck,
  User,
} from 'lucide-react';

const STANDARD_DRYING_PRODUCTS = [
  'Absorbent Bleached Gauze Thans (23m)',
  'Sterile Surgical Bandage Strips (15m)',
  'Bleached Cotton Gauze Sheeting (20m)',
  'Standard Surgical Cloth Roll (25m)',
  'Heavy-Duty Bleached Gauze Fabric (23m)',
];

const STANDARD_ITEM_TYPES = ['22x16', '23x17', '28x27', '22x14'];

function CreateDryingBatchContent() {
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
  const createBatchMutation = useCreateDryingBatch();
  const { data: rawMaterialsData } = useRawMaterials({ limit: 100 });

  // Finished products from materials inventory
  const inventoryFinishedProducts = useMemo(() => {
    return (rawMaterialsData?.items || []).filter(
      (m: any) =>
        m.name?.toLowerCase().includes('gauze') ||
        m.name?.toLowerCase().includes('cloth') ||
        m.name?.toLowerCase().includes('than') ||
        m.category?.name?.toLowerCase().includes('finish')
    );
  }, [rawMaterialsData]);

  // Batch General Information
  const [batchNumber, setBatchNumber] = useState('');
  const [productName, setProductName] = useState(STANDARD_DRYING_PRODUCTS[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  // Jobwork / Notebook Parameters
  const [dcNo, setDcNo] = useState('05');
  const [dcDate, setDcDate] = useState(new Date().toISOString().split('T')[0]);
  const [ends, setEnds] = useState('1140');
  const [itemType, setItemType] = useState('22x14');

  // Company Logistics
  const [deliveryPerson, setDeliveryPerson] = useState(initialDeliveryPerson);
  const [vehicleNumber, setVehicleNumber] = useState(initialVehicleNumber);

  // Pieces-Only Intake
  const [pieceLength, setPieceLength] = useState<number | ''>(23);
  const [pieceLengthUom, setPieceLengthUom] = useState('m');
  const [pieceWidth, setPieceWidth] = useState<number | ''>(90);
  const [pieceWidthUom, setPieceWidthUom] = useState('cm');
  const [totalPieces, setTotalPieces] = useState<number | ''>(100);

  // Salary Engine: Rate per meter (0.10 ₹/m produces ₹230 for 100 pcs of 23m)
  const [salaryRatePerMeter, setSalaryRatePerMeter] = useState<number | ''>(0.1);

  // Auto-generate batch code
  useEffect(() => {
    const d = new Date();
    const rand = Math.floor(100 + Math.random() * 900);
    setBatchNumber(`DRY-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${rand}`);
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
    const pieces = Number(totalPieces) || 0;
    let lengthM = Number(pieceLength) || 0;
    if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
    return Number((pieces * lengthM).toFixed(3));
  }, [totalPieces, pieceLength, pieceLengthUom]);

  // Salary Calculations
  const assignedWorkersList = useMemo(() => {
    if (!workerNames) return [];
    return workerNames.split(',').map((s) => s.trim()).filter(Boolean);
  }, [workerNames]);

  const workerCount = assignedWorkersList.length || 1;

  const { totalSalary, workerSalaryShare } = useMemo(() => {
    const rate = Number(salaryRatePerMeter) >= 0 ? Number(salaryRatePerMeter) : 0.1;
    const planned = Number((calculatedTotalLength * rate).toFixed(2));
    const share = Number((planned / workerCount).toFixed(2));
    return { totalSalary: planned, workerSalaryShare: share };
  }, [calculatedTotalLength, salaryRatePerMeter, workerCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast('Required Field', 'Please enter product specification', 'warning');
      return;
    }

    if (!pieceLength || Number(pieceLength) <= 0) {
      toast('Invalid Length', 'Please enter piece length greater than 0', 'warning');
      return;
    }

    if (!totalPieces || Number(totalPieces) <= 0) {
      toast('Invalid Pieces Count', 'Please enter total pieces count greater than 0', 'warning');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        batchNumber: batchNumber.trim() || undefined,
        productName: productName.trim(),
        pieceLength: Number(pieceLength),
        pieceLengthUom,
        pieceWidth: Number(pieceWidth) || 0,
        pieceWidthUom,
        totalPieces: Number(totalPieces),
        completedPieces: 0,
        salaryRatePerMeter: Number(salaryRatePerMeter) >= 0 ? Number(salaryRatePerMeter) : 0.1,
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

      toast('Batch Created', `Drying Batch ${batchNumber} started successfully`, 'success');
      router.push('/drying');
    } catch (err: any) {
      toast('Creation Failed', err?.message || 'Could not create batch', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/drying">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Back to Drying Operations">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Create Drying Process Batch
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Chamber / Line Drying
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/drying">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            form="drying-batch-form"
            type="submit"
            size="sm"
            disabled={createBatchMutation.isPending}
            className="h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{createBatchMutation.isPending ? 'Commencing Run...' : 'Commence Drying Run'}</span>
          </Button>
        </div>
      </div>

      {/* Pre-Assigned Workforce / Vendor Banner */}
      <Card className="p-4 bg-card border-border/80 shadow-2xs space-y-3">
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
                  {executorType === 'WORKERS' ? 'In-House Drying Workforce' : 'Jobworking Partner Company'}
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

        {/* Carrier Details if Outsourced to Job Working Company */}
        {executorType === 'COMPANY' && (
          <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-500/5 p-3 rounded-md border border-blue-500/15">
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Delivery Person
              </label>
              <Input
                type="text"
                placeholder="e.g. Ramesh / Suresh"
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Vehicle Number
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

      {/* Notebook Jobwork Parameters (Top 4 Red Circle Data) */}
      <Card className="p-5 border-border bg-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Job Work Production Parameters (DC, Ends & Item Type)
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20">
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
              placeholder="05"
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

      <form id="drying-batch-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Batch & Product Details */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Hash className="h-4 w-4 text-orange-600" />
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
                placeholder="DRY-2026-001"
                className="h-9 font-mono text-xs"
                required
              />
            </div>

            <div>
              <MasterEntityDropdown
                label="Product Specification"
                value={productName}
                onChange={setProductName}
                storageKey="drying_products"
                options={[
                  ...STANDARD_DRYING_PRODUCTS.map((prod) => ({ value: prod, label: prod })),
                  ...inventoryFinishedProducts.map((p: any) => ({
                    value: p.name,
                    label: `${p.name} (${p.sku})`,
                  })),
                ]}
                placeholder="Select Finished Product Specification..."
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

        {/* Pieces-Only Raw Material Intake */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-orange-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fabric Pieces Intake Form
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Intake format: Length × Width × Pieces Count
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
                  min="0.1"
                  step="0.1"
                  value={pieceLength}
                  onChange={(e) => setPieceLength(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="23"
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
                Standard piece length (e.g. 23m)
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
                  onChange={(e) => setPieceWidth(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="90"
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
                Fabric width (e.g. 90cm)
              </span>
            </div>

            {/* Total Pieces */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Total Pieces Received <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={totalPieces}
                onChange={(e) => setTotalPieces(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100"
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Total pieces assigned to dry (e.g. 100)
              </span>
            </div>
          </div>

          {/* Evaluated Total Length Callout */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-foreground">
                Evaluated Total Fabric Length:
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-foreground">
                {calculatedTotalLength.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-mono">meters</span>
              <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                ({totalPieces || 0} pcs × {pieceLength || 0}m)
              </span>
            </div>
          </div>
        </Card>

        {/* Salary Engine: Rate per Meter */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Salary Compensation (Equal Worker Split)
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Per Linear Meter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rate per Meter */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Salary Rate per Meter (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0.001"
                  step="0.01"
                  value={salaryRatePerMeter}
                  onChange={(e) =>
                    setSalaryRatePerMeter(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.10"
                  className="pl-7 h-9 font-mono text-xs"
                  required
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Standard: ₹0.10/m ({totalPieces || 100} pcs × {pieceLength || 23}m = {calculatedTotalLength}m = ₹{totalSalary})
              </span>
            </div>

            {/* Total Planned Salary */}
            <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  Total Planned Batch Salary
                </span>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {calculatedTotalLength}m × ₹{Number(salaryRatePerMeter || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Worker Equal Split */}
            <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">
                  Planned Share per Worker
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
                Workforce Planned Earnings Allocation:
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

        {/* Operational Notes */}
        <Card className="p-5 border-border bg-card space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Operational Notes & Instructions
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add heat, moisture, or ventilation instructions..."
              className="h-9 text-xs"
            />
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/drying">
            <Button type="button" variant="outline" size="sm" className="h-9 px-4 text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={createBatchMutation.isPending}
            className="h-9 px-5 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{createBatchMutation.isPending ? 'Commencing Run...' : 'Commence Drying Run'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateDryingBatchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading Drying Batch Setup...
        </div>
      }
    >
      <CreateDryingBatchContent />
    </Suspense>
  );
}
