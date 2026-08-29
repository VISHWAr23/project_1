import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamjeeProductionService } from '@/services/gamjee-production.service';
import {
  CreateGamjeeProductionBatchInput,
  IssueGamjeeMaterialsInput,
  AddGamjeeOperationInput,
  CreateGamjeeRollingInput,
  GamjeeSizeInput,
  GamjeeOperationInput,
  GamjeeProductMasterInput,
} from '@ims/validation';

export function useGamjeeDashboard() {
  return useQuery({
    queryKey: ['gamjeeDashboard'],
    queryFn: () => gamjeeProductionService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useGamjeeBatches(params?: {
  search?: string;
  status?: string;
  gamjeeSizeId?: string;
  finishedProductId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['gamjeeBatches', params],
    queryFn: () => gamjeeProductionService.getAllBatches(params),
  });
}

export function useGamjeeBatchDetail(id: string) {
  return useQuery({
    queryKey: ['gamjeeBatch', id],
    queryFn: () => gamjeeProductionService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useGamjeeTraceability(id: string) {
  return useQuery({
    queryKey: ['gamjeeTraceability', id],
    queryFn: () => gamjeeProductionService.getTraceability(id),
    enabled: Boolean(id),
  });
}

export function useGamjeeMasters() {
  return useQuery({
    queryKey: ['gamjeeMasters'],
    queryFn: () => gamjeeProductionService.getMasters(),
  });
}

export function useGamjeeReports(type: 'production' | 'consumption' | 'wastage' | 'finished_goods') {
  return useQuery({
    queryKey: ['gamjeeReports', type],
    queryFn: () => gamjeeProductionService.getReports(type),
  });
}

export function useCreateGamjeeBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGamjeeProductionBatchInput) => gamjeeProductionService.createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeDashboard'] });
    },
  });
}

export function useIssueGamjeeMaterials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: IssueGamjeeMaterialsInput }) =>
      gamjeeProductionService.issueMaterials(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });
}

export function useAddGamjeeOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: AddGamjeeOperationInput }) =>
      gamjeeProductionService.addProcessingOperation(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeDashboard'] });
    },
  });
}

export function useCreateGamjeeRolling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: CreateGamjeeRollingInput }) =>
      gamjeeProductionService.createRollingEntry(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });
}

export function useUpdateGamjeeBatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, status, remarks }: { batchId: string; status: string; remarks?: string }) =>
      gamjeeProductionService.updateBatchStatus(batchId, status, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gamjeeDashboard'] });
    },
  });
}

export function useCreateGamjeeSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GamjeeSizeInput) => gamjeeProductionService.createSize(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useUpdateGamjeeSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GamjeeSizeInput> }) =>
      gamjeeProductionService.updateSize(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useDeleteGamjeeSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gamjeeProductionService.deleteSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useCreateGamjeeOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GamjeeOperationInput) => gamjeeProductionService.createOperation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useUpdateGamjeeOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GamjeeOperationInput> }) =>
      gamjeeProductionService.updateOperation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useDeleteGamjeeOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gamjeeProductionService.deleteOperation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useCreateGamjeeProductMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GamjeeProductMasterInput) => gamjeeProductionService.createProductMaster(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useUpdateGamjeeProductMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GamjeeProductMasterInput> }) =>
      gamjeeProductionService.updateProductMaster(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useDeleteGamjeeProductMaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gamjeeProductionService.deleteProductMaster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useCreateGamjeeCottonSpec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => gamjeeProductionService.createCottonSpec(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useUpdateGamjeeCottonSpec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      gamjeeProductionService.updateCottonSpec(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}

export function useDeleteGamjeeCottonSpec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gamjeeProductionService.deleteCottonSpec(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamjeeMasters'] });
    },
  });
}
