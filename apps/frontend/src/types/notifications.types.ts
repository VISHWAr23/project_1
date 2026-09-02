export type NotificationType =
  | 'STOCK_ALERT'
  | 'JOB_WORK'
  | 'PRODUCTION'
  | 'PAYROLL'
  | 'ATTENDANCE'
  | 'CUSTOMER_ORDER'
  | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface Notification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface NotificationQueryFilters {
  type?: NotificationType;
  severity?: NotificationSeverity;
  isRead?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
