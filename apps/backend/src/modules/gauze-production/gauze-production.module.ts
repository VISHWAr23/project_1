import { Module } from '@nestjs/common';
import { GauzeProductionController } from './gauze-production.controller';
import { GauzeProductionService } from './gauze-production.service';

@Module({
  controllers: [GauzeProductionController],
  providers: [GauzeProductionService],
  exports: [GauzeProductionService],
})
export class GauzeProductionModule {}
