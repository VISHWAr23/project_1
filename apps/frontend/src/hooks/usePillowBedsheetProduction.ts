import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pillowBedsheetProductionService,
  CreatePillowBedsheetBatchInput,
  PillowBedsheetBatchStatus,
} from '@/services/pillow-bedsheet-production.service';

export function usePillowBedsheetDashboard() {
  return useQuery({
    queryKey: ['pillowBedsheetDashboard'],
    queryFn: () => pillowBedsheetProductionService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function usePillowBedsheetBatches(params?: {
  search?: string;
  status?: string;
  productType?: string;
}) {
  return useQuery({
    queryKey: ['pillowBedsheetBatches', params],
    queryFn: () => pillowBedsheetProductionService.getAllBatches(params),
  });
}

export function usePillowBedsheetBatchDetail(id: string) {
  return useQuery({
    queryKey: ['pillowBedsheetBatch', id],
    queryFn: () => pillowBedsheetProductionService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePillowBedsheetBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePillowBedsheetBatchInput) =>
      pillowBedsheetProductionService.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetBatches'] });
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetDashboard'] });
    },
  });
}

export function useUpdatePillowBedsheetProgress() {
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
      status?: PillowBedsheetBatchStatus;
      notes?: string;
    }) => pillowBedsheetProductionService.updateProgress(id, completedQuantity, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetBatches'] });
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetDashboard'] });
    },
  });
}

export function useUpdatePillowBedsheetBatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PillowBedsheetBatchStatus }) =>
      pillowBedsheetProductionService.updateBatchStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetBatches'] });
      queryClient.invalidateQueries({ queryKey: ['pillowBedsheetDashboard'] });
    },
  });
}
