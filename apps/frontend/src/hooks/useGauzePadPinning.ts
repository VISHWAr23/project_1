import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gauzePadPinningService,
  CreateGauzePadPinningInput,
  GauzePadPinningStatus,
} from '@/services/gauze-pad-pinning.service';

export function useGauzePadPinningDashboard() {
  return useQuery({
    queryKey: ['gauzePadPinningDashboard'],
    queryFn: () => gauzePadPinningService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useGauzePadPinningBatches(params?: {
  search?: string;
  status?: string;
  materialType?: string;
}) {
  return useQuery({
    queryKey: ['gauzePadPinningBatches', params],
    queryFn: () => gauzePadPinningService.getAllBatches(params),
  });
}

export function useGauzePadPinningBatchDetail(id: string) {
  return useQuery({
    queryKey: ['gauzePadPinningBatch', id],
    queryFn: () => gauzePadPinningService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useCreateGauzePadPinningBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGauzePadPinningInput) =>
      gauzePadPinningService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gauzePadPinningBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzePadPinningDashboard'] });
    },
  });
}

export function useUpdateGauzePadPinningBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GauzePadPinningStatus }) =>
      gauzePadPinningService.updateBatchStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gauzePadPinningBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzePadPinningDashboard'] });
    },
  });
}
