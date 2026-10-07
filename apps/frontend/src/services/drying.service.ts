import { apiClient } from '@/services/api-client';

export type DryingBatchStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DryingBatch {
  id: string;
  batchNumber: string;
  productName: string;
  totalPieces: number;
  pieceLength: number;
  pieceLengthUom: string;
  pieceWidth?: number;
  pieceWidthUom: string;
  totalLength: number;
  completedPieces: number;
  pendingPieces: number;
  completedLength: number;
  completionPercentage: number;
  salaryRatePerMeter: number;
  totalSalary: number;
  earnedSalary: number;
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
  outputProductWidth?: string;
  status: DryingBatchStatus;
  startDate: string;
  targetDate?: string;
  completionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDryingBatchInput {
  batchNumber?: string;
  productName: string;
  totalPieces: number;
  pieceLength: number;
  pieceLengthUom?: string;
  pieceWidth?: number;
  pieceWidthUom?: string;
  completedPieces?: number;
  salaryRatePerMeter?: number;
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

export interface UpdateDryingProgressInput {
  id: string;
  completedPieces: number;
  status?: DryingBatchStatus;
  notes?: string;
}

export interface DryingDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalPiecesProcessed: number;
  totalMetersDried: number;
  totalSalaryPaid: number;
}

/**
 * Helper: Total length calculation in meters
 */
export function calculateTotalLength(
  totalPieces: number,
  pieceLength: number,
  pieceLengthUom: string = 'm'
): number {
  let lengthM = Number(pieceLength) || 0;
  if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
  const pieces = Number(totalPieces) || 0;
  return Number((pieces * lengthM).toFixed(3));
}

/**
 * Helper: Calculate progress and completed length
 */
export function calculateProgress(
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
export function calculateSalary(
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

/**
 * Frontend service refactored to use apiClient instead of localStorage.
 * Preserves calculation helpers for UI form previews.
 */
class DryingService {
  async getAllBatches(params?: { search?: string; status?: string }): Promise<{ items: DryingBatch[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const res = await apiClient<{
      items: DryingBatch[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/drying/batches?${queryParams.toString()}`);

    return {
      items: res.items,
      total: res.meta?.total ?? res.items.length,
    };
  }

  async getBatchById(id: string): Promise<DryingBatch | null> {
    try {
      return await apiClient<DryingBatch>(`/drying/batches/${id}`);
    } catch (error) {
      return null;
    }
  }

  async createBatch(input: CreateDryingBatchInput): Promise<DryingBatch> {
    return await apiClient<DryingBatch>('/drying/batches', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateProgress(input: UpdateDryingProgressInput): Promise<DryingBatch> {
    return await apiClient<DryingBatch>(
      `/drying/batches/${input.id}/progress`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );
  }

  async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(
      `/drying/batches/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getDashboardStats(): Promise<DryingDashboardStats> {
    return await apiClient<DryingDashboardStats>('/drying/dashboard');
  }
}

export const dryingService = new DryingService();