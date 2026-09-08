import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fabricCostingService } from '@/services/fabric-costing.service';
import { CreateFabricCostingInput } from '@/types/fabric-costing.types';

export function useFabricCostingList(params?: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['fabricCostingList', params],
    queryFn: () => fabricCostingService.getAll(params),
  });
}

export function useFabricCostingStats() {
  return useQuery({
    queryKey: ['fabricCostingStats'],
    queryFn: () => fabricCostingService.getStats(),
    refetchInterval: 30000,
  });
}

export function useFabricCostingDetail(id: string) {
  return useQuery({
    queryKey: ['fabricCostingDetail', id],
    queryFn: () => fabricCostingService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateFabricCosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFabricCostingInput) => fabricCostingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabricCostingList'] });
      queryClient.invalidateQueries({ queryKey: ['fabricCostingStats'] });
    },
  });
}

export function useDeleteFabricCosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fabricCostingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabricCostingList'] });
      queryClient.invalidateQueries({ queryKey: ['fabricCostingStats'] });
    },
  });
}
