import { apiClient } from '@/services/api-client';

export type GauzePadRawMaterialType = 'ROLL' | 'PIECES';

export type GauzePadPinningStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface GauzePadPinningBatch {
  id: string;
  batchNumber: string;
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
  totalLength: number;
  totalLengthInMeters?: number;
  pinningSize: number;
  pinningSizeUom: string;
  cuttingSize: number;
  piecesAfterPinning?: number;
  outputQuantity: number;
  remnantLength: number;
  completedQuantity?: number;
  pendingQuantity?: number;
  completionPercentage?: number;
  salaryRatePerPiece: number;
  totalSalary: number;
  workerSalaryShare: number;
  executorType: 'WORKERS' | 'COMPANY';
  workerIds?: string[];
  workerNames?: string;
  companyId?: string;
  companyName?: string;
  deliveryPerson?: string;
  vehicleNumber?: string;
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
  totalPiecesProduced?: number;
  totalLengthMeters?: number;
}

/**
 * Helper: Total length in linear meters
 */
export function calculateTotalLength(
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
export function calculateOutputQuantity(
  totalLengthInMeters: number,
  pinningSize: number,
  pinningSizeUom: string = 'cm',
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
export function calculateSalary(
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

/**
 * Frontend service refactored to use apiClient instead of localStorage.
 * Preserves calculation helpers for UI form previews.
 */
class GauzePadPinningService {
  async getAllBatches(params?: {
    search?: string;
    status?: string;
    materialType?: string;
  }): Promise<{ items: GauzePadPinningBatch[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params?.materialType && params.materialType !== 'ALL') queryParams.append('materialType', params.materialType);

    const res = await apiClient<{
      items: GauzePadPinningBatch[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/gauze-pad-pinning/batches?${queryParams.toString()}`);

    return {
      items: res.items,
      total: res.meta?.total ?? res.items.length,
    };
  }

  async getBatchById(id: string): Promise<GauzePadPinningBatch | null> {
    try {
      return await apiClient<GauzePadPinningBatch>(`/gauze-pad-pinning/batches/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createBatch(input: CreateGauzePadPinningInput): Promise<GauzePadPinningBatch> {
    return await apiClient<GauzePadPinningBatch>('/gauze-pad-pinning/batches', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateBatchStatus(
    id: string,
    status: GauzePadPinningStatus
  ): Promise<GauzePadPinningBatch> {
    return await apiClient<GauzePadPinningBatch>(
      `/gauze-pad-pinning/batches/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }

  async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(
      `/gauze-pad-pinning/batches/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getDashboardStats(): Promise<GauzePadPinningDashboardStats> {
    return await apiClient<GauzePadPinningDashboardStats>(
      `/gauze-pad-pinning/dashboard`
    );
  }
}

export const gauzePadPinningService = new GauzePadPinningService();