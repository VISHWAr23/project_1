import { Module } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsController } from './raw-materials.controller';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { StorageLocationsService } from './storage-locations.service';
import { StorageLocationsController } from './storage-locations.controller';

@Module({
  controllers: [RawMaterialsController, SuppliersController, StorageLocationsController],
  providers: [RawMaterialsService, SuppliersService, StorageLocationsService],
  exports: [RawMaterialsService, SuppliersService, StorageLocationsService],
})
export class RawMaterialsModule {}
