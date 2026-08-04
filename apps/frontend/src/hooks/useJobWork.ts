import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobWorkService } from '@/services/job-work.service';
import {
  CreateJobWorkOrderPayload,
  IssueMaterialsPayload,
  ReceiveReturnPayload,
  CloseJobWorkOrderPayload,
} from '@/types/job-work.types';

export function useJobWorkOrders(params?: {
  search?: string;
  status?: string;
  jobWorkCompanyId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['jobWorkOrders', params],
    queryFn: () => jobWorkService.getAll(params),
  });
}

export function useJobWorkOrderDetail(id: string) {
  return useQuery({
    queryKey: ['jobWorkOrder', id],
    queryFn: () => jobWorkService.getById(id),
    enabled: Boolean(id),
  });
}

export function useJobWorkCompanies() {
  return useQuery({
    queryKey: ['jobWorkCompanies'],
    queryFn: () => jobWorkService.getCompanies(),
  });
}

export function useJobWorkMaterials() {
  return useQuery({
    queryKey: ['jobWorkMaterials'],
    queryFn: () => jobWorkService.getMaterials(),
  });
}

export function useReturnRegister(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['returnRegister', params],
    queryFn: () => jobWorkService.getReturnRegister(params),
  });
}

export function useCreateJobWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateJobWorkOrderPayload) => jobWorkService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrders'] });
    },
  });
}

export function useIssueJobWorkMaterials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IssueMaterialsPayload }) =>
      jobWorkService.issueMaterials(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrder', variables.id] });
    },
  });
}

export function useReceiveJobWorkReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceiveReturnPayload }) =>
      jobWorkService.receiveReturn(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrder', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['returnRegister'] });
    },
  });
}

export function useCloseJobWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CloseJobWorkOrderPayload }) =>
      jobWorkService.closeOrder(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrders'] });
      queryClient.invalidateQueries({ queryKey: ['jobWorkOrder', variables.id] });
    },
  });
}
