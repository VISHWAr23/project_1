import { apiClient } from '@/services/api-client';

export type MopingPadRawMaterialType = 'ROLL' | 'PIECES' | 'PIECE';

export type MopingPadBatchStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MopingPadBatch {
  id: string;
  batchNumber: string;
  productName: string;
  materialType?: MopingPadRawMaterialType;
  rawMaterialType?: MopingPadRawMaterialType;
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
  outputQuantity: number;
  remnantLength: number;
  completedQuantity: number;
  pendingQuantity: number;
  completionPercentage: number;
  salaryRatePerPiece?: number;
  totalSalary?: number;
  workerSalaryShare?: number;
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
  outputProductWidth?: string;
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
  materialType?: MopingPadRawMaterialType;
  rawMaterialType?: MopingPadRawMaterialType;
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
  salaryRatePerPiece?: number;
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
  outputProductWidth?: string;
  startDate?: string;
  targetDate?: string;
  notes?: string;
}

export interface UpdateMopingPadProgressInput {
  id: string;
  completedQuantity: number;
  status?: MopingPadBatchStatus;
  notes?: string;
}

export interface MopingPadDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalOutputPads?: number;
  totalCompletedPads?: number;
  totalFabricMeters?: number;
  totalPiecesProduced?: number;
  totalLengthMeters?: number;
  totalSalaryPaid?: number;
}

/**
 * Helper to calculate normalized total length in meters
 */
export function calculateTotalLength(
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
export function calculateOutputQuantity(
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

/**
 * Frontend service refactored to use apiClient instead of localStorage.
 * Preserves calculation helpers for UI form previews.
 */
class MopingPadProductionService {
  async getAllBatches(params?: {
    search?: string;
    status?: string;
    materialType?: string;
  }): Promise<{ items: MopingPadBatch[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.materialType) queryParams.append('materialType', params.materialType);

    const res = await apiClient<{
      items: MopingPadBatch[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/moping-pad-production/batches?${queryParams.toString()}`);

    return {
      items: res.items,
      total: res.meta?.total ?? res.items.length,
    };
  }

  async getBatchById(id: string): Promise<MopingPadBatch | null> {
    try {
      return await apiClient<MopingPadBatch>(`/moping-pad-production/batches/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createBatch(input: CreateMopingPadBatchInput): Promise<MopingPadBatch> {
    return await apiClient<MopingPadBatch>('/moping-pad-production/batches', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateProgress(
    id: string,
    completedQuantity: number,
    status?: MopingPadBatchStatus,
    notes?: string
  ): Promise<MopingPadBatch> {
    return await apiClient<MopingPadBatch>(
      `/moping-pad-production/batches/${id}/progress`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completedQuantity, status, notes }),
      }
    );
  }

  async updateBatchStatus(
    id: string,
    status: MopingPadBatchStatus
  ): Promise<MopingPadBatch> {
    return await apiClient<MopingPadBatch>(
      `/moping-pad-production/batches/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }

  async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(
      `/moping-pad-production/batches/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getDashboardStats(): Promise<MopingPadDashboardStats> {
    return await apiClient<MopingPadDashboardStats>(
      '/moping-pad-production/dashboard'
    );
  }
}

export const mopingPadProductionService = new MopingPadProductionService();