export interface GreyFabricCosting {
  id: string;
  qualityName: string;
  notes: string | null;

  // Primary Specifications
  ends: number;
  reed: number;
  pick: number;
  totalLengthMeters: number;
  totalLengthYards: number;
  warpCount: number;
  weftCount: number;

  // Rates & Wages Inputs
  warpPricePerKg: number;
  weftPricePerKg: number;
  sizingRatePerKg: number;
  weavingRatePerMeter: number;
  bleachingRatePerKg: number;

  // Circled Constants
  yarnConstant: number;
  conversionDivisor: number;
  endsDeduction: number;
  meterToYardFactor: number;
  baseReedPicks: number;

  // Computed Physical Attributes
  reedSpaceInches: number;
  warpWeightKg: number;
  weftWeightKg: number;
  totalWeightKg: number;
  weightPerMeterKg: number;
  weightPerMeterGram: number;

  // Computed Financial Breakdowns
  warpTotalPrice: number;
  weftTotalPrice: number;
  sizingTotalWages: number;
  weavingTotalWages: number;
  bleachingTotalCharges: number;

  // Final Costing
  costBeforeBleaching?: number;
  costPerMeterBeforeBleaching?: number;
  totalProductionCost: number;
  costPerMeter: number;

  createdById: string | null;
  createdBy?: {
    id: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFabricCostingInput {
  qualityName: string;
  notes?: string | null;
  ends: number;
  reed: number;
  pick: number;
  totalLengthMeters: number;
  warpCount: number;
  weftCount: number;
  warpPricePerKg: number;
  weftPricePerKg: number;
  sizingRatePerKg: number;
  weavingRatePerMeter: number;
  bleachingRatePerKg: number;
  yarnConstant?: number;
  conversionDivisor?: number;
  endsDeduction?: number;
  meterToYardFactor?: number;
  baseReedPicks?: number;
}

export interface FabricCostingCalculationResult {
  totalLengthYards: number;
  reedSpaceInches: number;
  warpWeightKg: number;
  warpTotalPrice: number;
  weftWeightKg: number;
  weftTotalPrice: number;
  totalWeightKg: number;
  weightPerMeterKg: number;
  weightPerMeterGram: number;
  sizingTotalWages: number;
  weavingTotalWages: number;
  bleachingTotalCharges: number;
  costBeforeBleaching: number;
  costPerMeterBeforeBleaching: number;
  totalProductionCost: number;
  costPerMeter: number;
  constantsUsed: {
    yarnConstant: number;
    conversionDivisor: number;
    endsDeduction: number;
    meterToYardFactor: number;
    baseReedPicks: number;
  };
}

export interface FabricCostingStats {
  totalFormulations: number;
  averageCostPerMeter: number;
  averageWeightPerMeterGram: number;
  totalMetersCalculated: number;
  totalProductionValue: number;
}

export interface FabricCostingListResponse {
  items: GreyFabricCosting[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ColumnDefinition {
  id: string;
  label: string;
  tamilLabel?: string;
  category: 'primary' | 'physical' | 'wages' | 'constants' | 'meta';
  defaultVisible: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}
