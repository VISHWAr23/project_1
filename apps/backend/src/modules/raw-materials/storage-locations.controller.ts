import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageLocationsService } from './storage-locations.service';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Storage Locations Management')
@Controller('storage-locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageLocationsController {
  constructor(private readonly storageLocationsService: StorageLocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all warehouse storage locations' })
  async findAll(@Query('search') search?: string) {
    return this.storageLocationsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single storage location detail' })
  async findOne(@Param('id') id: string) {
    return this.storageLocationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new storage location' })
  async create(@Body() dto: CreateStorageLocationDto) {
    return this.storageLocationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update storage location detail' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateStorageLocationDto>) {
    return this.storageLocationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate storage location' })
  async remove(@Param('id') id: string) {
    return this.storageLocationsService.remove(id);
  }
}
