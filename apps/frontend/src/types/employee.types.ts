export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'RESIGNED';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string | null;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dob?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  aadhaarNo?: string | null;
  panNo?: string | null;
  joiningDate: string;
  employmentType?: 'Permanent' | 'Contract' | 'Temporary' | 'Intern' | string | null;
  shift?: string | null;
  salaryType?: 'Monthly Salary' | 'Daily Wage' | string | null;
  baseWage?: number | string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  upiId?: string | null;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  departmentId?: string | null;
  department?: Department | null;

  designationId?: string | null;
  designation?: Designation | null;

  documents?: EmployeeDocument[];
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  contractEmployees: number;
}

export interface CreateEmployeePayload {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  aadhaarNo?: string;
  panNo?: string;
  joiningDate: string;
  employmentType?: string;
  shift?: string;
  salaryType?: string;
  baseWage?: number;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  upiId?: string;
  departmentId?: string;
  designationId?: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {}

export interface UploadDocumentPayload {
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: EmployeeStats;
}
