import { Module } from '@nestjs/common';
import { MopingPadProductionController } from './moping-pad-production.controller';
import { MopingPadProductionService } from './moping-pad-production.service';

@Module({
  controllers: [MopingPadProductionController],
  providers: [MopingPadProductionService],
  exports: [MopingPadProductionService],
})
export class MopingPadProductionModule {}
