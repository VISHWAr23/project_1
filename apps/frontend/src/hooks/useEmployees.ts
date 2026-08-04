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

export function useDesignations() {
  return useQuery({
    queryKey: ['designations'],
    queryFn: () => employeeService.getDesignations(),
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
