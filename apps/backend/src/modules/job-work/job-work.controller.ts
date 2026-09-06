import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobWorkService } from './job-work.service';
import { CreateJobWorkOrderDto } from './dto/create-job-work-order.dto';
import { IssueMaterialsDto } from './dto/issue-materials.dto';
import { ReceiveReturnDto } from './dto/receive-return.dto';
import { CloseJobWorkOrderDto } from './dto/close-job-work.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JobWorkStatus } from '@ims/database';

@ApiTags('Job Work Management')
@Controller('job-work')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobWorkController {
  constructor(private readonly jobWorkService: JobWorkService) {}

  @Get()
  @ApiOperation({ summary: 'List all Job Work Orders with search, filters and metrics' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', enum: JobWorkStatus, required: false })
  @ApiQuery({ name: 'jobWorkCompanyId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: JobWorkStatus,
    @Query('jobWorkCompanyId') jobWorkCompanyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobWorkService.findAll({ search, status, jobWorkCompanyId, page, limit });
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get Job Working Vendor companies' })
  async getCompanies(@Query('includeInactive') includeInactive?: string) {
    return this.jobWorkService.getCompanies(includeInactive === 'true' || includeInactive === undefined);
  }

  @Post('companies')
  @ApiOperation({ summary: 'Create a new Job Work company/vendor' })
  async createCompany(@Body() body: any) {
    return this.jobWorkService.createCompany(body);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update a Job Work company/vendor' })
  async updateCompany(@Param('id') id: string, @Body() body: any) {
    return this.jobWorkService.updateCompany(id, body);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete a Job Work company/vendor' })
  async deleteCompany(@Param('id') id: string) {
    return this.jobWorkService.deleteCompany(id);
  }

  @Get('materials')
  @ApiOperation({ summary: 'Get active raw materials and finished goods for dropdowns' })
  async getMaterials() {
    return this.jobWorkService.getMaterials();
  }

  @Get('returns')
  @ApiOperation({ summary: 'Get return register entries across all vendors' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getReturnRegister(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobWorkService.getReturnRegister({ search, page, limit });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Job Work Order' })
  async create(@Body() dto: CreateJobWorkOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single Job Work Order details, roll items, timeline & documents' })
  async findOne(@Param('id') id: string) {
    return this.jobWorkService.findOne(id);
  }

  @Post(':id/issue')
  @ApiOperation({ summary: 'Issue raw material rolls, update stock balances, generate Delivery Challan' })
  async issueMaterials(@Param('id') id: string, @Body() dto: IssueMaterialsDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.issueMaterials(id, dto, userId);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Receive returned finished rolls, log return register, update finished goods stock' })
  async receiveReturn(@Param('id') id: string, @Body() dto: ReceiveReturnDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.receiveReturn(id, dto, userId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Reconcile wastage/differences and close Job Work Order' })
  async closeOrder(@Param('id') id: string, @Body() dto: CloseJobWorkOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.closeOrder(id, dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Job Work Order details, schedule, or vehicle info' })
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or cancel a Job Work Order and reverse stock if needed' })
  async deleteOrder(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.jobWorkService.delete(id, userId);
  }
}
