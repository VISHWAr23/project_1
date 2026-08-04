"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let EmployeeService = class EmployeeService {
    async generateEmployeeCode() {
        const count = await database_1.prisma.employee.count();
        const nextNum = count + 1;
        const formattedNum = String(nextNum).padStart(3, '0');
        let code = `EMP-${formattedNum}`;
        let exists = await database_1.prisma.employee.findUnique({ where: { employeeCode: code } });
        let incrementer = 1;
        while (exists) {
            code = `EMP-${String(nextNum + incrementer).padStart(3, '0')}`;
            exists = await database_1.prisma.employee.findUnique({ where: { employeeCode: code } });
            incrementer++;
        }
        return code;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (query.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query.departmentId && query.departmentId !== 'ALL') {
            where.departmentId = query.departmentId;
        }
        if (query.designationId && query.designationId !== 'ALL') {
            where.designationId = query.designationId;
        }
        if (query.employmentType && query.employmentType !== 'ALL') {
            where.employmentType = query.employmentType;
        }
        if (query.search) {
            const searchLower = query.search.trim();
            where.OR = [
                { firstName: { contains: searchLower, mode: 'insensitive' } },
                { lastName: { contains: searchLower, mode: 'insensitive' } },
                { employeeCode: { contains: searchLower, mode: 'insensitive' } },
                { phone: { contains: searchLower, mode: 'insensitive' } },
                { email: { contains: searchLower, mode: 'insensitive' } },
                { department: { name: { contains: searchLower, mode: 'insensitive' } } },
            ];
        }
        const [items, total, allEmployees] = await Promise.all([
            database_1.prisma.employee.findMany({
                where,
                include: {
                    department: true,
                    designation: true,
                    documents: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.employee.count({ where }),
            database_1.prisma.employee.findMany({
                where: { deletedAt: null },
                select: { status: true, employmentType: true },
            }),
        ]);
        const stats = {
            totalEmployees: allEmployees.length,
            activeEmployees: allEmployees.filter((e) => e.status === database_1.EmployeeStatus.ACTIVE).length,
            inactiveEmployees: allEmployees.filter((e) => e.status === database_1.EmployeeStatus.INACTIVE).length,
            contractEmployees: allEmployees.filter((e) => e.employmentType === 'Contract').length,
        };
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats,
        };
    }
    async findOne(id) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id, deletedAt: null },
            include: {
                department: true,
                designation: true,
                documents: true,
                salaryStructure: true,
                attendanceLogs: {
                    take: 30,
                    orderBy: { date: 'desc' },
                },
            },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    async create(dto, userId) {
        const employeeCode = dto.employeeCode?.trim() || (await this.generateEmployeeCode());
        const existingCode = await database_1.prisma.employee.findUnique({ where: { employeeCode } });
        if (existingCode) {
            throw new common_1.BadRequestException(`Employee code ${employeeCode} already exists`);
        }
        const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : new Date();
        const dob = dto.dob ? new Date(dto.dob) : null;
        const employee = await database_1.prisma.employee.create({
            data: {
                employeeCode,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                alternatePhone: dto.alternatePhone,
                email: dto.email,
                avatarUrl: dto.avatarUrl,
                gender: dto.gender,
                dob,
                bloodGroup: dto.bloodGroup,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                pinCode: dto.pinCode,
                emergencyContact: dto.emergencyContact,
                emergencyPhone: dto.emergencyPhone,
                aadhaarNo: dto.aadhaarNo,
                panNo: dto.panNo,
                joiningDate,
                employmentType: dto.employmentType || 'Permanent',
                shift: dto.shift || 'General Day',
                salaryType: dto.salaryType || 'Monthly Salary',
                baseWage: dto.baseWage !== undefined ? dto.baseWage : 0,
                bankName: dto.bankName,
                bankAccountNo: dto.bankAccountNo,
                bankIfsc: dto.bankIfsc,
                upiId: dto.upiId,
                status: dto.status || database_1.EmployeeStatus.ACTIVE,
                departmentId: dto.departmentId || null,
                designationId: dto.designationId || null,
            },
            include: {
                department: true,
                designation: true,
            },
        });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'CREATE_EMPLOYEE',
                    entityName: 'Employee',
                    entityId: employee.id,
                    newValues: employee,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return employee;
    }
    async update(id, dto, userId) {
        const existing = await database_1.prisma.employee.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        const dataToUpdate = {};
        if (dto.firstName !== undefined)
            dataToUpdate.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            dataToUpdate.lastName = dto.lastName;
        if (dto.phone !== undefined)
            dataToUpdate.phone = dto.phone;
        if (dto.alternatePhone !== undefined)
            dataToUpdate.alternatePhone = dto.alternatePhone;
        if (dto.email !== undefined)
            dataToUpdate.email = dto.email;
        if (dto.avatarUrl !== undefined)
            dataToUpdate.avatarUrl = dto.avatarUrl;
        if (dto.gender !== undefined)
            dataToUpdate.gender = dto.gender;
        if (dto.dob !== undefined)
            dataToUpdate.dob = dto.dob ? new Date(dto.dob) : null;
        if (dto.bloodGroup !== undefined)
            dataToUpdate.bloodGroup = dto.bloodGroup;
        if (dto.address !== undefined)
            dataToUpdate.address = dto.address;
        if (dto.city !== undefined)
            dataToUpdate.city = dto.city;
        if (dto.state !== undefined)
            dataToUpdate.state = dto.state;
        if (dto.pinCode !== undefined)
            dataToUpdate.pinCode = dto.pinCode;
        if (dto.emergencyContact !== undefined)
            dataToUpdate.emergencyContact = dto.emergencyContact;
        if (dto.emergencyPhone !== undefined)
            dataToUpdate.emergencyPhone = dto.emergencyPhone;
        if (dto.aadhaarNo !== undefined)
            dataToUpdate.aadhaarNo = dto.aadhaarNo;
        if (dto.panNo !== undefined)
            dataToUpdate.panNo = dto.panNo;
        if (dto.joiningDate !== undefined)
            dataToUpdate.joiningDate = new Date(dto.joiningDate);
        if (dto.employmentType !== undefined)
            dataToUpdate.employmentType = dto.employmentType;
        if (dto.shift !== undefined)
            dataToUpdate.shift = dto.shift;
        if (dto.salaryType !== undefined)
            dataToUpdate.salaryType = dto.salaryType;
        if (dto.baseWage !== undefined)
            dataToUpdate.baseWage = dto.baseWage;
        if (dto.bankName !== undefined)
            dataToUpdate.bankName = dto.bankName;
        if (dto.bankAccountNo !== undefined)
            dataToUpdate.bankAccountNo = dto.bankAccountNo;
        if (dto.bankIfsc !== undefined)
            dataToUpdate.bankIfsc = dto.bankIfsc;
        if (dto.upiId !== undefined)
            dataToUpdate.upiId = dto.upiId;
        if (dto.status !== undefined)
            dataToUpdate.status = dto.status;
        if (dto.departmentId !== undefined)
            dataToUpdate.departmentId = dto.departmentId || null;
        if (dto.designationId !== undefined)
            dataToUpdate.designationId = dto.designationId || null;
        const updated = await database_1.prisma.employee.update({
            where: { id },
            data: dataToUpdate,
            include: {
                department: true,
                designation: true,
                documents: true,
            },
        });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'UPDATE_EMPLOYEE',
                    entityName: 'Employee',
                    entityId: updated.id,
                    oldValues: existing,
                    newValues: updated,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return updated;
    }
    async softDelete(id, userId) {
        const existing = await database_1.prisma.employee.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        const updated = await database_1.prisma.employee.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: database_1.EmployeeStatus.INACTIVE,
            },
        });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'SOFT_DELETE_EMPLOYEE',
                    entityName: 'Employee',
                    entityId: id,
                    oldValues: existing,
                    newValues: updated,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return { message: 'Employee soft-deleted successfully', id };
    }
    async uploadDocument(employeeId, dto) {
        await this.findOne(employeeId);
        const doc = await database_1.prisma.employeeDocument.create({
            data: {
                employeeId,
                documentType: dto.documentType,
                fileName: dto.fileName,
                fileUrl: dto.fileUrl,
                storagePath: dto.storagePath,
            },
        });
        return doc;
    }
    async deleteDocument(docId) {
        const doc = await database_1.prisma.employeeDocument.findUnique({ where: { id: docId } });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID ${docId} not found`);
        }
        await database_1.prisma.employeeDocument.delete({ where: { id: docId } });
        return { message: 'Document deleted successfully', id: docId };
    }
    async getDepartments() {
        let depts = await database_1.prisma.department.findMany({
            orderBy: { name: 'asc' },
        });
        if (depts.length === 0) {
            const defaultDepts = [
                { name: 'Production & Manufacturing', code: 'PROD', description: 'Gauze weaving, bleaching, and converting floor' },
                { name: 'Packing & Packaging', code: 'PACK', description: 'Pouching, bundling, and box packaging' },
                { name: 'Quality Assurance & QC Lab', code: 'QC', description: 'Absorbency, GSM, and whiteness lab testing' },
                { name: 'Raw Material Store & Warehouse', code: 'WH', description: 'Bale storage and raw material inventory' },
                { name: 'Accounts & Finance', code: 'FIN', description: 'Payroll, invoicing, and ledger management' },
                { name: 'Human Resources & Admin', code: 'HR', description: 'Staffing, shift management, and employee welfare' },
            ];
            for (const d of defaultDepts) {
                await database_1.prisma.department.upsert({
                    where: { code: d.code },
                    update: {},
                    create: d,
                });
            }
            depts = await database_1.prisma.department.findMany({ orderBy: { name: 'asc' } });
        }
        return depts;
    }
    async getDesignations() {
        let desigs = await database_1.prisma.designation.findMany({
            orderBy: { name: 'asc' },
        });
        if (desigs.length === 0) {
            const defaultDesigs = [
                { name: 'Senior Machine Operator', code: 'SMO', description: 'Operates high-speed gauze looms and slitters' },
                { name: 'Floor Supervisor', code: 'SUP', description: 'Oversees daily shift output and safety' },
                { name: 'Packing Staff', code: 'PST', description: 'Assists in finished goods packaging' },
                { name: 'Quality Inspector', code: 'QCI', description: 'Performs chemical and physical test checks' },
                { name: 'Store Keeper', code: 'SKP', description: 'Manages warehouse receipt and issue' },
                { name: 'Senior Accountant', code: 'ACC', description: 'Handles payroll and GST compliance' },
            ];
            for (const d of defaultDesigs) {
                await database_1.prisma.designation.upsert({
                    where: { code: d.code },
                    update: {},
                    create: d,
                });
            }
            desigs = await database_1.prisma.designation.findMany({ orderBy: { name: 'asc' } });
        }
        return desigs;
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)()
], EmployeeService);
//# sourceMappingURL=employee.service.js.map