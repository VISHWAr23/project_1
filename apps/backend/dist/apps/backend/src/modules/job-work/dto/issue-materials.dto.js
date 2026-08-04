"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueMaterialsDto = exports.IssueItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class IssueItemDto {
}
exports.IssueItemDto = IssueItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Roll Number / Serial' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IssueItemDto.prototype, "rollNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Batch ID if tracked' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IssueItemDto.prototype, "batchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Issued Weight in Kg' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], IssueItemDto.prototype, "issuedWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Issued Quantity in units/meters' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], IssueItemDto.prototype, "issuedQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Item level notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IssueItemDto.prototype, "remarks", void 0);
class IssueMaterialsDto {
}
exports.IssueMaterialsDto = IssueMaterialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vehicle Registration Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IssueMaterialsDto.prototype, "vehicleNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transport Driver Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IssueMaterialsDto.prototype, "driverName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery Challan remarks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], IssueMaterialsDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IssueItemDto], description: 'List of rolls issued' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IssueItemDto),
    __metadata("design:type", Array)
], IssueMaterialsDto.prototype, "items", void 0);
//# sourceMappingURL=issue-materials.dto.js.map