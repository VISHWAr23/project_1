import { Module } from '@nestjs/common';
import { FabricCostingController } from './fabric-costing.controller';
import { FabricCostingService } from './fabric-costing.service';

@Module({
  controllers: [FabricCostingController],
  providers: [FabricCostingService],
  exports: [FabricCostingService],
})
export class FabricCostingModule {}
