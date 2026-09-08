export type GauzePadRawMaterialType = 'ROLL' | 'PIECES';

export type GauzePadPinningStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface GauzePadPinningBatch {
  id: string;
  batchNumber: string;
  productName: string;
  materialType: GauzePadRawMaterialType;

  // Roll Form
  rollWidth?: number;
  rollWidthUom?: string;
  rollLength?: number;
  rollLengthUom?: string;

  // Pieces Form
  pieceLength?: number;
  pieceLengthUom?: string;
  pieceWidth?: number;
  pieceWidthUom?: string;
  pieceCount?: number;

  // Calculated Dimensions
  totalLength: number; // normalized linear meters

  // Operations: Pinning Size & Cutting Size
  pinningSize: number; // e.g. length per pin (m or cm)
  pinningSizeUom?: string;
  cuttingSize: number; // e.g. division factor / number of cuts
  outputQuantity: number; // (totalLength / pinningSize) / cuttingSize
  remnantLength?: number;

  // Salary Engine
  salaryRatePerPiece: number; // rate per output quantity (₹)
  totalSalary: number; // outputQuantity * salaryRatePerPiece
  workerSalaryShare: number; // totalSalary / workerCount

  // Workforce / Vendor Assignment
  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  // Job Work Notebook Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;

  status: GauzePadPinningStatus;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGauzePadPinningInput {
  batchNumber?: string;
  productName: string;
  materialType: GauzePadRawMaterialType;

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
  cuttingSize: number;

  salaryRatePerPiece: number;

  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;

  // Job Work Notebook Parameters
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;

  startDate?: string;
  targetDate?: string;
  notes?: string;
}

export interface GauzePadPinningDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalOutputPads: number;
  totalFabricMeters: number;
  totalSalaryPaid: number;
}

const STORAGE_KEY = 'ims_gauze_pad_pinning_batches';

const DEFAULT_BATCHES: GauzePadPinningBatch[] = [
  {
    id: 'gpp-batch-1',
    batchNumber: 'GPP-2026-001',
    productName: 'Sterile Gauze Swab Pad 10x10cm (12 Ply)',
    materialType: 'ROLL',
    rollWidth: 100,
    rollWidthUom: 'cm',
    rollLength: 120,
    rollLengthUom: 'm',
    totalLength: 120,
    pinningSize: 0.3,
    pinningSizeUom: 'm',
    cuttingSize: 2,
    outputQuantity: 200, // (120 / 0.3) / 2 = 400 / 2 = 200
    remnantLength: 0,
    salaryRatePerPiece: 1.5,
    totalSalary: 300,
    workerSalaryShare: 150,
    executorType: 'WORKERS',
    workerIds: ['emp-1', 'emp-2'],
    workerNames: 'Anitha Sharma, Rajesh Kumar',
    dcNo: 'DC-05',
    dcDate: '2026-09-06',
    ends: '1140',
    itemType: '22x14',
    status: 'IN_PROGRESS',
    startDate: '2026-09-05',
    targetDate: '2026-09-08',
    notes: 'High absorbency pad pinning & slitting run',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'gpp-batch-2',
    batchNumber: 'GPP-2026-002',
    productName: 'Dental Gauze Pad 5x5cm (8 Ply)',
    materialType: 'PIECES',
    pieceLength: 3,
    pieceLengthUom: 'm',
    pieceWidth: 60,
    pieceWidthUom: 'cm',
    pieceCount: 30,
    totalLength: 90,
    pinningSize: 0.25,
    pinningSizeUom: 'm',
    cuttingSize: 3,
    outputQuantity: 120, // (90 / 0.25) / 3 = 360 / 3 = 120
    remnantLength: 0,
    salaryRatePerPiece: 1.25,
    totalSalary: 150,
    workerSalaryShare: 150,
    executorType: 'WORKERS',
    workerIds: ['emp-3'],
    workerNames: 'Venkatesh Murugan',
    dcNo: 'DC-04',
    dcDate: '2026-09-04',
    ends: '1140',
    itemType: '22x16',
    status: 'COMPLETED',
    startDate: '2026-09-02',
    completionDate: '2026-09-04',
    notes: 'Cleanroom dental pads batch completed',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

class GauzePadPinningService {
  private getStorageBatches(): GauzePadPinningBatch[] {
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

  private saveStorageBatches(batches: GauzePadPinningBatch[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error('Error saving gauze pad pinning batches to localStorage:', e);
    }
  }

  /**
   * Helper: Total length in linear meters
   */
  calculateTotalLength(
    materialType: GauzePadRawMaterialType,
    rollLength?: number,
    pieceLength?: number,
    pieceLengthUom?: string,
    pieceCount?: number
  ): number {
    if (materialType === 'ROLL') {
      return Number(rollLength) || 0;
    } else {
      let lengthM = Number(pieceLength) || 0;
      if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
      const count = Number(pieceCount) || 0;
      return Number((count * lengthM).toFixed(3));
    }
  }

  /**
   * Helper: Dual division operation -> (totalLength / pinningSize) / cuttingSize
   */
  calculateOutputQuantity(
    totalLengthInMeters: number,
    pinningSize: number,
    pinningSizeUom: string = 'm',
    cuttingSize: number = 1
  ): { piecesAfterPinning: number; outputQuantity: number; remnantLength: number } {
    let sizeM = Number(pinningSize) || 0;
    if (pinningSizeUom === 'cm') sizeM = sizeM / 100;
    const cuts = Number(cuttingSize) || 1;

    if (sizeM <= 0 || totalLengthInMeters <= 0 || cuts <= 0) {
      return { piecesAfterPinning: 0, outputQuantity: 0, remnantLength: 0 };
    }

    const piecesAfterPinning = Math.floor(totalLengthInMeters / sizeM);
    const outputQuantity = Math.floor(piecesAfterPinning / cuts);
    const remnantLength = Number((totalLengthInMeters % (sizeM * cuts)).toFixed(3));

    return { piecesAfterPinning, outputQuantity, remnantLength };
  }

  /**
   * Helper: Salary per output unit and equal split among workers
   */
  calculateSalary(
    outputQuantity: number,
    ratePerPiece: number,
    workerCount: number = 1
  ): { totalSalary: number; workerSalaryShare: number } {
    const qty = Number(outputQuantity) || 0;
    const rate = Number(ratePerPiece) || 0;
    const totalSalary = Number((qty * rate).toFixed(2));
    const count = workerCount > 0 ? workerCount : 1;
    const workerSalaryShare = Number((totalSalary / count).toFixed(2));
    return { totalSalary, workerSalaryShare };
  }

  async getAllBatches(params?: {
    search?: string;
    status?: string;
    materialType?: string;
  }): Promise<{ items: GauzePadPinningBatch[]; total: number }> {
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

  async getBatchById(id: string): Promise<GauzePadPinningBatch | null> {
    const batches = this.getStorageBatches();
    return batches.find((b) => b.id === id) || null;
  }

  async createBatch(input: CreateGauzePadPinningInput): Promise<GauzePadPinningBatch> {
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
      input.pinningSizeUom || 'm',
      input.cuttingSize
    );

    const workerCount = input.workerIds?.length || (input.workerNames ? input.workerNames.split(',').length : 1);
    const { totalSalary, workerSalaryShare } = this.calculateSalary(
      outputQuantity,
      input.salaryRatePerPiece,
      workerCount
    );

    const now = new Date();
    const batchNumber =
      input.batchNumber ||
      `GPP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        batches.length + 1
      ).padStart(3, '0')}`;

    const newBatch: GauzePadPinningBatch = {
      id: `gpp-batch-${Date.now()}`,
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
      cuttingSize: input.cuttingSize,
      outputQuantity,
      remnantLength,

      salaryRatePerPiece: input.salaryRatePerPiece,
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

  async updateBatchStatus(id: string, status: GauzePadPinningStatus): Promise<GauzePadPinningBatch> {
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

  async getDashboardStats(): Promise<GauzePadPinningDashboardStats> {
    const batches = this.getStorageBatches();
    const activeBatches = batches.filter(
      (b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT'
    ).length;
    const completedBatches = batches.filter((b) => b.status === 'COMPLETED').length;
    const totalOutputPads = batches.reduce((sum, b) => sum + (b.outputQuantity || 0), 0);
    const totalFabricMeters = batches.reduce((sum, b) => sum + (b.totalLength || 0), 0);
    const totalSalaryPaid = batches.reduce((sum, b) => sum + (b.totalSalary || 0), 0);

    return {
      totalBatches: batches.length,
      activeBatches,
      completedBatches,
      totalOutputPads,
      totalFabricMeters: Number(totalFabricMeters.toFixed(1)),
      totalSalaryPaid: Number(totalSalaryPaid.toFixed(2)),
    };
  }
}

export const gauzePadPinningService = new GauzePadPinningService();
