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
exports.BulkAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_attendance_dto_1 = require("./create-attendance.dto");
class BulkAttendanceDto {
}
exports.BulkAttendanceDto = BulkAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of attendance for bulk record (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkAttendanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department filter if applicable' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkAttendanceDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [create_attendance_dto_1.CreateAttendanceDto], description: 'List of attendance entries' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_attendance_dto_1.CreateAttendanceDto),
    __metadata("design:type", Array)
], BulkAttendanceDto.prototype, "records", void 0);
//# sourceMappingURL=bulk-attendance.dto.js.map