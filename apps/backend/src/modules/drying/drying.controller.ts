import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DryingService } from './drying.service';
import {
  CreateDryingBatchDto,
  UpdateDryingProgressDto,
  UpdateDryingStatusDto,
} from './dto/create-batch.dto';
import { QueryDryingBatchesDto } from './dto/query.dto';

@ApiTags('Drying Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drying')
export class DryingController {
  constructor(private readonly service: DryingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Drying production dashboard metrics' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'List all Drying production batches with search, filters, pagination' })
  async findAll(@Query() query: QueryDryingBatchesDto) {
    return this.service.findAll(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get details of a single Drying production batch' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new Drying production batch' })
  async create(@Body() dto: CreateDryingBatchDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update Drying batch lifecycle status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDryingStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch('batches/:id/progress')
  @ApiOperation({ summary: 'Update Drying batch progress completed pieces' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateDryingProgressDto,
  ) {
    return this.service.updateProgress(id, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete a Drying batch record' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
