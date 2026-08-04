import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '@/services/salary.service';
import {
  GeneratePayrollPayload,
  UpdatePayrollItemAdjustmentPayload,
  RecordSalaryPaymentPayload,
  PayrollStatus,
} from '@/types/salary.types';

export function useSalaryDashboard() {
  return useQuery({
    queryKey: ['salary-dashboard'],
    queryFn: () => salaryService.getDashboardSummary(),
  });
}

export function usePayrollRuns(params?: {
  month?: number;
  year?: number;
  status?: PayrollStatus;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['payroll-runs', params],
    queryFn: () => salaryService.getAll(params),
  });
}

export function usePayrollRunDetail(id: string) {
  return useQuery({
    queryKey: ['payroll-run', id],
    queryFn: () => salaryService.getById(id),
    enabled: Boolean(id),
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneratePayrollPayload) => salaryService.generatePayroll(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdatePayrollAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdatePayrollItemAdjustmentPayload }) =>
      salaryService.updateAdjustment(itemId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run'] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryService.approvePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
    },
  });
}

export function useCancelPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryService.cancelPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
    },
  });
}

export function useRecordSalaryPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordSalaryPaymentPayload) => salaryService.recordPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run'] });
      queryClient.invalidateQueries({ queryKey: ['salary-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['salary-history'] });
    },
  });
}

export function useSalarySlip(itemId: string) {
  return useQuery({
    queryKey: ['salary-slip', itemId],
    queryFn: () => salaryService.getSalarySlip(itemId),
    enabled: Boolean(itemId),
  });
}

export function useSalaryHistory(params?: { employeeId?: string; year?: number }) {
  return useQuery({
    queryKey: ['salary-history', params],
    queryFn: () => salaryService.getHistory(params),
  });
}
