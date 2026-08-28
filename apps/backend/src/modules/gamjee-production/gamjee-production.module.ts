import { Module } from '@nestjs/common';
import { GamjeeProductionController } from './gamjee-production.controller';
import { GamjeeProductionService } from './gamjee-production.service';

@Module({
  controllers: [GamjeeProductionController],
  providers: [GamjeeProductionService],
  exports: [GamjeeProductionService],
})
export class GamjeeProductionModule {}
