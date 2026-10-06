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
import { GauzePadPinningService } from './gauze-pad-pinning.service';
import {
  CreateGauzePadPinningBatchDto,
  UpdateGauzePadPinningStatusDto,
} from './dto/create-batch.dto';
import { QueryGauzePadPinningBatchesDto } from './dto/query.dto';

@ApiTags('Gauze Pad Pinning Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gauze-pad-pinning')
export class GauzePadPinningController {
  constructor(private readonly service: GauzePadPinningService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Gauze Pad Pinning dashboard metrics' })
  async getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get('batches')
  @ApiOperation({ summary: 'List all Gauze Pad Pinning batches with search, filters, pagination' })
  async findAll(@Query() query: QueryGauzePadPinningBatchesDto) {
    return this.service.findAll(query);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get details of a single Gauze Pad Pinning batch' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('batches')
  @ApiOperation({ summary: 'Create a new Gauze Pad Pinning batch' })
  async create(@Body() dto: CreateGauzePadPinningBatchDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @Patch('batches/:id/status')
  @ApiOperation({ summary: 'Update Gauze Pad Pinning batch status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateGauzePadPinningStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Delete a Gauze Pad Pinning batch record' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
