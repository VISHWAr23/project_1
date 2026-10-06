import { Module } from '@nestjs/common';
import { GauzePadPinningController } from './gauze-pad-pinning.controller';
import { GauzePadPinningService } from './gauze-pad-pinning.service';

@Module({
  controllers: [GauzePadPinningController],
  providers: [GauzePadPinningService],
  exports: [GauzePadPinningService],
})
export class GauzePadPinningModule {}
