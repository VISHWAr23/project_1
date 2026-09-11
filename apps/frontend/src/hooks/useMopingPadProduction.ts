import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mopingPadProductionService,
  CreateMopingPadBatchInput,
  MopingPadBatchStatus,
} from '@/services/moping-pad-production.service';

export function useMopingPadDashboard() {
  return useQuery({
    queryKey: ['mopingPadDashboard'],
    queryFn: () => mopingPadProductionService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useMopingPadBatches(params?: {
  search?: string;
  status?: string;
  materialType?: string;
}) {
  return useQuery({
    queryKey: ['mopingPadBatches', params],
    queryFn: () => mopingPadProductionService.getAllBatches(params),
  });
}

export function useMopingPadBatchDetail(id: string) {
  return useQuery({
    queryKey: ['mopingPadBatch', id],
    queryFn: () => mopingPadProductionService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useCreateMopingPadBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMopingPadBatchInput) =>
      mopingPadProductionService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mopingPadBatches'] });
      queryClient.invalidateQueries({ queryKey: ['mopingPadDashboard'] });
    },
  });
}

export function useUpdateMopingPadBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MopingPadBatchStatus }) =>
      mopingPadProductionService.updateBatchStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mopingPadBatches'] });
      queryClient.invalidateQueries({ queryKey: ['mopingPadDashboard'] });
    },
  });
}

export function useUpdateMopingPadProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      completedQuantity,
      status,
      notes,
    }: {
      id: string;
      completedQuantity: number;
      status?: MopingPadBatchStatus;
      notes?: string;
    }) => mopingPadProductionService.updateProgress(id, completedQuantity, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mopingPadBatches'] });
      queryClient.invalidateQueries({ queryKey: ['mopingPadDashboard'] });
    },
  });
}

