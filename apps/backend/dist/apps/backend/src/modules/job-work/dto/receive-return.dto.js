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
exports.ReceiveReturnDto = exports.ReturnItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ReturnItemDto {
}
exports.ReturnItemDto = ReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Finished Product / Processed Material ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "finishedProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Returned Roll Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "rollNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Returned Weight in Kg' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "returnedWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Returned Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.001),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "returnedQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scrap / Wastage Weight in Kg' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "wastageWeight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scrap / Wastage Quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "wastageQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Optional inspection photo URLs' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ReturnItemDto.prototype, "photoUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Roll return notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "remarks", void 0);
class ReceiveReturnDto {
}
exports.ReceiveReturnDto = ReceiveReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Return Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReceiveReturnDto.prototype, "returnedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReturnItemDto], description: 'List of returned rolls' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReturnItemDto),
    __metadata("design:type", Array)
], ReceiveReturnDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'General return batch remarks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReceiveReturnDto.prototype, "remarks", void 0);
//# sourceMappingURL=receive-return.dto.js.map