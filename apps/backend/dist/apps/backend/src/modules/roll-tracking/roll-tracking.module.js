"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollTrackingModule = void 0;
const common_1 = require("@nestjs/common");
const roll_tracking_controller_1 = require("./roll-tracking.controller");
const roll_tracking_service_1 = require("./roll-tracking.service");
let RollTrackingModule = class RollTrackingModule {
};
exports.RollTrackingModule = RollTrackingModule;
exports.RollTrackingModule = RollTrackingModule = __decorate([
    (0, common_1.Module)({
        controllers: [roll_tracking_controller_1.RollTrackingController],
        providers: [roll_tracking_service_1.RollTrackingService],
        exports: [roll_tracking_service_1.RollTrackingService],
    })
], RollTrackingModule);
//# sourceMappingURL=roll-tracking.module.js.map