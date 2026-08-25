import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmployeeStatus } from '@ims/database';

@ApiTags('Employee Management')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'List all employees with search, pagination, and department filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'designationId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'employmentType', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('designationId') designationId?: string,
    @Query('status') status?: EmployeeStatus | string,
    @Query('employmentType') employmentType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.employeeService.findAll({ search, departmentId, designationId, status, employmentType, page, limit });
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  async getDepartments() {
    return this.employeeService.getDepartments();
  }

  @Get('designations')
  @ApiOperation({ summary: 'Get all designations' })
  async getDesignations() {
    return this.employeeService.getDesignations();
  }

  @Get(':id/financial-summary')
  @ApiOperation({ summary: 'Get financial and compensation summary including OT and advance balance' })
  async getFinancialSummary(@Param('id') id: string) {
    return this.employeeService.getFinancialSummary(id);
  }

  @Post(':id/advances')
  @ApiOperation({ summary: 'Disburse a salary advance / loan to employee' })
  async createAdvance(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.createAdvance({ ...body, employeeId: id }, userId);
  }

  @Post(':id/repay-advance')
  @ApiOperation({ summary: 'Record repayment of an advance installment' })
  async repayAdvance(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.repayAdvance(body, userId);
  }

  @Post(':id/settle-payment')
  @ApiOperation({ summary: 'Direct payment settlement (Normal Salary, OT, Advance, Full Settlement)' })
  async settlePayment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.settlePayment({ ...body, employeeId: id }, userId);
  }

  @Get(':id/payment-history')
  @ApiOperation({ summary: 'Get all payment and advance transaction history for employee' })
  async getPaymentHistory(@Param('id') id: string) {
    return this.employeeService.getPaymentHistory(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed profile of a single employee' })
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new employee profile' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.create(createEmployeeDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing employee profile' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.update(id, updateEmployeeDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee profile' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id;
    return this.employeeService.softDelete(id, userId);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Attach document record to employee' })
  async uploadDocument(@Param('id') id: string, @Body() uploadDocumentDto: UploadDocumentDto) {
    return this.employeeService.uploadDocument(id, uploadDocumentDto);
  }

  @Delete('documents/:docId')
  @ApiOperation({ summary: 'Remove document attached to employee' })
  async deleteDocument(@Param('docId') docId: string) {
    return this.employeeService.deleteDocument(docId);
  }
}
