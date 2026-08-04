import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RollTrackingService } from './roll-tracking.service';
import { CreateRollDto } from './dto/create-roll.dto';
import { UpdateRollStatusDto } from './dto/update-roll-status.dto';
import { RollStatus, RollStage } from '@ims/database';

@Controller('rolls')
export class RollTrackingController {
  constructor(private readonly rollTrackingService: RollTrackingService) {}

  @Post()
  async createRoll(@Body() dto: CreateRollDto) {
    return this.rollTrackingService.createRoll(dto);
  }

  @Post('bulk')
  async bulkCreateRolls(@Body() dto: { items: CreateRollDto[] }) {
    return this.rollTrackingService.bulkCreateRolls(dto.items);
  }

  @Get('stats')
  async getStats() {
    return this.rollTrackingService.getStats();
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: RollStatus,
    @Query('stage') stage?: RollStage,
    @Query('batchNumber') batchNumber?: string,
    @Query('jobWorkCompanyId') jobWorkCompanyId?: string,
    @Query('location') location?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rollTrackingService.findAll({
      search,
      status,
      stage,
      batchNumber,
      jobWorkCompanyId,
      location,
      page,
      limit,
    });
  }

  @Get(':rollNumber')
  async findByRollNumber(@Param('rollNumber') rollNumber: string) {
    return this.rollTrackingService.findByRollNumber(rollNumber);
  }

  @Get(':rollNumber/genealogy')
  async getGenealogy(@Param('rollNumber') rollNumber: string) {
    return this.rollTrackingService.getGenealogy(rollNumber);
  }

  @Put(':rollNumber/status')
  async updateStatus(
    @Param('rollNumber') rollNumber: string,
    @Body() dto: UpdateRollStatusDto,
  ) {
    return this.rollTrackingService.updateStatus(rollNumber, dto);
  }
}
