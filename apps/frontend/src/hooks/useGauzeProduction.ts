import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gauzeProductionService } from '@/services/gauze-production.service';
import {
  CreateGauzeProductionBatchInput,
  SendToBleachingInput,
  ReceiveBleachingInput,
  AddProcessingOperationInput,
  CreatePackingEntryInput,
  GauzeTypeInput,
  GauzeSizeInput,
  BleachingTypeInput,
  GauzeOperationTypeInput,
} from '@ims/validation';

export function useGauzeDashboard() {
  return useQuery({
    queryKey: ['gauzeDashboard'],
    queryFn: () => gauzeProductionService.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useGauzeBatches(params?: {
  search?: string;
  status?: string;
  gauzeTypeId?: string;
  gauzeSizeId?: string;
  supplierId?: string;
  productId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['gauzeBatches', params],
    queryFn: () => gauzeProductionService.getAllBatches(params),
  });
}

export function useGauzeBatchDetail(id: string) {
  return useQuery({
    queryKey: ['gauzeBatch', id],
    queryFn: () => gauzeProductionService.getBatchById(id),
    enabled: Boolean(id),
  });
}

export function useGauzeTraceability(id: string) {
  return useQuery({
    queryKey: ['gauzeTraceability', id],
    queryFn: () => gauzeProductionService.getTraceability(id),
    enabled: Boolean(id),
  });
}

export function useGauzeBleachingJobs(params?: { vendorId?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['gauzeBleachingJobs', params],
    queryFn: () => gauzeProductionService.getBleachingJobs(params),
  });
}

export function useVendorHeldStock() {
  return useQuery({
    queryKey: ['vendorHeldStock'],
    queryFn: () => gauzeProductionService.getVendorStockRegister(),
  });
}

export function useGauzeMasters() {
  return useQuery({
    queryKey: ['gauzeMasters'],
    queryFn: () => gauzeProductionService.getMasters(),
  });
}

export function useGauzeReports(type: 'batches' | 'bleaching' | 'vendor-pending' | 'wastage' | 'finished-goods') {
  return useQuery({
    queryKey: ['gauzeReports', type],
    queryFn: () => gauzeProductionService.getReports(type),
  });
}

export function useCreateGauzeBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGauzeProductionBatchInput) => gauzeProductionService.createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
    },
  });
}

export function useSendToBleaching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: SendToBleachingInput }) =>
      gauzeProductionService.sendToBleaching(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBleachingJobs'] });
      queryClient.invalidateQueries({ queryKey: ['vendorHeldStock'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
    },
  });
}

export function useReceiveBleaching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: ReceiveBleachingInput }) =>
      gauzeProductionService.receiveBleaching(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBleachingJobs'] });
      queryClient.invalidateQueries({ queryKey: ['vendorHeldStock'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
    },
  });
}

export function useAddProcessingOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: AddProcessingOperationInput }) =>
      gauzeProductionService.addProcessingOperation(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
    },
  });
}

export function useCreatePackingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, payload }: { batchId: string; payload: CreatePackingEntryInput }) =>
      gauzeProductionService.createPackingEntry(batchId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });
}

export function useUpdateGauzeBatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, status, remarks }: { batchId: string; status: string; remarks?: string }) =>
      gauzeProductionService.updateBatchStatus(batchId, status, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gauzeBatches'] });
      queryClient.invalidateQueries({ queryKey: ['gauzeBatch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['gauzeDashboard'] });
    },
  });
}

export function useManageGauzeMasters() {
  const queryClient = useQueryClient();

  const createType = useMutation({
    mutationFn: (payload: GauzeTypeInput) => gauzeProductionService.createGauzeType(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const updateType = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GauzeTypeInput> }) =>
      gauzeProductionService.updateGauzeType(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const createSize = useMutation({
    mutationFn: (payload: GauzeSizeInput) => gauzeProductionService.createGauzeSize(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const updateSize = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GauzeSizeInput> }) =>
      gauzeProductionService.updateGauzeSize(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const createBleaching = useMutation({
    mutationFn: (payload: BleachingTypeInput) => gauzeProductionService.createBleachingType(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const updateBleaching = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BleachingTypeInput> }) =>
      gauzeProductionService.updateBleachingType(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const createOperation = useMutation({
    mutationFn: (payload: GauzeOperationTypeInput) => gauzeProductionService.createOperationType(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  const updateOperation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GauzeOperationTypeInput> }) =>
      gauzeProductionService.updateOperationType(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gauzeMasters'] }),
  });

  return {
    createType,
    updateType,
    createSize,
    updateSize,
    createBleaching,
    updateBleaching,
    createOperation,
    updateOperation,
  };
}
