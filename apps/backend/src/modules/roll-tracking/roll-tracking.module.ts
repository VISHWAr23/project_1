import { Module } from '@nestjs/common';
import { RollTrackingController } from './roll-tracking.controller';
import { RollTrackingService } from './roll-tracking.service';

@Module({
  controllers: [RollTrackingController],
  providers: [RollTrackingService],
  exports: [RollTrackingService],
})
export class RollTrackingModule {}
