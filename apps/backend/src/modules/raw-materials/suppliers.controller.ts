import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Suppliers Management')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all raw material suppliers' })
  async findAll(@Query('search') search?: string) {
    return this.suppliersService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single supplier detail' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier detail' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate supplier' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
