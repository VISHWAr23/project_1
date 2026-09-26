import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { StockTransactionDto } from './dto/stock-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionType } from '@ims/database';

@ApiTags('Raw Materials Management')
@Controller('raw-materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'List raw materials with filters, search, and inventory metrics' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'storageLocationId', required: false })
  @ApiQuery({ name: 'stockStatus', required: false, enum: ['OPTIMAL', 'LOW_STOCK', 'OVERSTOCK', 'OUT_OF_STOCK'] })
  @ApiQuery({ name: 'type', required: false, enum: ['ALL', 'RM', 'PM', 'FG'] })
  @ApiQuery({ name: 'itemSource', required: false, enum: ['ALL', 'MANUFACTURED', 'TRADED'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('storageLocationId') storageLocationId?: string,
    @Query('stockStatus') stockStatus?: 'OPTIMAL' | 'LOW_STOCK' | 'OVERSTOCK' | 'OUT_OF_STOCK',
    @Query('type') type?: 'ALL' | 'RM' | 'PM' | 'FG',
    @Query('itemSource') itemSource?: 'ALL' | 'MANUFACTURED' | 'TRADED',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rawMaterialsService.findAll({
      search,
      categoryId,
      supplierId,
      storageLocationId,
      stockStatus,
      type,
      itemSource,
      page,
      limit,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all raw material categories' })
  async getCategories() {
    return this.rawMaterialsService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new raw material category' })
  async createCategory(@Body() body: { name: string; description?: string }) {
    return this.rawMaterialsService.createCategory(body.name, body.description);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update raw material category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.rawMaterialsService.updateCategory(id, body.name, body.description);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete raw material category' })
  async deleteCategory(@Param('id') id: string) {
    return this.rawMaterialsService.deleteCategory(id);
  }

  @Get('units')
  @ApiOperation({ summary: 'Get all units of measure' })
  async getUnits() {
    return this.rawMaterialsService.getUnits();
  }

  @Post('units')
  @ApiOperation({ summary: 'Create new unit of measure' })
  async createUnit(@Body() body: { name: string; abbreviation: string }) {
    return this.rawMaterialsService.createUnit(body.name, body.abbreviation);
  }

  @Patch('units/:id')
  @ApiOperation({ summary: 'Update unit of measure' })
  async updateUnit(@Param('id') id: string, @Body() body: { name?: string; abbreviation?: string }) {
    return this.rawMaterialsService.updateUnit(id, body.name, body.abbreviation);
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Delete unit of measure' })
  async deleteUnit(@Param('id') id: string) {
    return this.rawMaterialsService.deleteUnit(id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get global stock movement history ledger' })
  @ApiQuery({ name: 'rawMaterialId', required: false })
  @ApiQuery({ name: 'transactionType', enum: TransactionType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransactionHistory(
    @Query('rawMaterialId') rawMaterialId?: string,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rawMaterialsService.getTransactionHistory({
      rawMaterialId,
      transactionType,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single raw material details, metrics, history & job work orders' })
  async findOne(@Param('id') id: string) {
    return this.rawMaterialsService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get stock history ledger for specific raw material' })
  async getItemHistory(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.rawMaterialsService.getTransactionHistory({ rawMaterialId: id, page, limit });
  }

  @Post()
  @ApiOperation({ summary: 'Register a new raw material SKU' })
  async create(@Body() dto: CreateRawMaterialDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.rawMaterialsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update raw material SKU details' })
  async update(@Param('id') id: string, @Body() dto: UpdateRawMaterialDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.rawMaterialsService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate raw material' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.rawMaterialsService.remove(id, userId);
  }

  @Post(':id/transaction')
  @ApiOperation({ summary: 'Record stock transaction (Adjustment, Receipt, Transfer, Correction)' })
  async recordStockTransaction(@Param('id') id: string, @Body() dto: StockTransactionDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.rawMaterialsService.recordStockTransaction(id, dto, userId);
  }
}
