import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FabricCostingService } from './fabric-costing.service';
import { CreateFabricCostingDto, CalculateCostingPreviewDto } from './dto/create-fabric-costing.dto';
import { QueryFabricCostingDto } from './dto/query-fabric-costing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Grey Fabric & Bleaching Costing')
@Controller('fabric-costing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FabricCostingController {
  constructor(private readonly fabricCostingService: FabricCostingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Compute real-time mathematical costing breakdown without saving to database' })
  calculatePreview(@Body() dto: CalculateCostingPreviewDto) {
    return this.fabricCostingService.calculatePreview(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new grey fabric & bleaching costing record to the database' })
  create(@Body() dto: CreateFabricCostingDto, @Req() req: any) {
    return this.fabricCostingService.create(dto, req.user?.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate KPI metrics for fabric costing' })
  getStats() {
    return this.fabricCostingService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List all fabric costing formulations with search, sorting, and pagination' })
  findAll(@Query() query: QueryFabricCostingDto) {
    return this.fabricCostingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single fabric costing details' })
  findOne(@Param('id') id: string) {
    return this.fabricCostingService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a fabric costing formulation' })
  delete(@Param('id') id: string) {
    return this.fabricCostingService.delete(id);
  }
}
