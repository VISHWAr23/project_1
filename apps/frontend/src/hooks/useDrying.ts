import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dryingService,
  CreateDryingBatchInput,
  UpdateDryingProgressInput,
} from '@/services/drying.service';

export function useDryingDashboard() {
  return useQuery({
    queryKey: ['dryingDashboard'],
    queryFn: () => dryingService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useDryingBatches(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['dryingBatches', params],
    queryFn: () => dryingService.getAllBatches(params),
  });
}

export function useDryingBatchDetail(id: string) {
  return useQuery({
    queryKey: ['dryingBatch', id],
    queryFn: () => dryingService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useCreateDryingBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDryingBatchInput) => dryingService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dryingBatches'] });
      queryClient.invalidateQueries({ queryKey: ['dryingDashboard'] });
    },
  });
}

export function useUpdateDryingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDryingProgressInput) => dryingService.updateProgress(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dryingBatches'] });
      queryClient.invalidateQueries({ queryKey: ['dryingDashboard'] });
    },
  });
}
