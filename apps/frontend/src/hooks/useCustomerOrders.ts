import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerOrdersService } from '@/services/customer-orders.service';
import {
  CreateCustomerOrderPayload,
  CustomerOrderQueryFilters,
} from '@/types/customer-orders.types';

export function useCustomerOrders(params?: CustomerOrderQueryFilters) {
  return useQuery({
    queryKey: ['customerOrders', params],
    queryFn: () => customerOrdersService.getAll(params),
  });
}

export function useCustomerOrderStats() {
  return useQuery({
    queryKey: ['customerOrderStats'],
    queryFn: () => customerOrdersService.getStats(),
  });
}

export function useCustomerOrderDetail(id: string) {
  return useQuery({
    queryKey: ['customerOrder', id],
    queryFn: () => customerOrdersService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerOrderPayload) => customerOrdersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCustomerOrderPayload> }) =>
      customerOrdersService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrder', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; notes?: string } }) =>
      customerOrdersService.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrder', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
    },
  });
}

export function useRecordOrderDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      customerOrdersService.recordDispatch(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrder', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
    },
  });
}

export function useRecordOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { amount: number; paymentMethod?: string; paymentStatus?: string; notes?: string };
    }) => customerOrdersService.recordPayment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrder', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
    },
  });
}

export function useDeleteCustomerOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['customerOrderStats'] });
    },
  });
}
