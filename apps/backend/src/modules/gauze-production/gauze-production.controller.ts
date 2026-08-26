import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GauzeProductionService } from './gauze-production.service';
import { CreateGauzeProductionBatchDto, UpdateGauzeProductionBatchDto } from './dto/create-batch.dto';
import { SendToBleachingDto } from './dto/send-bleaching.dto';
import { ReceiveBleachingDto } from './dto/receive-bleaching.dto';
import { AddProcessingOperationDto } from './dto/add-operation.dto';
import { CreatePackingEntryDto } from './dto/create-packing.dto';
import {
  CreateGauzeTypeDto,
  CreateGauzeSizeDto,
  CreateBleachingTypeDto,
  CreateGauzeOperationTypeDto,
} from './dto/master.dto';
import { GauzeBatchQueryDto } from './dto/query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GauzeProductionStatus } from '@ims/database';

@ApiTags('Gauze Production Tracking')
@Controller('gauze-production')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GauzeProductionController {
  constructor(private readonly gauzeProductionService: GauzeProductionService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get aggregated executive production dashboard statistics and KPIs' })
  async getDashboard() {
    return this.gauzeProductionService.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'List all gauze production batches with filters, search, and pagination' })
  async findAllBatches(@Query() query: GauzeBatchQueryDto) {
    return this.gauzeProductionService.findAllBatches(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get complete batch details, timeline, movements, operations, and status history' })
  async getBatchById(@Param('id') id: string) {
    return this.gauzeProductionService.getBatchById(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new gauze production batch from raw material roll' })
  async createBatch(@Body() dto: CreateGauzeProductionBatchDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.gauzeProductionService.createBatch(dto, userId);
  }

  @Post('batches/:id/bleaching')
  @ApiOperation({ summary: 'Send production batch material to external job-work bleaching vendor' })
  async sendToBleaching(
    @Param('id') id: string,
    @Body() dto: SendToBleachingDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gauzeProductionService.sendToBleaching(id, dto, userId);
  }

  @Post('batches/:id/bleaching-receipt')
  @ApiOperation({ summary: 'Receive material back from bleaching vendor and record wastage & rejection' })
  async receiveBleaching(
    @Param('id') id: string,
    @Body() dto: ReceiveBleachingDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gauzeProductionService.receiveBleaching(id, dto, userId);
  }

  @Post('batches/:id/operations')
  @ApiOperation({ summary: 'Record internal processing operation (cutting, folding, inspection, etc.)' })
  async addProcessingOperation(
    @Param('id') id: string,
    @Body() dto: AddProcessingOperationDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gauzeProductionService.addProcessingOperation(id, dto, userId);
  }

  @Post('batches/:id/packing')
  @ApiOperation({ summary: 'Convert processed gauze into finished packed goods and update finished stock' })
  async createPackingEntry(
    @Param('id') id: string,
    @Body() dto: CreatePackingEntryDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gauzeProductionService.createPackingEntry(id, dto, userId);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Manually update batch status (e.g. ON_HOLD, READY_FOR_PACKING, CANCELLED)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: GauzeProductionStatus; remarks?: string },
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gauzeProductionService.updateStatus(id, body.status, body.remarks, userId);
  }

  @Get('batches/:id/traceability')
  @ApiOperation({ summary: 'Get forward and reverse traceability chain for a batch' })
  async getTraceability(@Param('id') id: string) {
    return this.gauzeProductionService.getTraceability(id);
  }

  @Get('bleaching-jobs')
  @ApiOperation({ summary: 'List all bleaching jobs with vendor statuses and balances' })
  async getBleachingJobs(
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.gauzeProductionService.getBleachingJobs({ vendorId, status, search });
  }

  @Get('vendor-stock')
  @ApiOperation({ summary: 'Get company-owned material currently held by each job-work vendor' })
  async getVendorStockRegister() {
    return this.gauzeProductionService.getVendorStockRegister();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Generate specialized gauze production reports' })
  async getReports(@Query('type') type: 'batches' | 'bleaching' | 'vendor-pending' | 'wastage' | 'finished-goods') {
    return this.gauzeProductionService.getReports(type || 'batches');
  }

  @Get('masters')
  @ApiOperation({ summary: 'Get all Gauze Production master data (types, sizes, bleaching, operations)' })
  async getMasters() {
    return this.gauzeProductionService.getMasters();
  }

  @Post('masters/types')
  @ApiOperation({ summary: 'Create new Gauze Type master record' })
  async createGauzeType(@Body() dto: CreateGauzeTypeDto) {
    return this.gauzeProductionService.createGauzeType(dto);
  }

  @Patch('masters/types/:id')
  @ApiOperation({ summary: 'Update Gauze Type master record' })
  async updateGauzeType(@Param('id') id: string, @Body() dto: Partial<CreateGauzeTypeDto>) {
    return this.gauzeProductionService.updateGauzeType(id, dto);
  }

  @Post('masters/sizes')
  @ApiOperation({ summary: 'Create new Gauze Size dimension master record' })
  async createGauzeSize(@Body() dto: CreateGauzeSizeDto) {
    return this.gauzeProductionService.createGauzeSize(dto);
  }

  @Patch('masters/sizes/:id')
  @ApiOperation({ summary: 'Update Gauze Size dimension master record' })
  async updateGauzeSize(@Param('id') id: string, @Body() dto: Partial<CreateGauzeSizeDto>) {
    return this.gauzeProductionService.updateGauzeSize(id, dto);
  }

  @Post('masters/bleaching')
  @ApiOperation({ summary: 'Create new Bleaching Process Type master record' })
  async createBleachingType(@Body() dto: CreateBleachingTypeDto) {
    return this.gauzeProductionService.createBleachingType(dto);
  }

  @Patch('masters/bleaching/:id')
  @ApiOperation({ summary: 'Update Bleaching Process Type master record' })
  async updateBleachingType(@Param('id') id: string, @Body() dto: Partial<CreateBleachingTypeDto>) {
    return this.gauzeProductionService.updateBleachingType(id, dto);
  }

  @Post('masters/operations')
  @ApiOperation({ summary: 'Create new Internal Processing Operation master record' })
  async createOperationType(@Body() dto: CreateGauzeOperationTypeDto) {
    return this.gauzeProductionService.createOperationType(dto);
  }

  @Patch('masters/operations/:id')
  @ApiOperation({ summary: 'Update Internal Processing Operation master record' })
  async updateOperationType(@Param('id') id: string, @Body() dto: Partial<CreateGauzeOperationTypeDto>) {
    return this.gauzeProductionService.updateOperationType(id, dto);
  }
}
