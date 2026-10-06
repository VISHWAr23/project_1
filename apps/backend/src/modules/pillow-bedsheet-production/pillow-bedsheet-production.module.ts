import { Module } from '@nestjs/common';
import { PillowBedsheetProductionController } from './pillow-bedsheet-production.controller';
import { PillowBedsheetProductionService } from './pillow-bedsheet-production.service';

@Module({
  controllers: [PillowBedsheetProductionController],
  providers: [PillowBedsheetProductionService],
  exports: [PillowBedsheetProductionService],
})
export class PillowBedsheetProductionModule {}
