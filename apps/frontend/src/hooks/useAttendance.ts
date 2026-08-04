import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import { CreateAttendancePayload, BulkAttendancePayload, UpdateAttendancePayload } from '@/types/attendance.types';

export function useAttendance(params?: {
  date?: string;
  search?: string;
  departmentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceService.getAll(params),
  });
}

export function useTodayAttendance(date?: string) {
  return useQuery({
    queryKey: ['todayAttendance', date],
    queryFn: () => attendanceService.getTodaySummary(date),
  });
}

export function useMonthAttendance(month: number, year: number, departmentId?: string) {
  return useQuery({
    queryKey: ['monthAttendance', month, year, departmentId],
    queryFn: () => attendanceService.getMonthSummary(month, year, departmentId),
    enabled: Boolean(month && year),
  });
}

export function useEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['employeeAttendance', employeeId, startDate, endDate],
    queryFn: () => attendanceService.getEmployeeAttendance(employeeId, startDate, endDate),
    enabled: Boolean(employeeId),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAttendancePayload) => attendanceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['employeeAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) => attendanceService.bulkCreate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAttendancePayload }) => attendanceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['employeeAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['monthAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
