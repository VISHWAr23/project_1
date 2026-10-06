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
import { MopingPadProductionService } from './moping-pad-production.service';
import {
  CreateMopingPadBatchDto,
  UpdateMopingPadProgressDto,
  UpdateMopingPadStatusDto,
} from './dto/create-batch.dto';
import { QueryMopingPadBatchesDto } from './dto/query.dto';

@ApiTags('Moping Pad Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('moping-pad-production')
export class MopingPadProductionController {
  constructor(private readonly service: MopingPadProductionService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Moping Pad production dashboard metrics' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'List all Moping Pad production batches with search, filters, pagination' })
  async findAll(@Query() query: QueryMopingPadBatchesDto) {
    return this.service.findAll(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get details of a single Moping Pad production batch' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new Moping Pad production batch' })
  async create(@Body() dto: CreateMopingPadBatchDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update Moping Pad batch lifecycle status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMopingPadStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch('batches/:id/progress')
  @ApiOperation({ summary: 'Update Moping Pad batch progress quantity & wastage notes' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateMopingPadProgressDto,
  ) {
    return this.service.updateProgress(id, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete a Moping Pad batch record' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
