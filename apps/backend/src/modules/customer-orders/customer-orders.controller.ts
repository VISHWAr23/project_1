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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerOrdersService } from './customer-orders.service';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { UpdateCustomerOrderDto } from './dto/update-customer-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';
import { RecordOrderDispatchDto } from './dto/record-order-dispatch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Customer Orders Management')
@Controller('customer-orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerOrdersController {
  constructor(private readonly customerOrdersService: CustomerOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all customer orders with filters & pagination' })
  async findAll(
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.customerOrdersService.findAll({
      search,
      customerId,
      status,
      priority,
      paymentStatus,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer order dashboard KPI statistics' })
  async getStats() {
    return this.customerOrdersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer order details with line items and status timeline' })
  async findOne(@Param('id') id: string) {
    return this.customerOrdersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer order with line items' })
  async create(@Body() dto: CreateCustomerOrderDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.customerOrdersService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer order details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerOrderDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.customerOrdersService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customer order lifecycle status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.customerOrdersService.updateStatus(id, dto, userId);
  }

  @Patch(':id/dispatch')
  @ApiOperation({ summary: 'Record full or partial dispatch/delivery for customer order' })
  async recordDispatch(
    @Param('id') id: string,
    @Body() dto: RecordOrderDispatchDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.customerOrdersService.recordDispatch(id, dto, userId);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Record payment for customer order' })
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordOrderPaymentDto,
  ) {
    return this.customerOrdersService.recordPayment(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or cancel customer order' })
  async remove(@Param('id') id: string) {
    return this.customerOrdersService.remove(id);
  }
}
