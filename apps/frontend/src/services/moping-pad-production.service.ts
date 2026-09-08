export type MopingPadRawMaterialType = 'ROLL' | 'PIECES';

export type MopingPadBatchStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MopingPadBatch {
  id: string;
  batchNumber: string;
  productName: string;
  materialType: MopingPadRawMaterialType;

  // Roll Form attributes
  rollWidth?: number;
  rollWidthUom?: string; // cm, inch, mm
  rollLength?: number; // meters
  rollLengthUom?: string; // m

  // Pieces Form attributes
  pieceLength?: number;
  pieceLengthUom?: string; // m, cm
  pieceWidth?: number;
  pieceWidthUom?: string; // cm, inch
  pieceCount?: number;

  // Calculation outputs
  totalLength: number; // in normalized meters
  pinningSize: number; // pinning size per pad
  pinningSizeUom?: string; // m, cm
  outputQuantity: number; // calculated: Math.floor(totalLength / pinningSizeInMeters)
  remnantLength?: number; // leftover meters

  // Partial Completion Tracking
  completedQuantity: number; // completed pads processed so far
  pendingQuantity: number; // outputQuantity - completedQuantity
  completionPercentage: number; // (completedQuantity / outputQuantity) * 100

  // Top 4 Notebook / Job Work Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: number | string;
  itemType?: string;
  outputProductWidth?: string;

  // Workforce / Vendor Assignment
  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  status: MopingPadBatchStatus;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMopingPadBatchInput {
  batchNumber?: string;
  productName: string;
  materialType: MopingPadRawMaterialType;

  // Top 4 Notebook / Job Work Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: number | string;
  itemType?: string;
  outputProductWidth?: string;

  rollWidth?: number;
  rollWidthUom?: string;
  rollLength?: number;
  rollLengthUom?: string;

  pieceLength?: number;
  pieceLengthUom?: string;
  pieceWidth?: number;
  pieceWidthUom?: string;
  pieceCount?: number;

  pinningSize: number;
  pinningSizeUom?: string;

  completedQuantity?: number;

  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  startDate?: string;
  targetDate?: string;
  notes?: string;
}

export interface UpdateMopingPadProgressInput {
  id: string;
  completedQuantity: number;
  status?: MopingPadBatchStatus;
}

export interface MopingPadDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalOutputPads: number;
  totalCompletedPads: number;
  totalFabricMeters: number;
}

const STORAGE_KEY = 'ims_moping_pad_batches';

const DEFAULT_BATCHES: MopingPadBatch[] = [
  {
    id: 'mp-batch-101',
    batchNumber: 'MPP-2026-001',
    productName: 'Heavy-Duty Surgical Moping Pad 40cm',
    materialType: 'ROLL',
    dcNo: 'D.C. No. 05',
    dcDate: '2026-09-06',
    ends: 1140,
    itemType: '22x14',
    outputProductWidth: '30cm x 30cm - 8 ply',
    rollWidth: 100,
    rollWidthUom: 'cm',
    rollLength: 150,
    rollLengthUom: 'm',
    totalLength: 150,
    pinningSize: 0.4,
    pinningSizeUom: 'm',
    outputQuantity: 375,
    completedQuantity: 150,
    pendingQuantity: 225,
    completionPercentage: 40.0,
    remnantLength: 0,
    executorType: 'WORKERS',
    workerIds: ['emp-1'],
    workerNames: 'Anitha Sharma, Rajesh Kumar',
    status: 'IN_PROGRESS',
    startDate: '2026-09-05',
    targetDate: '2026-09-08',
    notes: 'Floor hospital sterile mop pads - batch 1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mp-batch-102',
    batchNumber: 'MPP-2026-002',
    productName: 'Standard Cleanroom Mop Pad 30cm',
    materialType: 'PIECES',
    dcNo: 'D.C. No. 04',
    dcDate: '2026-09-01',
    ends: 1140,
    itemType: '23x17',
    outputProductWidth: '30cm x 30cm - 6 ply',
    deliveryPerson: 'Ramesh Kumar',
    vehicleNumber: 'TN-67-AB-1234',
    pieceLength: 2.5,
    pieceLengthUom: 'm',
    pieceWidth: 50,
    pieceWidthUom: 'cm',
    pieceCount: 40,
    totalLength: 100,
    pinningSize: 0.3,
    pinningSizeUom: 'm',
    outputQuantity: 333,
    completedQuantity: 200,
    pendingQuantity: 133,
    completionPercentage: 60.1,
    remnantLength: 0.1,
    executorType: 'COMPANY',
    companyId: 'comp-1',
    companyName: 'Sri Lakshmi Bleaching & Scouring Works',
    status: 'IN_PROGRESS',
    startDate: '2026-09-06',
    targetDate: '2026-09-09',
    notes: 'Subcontracted slitting & pinning jobwork',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mp-batch-103',
    batchNumber: 'MPP-2026-003',
    productName: 'Microfiber Absorbent Mop Pad 35cm',
    materialType: 'ROLL',
    dcNo: 'D.C. No. 03',
    dcDate: '2026-08-28',
    ends: 1140,
    itemType: '28x27',
    outputProductWidth: '25cm x 25cm - 8 ply',
    rollWidth: 90,
    rollWidthUom: 'cm',
    rollLength: 200,
    rollLengthUom: 'm',
    totalLength: 200,
    pinningSize: 0.35,
    pinningSizeUom: 'm',
    outputQuantity: 571,
    completedQuantity: 571,
    pendingQuantity: 0,
    completionPercentage: 100.0,
    remnantLength: 0.15,
    executorType: 'WORKERS',
    workerIds: ['emp-2'],
    workerNames: 'Venkatesh Murugan',
    status: 'COMPLETED',
    startDate: '2026-09-01',
    completionDate: '2026-09-04',
    notes: 'Quality checked and sterile packed',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

class MopingPadProductionService {
  private getStorageBatches(): MopingPadBatch[] {
    if (typeof window === 'undefined') return DEFAULT_BATCHES;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BATCHES));
        return DEFAULT_BATCHES;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_BATCHES;
    }
  }

  private saveStorageBatches(batches: MopingPadBatch[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error('Error saving moping pad batches to localStorage:', e);
    }
  }

  /**
   * Helper to calculate normalized total length in meters
   */
  calculateTotalLength(
    materialType: MopingPadRawMaterialType,
    rollLength?: number,
    pieceLength?: number,
    pieceLengthUom?: string,
    pieceCount?: number
  ): number {
    if (materialType === 'ROLL') {
      return Number(rollLength) || 0;
    } else {
      let lengthInMeters = Number(pieceLength) || 0;
      if (pieceLengthUom === 'cm') {
        lengthInMeters = lengthInMeters / 100;
      }
      const count = Number(pieceCount) || 0;
      return Number((count * lengthInMeters).toFixed(3));
    }
  }

  /**
   * Helper to calculate output quantity: totalLength / pinningSize
   */
  calculateOutputQuantity(
    totalLengthInMeters: number,
    pinningSize: number,
    pinningSizeUom: string = 'm'
  ): { outputQuantity: number; remnantLength: number } {
    let sizeInMeters = Number(pinningSize) || 0;
    if (pinningSizeUom === 'cm') {
      sizeInMeters = sizeInMeters / 100;
    }
    if (sizeInMeters <= 0 || totalLengthInMeters <= 0) {
      return { outputQuantity: 0, remnantLength: 0 };
    }
    const quantity = Math.floor(totalLengthInMeters / sizeInMeters);
    const remnant = Number((totalLengthInMeters % sizeInMeters).toFixed(3));
    return { outputQuantity: quantity, remnantLength: remnant };
  }

  async getAllBatches(params?: {
    search?: string;
    status?: string;
    materialType?: string;
  }): Promise<{ items: MopingPadBatch[]; total: number }> {
    let batches = this.getStorageBatches();

    if (params?.status && params.status !== 'ALL') {
      batches = batches.filter((b) => b.status === params.status);
    }

    if (params?.materialType && params.materialType !== 'ALL') {
      batches = batches.filter((b) => b.materialType === params.materialType);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      batches = batches.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          (b.workerNames && b.workerNames.toLowerCase().includes(q)) ||
          (b.companyName && b.companyName.toLowerCase().includes(q))
      );
    }

    // Sort newest-first
    batches.sort((a, b) => {
      const tA = new Date(a.createdAt || a.startDate || 0).getTime() || 0;
      const tB = new Date(b.createdAt || b.startDate || 0).getTime() || 0;
      if (tB !== tA) return tB - tA;
      return (b.batchNumber || b.id).localeCompare(a.batchNumber || a.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });

    return { items: batches, total: batches.length };
  }

  async getBatchById(id: string): Promise<MopingPadBatch | null> {
    const batches = this.getStorageBatches();
    return batches.find((b) => b.id === id) || null;
  }

  async createBatch(input: CreateMopingPadBatchInput): Promise<MopingPadBatch> {
    const batches = this.getStorageBatches();

    const totalLength = this.calculateTotalLength(
      input.materialType,
      input.rollLength,
      input.pieceLength,
      input.pieceLengthUom,
      input.pieceCount
    );

    const { outputQuantity, remnantLength } = this.calculateOutputQuantity(
      totalLength,
      input.pinningSize,
      input.pinningSizeUom || 'm'
    );

    const now = new Date();
    const batchNumber =
      input.batchNumber ||
      `MPP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        batches.length + 1
      ).padStart(3, '0')}`;

    const newBatch: MopingPadBatch = {
      id: `mp-batch-${Date.now()}`,
      batchNumber,
      productName: input.productName,
      materialType: input.materialType,

      rollWidth: input.rollWidth,
      rollWidthUom: input.rollWidthUom || 'cm',
      rollLength: input.rollLength,
      rollLengthUom: input.rollLengthUom || 'm',

      pieceLength: input.pieceLength,
      pieceLengthUom: input.pieceLengthUom || 'm',
      pieceWidth: input.pieceWidth,
      pieceWidthUom: input.pieceWidthUom || 'cm',
      pieceCount: input.pieceCount,

      totalLength,
      pinningSize: input.pinningSize,
      pinningSizeUom: input.pinningSizeUom || 'm',
      outputQuantity,
      remnantLength,

      completedQuantity: input.completedQuantity || 0,
      pendingQuantity: Math.max(0, outputQuantity - (input.completedQuantity || 0)),
      completionPercentage:
        outputQuantity > 0
          ? Number((((input.completedQuantity || 0) / outputQuantity) * 100).toFixed(1))
          : 0,

      // Top 4 Notebook / Job Work Parameters
      dcNo: input.dcNo,
      dcDate: input.dcDate,
      ends: input.ends,
      itemType: input.itemType,
      outputProductWidth: input.outputProductWidth,

      executorType: input.executorType,
      workerIds: input.workerIds,
      workerNames: input.workerNames,
      companyId: input.companyId,
      companyName: input.companyName,
      deliveryPerson: input.deliveryPerson,
      vehicleNumber: input.vehicleNumber,

      status: 'IN_PROGRESS',
      startDate: input.startDate || now.toISOString().split('T')[0],
      targetDate: input.targetDate,
      notes: input.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const updatedList = [newBatch, ...batches];
    this.saveStorageBatches(updatedList);
    return newBatch;
  }

  async updateProgress(
    id: string,
    completedQuantity: number,
    status?: MopingPadBatchStatus
  ): Promise<MopingPadBatch> {
    const batches = this.getStorageBatches();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Batch with ID ${id} not found`);
    }

    const current = batches[index];
    const total = current.outputQuantity || 0;
    const completed = Math.min(Math.max(completedQuantity, 0), total);
    const pending = Math.max(0, total - completed);
    const pct = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;
    const isCompleted = completed >= total && total > 0;
    const newStatus =
      status ||
      (isCompleted ? 'COMPLETED' : current.status === 'COMPLETED' ? 'IN_PROGRESS' : current.status);

    const updated: MopingPadBatch = {
      ...current,
      completedQuantity: completed,
      pendingQuantity: pending,
      completionPercentage: pct,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === 'COMPLETED'
        ? { completionDate: new Date().toISOString().split('T')[0] }
        : {}),
    };

    batches[index] = updated;
    this.saveStorageBatches(batches);
    return updated;
  }

  async updateBatchStatus(id: string, status: MopingPadBatchStatus): Promise<MopingPadBatch> {
    const batches = this.getStorageBatches();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Batch with ID ${id} not found`);
    }

    const updated = {
      ...batches[index],
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'COMPLETED' ? { completionDate: new Date().toISOString().split('T')[0] } : {}),
    };

    batches[index] = updated;
    this.saveStorageBatches(batches);
    return updated;
  }

  async getDashboardStats(): Promise<MopingPadDashboardStats> {
    const batches = this.getStorageBatches();
    const activeBatches = batches.filter(
      (b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT'
    ).length;
    const completedBatches = batches.filter((b) => b.status === 'COMPLETED').length;
    const totalOutputPads = batches.reduce((sum, b) => sum + (b.outputQuantity || 0), 0);
    const totalCompletedPads = batches.reduce((sum, b) => sum + (b.completedQuantity || 0), 0);
    const totalFabricMeters = batches.reduce((sum, b) => sum + (b.totalLength || 0), 0);

    return {
      totalBatches: batches.length,
      activeBatches,
      completedBatches,
      totalOutputPads,
      totalCompletedPads,
      totalFabricMeters: Number(totalFabricMeters.toFixed(1)),
    };
  }
}

export const mopingPadProductionService = new MopingPadProductionService();
