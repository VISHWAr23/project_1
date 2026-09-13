import { z } from 'zod';

export const createJobWorkCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  gstin: z.string().optional(),
  address: z.string().optional(),
  creditDays: z.number().int().min(0).default(30),
});

export type CreateJobWorkCompanyInput = z.infer<typeof createJobWorkCompanySchema>;

export const createJobWorkOrderSchema = z.object({
  jobWorkCompanyId: z.string().uuid('Valid Job Working Company is required'),
  rawMaterialId: z.string().uuid('Valid Raw Material is required'),
  finishedProductId: z.string().uuid('Valid Finished Product is required').optional().nullable(),
  expectedReturnDate: z.string().min(1, 'Expected return date is required'),
  remarks: z.string().optional(),
});

export type CreateJobWorkOrderInput = z.infer<typeof createJobWorkOrderSchema>;

export const issueItemSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  batchId: z.string().uuid().optional().nullable(),
  issuedWeight: z.number().positive('Issued weight must be greater than 0'),
  issuedQty: z.number().positive('Issued quantity must be greater than 0'),
  remarks: z.string().optional(),
});

export type IssueItemInput = z.infer<typeof issueItemSchema>;

export const issueMaterialsSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  remarks: z.string().optional(),
  items: z.array(issueItemSchema).min(1, 'At least one roll must be issued'),
});

export type IssueMaterialsInput = z.infer<typeof issueMaterialsSchema>;

export const returnItemSchema = z.object({
  finishedProductId: z.string().uuid('Valid Finished Product is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  returnedWeight: z.number().positive('Returned weight must be greater than 0'),
  returnedQty: z.number().positive('Returned quantity must be greater than 0'),
  wastageWeight: z.number().min(0).default(0),
  wastageQty: z.number().min(0).default(0),
  photoUrls: z.array(z.string().url()).optional(),
  remarks: z.string().optional(),
});

export type ReturnItemInput = z.infer<typeof returnItemSchema>;

export const receiveReturnSchema = z.object({
  returnedDate: z.string().min(1, 'Return date is required'),
  items: z.array(returnItemSchema).min(1, 'At least one returned item/roll is required'),
  remarks: z.string().optional(),
});

export type ReceiveReturnInput = z.infer<typeof receiveReturnSchema>;

export const closeJobWorkOrderSchema = z.object({
  remarks: z.string().optional(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm order closure',
  }),
});

export type CloseJobWorkOrderInput = z.infer<typeof closeJobWorkOrderSchema>;

// ==========================================
// WEAVING JOB WORK SPECIFICATIONS & SCHEMAS
// ==========================================

export const markBreakdownItemSchema = z.object({
  mark: z.number().positive('Mark must be greater than 0'),
  paavu: z.number().positive('Paavu must be greater than 0'),
  pieces: z.number().positive().optional(),
});

export type MarkBreakdownItem = z.infer<typeof markBreakdownItemSchema>;

export const createWeavingJobWorkSchema = z.object({
  jobWorkCompanyId: z.string().uuid('Valid Job Working Company is required'),
  jobWorkType: z.literal('WEAVING').default('WEAVING'),
  rawMaterialId: z.string().uuid().optional().nullable(),
  expectedReturnDate: z.string().min(1, 'Expected return date is required'),
  remarks: z.string().optional(),

  // Weaving Engineering Parameters
  ends: z.number().int().positive('Ends count must be positive'),
  reed: z.number().int().positive('Reed must be positive'),
  pick: z.number().int().positive('Pick must be positive'),
  totalPaavu: z.number().int().positive('Total Paavu must be positive'),
  pieceLengthYards: z.number().positive('Piece length in yards must be positive').default(112),
  pieceLengthMeters: z.number().positive('Piece length in meters must be positive').default(100),
  weftCount: z.number().positive('Weft count must be positive'),
  warpCount: z.number().positive().optional().nullable(),
  yarnConstant: z.number().positive().default(0.54),

  // Mark Breakdown Array
  markBreakdown: z.array(markBreakdownItemSchema).min(1, 'At least one mark breakdown is required'),
  totalPieces: z.number().int().positive('Total pieces must be positive'),

  // Calculations
  weftWeightPerPieceKg: z.number().positive('Weft weight per piece must be positive'),
  totalWeftWeightKg: z.number().positive('Total weft weight must be positive'),
  warpWeightKg: z.number().min(0).default(0),
  totalReceivableWeightKg: z.number().positive('Total receivable weight must be positive'),

  // Salary Parameters
  salaryType: z.enum(['Roll', 'Than', 'Custom']).default('Roll'),
  ratePerMeter: z.number().positive('Rate per meter must be positive'),
  baseReedPicks: z.number().int().positive().default(16),
  salaryPerPiece: z.number().positive('Salary per piece must be positive'),
  totalSalary: z.number().positive('Total salary must be positive'),
});

export type CreateWeavingJobWorkInput = z.infer<typeof createWeavingJobWorkSchema>;

export const receiveWeavingItemSchema = z.object({
  date: z.string().min(1, 'In-pass date is required'),
  inPassNumber: z.string().min(1, 'In-pass number is required'),
  description: z.string().min(1, 'Fabric description is required'),
  weightKg: z.number().positive('Weight in KG must be greater than 0'),
  wastageDescription: z.string().optional().nullable(),
  wastageWeightKg: z.number().min(0).default(0),
});

export type ReceiveWeavingItemInput = z.infer<typeof receiveWeavingItemSchema>;

export const receiveWeavingReturnSchema = z.object({
  returnedDate: z.string().min(1, 'Return date is required'),
  items: z.array(receiveWeavingItemSchema).min(1, 'At least one in-pass record is required'),
  remarks: z.string().optional().nullable(),
  isFinal: z.boolean().default(false),
});

export type ReceiveWeavingReturnInput = z.infer<typeof receiveWeavingReturnSchema>;

/**
 * Pure calculation engine for Weaving Job Work
 * Implements exact textile formulas:
 * 1. Pieces per mark = Mark * Paavu
 * 2. Total Pieces = Sum(Mark * Paavu)
 * 3. Weft Weight (kg) for 1 piece = ((Ends / Reed) * Pick * YarnConstant * LengthYds) / (WeftCount * 1000)
 * 4. Total Weft Weight (kg) = Total Pieces * Weft Weight per piece
 * 5. Salary (₹) for 1 piece = (RatePerMeter / 16) * Pick * LengthMeters
 * 6. Total Salary (₹) = Total Pieces * Salary per piece
 * 7. Total Receivable Weight (kg) = Total Weft Weight + Warp Weight
 */
export function computeWeavingJobWork(input: {
  ends: number;
  reed: number;
  pick: number;
  weftCount: number;
  markBreakdown: Array<{ mark: number; paavu: number }>;
  pieceLengthYards?: number;
  pieceLengthMeters?: number;
  yarnConstant?: number;
  salaryType?: 'Roll' | 'Than' | 'Custom';
  ratePerMeter?: number;
  baseReedPicks?: number;
  warpWeightKg?: number;
}) {
  const cYarn = input.yarnConstant ?? 0.54;
  const cYards = input.pieceLengthYards ?? 112;
  const cMeters = input.pieceLengthMeters ?? 100;
  const cBaseReed = input.baseReedPicks ?? 16;
  const salaryType = input.salaryType ?? 'Roll';

  // Default rates based on type: Roll = ₹2.015, Than = ₹2.095
  const ratePerMeter =
    input.ratePerMeter ?? (salaryType === 'Than' ? 2.095 : 2.015);

  // 1. Process Mark Breakdown
  const breakdown = input.markBreakdown.map((item) => ({
    mark: item.mark,
    paavu: item.paavu,
    pieces: item.mark * item.paavu,
  }));

  const totalPaavu = breakdown.reduce((sum, item) => sum + item.paavu, 0);
  const totalPieces = breakdown.reduce((sum, item) => sum + item.pieces, 0);

  // 2. Weft Yarn Weight (ஊடை நூல் எடை)
  // Formula: ((Ends / Reed) * Pick * 0.54 * LengthYds) / (WeftCount * 1000)
  const reedSpace = input.ends / (input.reed || 1);
  const rawWeftWeightPerPiece =
    (reedSpace * input.pick * cYarn * cYards) / ((input.weftCount || 1) * 1000);
  const weftWeightPerPieceKg = Number(rawWeftWeightPerPiece.toFixed(3));
  const totalWeftWeightKg = Number(
    (totalPieces * weftWeightPerPieceKg).toFixed(3)
  );

  // 3. Weaving Salary (நெசவு சம்பளம்)
  // Formula: (Rate / 16) * Pick * LengthMeters
  const rawSalaryPerPiece = (ratePerMeter / cBaseReed) * input.pick * cMeters;
  const salaryPerPiece = Number(rawSalaryPerPiece.toFixed(3));
  const totalSalary = Number((totalPieces * salaryPerPiece).toFixed(2));

  // 4. Total Receivable Weight (மொத்த பெறவேண்டிய எடை)
  const warpWeightKg = input.warpWeightKg ?? 0;
  const totalReceivableWeightKg = Number(
    (totalWeftWeightKg + warpWeightKg).toFixed(3)
  );

  return {
    ends: input.ends,
    reed: input.reed,
    pick: input.pick,
    totalPaavu,
    totalPieces,
    breakdown,
    pieceLengthYards: cYards,
    pieceLengthMeters: cMeters,
    yarnConstant: cYarn,
    weftCount: input.weftCount,
    reedSpaceInches: Number(reedSpace.toFixed(2)),
    weftWeightPerPieceKg,
    totalWeftWeightKg,
    salaryType,
    ratePerMeter,
    baseReedPicks: cBaseReed,
    salaryPerPiece,
    totalSalary,
    warpWeightKg,
    totalReceivableWeightKg,
  };
}

