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
import { PillowBedsheetProductionService } from './pillow-bedsheet-production.service';
import {
  CreatePillowBedsheetBatchDto,
  UpdatePillowBedsheetProgressDto,
  UpdatePillowBedsheetStatusDto,
} from './dto/create-batch.dto';
import { QueryPillowBedsheetBatchesDto } from './dto/query.dto';

@ApiTags('Pillow & Bedsheet Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pillow-bedsheet-production')
export class PillowBedsheetProductionController {
  constructor(private readonly service: PillowBedsheetProductionService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Pillow & Bedsheet dashboard metrics' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'List all Pillow & Bedsheet batches with search, filters, pagination' })
  async findAll(@Query() query: QueryPillowBedsheetBatchesDto) {
    return this.service.findAll(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get details of a single Pillow & Bedsheet batch' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new Pillow & Bedsheet batch' })
  async create(@Body() dto: CreatePillowBedsheetBatchDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Patch('batches/:id/progress')
  @ApiOperation({ summary: 'Update batch completion progress' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdatePillowBedsheetProgressDto,
  ) {
    return this.service.updateProgress(id, dto);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update Pillow & Bedsheet batch status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePillowBedsheetStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete a Pillow & Bedsheet batch record' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
