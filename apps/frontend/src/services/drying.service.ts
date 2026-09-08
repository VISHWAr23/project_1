export type DryingBatchStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DryingBatch {
  id: string;
  batchNumber: string;
  productName: string;

  // Pieces-Only Intake
  pieceLength: number; // meters (e.g. 23m)
  pieceLengthUom?: string; // default 'm'
  pieceWidth: number; // cm
  pieceWidthUom?: string; // default 'cm'
  totalPieces: number; // total count of pieces (e.g. 100)
  totalLength: number; // totalPieces * pieceLength (e.g. 2,300m)

  // Progress Tracking: How much is completed
  completedPieces: number; // e.g. 45
  pendingPieces: number; // totalPieces - completedPieces (e.g. 55)
  completedLength: number; // completedPieces * pieceLength (e.g. 1,035m)
  completionPercentage: number; // (completedPieces / totalPieces) * 100

  // Salary Engine: Rate per meter
  salaryRatePerMeter: number; // rate per meter (e.g. 0.10 ₹/m -> 2,300m = 230 ₹)
  totalSalary: number; // totalLength * salaryRatePerMeter (planned total)
  earnedSalary: number; // completedLength * salaryRatePerMeter (accrued so far)
  workerSalaryShare: number; // earnedSalary / workerCount

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

  status: DryingBatchStatus;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  dryingChamberOrLine?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDryingBatchInput {
  batchNumber?: string;
  productName: string;

  pieceLength: number;
  pieceLengthUom?: string;
  pieceWidth: number;
  pieceWidthUom?: string;
  totalPieces: number;

  completedPieces?: number;

  salaryRatePerMeter?: number; // default 0.10 ₹/m

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
  dryingChamberOrLine?: string;
  notes?: string;
}

export interface UpdateDryingProgressInput {
  id: string;
  completedPieces: number;
  status?: DryingBatchStatus;
}

export interface DryingDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalPiecesProcessed: number;
  totalMetersDried: number;
  totalSalaryPaid: number;
}

const STORAGE_KEY = 'ims_drying_batches';

const DEFAULT_BATCHES: DryingBatch[] = [
  {
    id: 'dry-batch-1',
    batchNumber: 'DRY-2026-001',
    productName: 'Absorbent Bleached Gauze Thans (23m)',
    pieceLength: 23,
    pieceLengthUom: 'm',
    pieceWidth: 90,
    pieceWidthUom: 'cm',
    totalPieces: 100,
    totalLength: 2300,
    completedPieces: 0,
    pendingPieces: 100,
    completedLength: 0,
    completionPercentage: 0,
    salaryRatePerMeter: 0.1,
    totalSalary: 230,
    earnedSalary: 0,
    workerSalaryShare: 0,
    executorType: 'WORKERS',
    workerIds: ['emp-1', 'emp-2'],
    workerNames: 'Anitha Sharma, Rajesh Kumar',
    dcNo: 'DC-05',
    dcDate: '2026-09-06',
    ends: '1140',
    itemType: '22x14',
    status: 'IN_PROGRESS',
    startDate: '2026-09-06',
    targetDate: '2026-09-07',
    dryingChamberOrLine: 'Drying Chamber Line 1',
    notes: 'Hot air drying chamber run - ready for progress logging',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dry-batch-2',
    batchNumber: 'DRY-2026-002',
    productName: 'Sterile Surgical Bandage Strips (15m)',
    pieceLength: 15,
    pieceLengthUom: 'm',
    pieceWidth: 100,
    pieceWidthUom: 'cm',
    totalPieces: 80,
    totalLength: 1200,
    completedPieces: 80,
    pendingPieces: 0,
    completedLength: 1200,
    completionPercentage: 100,
    salaryRatePerMeter: 0.1,
    totalSalary: 120,
    earnedSalary: 120,
    workerSalaryShare: 120,
    executorType: 'WORKERS',
    workerIds: ['emp-3'],
    workerNames: 'Venkatesh Murugan',
    dcNo: 'DC-03',
    dcDate: '2026-09-03',
    ends: '1140',
    itemType: '23x17',
    status: 'COMPLETED',
    startDate: '2026-09-03',
    completionDate: '2026-09-04',
    dryingChamberOrLine: 'Drying Chamber Line 2',
    notes: 'Full run complete & quality approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

class DryingService {
  private getStorageBatches(): DryingBatch[] {
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

  private saveStorageBatches(batches: DryingBatch[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error('Error saving drying batches to localStorage:', e);
    }
  }

  /**
   * Helper: Total length calculation in meters
   */
  calculateTotalLength(totalPieces: number, pieceLength: number, pieceLengthUom: string = 'm'): number {
    let lengthM = Number(pieceLength) || 0;
    if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
    const pieces = Number(totalPieces) || 0;
    return Number((pieces * lengthM).toFixed(3));
  }

  /**
   * Helper: Calculate progress and completed length
   */
  calculateProgress(
    totalPieces: number,
    completedPieces: number,
    pieceLength: number,
    pieceLengthUom: string = 'm'
  ): { pendingPieces: number; completedLength: number; completionPercentage: number } {
    const total = Number(totalPieces) || 0;
    const completed = Math.min(Math.max(Number(completedPieces) || 0, 0), total);
    const pending = total - completed;
    let lengthM = Number(pieceLength) || 0;
    if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
    const completedLength = Number((completed * lengthM).toFixed(3));
    const completionPercentage = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;
    return { pendingPieces: pending, completedLength, completionPercentage };
  }

  /**
   * Helper: Calculate salary per meter and worker split
   */
  calculateSalary(
    totalLength: number,
    completedLength: number,
    ratePerMeter: number = 0.1,
    workerCount: number = 1
  ): { totalSalary: number; earnedSalary: number; workerSalaryShare: number } {
    const rate = Number(ratePerMeter) >= 0 ? Number(ratePerMeter) : 0.1;
    const totalSalary = Number((totalLength * rate).toFixed(2));
    const earnedSalary = Number((completedLength * rate).toFixed(2));
    const count = workerCount > 0 ? workerCount : 1;
    const workerSalaryShare = Number((earnedSalary / count).toFixed(2));
    return { totalSalary, earnedSalary, workerSalaryShare };
  }

  async getAllBatches(params?: { search?: string; status?: string }): Promise<{ items: DryingBatch[]; total: number }> {
    let batches = this.getStorageBatches();

    if (params?.status && params.status !== 'ALL') {
      batches = batches.filter((b) => b.status === params.status);
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

  async getBatchById(id: string): Promise<DryingBatch | null> {
    const batches = this.getStorageBatches();
    return batches.find((b) => b.id === id) || null;
  }

  async createBatch(input: CreateDryingBatchInput): Promise<DryingBatch> {
    const batches = this.getStorageBatches();

    const totalLength = this.calculateTotalLength(input.totalPieces, input.pieceLength, input.pieceLengthUom);
    const completedPieces = input.completedPieces || 0;
    const { pendingPieces, completedLength, completionPercentage } = this.calculateProgress(
      input.totalPieces,
      completedPieces,
      input.pieceLength,
      input.pieceLengthUom
    );

    const rate = input.salaryRatePerMeter !== undefined ? input.salaryRatePerMeter : 0.1;
    const workerCount = input.workerIds?.length || (input.workerNames ? input.workerNames.split(',').length : 1);
    const { totalSalary, earnedSalary, workerSalaryShare } = this.calculateSalary(
      totalLength,
      completedLength,
      rate,
      workerCount
    );

    const now = new Date();
    const batchNumber =
      input.batchNumber ||
      `DRY-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        batches.length + 1
      ).padStart(3, '0')}`;

    const newBatch: DryingBatch = {
      id: `dry-batch-${Date.now()}`,
      batchNumber,
      productName: input.productName,

      pieceLength: input.pieceLength,
      pieceLengthUom: input.pieceLengthUom || 'm',
      pieceWidth: input.pieceWidth,
      pieceWidthUom: input.pieceWidthUom || 'cm',
      totalPieces: input.totalPieces,
      totalLength,

      completedPieces,
      pendingPieces,
      completedLength,
      completionPercentage,

      salaryRatePerMeter: rate,
      totalSalary,
      earnedSalary,
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

      status: completedPieces >= input.totalPieces ? 'COMPLETED' : 'IN_PROGRESS',
      startDate: input.startDate || now.toISOString().split('T')[0],
      targetDate: input.targetDate,
      completionDate: completedPieces >= input.totalPieces ? now.toISOString().split('T')[0] : undefined,
      dryingChamberOrLine: input.dryingChamberOrLine,
      notes: input.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const updatedList = [newBatch, ...batches];
    this.saveStorageBatches(updatedList);
    return newBatch;
  }

  async updateProgress(input: UpdateDryingProgressInput): Promise<DryingBatch> {
    const batches = this.getStorageBatches();
    const index = batches.findIndex((b) => b.id === input.id);
    if (index === -1) {
      throw new Error(`Drying batch with ID ${input.id} not found`);
    }

    const current = batches[index];
    const completedPieces = Math.min(Math.max(Number(input.completedPieces) || 0, 0), current.totalPieces);
    const { pendingPieces, completedLength, completionPercentage } = this.calculateProgress(
      current.totalPieces,
      completedPieces,
      current.pieceLength,
      current.pieceLengthUom
    );

    const workerCount = current.workerIds?.length || (current.workerNames ? current.workerNames.split(',').length : 1);
    const { totalSalary, earnedSalary, workerSalaryShare } = this.calculateSalary(
      current.totalLength,
      completedLength,
      current.salaryRatePerMeter,
      workerCount
    );

    const isCompleted = completedPieces >= current.totalPieces;
    const updated: DryingBatch = {
      ...current,
      completedPieces,
      pendingPieces,
      completedLength,
      completionPercentage,
      totalSalary,
      earnedSalary,
      workerSalaryShare,
      status: input.status || (isCompleted ? 'COMPLETED' : 'IN_PROGRESS'),
      completionDate: isCompleted ? new Date().toISOString().split('T')[0] : current.completionDate,
      updatedAt: new Date().toISOString(),
    };

    batches[index] = updated;
    this.saveStorageBatches(batches);
    return updated;
  }

  async getDashboardStats(): Promise<DryingDashboardStats> {
    const batches = this.getStorageBatches();
    const activeBatches = batches.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT').length;
    const completedBatches = batches.filter((b) => b.status === 'COMPLETED').length;
    const totalPiecesProcessed = batches.reduce((sum, b) => sum + (b.completedPieces || 0), 0);
    const totalMetersDried = batches.reduce((sum, b) => sum + (b.completedLength || 0), 0);
    const totalSalaryPaid = batches.reduce((sum, b) => sum + (b.earnedSalary || 0), 0);

    return {
      totalBatches: batches.length,
      activeBatches,
      completedBatches,
      totalPiecesProcessed,
      totalMetersDried: Number(totalMetersDried.toFixed(1)),
      totalSalaryPaid: Number(totalSalaryPaid.toFixed(2)),
    };
  }
}

export const dryingService = new DryingService();
