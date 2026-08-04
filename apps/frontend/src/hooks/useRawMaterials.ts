import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rawMaterialsService, MaterialQueryFilters } from '@/services/raw-materials.service';
import { StockTransactionPayload, CreateRawMaterialPayload } from '@/types/raw-materials.types';

export function useRawMaterials(params?: MaterialQueryFilters) {
  return useQuery({
    queryKey: ['rawMaterials', params],
    queryFn: () => rawMaterialsService.getAll(params),
  });
}

export function useRawMaterialDetail(id: string) {
  return useQuery({
    queryKey: ['rawMaterial', id],
    queryFn: () => rawMaterialsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useGlobalStockHistory(params?: {
  rawMaterialId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['rawMaterialHistory', params],
    queryFn: () => rawMaterialsService.getGlobalHistory(params),
  });
}

export function useRawMaterialCategories() {
  return useQuery({
    queryKey: ['rawMaterialCategories'],
    queryFn: () => rawMaterialsService.getCategories(),
  });
}

export function useRawMaterialUnits() {
  return useQuery({
    queryKey: ['rawMaterialUnits'],
    queryFn: () => rawMaterialsService.getUnits(),
  });
}

export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => rawMaterialsService.getSuppliers(search),
  });
}

export function useStorageLocations(search?: string) {
  return useQuery({
    queryKey: ['storageLocations', search],
    queryFn: () => rawMaterialsService.getStorageLocations(search),
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRawMaterialPayload) => rawMaterialsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateRawMaterialPayload> }) =>
      rawMaterialsService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterial', variables.id] });
    },
  });
}

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawMaterialsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
    },
  });
}

export function useRecordStockTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockTransactionPayload }) =>
      rawMaterialsService.recordTransaction(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterial', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['rawMaterialHistory'] });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => rawMaterialsService.createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => rawMaterialsService.createStorageLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storageLocations'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      rawMaterialsService.createCategory(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterialCategories'] });
    },
  });
}
