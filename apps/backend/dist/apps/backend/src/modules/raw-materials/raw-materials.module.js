"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialsModule = void 0;
const common_1 = require("@nestjs/common");
const raw_materials_service_1 = require("./raw-materials.service");
const raw_materials_controller_1 = require("./raw-materials.controller");
const suppliers_service_1 = require("./suppliers.service");
const suppliers_controller_1 = require("./suppliers.controller");
const storage_locations_service_1 = require("./storage-locations.service");
const storage_locations_controller_1 = require("./storage-locations.controller");
let RawMaterialsModule = class RawMaterialsModule {
};
exports.RawMaterialsModule = RawMaterialsModule;
exports.RawMaterialsModule = RawMaterialsModule = __decorate([
    (0, common_1.Module)({
        controllers: [raw_materials_controller_1.RawMaterialsController, suppliers_controller_1.SuppliersController, storage_locations_controller_1.StorageLocationsController],
        providers: [raw_materials_service_1.RawMaterialsService, suppliers_service_1.SuppliersService, storage_locations_service_1.StorageLocationsService],
        exports: [raw_materials_service_1.RawMaterialsService, suppliers_service_1.SuppliersService, storage_locations_service_1.StorageLocationsService],
    })
], RawMaterialsModule);
//# sourceMappingURL=raw-materials.module.js.map