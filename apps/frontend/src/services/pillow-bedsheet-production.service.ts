export type PillowBedsheetProductType = 'BED_SHEET' | 'PILLOW_COVER';

export type PillowBedsheetBatchStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface PillowBedsheetBatch {
  id: string;
  batchNumber: string;
  productName: string;
  productType: PillowBedsheetProductType; // 'BED_SHEET' or 'PILLOW_COVER'

  // Raw Material Roll Intake Attributes
  weightKg: number; // weight in KG
  gsm: number; // GSM (grams per square meter)
  rollWidth: number; // roll width dimension
  rollWidthUom: string; // cm, m, inch
  rollWidthInMeters: number; // normalized width in meters

  // Calculated Roll Length
  totalLength: number; // TL in meters: (((weightKg * 1000) / rollWidthInMeters) / gsm)

  // Bed Sheet Specific Parameters
  bedSheetLength?: number; // length of bed sheet
  bedSheetLengthUom?: string; // m or cm

  // Pillow Cover Specific Parameters
  pillowCoverCuttingLength?: number; // PCL: cutting length
  pillowCoverCuttingLengthUom?: string; // m or cm
  cuttingCount?: number; // cutting count multiplier (e.g. 2, 4)

  // Output Quantity Calculation
  outputQuantity: number; // Bed Sheet: Math.floor(TL / BS_length); Pillow Cover: Math.floor(TL / PCL) * cuttingCount
  remnantLength: number; // Leftover fabric length in meters

  // Progress Tracking
  completedQuantity: number;
  pendingQuantity: number;
  completionPercentage: number;

  // Salary Engine
  salaryRatePerUnit: number; // ₹ per piece/quantity
  totalSalary: number; // outputQuantity * salaryRatePerUnit
  workerSalaryShare: number; // totalSalary / workerCount

  // Workforce / Vendor Assignment
  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  // Top 4 Notebook Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;

  status: PillowBedsheetBatchStatus;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePillowBedsheetBatchInput {
  batchNumber?: string;
  productName: string;
  productType: PillowBedsheetProductType;

  // Raw Material Roll Intake
  weightKg: number;
  gsm: number;
  rollWidth: number;
  rollWidthUom?: string;

  // Output Sizing
  bedSheetLength?: number;
  bedSheetLengthUom?: string;
  pillowCoverCuttingLength?: number;
  pillowCoverCuttingLengthUom?: string;
  cuttingCount?: number;

  // Salary
  salaryRatePerUnit: number;

  // Workforce / Vendor Assignment
  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  // Notebook Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;

  startDate?: string;
  targetDate?: string;
  notes?: string;
}

const STORAGE_KEY = 'ims_pillow_bedsheet_batches_v1';

const INITIAL_BATCHES: PillowBedsheetBatch[] = [
  {
    id: 'pbs-batch-101',
    batchNumber: 'PBS-2026-001',
    productName: 'Hospital Grade Cotton Bed Sheet (240cm)',
    productType: 'BED_SHEET',
    weightKg: 65,
    gsm: 130,
    rollWidth: 160,
    rollWidthUom: 'cm',
    rollWidthInMeters: 1.6,
    totalLength: 312.5, // ((65*1000)/1.6)/130
    bedSheetLength: 2.4,
    bedSheetLengthUom: 'm',
    outputQuantity: 130, // Math.floor(312.5 / 2.4)
    remnantLength: 0.5,
    completedQuantity: 80,
    pendingQuantity: 50,
    completionPercentage: 61.5,
    salaryRatePerUnit: 4.5,
    totalSalary: 585.0,
    workerSalaryShare: 292.5,
    executorType: 'WORKERS',
    workerIds: ['emp-1', 'emp-2'],
    workerNames: 'Ramesh Kumar, Suresh Patel',
    dcNo: 'DC-BS-01',
    dcDate: '2026-09-02',
    ends: '1140',
    itemType: '22x16',
    status: 'IN_PROGRESS',
    startDate: '2026-09-02',
    targetDate: '2026-09-18',
    notes: 'Premium 100% bleached cotton bed sheet cutting & hemming.',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-04T14:30:00.000Z',
  },
];

class PillowBedsheetProductionService {
  private getStoredBatches(): PillowBedsheetBatch[] {
    if (typeof window === 'undefined') return INITIAL_BATCHES;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
        return INITIAL_BATCHES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BATCHES;
    }
  }

  private setStoredBatches(batches: PillowBedsheetBatch[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error('Failed to save pillow-bedsheet batches to localStorage', e);
    }
  }

  public normalizeWidthToMeters(width: number, uom: string = 'cm'): number {
    if (!width || width <= 0) return 1;
    switch (uom.toLowerCase()) {
      case 'm':
      case 'meter':
      case 'meters':
        return width;
      case 'inch':
      case 'inches':
        return Number(((width * 2.54) / 100).toFixed(4));
      case 'cm':
      default:
        return Number((width / 100).toFixed(4));
    }
  }

  public normalizeLengthToMeters(length: number, uom: string = 'm'): number {
    if (!length || length <= 0) return 1;
    switch (uom.toLowerCase()) {
      case 'cm':
        return length / 100;
      case 'm':
      default:
        return length;
    }
  }

  public calculateCalculations(
    weightKg: number,
    gsm: number,
    rollWidth: number,
    rollWidthUom: string,
    productType: PillowBedsheetProductType,
    bedSheetLength: number = 2.4,
    bedSheetLengthUom: string = 'm',
    pillowCoverCuttingLength: number = 0.8,
    pillowCoverCuttingLengthUom: string = 'm',
    cuttingCount: number = 1
  ): {
    totalLength: number;
    outputQuantity: number;
    remnantLength: number;
  } {
    const widthM = this.normalizeWidthToMeters(rollWidth, rollWidthUom);
    const validGsm = gsm > 0 ? gsm : 1;
    const validWeight = weightKg > 0 ? weightKg : 0;

    // Formula: (((weight * 1000) / width_in_meter) / GSM)
    const totalLength = Number((((validWeight * 1000) / widthM) / validGsm).toFixed(3));

    if (totalLength <= 0) {
      return { totalLength: 0, outputQuantity: 0, remnantLength: 0 };
    }

    if (productType === 'BED_SHEET') {
      const bsM = this.normalizeLengthToMeters(bedSheetLength, bedSheetLengthUom);
      if (bsM <= 0) return { totalLength, outputQuantity: 0, remnantLength: totalLength };
      const outputQty = Math.floor(totalLength / bsM);
      const remnant = Number((totalLength % bsM).toFixed(3));
      return { totalLength, outputQuantity: outputQty, remnantLength: remnant };
    } else {
      const pclM = this.normalizeLengthToMeters(
        pillowCoverCuttingLength,
        pillowCoverCuttingLengthUom
      );
      const validCuts = cuttingCount > 0 ? cuttingCount : 1;
      if (pclM <= 0) return { totalLength, outputQuantity: 0, remnantLength: totalLength };
      const baseCuts = Math.floor(totalLength / pclM);
      const outputQty = baseCuts * validCuts;
      const remnant = Number((totalLength % pclM).toFixed(3));
      return { totalLength, outputQuantity: outputQty, remnantLength: remnant };
    }
  }

  public async getAllBatches(params?: {
    search?: string;
    status?: string;
    productType?: string;
  }): Promise<{ items: PillowBedsheetBatch[]; total: number }> {
    let list = this.getStoredBatches();

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((b) => b.status === params.status);
    }

    if (params?.productType && params.productType !== 'ALL') {
      list = list.filter((b) => b.productType === params.productType);
    }

    if (params?.search && params.search.trim()) {
      const s = params.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(s) ||
          b.productName.toLowerCase().includes(s) ||
          (b.dcNo && b.dcNo.toLowerCase().includes(s)) ||
          (b.workerNames && b.workerNames.toLowerCase().includes(s)) ||
          (b.companyName && b.companyName.toLowerCase().includes(s))
      );
    }

    // Sort newest-first
    list.sort((a, b) => {
      const tA = new Date(a.createdAt || a.startDate || 0).getTime() || 0;
      const tB = new Date(b.createdAt || b.startDate || 0).getTime() || 0;
      if (tB !== tA) return tB - tA;
      return (b.batchNumber || b.id).localeCompare(a.batchNumber || a.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });

    return { items: list, total: list.length };
  }

  public async getBatchById(id: string): Promise<PillowBedsheetBatch | null> {
    const list = this.getStoredBatches();
    return list.find((b) => b.id === id) || null;
  }

  public async getDashboardStats(): Promise<{
    totalBatches: number;
    activeBatches: number;
    completedBatches: number;
    totalBedSheetsOutput: number;
    totalPillowCoversOutput: number;
    totalSalaryDisbursed: number;
  }> {
    const list = this.getStoredBatches();
    const active = list.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT');
    const completed = list.filter((b) => b.status === 'COMPLETED');

    const totalBedSheets = list
      .filter((b) => b.productType === 'BED_SHEET')
      .reduce((sum, b) => sum + (b.outputQuantity || 0), 0);

    const totalPillowCovers = list
      .filter((b) => b.productType === 'PILLOW_COVER')
      .reduce((sum, b) => sum + (b.outputQuantity || 0), 0);

    const totalSalary = list.reduce((sum, b) => sum + (b.totalSalary || 0), 0);

    return {
      totalBatches: list.length,
      activeBatches: active.length,
      completedBatches: completed.length,
      totalBedSheetsOutput: totalBedSheets,
      totalPillowCoversOutput: totalPillowCovers,
      totalSalaryDisbursed: Number(totalSalary.toFixed(2)),
    };
  }

  public async createBatch(input: CreatePillowBedsheetBatchInput): Promise<PillowBedsheetBatch> {
    const list = this.getStoredBatches();
    const id = `pbs-${Date.now()}`;
    const batchNumber =
      input.batchNumber ||
      `PBS-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;

    const rollWidthUom = input.rollWidthUom || 'cm';
    const rollWidthInMeters = this.normalizeWidthToMeters(input.rollWidth, rollWidthUom);

    const { totalLength, outputQuantity, remnantLength } = this.calculateCalculations(
      input.weightKg,
      input.gsm,
      input.rollWidth,
      rollWidthUom,
      input.productType,
      input.bedSheetLength,
      input.bedSheetLengthUom,
      input.pillowCoverCuttingLength,
      input.pillowCoverCuttingLengthUom,
      input.cuttingCount
    );

    const rate = Number(input.salaryRatePerUnit) || 0;
    const totalSalary = Number((outputQuantity * rate).toFixed(2));
    const workerCount = input.workerIds?.length || 1;
    const workerSalaryShare = Number((totalSalary / workerCount).toFixed(2));

    const newBatch: PillowBedsheetBatch = {
      id,
      batchNumber,
      productName: input.productName,
      productType: input.productType,
      weightKg: input.weightKg,
      gsm: input.gsm,
      rollWidth: input.rollWidth,
      rollWidthUom,
      rollWidthInMeters,
      totalLength,
      bedSheetLength: input.bedSheetLength,
      bedSheetLengthUom: input.bedSheetLengthUom || 'm',
      pillowCoverCuttingLength: input.pillowCoverCuttingLength,
      pillowCoverCuttingLengthUom: input.pillowCoverCuttingLengthUom || 'm',
      cuttingCount: input.cuttingCount || 1,
      outputQuantity,
      remnantLength,
      completedQuantity: 0,
      pendingQuantity: outputQuantity,
      completionPercentage: 0,
      salaryRatePerUnit: rate,
      totalSalary,
      workerSalaryShare,
      executorType: input.executorType,
      workerIds: input.workerIds,
      workerNames: input.workerNames,
      companyId: input.companyId,
      companyName: input.companyName,
      deliveryPerson: input.deliveryPerson,
      vehicleNumber: input.vehicleNumber,
      dcNo: input.dcNo,
      dcDate: input.dcDate,
      ends: input.ends,
      itemType: input.itemType,
      status: 'IN_PROGRESS',
      startDate: input.startDate || new Date().toISOString().split('T')[0],
      targetDate: input.targetDate,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newBatch);
    this.setStoredBatches(list);
    return newBatch;
  }

  public async updateProgress(
    id: string,
    completedQuantity: number,
    status?: PillowBedsheetBatchStatus,
    notes?: string
  ): Promise<PillowBedsheetBatch> {
    const list = this.getStoredBatches();
    const batch = list.find((b) => b.id === id);
    if (!batch) throw new Error('Batch not found');

    const total = batch.outputQuantity || 1;
    const completed = Math.min(Math.max(0, completedQuantity), total);
    const pending = Math.max(0, total - completed);
    const completionPercentage = Number(((completed / total) * 100).toFixed(1));

    let finalStatus = status || batch.status;
    if (completed >= total) {
      finalStatus = 'COMPLETED';
      batch.completionDate = new Date().toISOString().split('T')[0];
    } else if (completed > 0 && finalStatus === 'DRAFT') {
      finalStatus = 'IN_PROGRESS';
    }

    const isCompleted = finalStatus === 'COMPLETED';
    let updatedNotes = batch.notes;
    if (notes !== undefined) {
      const trimmed = notes.trim();
      if (!trimmed) {
        updatedNotes = undefined;
      } else if (trimmed === batch.notes?.trim()) {
        updatedNotes = batch.notes;
      } else if (trimmed.includes('[Final Wastage') || trimmed.includes('[Progress')) {
        updatedNotes = trimmed;
      } else {
        updatedNotes = batch.notes
          ? `${batch.notes}\n[${isCompleted ? 'Final Wastage' : 'Progress'}]: ${trimmed}`
          : `[${isCompleted ? 'Final Wastage' : 'Progress'}]: ${trimmed}`;
      }
    }

    batch.completedQuantity = completed;
    batch.pendingQuantity = pending;
    batch.completionPercentage = completionPercentage;
    batch.status = finalStatus;
    batch.notes = updatedNotes;
    batch.updatedAt = new Date().toISOString();

    this.setStoredBatches(list);
    return batch;
  }

  public async updateBatchStatus(
    id: string,
    status: PillowBedsheetBatchStatus
  ): Promise<PillowBedsheetBatch> {
    const list = this.getStoredBatches();
    const batch = list.find((b) => b.id === id);
    if (!batch) throw new Error('Batch not found');

    batch.status = status;
    if (status === 'COMPLETED') {
      batch.completedQuantity = batch.outputQuantity;
      batch.pendingQuantity = 0;
      batch.completionPercentage = 100;
      batch.completionDate = new Date().toISOString().split('T')[0];
    }
    batch.updatedAt = new Date().toISOString();

    this.setStoredBatches(list);
    return batch;
  }
}

export const pillowBedsheetProductionService = new PillowBedsheetProductionService();
