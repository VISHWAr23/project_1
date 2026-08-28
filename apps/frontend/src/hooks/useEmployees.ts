import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employee.service';
import { CreateEmployeePayload, UpdateEmployeePayload, UploadDocumentPayload } from '@/types/employee.types';

export function useEmployees(params?: {
  search?: string;
  departmentId?: string;
  designationId?: string;
  status?: string;
  employmentType?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getAll(params),
  });
}

export function useEmployeeDetail(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id),
    enabled: Boolean(id),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => employeeService.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; code?: string; description?: string }) =>
      employeeService.createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; code?: string; description?: string } }) =>
      employeeService.updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDesignations() {
  return useQuery({
    queryKey: ['designations'],
    queryFn: () => employeeService.getDesignations(),
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; code?: string; description?: string }) =>
      employeeService.createDesignation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; code?: string; description?: string } }) =>
      employeeService.updateDesignation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.deleteDesignation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => employeeService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUploadEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: UploadDocumentPayload }) =>
      employeeService.uploadDocument(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    },
  });
}

export function useDeleteEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, employeeId }: { docId: string; employeeId: string }) =>
      employeeService.deleteDocument(docId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
    },
  });
}

export function useEmployeeFinancialSummary(employeeId: string) {
  return useQuery({
    queryKey: ['employee-financial-summary', employeeId],
    queryFn: () => employeeService.getFinancialSummary(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useCreateAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: any }) =>
      employeeService.createAdvance(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-financial-summary', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-payment-history', variables.employeeId] });
    },
  });
}

export function useRepayAdvance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: any }) =>
      employeeService.repayAdvance(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-financial-summary', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-payment-history', variables.employeeId] });
    },
  });
}

export function useSettlePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: any }) =>
      employeeService.settlePayment(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-financial-summary', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee-payment-history', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
    },
  });
}

export function useEmployeePaymentHistory(employeeId: string) {
  return useQuery({
    queryKey: ['employee-payment-history', employeeId],
    queryFn: () => employeeService.getPaymentHistory(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeReport(
  employeeId: string,
  params?: { startDate?: string; endDate?: string; month?: number; year?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['employee-report', employeeId, params],
    queryFn: () => employeeService.getReport(employeeId, params),
    enabled: Boolean(employeeId) && (options?.enabled !== undefined ? options.enabled : true),
  });
}

