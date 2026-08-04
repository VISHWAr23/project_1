import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, EmployeeStatus } from '@ims/database';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class EmployeeService {
  /**
   * Helper: Generate unique Employee Code (e.g. EMP-001, EMP-002)
   */
  private async generateEmployeeCode(): Promise<string> {
    const count = await prisma.employee.count();
    const nextNum = count + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    let code = `EMP-${formattedNum}`;

    let exists = await prisma.employee.findUnique({ where: { employeeCode: code } });
    let incrementer = 1;
    while (exists) {
      code = `EMP-${String(nextNum + incrementer).padStart(3, '0')}`;
      exists = await prisma.employee.findUnique({ where: { employeeCode: code } });
      incrementer++;
    }
    return code;
  }

  /**
   * List all employees with search, pagination, and status filters
   */
  async findAll(query: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    status?: EmployeeStatus | string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Soft Delete Filter
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
      prisma.employee.findMany({
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
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where: { deletedAt: null },
        select: { status: true, employmentType: true },
      }),
    ]);

    const stats = {
      totalEmployees: allEmployees.length,
      activeEmployees: allEmployees.filter((e) => e.status === EmployeeStatus.ACTIVE).length,
      inactiveEmployees: allEmployees.filter((e) => e.status === EmployeeStatus.INACTIVE).length,
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

  /**
   * Get single employee profile with documents and relations
   */
  async findOne(id: string) {
    const employee = await prisma.employee.findFirst({
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
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Create new Employee record
   */
  async create(dto: CreateEmployeeDto, userId?: string) {
    const employeeCode = dto.employeeCode?.trim() || (await this.generateEmployeeCode());

    // Check duplicate code
    const existingCode = await prisma.employee.findUnique({ where: { employeeCode } });
    if (existingCode) {
      throw new BadRequestException(`Employee code ${employeeCode} already exists`);
    }

    const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : new Date();
    const dob = dto.dob ? new Date(dto.dob) : null;

    const employee = await prisma.employee.create({
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
        status: dto.status || EmployeeStatus.ACTIVE,
        departmentId: dto.departmentId || null,
        designationId: dto.designationId || null,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_EMPLOYEE',
          entityName: 'Employee',
          entityId: employee.id,
          newValues: employee as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return employee;
  }

  /**
   * Update existing Employee record
   */
  async update(id: string, dto: UpdateEmployeeDto, userId?: string) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const dataToUpdate: any = {};

    if (dto.firstName !== undefined) dataToUpdate.firstName = dto.firstName;
    if (dto.lastName !== undefined) dataToUpdate.lastName = dto.lastName;
    if (dto.phone !== undefined) dataToUpdate.phone = dto.phone;
    if (dto.alternatePhone !== undefined) dataToUpdate.alternatePhone = dto.alternatePhone;
    if (dto.email !== undefined) dataToUpdate.email = dto.email;
    if (dto.avatarUrl !== undefined) dataToUpdate.avatarUrl = dto.avatarUrl;
    if (dto.gender !== undefined) dataToUpdate.gender = dto.gender;
    if (dto.dob !== undefined) dataToUpdate.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.bloodGroup !== undefined) dataToUpdate.bloodGroup = dto.bloodGroup;
    if (dto.address !== undefined) dataToUpdate.address = dto.address;
    if (dto.city !== undefined) dataToUpdate.city = dto.city;
    if (dto.state !== undefined) dataToUpdate.state = dto.state;
    if (dto.pinCode !== undefined) dataToUpdate.pinCode = dto.pinCode;
    if (dto.emergencyContact !== undefined) dataToUpdate.emergencyContact = dto.emergencyContact;
    if (dto.emergencyPhone !== undefined) dataToUpdate.emergencyPhone = dto.emergencyPhone;
    if (dto.aadhaarNo !== undefined) dataToUpdate.aadhaarNo = dto.aadhaarNo;
    if (dto.panNo !== undefined) dataToUpdate.panNo = dto.panNo;
    if (dto.joiningDate !== undefined) dataToUpdate.joiningDate = new Date(dto.joiningDate);
    if (dto.employmentType !== undefined) dataToUpdate.employmentType = dto.employmentType;
    if (dto.shift !== undefined) dataToUpdate.shift = dto.shift;
    if (dto.salaryType !== undefined) dataToUpdate.salaryType = dto.salaryType;
    if (dto.baseWage !== undefined) dataToUpdate.baseWage = dto.baseWage;
    if (dto.bankName !== undefined) dataToUpdate.bankName = dto.bankName;
    if (dto.bankAccountNo !== undefined) dataToUpdate.bankAccountNo = dto.bankAccountNo;
    if (dto.bankIfsc !== undefined) dataToUpdate.bankIfsc = dto.bankIfsc;
    if (dto.upiId !== undefined) dataToUpdate.upiId = dto.upiId;
    if (dto.status !== undefined) dataToUpdate.status = dto.status;
    if (dto.departmentId !== undefined) dataToUpdate.departmentId = dto.departmentId || null;
    if (dto.designationId !== undefined) dataToUpdate.designationId = dto.designationId || null;

    const updated = await prisma.employee.update({
      where: { id },
      data: dataToUpdate,
      include: {
        department: true,
        designation: true,
        documents: true,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_EMPLOYEE',
          entityName: 'Employee',
          entityId: updated.id,
          oldValues: existing as any,
          newValues: updated as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return updated;
  }

  /**
   * Soft Delete Employee (sets deletedAt and INACTIVE status)
   */
  async softDelete(id: string, userId?: string) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EmployeeStatus.INACTIVE,
      },
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'SOFT_DELETE_EMPLOYEE',
          entityName: 'Employee',
          entityId: id,
          oldValues: existing as any,
          newValues: updated as any,
          userId: userId || null,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return { message: 'Employee soft-deleted successfully', id };
  }

  /**
   * Upload Document Metadata to Employee
   */
  async uploadDocument(employeeId: string, dto: UploadDocumentDto) {
    await this.findOne(employeeId); // verify exists

    const doc = await prisma.employeeDocument.create({
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

  /**
   * Delete Employee Document Record
   */
  async deleteDocument(docId: string) {
    const doc = await prisma.employeeDocument.findUnique({ where: { id: docId } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }

    await prisma.employeeDocument.delete({ where: { id: docId } });
    return { message: 'Document deleted successfully', id: docId };
  }

  /**
   * List or seed Departments
   */
  async getDepartments() {
    let depts = await prisma.department.findMany({
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
        await prisma.department.upsert({
          where: { code: d.code },
          update: {},
          create: d,
        });
      }
      depts = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    }

    return depts;
  }

  /**
   * List or seed Designations
   */
  async getDesignations() {
    let desigs = await prisma.designation.findMany({
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
        await prisma.designation.upsert({
          where: { code: d.code },
          update: {},
          create: d,
        });
      }
      desigs = await prisma.designation.findMany({ orderBy: { name: 'asc' } });
    }

    return desigs;
  }
}
