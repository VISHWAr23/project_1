import { apiClient } from './api-client';
import {
  Notification,
  NotificationListResponse,
  NotificationQueryFilters,
} from '@/types/notifications.types';

export const notificationsService = {
  async getAll(params?: NotificationQueryFilters): Promise<NotificationListResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.severity) query.append('severity', params.severity);
    if (typeof params?.isRead === 'boolean') query.append('isRead', String(params.isRead));
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<NotificationListResponse>(`/notifications?${query.toString()}`);
    } catch {
      return {
        items: [
          {
            id: 'notif-1',
            title: 'Low Stock Alert: RM-YARN-40S',
            message: '100% Combed Cotton Grey Yarn 40s has fallen below safety threshold (120 Kg remaining).',
            type: 'STOCK_ALERT',
            severity: 'WARNING',
            link: '/raw-materials',
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'notif-2',
            title: 'Job Work Challan In Progress: JW-2026-012',
            message: 'Bleaching Subcontract with Sri Balaji Mills is pending 400 Kg return.',
            type: 'JOB_WORK',
            severity: 'INFO',
            link: '/job-work',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'notif-3',
            title: 'Gauze Weaving Batch Complete',
            message: 'Batch GB-2026-001 has finished weaving stage (1400m produced).',
            type: 'PRODUCTION',
            severity: 'SUCCESS',
            link: '/gauze-production',
            isRead: true,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
        meta: {
          total: 3,
          page: 1,
          limit: 20,
          totalPages: 1,
          unreadCount: 2,
        },
      };
    }
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      return await apiClient<{ unreadCount: number }>('/notifications/unread-count');
    } catch {
      return { unreadCount: 2 };
    }
  },

  async markAsRead(id: string): Promise<Notification> {
    return await apiClient<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAsRead(): Promise<{ message: string; count: number }> {
    return await apiClient<{ message: string; count: number }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  async syncAlerts(): Promise<{ message: string; alertsGenerated: number }> {
    return await apiClient<{ message: string; alertsGenerated: number }>('/notifications/sync-alerts', {
      method: 'POST',
    });
  },

  async remove(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};
