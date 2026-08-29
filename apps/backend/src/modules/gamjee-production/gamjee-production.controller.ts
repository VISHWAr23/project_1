import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamjeeProductionService } from './gamjee-production.service';
import { CreateGamjeeProductionBatchDto, UpdateGamjeeProductionBatchDto } from './dto/create-batch.dto';
import { IssueGamjeeMaterialsDto } from './dto/issue-materials.dto';
import { AddGamjeeOperationDto } from './dto/add-operation.dto';
import { CreateGamjeeRollingDto } from './dto/create-rolling.dto';
import {
  CreateGamjeeSizeDto,
  CreateGamjeeOperationTypeDto,
  CreateGamjeeProductMasterDto,
  CreateGamjeeCottonSpecDto,
} from './dto/master.dto';
import { GamjeeBatchQueryDto } from './dto/query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GamjeeProductionStatus } from '@ims/database';

@ApiTags('Gamjee Roll Production')
@Controller('gamjee-production')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamjeeProductionController {
  constructor(private readonly gamjeeProductionService: GamjeeProductionService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get executive dashboard KPIs for Gamjee Roll Production' })
  async getDashboardStats() {
    return this.gamjeeProductionService.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'Get all Gamjee Production Batches with filters and pagination' })
  async findAllBatches(@Query() query: GamjeeBatchQueryDto) {
    return this.gamjeeProductionService.findAllBatches(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get complete detail of a Gamjee Production Batch' })
  async getBatchById(@Param('id') id: string) {
    return this.gamjeeProductionService.getBatchById(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new Gamjee Production Batch' })
  async createBatch(@Body() dto: CreateGamjeeProductionBatchDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.gamjeeProductionService.createBatch(dto, userId);
  }

  @Post('batches/:id/issue-materials')
  @ApiOperation({ summary: 'Issue Bleached Fabric and Cotton Roll to Production Batch' })
  async issueMaterials(
    @Param('id') id: string,
    @Body() dto: IssueGamjeeMaterialsDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gamjeeProductionService.issueMaterials(id, dto, userId);
  }

  @Post('batches/:id/operations')
  @ApiOperation({ summary: 'Record Pinning, Folding, or Cutting processing operation' })
  async addProcessingOperation(
    @Param('id') id: string,
    @Body() dto: AddGamjeeOperationDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gamjeeProductionService.addProcessingOperation(id, dto, userId);
  }

  @Post('batches/:id/rolling')
  @ApiOperation({ summary: 'Record combine and rolling entry to produce finished Gamjee rolls' })
  async createRollingEntry(
    @Param('id') id: string,
    @Body() dto: CreateGamjeeRollingDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gamjeeProductionService.createRollingEntry(id, dto, userId);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update status of a Gamjee Production Batch' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: GamjeeProductionStatus,
    @Body('remarks') remarks: string,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.gamjeeProductionService.updateStatus(id, status, remarks, userId);
  }

  @Get('batches/:id/traceability')
  @ApiOperation({ summary: 'Get forward and reverse traceability chain for a batch' })
  async getTraceability(@Param('id') id: string) {
    return this.gamjeeProductionService.getTraceability(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get Gamjee Roll specialized production and material reports' })
  async getReports(@Query('type') type: 'production' | 'consumption' | 'wastage' | 'finished_goods') {
    return this.gamjeeProductionService.getReports(type || 'production');
  }

  @Get('masters')
  @ApiOperation({ summary: 'Get Gamjee Sizes, Operations, Product Masters, and Cotton Specifications' })
  async getMasters() {
    return this.gamjeeProductionService.getMasters();
  }

  @Post('masters/sizes')
  @ApiOperation({ summary: 'Create a new Gamjee Roll Size Master' })
  async createSize(@Body() dto: CreateGamjeeSizeDto) {
    return this.gamjeeProductionService.createSize(dto);
  }

  @Put('masters/sizes/:id')
  @ApiOperation({ summary: 'Update a Gamjee Roll Size Master' })
  async updateSize(@Param('id') id: string, @Body() dto: Partial<CreateGamjeeSizeDto>) {
    return this.gamjeeProductionService.updateSize(id, dto);
  }

  @Delete('masters/sizes/:id')
  @ApiOperation({ summary: 'Delete a Gamjee Roll Size Master' })
  async deleteSize(@Param('id') id: string) {
    return this.gamjeeProductionService.deleteSize(id);
  }

  @Post('masters/operations')
  @ApiOperation({ summary: 'Create a new Gamjee Operation Master' })
  async createOperation(@Body() dto: CreateGamjeeOperationTypeDto) {
    return this.gamjeeProductionService.createOperation(dto);
  }

  @Put('masters/operations/:id')
  @ApiOperation({ summary: 'Update a Gamjee Operation Master' })
  async updateOperation(@Param('id') id: string, @Body() dto: Partial<CreateGamjeeOperationTypeDto>) {
    return this.gamjeeProductionService.updateOperation(id, dto);
  }

  @Delete('masters/operations/:id')
  @ApiOperation({ summary: 'Delete a Gamjee Operation Master' })
  async deleteOperation(@Param('id') id: string) {
    return this.gamjeeProductionService.deleteOperation(id);
  }

  @Post('masters/products')
  @ApiOperation({ summary: 'Create a new Gamjee Product Master' })
  async createProductMaster(@Body() dto: CreateGamjeeProductMasterDto) {
    return this.gamjeeProductionService.createProductMaster(dto);
  }

  @Put('masters/products/:id')
  @ApiOperation({ summary: 'Update a Gamjee Product Master' })
  async updateProductMaster(@Param('id') id: string, @Body() dto: Partial<CreateGamjeeProductMasterDto>) {
    return this.gamjeeProductionService.updateProductMaster(id, dto);
  }

  @Delete('masters/products/:id')
  @ApiOperation({ summary: 'Delete a Gamjee Product Master' })
  async deleteProductMaster(@Param('id') id: string) {
    return this.gamjeeProductionService.deleteProductMaster(id);
  }

  @Post('masters/cotton-specs')
  @ApiOperation({ summary: 'Create a new Gamjee Cotton Roll Specification' })
  async createCottonSpec(@Body() dto: CreateGamjeeCottonSpecDto) {
    return this.gamjeeProductionService.createCottonSpec(dto);
  }

  @Put('masters/cotton-specs/:id')
  @ApiOperation({ summary: 'Update a Gamjee Cotton Roll Specification' })
  async updateCottonSpec(@Param('id') id: string, @Body() dto: Partial<CreateGamjeeCottonSpecDto>) {
    return this.gamjeeProductionService.updateCottonSpec(id, dto);
  }

  @Delete('masters/cotton-specs/:id')
  @ApiOperation({ summary: 'Delete a Gamjee Cotton Roll Specification' })
  async deleteCottonSpec(@Param('id') id: string) {
    return this.gamjeeProductionService.deleteCottonSpec(id);
  }
}
