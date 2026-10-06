import { Module } from '@nestjs/common';
import { DryingController } from './drying.controller';
import { DryingService } from './drying.service';

@Module({
  controllers: [DryingController],
  providers: [DryingService],
  exports: [DryingService],
})
export class DryingModule {}
