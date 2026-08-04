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
exports.CreateEmployeeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const database_1 = require("@ims/database");
class CreateEmployeeDto {
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom or Auto Employee Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employeeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary Phone Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Alternate Phone Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "alternatePhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email Address' }),
    (0, class_validator_1.ValidateIf)(o => o.email !== ''),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Avatar / Profile Picture URL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date of Birth (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Blood Group' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'State' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PIN Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "pinCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency Contact Person Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "emergencyContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Emergency Contact Phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "emergencyPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Aadhaar Card Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "aadhaarNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PAN Card Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "panNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Joining Date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "joiningDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Employment Type (Permanent, Contract, Temporary)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Work Shift' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "shift", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Salary Structure Type (Monthly Salary / Daily Wage)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "salaryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Base Wage or Salary Amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "baseWage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank Account Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bankAccountNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bank IFSC Code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bankIfsc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UPI ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Department UUID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Designation UUID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "designationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.EmployeeStatus, default: database_1.EmployeeStatus.ACTIVE }),
    (0, class_validator_1.IsEnum)(database_1.EmployeeStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "status", void 0);
//# sourceMappingURL=create-employee.dto.js.map