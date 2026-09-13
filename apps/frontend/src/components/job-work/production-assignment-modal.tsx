'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobWorkCompanies } from '@/hooks/useJobWork';
import { Employee } from '@/types/employee.types';
import {
  Users,
  Building2,
  Factory,
  Scroll,
  Check,
  Search,
  UserCheck,
  X,
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  Scissors,
  Sun,
  Truck,
  Bed,
} from 'lucide-react';

export type ProductionType =
  | 'GAUZE'
  | 'GAMJEE'
  | 'MOPING_PAD'
  | 'GAUZE_PAD_PINNING'
  | 'DRYING'
  | 'PILLOW_BEDSHEET'
  | 'WEAVING';

interface ProductionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionType: ProductionType | null;
}

export function ProductionAssignmentModal({
  isOpen,
  onClose,
  productionType,
}: ProductionAssignmentModalProps) {
  const router = useRouter();

  // Mode: 'WORKERS' (Our Company Workers) or 'COMPANY' (Jobworking Company)
  const [executorType, setExecutorType] = useState<'WORKERS' | 'COMPANY'>('WORKERS');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');

  // Queries
  const { data: employeesData, isLoading: loadingEmployees } = useEmployees({
    status: 'ACTIVE',
    limit: 100,
  });
  const { data: companies = [], isLoading: loadingCompanies } = useJobWorkCompanies();

  const allEmployees: Employee[] = useMemo(() => {
    return employeesData?.items || [];
  }, [employeesData?.items]);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!workerSearch.trim()) return allEmployees;
    const query = workerSearch.toLowerCase();
    return allEmployees.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      const code = (emp.employeeCode || '').toLowerCase();
      const dept = (emp.department?.name || '').toLowerCase();
      return fullName.includes(query) || code.includes(query) || dept.includes(query);
    });
  }, [allEmployees, workerSearch]);

  const selectedWorkers = useMemo(() => {
    return allEmployees.filter((emp) => selectedWorkerIds.includes(emp.id));
  }, [allEmployees, selectedWorkerIds]);

  const selectedCompany = useMemo(() => {
    return companies.find((c: any) => c.id === selectedCompanyId);
  }, [companies, selectedCompanyId]);

  // Toggle worker selection
  const handleToggleWorker = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId]
    );
  };

  const handleSelectAllWorkers = () => {
    setSelectedWorkerIds(filteredEmployees.map((e) => e.id));
  };

  const handleClearWorkers = () => {
    setSelectedWorkerIds([]);
  };

  const isFormValid =
    executorType === 'WORKERS'
      ? selectedWorkerIds.length > 0
      : Boolean(selectedCompanyId);

  // Submit and route
  const handleContinue = () => {
    if (!isFormValid || !productionType) return;

    const queryParams = new URLSearchParams();
    queryParams.set('source', 'job-work');
    queryParams.set('executorType', executorType);

    if (executorType === 'WORKERS') {
      queryParams.set('workerIds', selectedWorkerIds.join(','));
      const workerNames = selectedWorkers
        .map((w) => `${w.firstName} ${w.lastName}`.trim())
        .join(', ');
      queryParams.set('workerNames', workerNames);
    } else {
      queryParams.set('companyId', selectedCompanyId);
      if (selectedCompany) {
        queryParams.set('companyName', selectedCompany.companyName);
      }
      if (deliveryPerson.trim()) {
        queryParams.set('deliveryPerson', deliveryPerson.trim());
      }
      if (vehicleNumber.trim()) {
        queryParams.set('vehicleNumber', vehicleNumber.trim());
      }
    }

    const basePath =
      productionType === 'GAUZE'
        ? '/gauze-production'
        : productionType === 'GAMJEE'
        ? '/gamjee-production'
        : productionType === 'MOPING_PAD'
        ? '/moping-pad-production'
        : productionType === 'GAUZE_PAD_PINNING'
        ? '/gauze-pad-pinning'
        : productionType === 'PILLOW_BEDSHEET'
        ? '/pillow-bedsheet-production'
        : productionType === 'WEAVING'
        ? '/job-work/weaving'
        : '/drying';

    const targetUrl =
      productionType === 'WEAVING'
        ? `/job-work/weaving/new?${queryParams.toString()}`
        : `${basePath}/batches/new?${queryParams.toString()}`;

    onClose();
    router.push(targetUrl);
  };

  const isGauze = productionType === 'GAUZE';
  const isGamjee = productionType === 'GAMJEE';
  const isMopingPad = productionType === 'MOPING_PAD';
  const isGauzePadPinning = productionType === 'GAUZE_PAD_PINNING';
  const isDrying = productionType === 'DRYING';
  const isPillowBedsheet = productionType === 'PILLOW_BEDSHEET';
  const isWeaving = productionType === 'WEAVING';

  const titleText = isGauze
    ? 'Gauze Production'
    : isGamjee
    ? 'Gamjee Production'
    : isMopingPad
    ? 'Moping Pad Production'
    : isGauzePadPinning
    ? 'Gauze Pad Pinning'
    : isPillowBedsheet
    ? 'Pillow Cover & Bed Sheet Production'
    : isWeaving
    ? 'Weaving Job Work (நெசவு பணி)'
    : 'Drying Process';

  const badgeText = isGauze
    ? 'Gauze & Bleached Fabric'
    : isGamjee
    ? 'Gamjee Rolls & Cotton'
    : isMopingPad
    ? 'Floor & Surgical Moping Pads'
    : isGauzePadPinning
    ? 'Pad Sizing, Dual Division & Salary'
    : isPillowBedsheet
    ? 'Roll Weight, GSM & Piece Salary'
    : isWeaving
    ? 'Yarn to Fabric, Formulas & In-Pass'
    : 'Pieces Drying, Progress & Meter Salary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={`Assign Job: ${titleText}`}
      description="Choose who performs this manufacturing run before continuing to the production line."
    >
      <div className="space-y-4 pt-1">
        {/* Production Identifier Banner */}
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${
            isGauze
              ? 'bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300'
              : isGamjee
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : isMopingPad
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300'
              : isGauzePadPinning
              ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-700 dark:text-cyan-300'
              : isPillowBedsheet
              ? 'bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-purple-300'
              : isWeaving
              ? 'bg-lime-500/5 border-lime-500/20 text-lime-700 dark:text-lime-300'
              : 'bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-orange-300'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isGauze
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                : isGamjee
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : isMopingPad
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : isGauzePadPinning
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : isPillowBedsheet
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                : isWeaving
                ? 'bg-lime-500/15 text-lime-600 dark:text-lime-400'
                : 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
            }`}
          >
            {isGauze ? (
              <Factory className="h-4 w-4" />
            ) : isGamjee ? (
              <Scroll className="h-4 w-4" />
            ) : isMopingPad ? (
              <Layers className="h-4 w-4" />
            ) : isGauzePadPinning ? (
              <Scissors className="h-4 w-4" />
            ) : isPillowBedsheet ? (
              <Bed className="h-4 w-4" />
            ) : isWeaving ? (
              <Layers className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground">{titleText}</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-background/80 border border-border">
                {badgeText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select workforce or vendor to dispatch materials and track line throughput.
            </p>
          </div>
        </div>

        {/* Step 1: Who does this job? */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            1. Who will perform this job?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option A: Our Company Workers */}
            <button
              type="button"
              onClick={() => setExecutorType('WORKERS')}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                executorType === 'WORKERS'
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                {executorType === 'WORKERS' && (
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <span className="font-semibold text-foreground text-xs block">
                  Our Company Workers
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  In-house factory team (1 or more)
                </span>
              </div>
            </button>

            {/* Option B: Jobworking Company */}
            <button
              type="button"
              onClick={() => setExecutorType('COMPANY')}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                executorType === 'COMPANY'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-500/5 shadow-xs ring-1 ring-blue-500'
                  : 'border-border bg-card hover:bg-secondary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="h-4 w-4" />
                </div>
                {executorType === 'COMPANY' && (
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <span className="font-semibold text-foreground text-xs block">
                  Jobworking Company
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  External subcontractor / partner
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Details Selection */}
        {executorType === 'WORKERS' ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Select Worker(s) ({selectedWorkerIds.length} selected)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllWorkers}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={handleClearWorkers}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Selected Workers Chips */}
            {selectedWorkers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-secondary/30 rounded-lg border border-border/70 max-h-24 overflow-y-auto">
                {selectedWorkers.map((worker) => (
                  <span
                    key={worker.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  >
                    <UserCheck className="h-3 w-3" />
                    <span>
                      {worker.firstName} {worker.lastName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleWorker(worker.id)}
                      className="hover:bg-emerald-500/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search worker by name, employee code, or department..."
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Worker List */}
            <div className="border border-border rounded-xl divide-y divide-border/60 max-h-56 overflow-y-auto bg-card">
              {loadingEmployees ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Loading employee records...
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No active workers found matching &ldquo;{workerSearch}&rdquo;
                </div>
              ) : (
                filteredEmployees.map((worker) => {
                  const isSelected = selectedWorkerIds.includes(worker.id);
                  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim();
                  return (
                    <div
                      key={worker.id}
                      onClick={() => handleToggleWorker(worker.id)}
                      className={`flex items-center justify-between p-2.5 px-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                          : 'hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-muted-foreground/40 bg-background'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {fullName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span>{worker.employeeCode}</span>
                            {worker.department?.name && (
                              <>
                                <span>•</span>
                                <span className="font-sans text-[10px]">{worker.department.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {worker.employmentType && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono shrink-0">
                          {worker.employmentType}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              You can select 1 or multiple workers who will be involved in this manufacturing shift.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              2. Select Jobworking Vendor / Company
            </label>

            {loadingCompanies ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Loading registered companies...
              </div>
            ) : companies.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                No registered jobworking companies found. Please register a jobworking partner in system settings.
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Jobworking Company --</option>
                  {companies.map((comp: any) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.companyName} {comp.contactPerson ? `(${comp.contactPerson})` : ''}
                    </option>
                  ))}
                </select>

                {/* Selected Company Preview Card */}
                {selectedCompany && (
                  <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {selectedCompany.companyName}
                      </span>
                      {selectedCompany.gstin && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          GST: {selectedCompany.gstin}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {selectedCompany.contactPerson && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>Contact: {selectedCompany.contactPerson}</span>
                        </div>
                      )}
                      {selectedCompany.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{selectedCompany.phone}</span>
                        </div>
                      )}
                      {selectedCompany.address && (
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{selectedCompany.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Person & Vehicle Number Inputs */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-foreground">
                      Transport & Dispatch Carrier Details
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      (Required for Jobwork Company dispatch)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Delivery Person / Driver Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={deliveryPerson}
                        onChange={(e) => setDeliveryPerson(e.target.value)}
                        className="h-8.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-foreground block mb-1">
                        Vehicle Number
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. TN-67-AB-1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="h-8.5 text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!isFormValid}
            size="sm"
            className={`gap-1.5 text-white ${
              isGauze
                ? 'bg-blue-600 hover:bg-blue-700'
                : isGamjee
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : isMopingPad
                ? 'bg-amber-600 hover:bg-amber-700'
                : isGauzePadPinning
                ? 'bg-cyan-600 hover:bg-cyan-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            <span>Continue to {titleText}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
