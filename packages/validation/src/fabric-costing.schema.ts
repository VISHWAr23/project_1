import { z } from 'zod';

export const createFabricCostingSchema = z.object({
  qualityName: z.string().min(1, 'Quality/Item name is required').max(255),
  notes: z.string().optional().nullable(),

  // Primary Specifications
  ends: z.number().int().positive('Ends must be greater than 0'),
  reed: z.number().int().positive('Reed must be greater than 0'),
  pick: z.number().int().positive('Pick must be greater than 0'),
  totalLengthMeters: z.number().positive('Total length must be greater than 0'),
  warpCount: z.number().positive('Warp count must be greater than 0'),
  weftCount: z.number().positive('Weft count must be greater than 0'),

  // Rates & Wages
  warpPricePerKg: z.number().min(0, 'Warp price cannot be negative'),
  weftPricePerKg: z.number().min(0, 'Weft price cannot be negative'),
  sizingRatePerKg: z.number().min(0, 'Sizing rate cannot be negative'),
  weavingRatePerMeter: z.number().min(0, 'Weaving rate cannot be negative'),
  bleachingRatePerKg: z.number().min(0, 'Bleaching rate cannot be negative'),

  // Constants (Optional overrides, defaults provided)
  yarnConstant: z.number().positive().default(0.54),
  conversionDivisor: z.number().positive().default(1000),
  endsDeduction: z.number().int().min(0).default(24),
  meterToYardFactor: z.number().positive().default(1.12),
  baseReedPicks: z.number().int().positive().default(16),
});

export type CreateFabricCostingInput = z.infer<typeof createFabricCostingSchema>;

export const queryFabricCostingSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type QueryFabricCostingInput = z.infer<typeof queryFabricCostingSchema>;

/**
 * Pure calculation engine for Grey Fabric Roll Production & Bleaching Cost
 * Accurately implements textile manufacturing formulas:
 * 1. Total Yards = Meters * 1.12
 * 2. Warp Weight (kg) = ((Ends * 0.54 * Total Yards) / Warp Count) / 1000
 * 3. Reed Space / Width (inches) = (Ends - 24) / Reed
 * 4. Weft Weight (kg) = ((Reed Space * Pick * 0.54 * Total Yards) / Weft Count) / 1000
 * 5. Total Weight (kg) = Warp Weight + Weft Weight
 * 6. Weight per meter = Total Weight / Total Meters
 * 7. Sizing Wages = Warp Weight * Sizing Rate
 * 8. Weaving Wages = (Weaving Base Rate / 16) * Pick * Total Meters
 * 9. Bleaching Charges = Total Weight * Bleaching Rate
 * 10. Total Production Cost = Warp Cost + Weft Cost + Sizing Wages + Weaving Wages + Bleaching Charges
 * 11. Cost per meter = Total Cost / Total Meters
 */
export function computeFabricCosting(input: {
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
}) {
  const cYarn = input.yarnConstant ?? 0.54;
  const cDiv = input.conversionDivisor ?? 1000;
  const cEndsDed = input.endsDeduction ?? 24;
  const cM2Y = input.meterToYardFactor ?? 1.12;
  const cBaseReed = input.baseReedPicks ?? 16;

  // Total Length in yards (e.g. 1000 * 1.12 = 1120)
  const totalLengthYards = Number((input.totalLengthMeters * cM2Y).toFixed(2));

  // 1. Warp Weight (பாவு நூல் எடை) in kg
  const rawWarpWeight = ((input.ends * cYarn * totalLengthYards) / input.warpCount) / cDiv;
  const warpWeightKg = Number(rawWarpWeight.toFixed(3));
  const warpTotalPrice = Number((warpWeightKg * input.warpPricePerKg).toFixed(2));

  // 2. Reed Space (Fabric Width in inches) and Weft Weight (ஊடை நூல் எடை) in kg
  const reedSpaceInches = Number(((input.ends - cEndsDed) / input.reed).toFixed(2));
  const rawWeftWeight = ((reedSpaceInches * input.pick * cYarn * totalLengthYards) / input.weftCount) / cDiv;
  const weftWeightKg = Number(rawWeftWeight.toFixed(3));
  const weftTotalPrice = Number((weftWeightKg * input.weftPricePerKg).toFixed(2));

  // 3. Total Fabric Weight
  const totalWeightKg = Number((warpWeightKg + weftWeightKg).toFixed(3));
  const weightPerMeterKg = Number((totalWeightKg / (input.totalLengthMeters || 1)).toFixed(6));
  const weightPerMeterGram = Number((weightPerMeterKg * 1000).toFixed(3));

  // 4. Sizing Wages (சைசிங் Wages)
  const sizingTotalWages = Number((warpWeightKg * input.sizingRatePerKg).toFixed(2));

  // 5. Weaving Wages (நெசவு Wages)
  const weavingTotalWages = Number((((input.weavingRatePerMeter / cBaseReed) * input.pick * input.totalLengthMeters)).toFixed(2));

  // 6. Bleaching Charges
  const bleachingTotalCharges = Number((totalWeightKg * input.bleachingRatePerKg).toFixed(2));

  // 7. Cost Before Bleaching (Grey Fabric Production Cost)
  const costBeforeBleaching = Number(
    (warpTotalPrice + weftTotalPrice + sizingTotalWages + weavingTotalWages).toFixed(2)
  );
  const costPerMeterBeforeBleaching = Number(
    (costBeforeBleaching / (input.totalLengthMeters || 1)).toFixed(2)
  );

  // 8. Total Production Cost & Per-Meter Cost (Finished Fabric with Bleaching)
  const totalProductionCost = Number(
    (costBeforeBleaching + bleachingTotalCharges).toFixed(2)
  );
  const costPerMeter = Number((totalProductionCost / (input.totalLengthMeters || 1)).toFixed(2));

  return {
    totalLengthYards,
    reedSpaceInches,
    warpWeightKg,
    warpTotalPrice,
    weftWeightKg,
    weftTotalPrice,
    totalWeightKg,
    weightPerMeterKg,
    weightPerMeterGram,
    sizingTotalWages,
    weavingTotalWages,
    bleachingTotalCharges,
    costBeforeBleaching,
    costPerMeterBeforeBleaching,
    totalProductionCost,
    costPerMeter,
    constantsUsed: {
      yarnConstant: cYarn,
      conversionDivisor: cDiv,
      endsDeduction: cEndsDed,
      meterToYardFactor: cM2Y,
      baseReedPicks: cBaseReed,
    },
  };
}
