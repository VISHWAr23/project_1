import { Module } from '@nestjs/common';
import { JobWorkController } from './job-work.controller';
import { JobWorkService } from './job-work.service';

@Module({
  controllers: [JobWorkController],
  providers: [JobWorkService],
  exports: [JobWorkService],
})
export class JobWorkModule {}
