import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import { computeFabricCosting } from '@ims/validation';
import { CreateFabricCostingDto } from './dto/create-fabric-costing.dto';
import { QueryFabricCostingDto } from './dto/query-fabric-costing.dto';

@Injectable()
export class FabricCostingService {
  /**
   * Real-time calculation preview without saving
   */
  calculatePreview(dto: CreateFabricCostingDto) {
    return computeFabricCosting(dto);
  }

  /**
   * Create and store a new Grey Fabric & Bleaching Cost formulation
   */
  async create(dto: CreateFabricCostingDto, userId?: string) {
    const computed = computeFabricCosting(dto);

    const record = await prisma.greyFabricCosting.create({
      data: {
        qualityName: dto.qualityName.trim(),
        notes: dto.notes?.trim() || null,

        // Inputs
        ends: dto.ends,
        reed: dto.reed,
        pick: dto.pick,
        totalLengthMeters: dto.totalLengthMeters,
        totalLengthYards: computed.totalLengthYards,
        warpCount: dto.warpCount,
        weftCount: dto.weftCount,

        // Rates
        warpPricePerKg: dto.warpPricePerKg,
        weftPricePerKg: dto.weftPricePerKg,
        sizingRatePerKg: dto.sizingRatePerKg,
        weavingRatePerMeter: dto.weavingRatePerMeter,
        bleachingRatePerKg: dto.bleachingRatePerKg,

        // Constants
        yarnConstant: computed.constantsUsed.yarnConstant,
        conversionDivisor: computed.constantsUsed.conversionDivisor,
        endsDeduction: computed.constantsUsed.endsDeduction,
        meterToYardFactor: computed.constantsUsed.meterToYardFactor,
        baseReedPicks: computed.constantsUsed.baseReedPicks,

        // Computed Physical Attributes
        reedSpaceInches: computed.reedSpaceInches,
        warpWeightKg: computed.warpWeightKg,
        weftWeightKg: computed.weftWeightKg,
        totalWeightKg: computed.totalWeightKg,
        weightPerMeterKg: computed.weightPerMeterKg,
        weightPerMeterGram: computed.weightPerMeterGram,

        // Computed Financial Breakdowns
        warpTotalPrice: computed.warpTotalPrice,
        weftTotalPrice: computed.weftTotalPrice,
        sizingTotalWages: computed.sizingTotalWages,
        weavingTotalWages: computed.weavingTotalWages,
        bleachingTotalCharges: computed.bleachingTotalCharges,

        // Final Costing
        totalProductionCost: computed.totalProductionCost,
        costPerMeter: computed.costPerMeter,

        createdById: userId || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return record;
  }

  /**
   * Find all fabric costing records with pagination, search, and sorting
   */
  async findAll(query: QueryFabricCostingDto) {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GreyFabricCostingWhereInput = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { qualityName: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = [
      'createdAt',
      'qualityName',
      'totalLengthMeters',
      'totalWeightKg',
      'totalProductionCost',
      'costPerMeter',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.greyFabricCosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.greyFabricCosting.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get single fabric costing formulation with full details
   */
  async findOne(id: string) {
    const record = await prisma.greyFabricCosting.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Fabric costing formulation with ID "${id}" not found`);
    }

    return record;
  }

  /**
   * Delete a fabric costing record
   */
  async delete(id: string) {
    const existing = await prisma.greyFabricCosting.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Fabric costing formulation with ID "${id}" not found`);
    }

    await prisma.greyFabricCosting.delete({ where: { id } });
    return { success: true, message: 'Fabric costing formulation removed successfully' };
  }

  /**
   * Aggregate statistics for dashboard summary cards
   */
  async getStats() {
    const totalCount = await prisma.greyFabricCosting.count();

    if (totalCount === 0) {
      return {
        totalFormulations: 0,
        averageCostPerMeter: 0,
        averageWeightPerMeterGram: 0,
        totalMetersCalculated: 0,
        totalProductionValue: 0,
      };
    }

    const aggregates = await prisma.greyFabricCosting.aggregate({
      _avg: {
        costPerMeter: true,
        weightPerMeterGram: true,
      },
      _sum: {
        totalLengthMeters: true,
        totalProductionCost: true,
      },
    });

    return {
      totalFormulations: totalCount,
      averageCostPerMeter: Number((aggregates._avg.costPerMeter || 0).toFixed(2)),
      averageWeightPerMeterGram: Number((aggregates._avg.weightPerMeterGram || 0).toFixed(2)),
      totalMetersCalculated: Number((aggregates._sum.totalLengthMeters || 0).toFixed(1)),
      totalProductionValue: Number((aggregates._sum.totalProductionCost || 0).toFixed(2)),
    };
  }
}
