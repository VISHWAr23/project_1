import { apiClient } from '@/services/api-client';

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

export interface PillowBedsheetDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedBatches: number;
  totalBedSheetsOutput: number;
  totalPillowCoversOutput: number;
  totalSalaryDisbursed: number;
  totalBedSheets?: number;
  totalPillowCovers?: number;
  totalFabricKg?: number;
  totalLengthMeters?: number;
  totalSalaryPaid?: number;
}

class PillowBedsheetProductionService {
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
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params?.productType && params.productType !== 'ALL') queryParams.append('productType', params.productType);

    const res = await apiClient<{
      items: PillowBedsheetBatch[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/pillow-bedsheet-production/batches?${queryParams.toString()}`);

    return {
      items: res.items,
      total: res.meta?.total ?? res.items.length,
    };
  }

  public async getBatchById(id: string): Promise<PillowBedsheetBatch | null> {
    try {
      return await apiClient<PillowBedsheetBatch>(`/pillow-bedsheet-production/batches/${id}`);
    } catch (error) {
      return null;
    }
  }

  public async createBatch(input: CreatePillowBedsheetBatchInput): Promise<PillowBedsheetBatch> {
    return await apiClient<PillowBedsheetBatch>('/pillow-bedsheet-production/batches', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public async updateProgress(
    id: string,
    completedQuantity: number,
    status?: PillowBedsheetBatchStatus,
    notes?: string
  ): Promise<PillowBedsheetBatch> {
    return await apiClient<PillowBedsheetBatch>(
      `/pillow-bedsheet-production/batches/${id}/progress`,
      {
        method: 'PATCH',
        body: JSON.stringify({ completedQuantity, status, notes }),
      }
    );
  }

  public async updateBatchStatus(
    id: string,
    status: PillowBedsheetBatchStatus
  ): Promise<PillowBedsheetBatch> {
    return await apiClient<PillowBedsheetBatch>(
      `/pillow-bedsheet-production/batches/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  }

  public async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(
      `/pillow-bedsheet-production/batches/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  public async getDashboardStats(): Promise<PillowBedsheetDashboardStats> {
    return await apiClient<PillowBedsheetDashboardStats>(
      '/pillow-bedsheet-production/dashboard'
    );
  }
}

export const pillowBedsheetProductionService = new PillowBedsheetProductionService();
