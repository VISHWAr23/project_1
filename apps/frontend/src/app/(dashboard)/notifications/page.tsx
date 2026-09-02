'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  RotateCw,
  Search,
  Filter,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Package,
  Truck,
  Layers,
  Banknote,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useSyncSystemAlerts,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { Notification, NotificationType, NotificationSeverity } from '@/types/notifications.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isReadFilter, setIsReadFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useNotifications({
    search: search || undefined,
    type: selectedType !== 'ALL' ? (selectedType as NotificationType) : undefined,
    severity: selectedSeverity !== 'ALL' ? (selectedSeverity as NotificationSeverity) : undefined,
    isRead: isReadFilter === 'UNREAD' ? false : isReadFilter === 'READ' ? true : undefined,
    page,
    limit: 15,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const syncAlerts = useSyncSystemAlerts();
  const deleteNotif = useDeleteNotification();

  const handleSyncAlerts = async () => {
    try {
      const res = await syncAlerts.mutateAsync();
      toast('Alerts Synchronized', `Generated ${res.alertsGenerated} new operational notifications`, 'success');
    } catch {
      toast('Sync Failed', 'Could not sync system alerts from backend', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast('All Read', 'All notifications have been marked as read', 'success');
    } catch {
      toast('Action Failed', 'Could not mark notifications as read', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotif.mutateAsync(id);
      toast('Deleted', 'Notification removed', 'info');
    } catch {
      toast('Delete Failed', 'Could not delete notification', 'error');
    }
  };

  const getNotificationIcon = (type: NotificationType, severity: NotificationSeverity) => {
    if (severity === 'ERROR') {
      return <AlertOctagon className="h-4 w-4 text-rose-500 shrink-0" />;
    }
    if (severity === 'WARNING') {
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    }
    if (severity === 'SUCCESS') {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    }

    switch (type) {
      case 'STOCK_ALERT':
        return <Package className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'JOB_WORK':
        return <Truck className="h-4 w-4 text-purple-500 shrink-0" />;
      case 'PRODUCTION':
        return <Layers className="h-4 w-4 text-cyan-500 shrink-0" />;
      case 'PAYROLL':
        return <Banknote className="h-4 w-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-sky-500 shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'ERROR':
        return <Badge variant="error">CRITICAL</Badge>;
      case 'WARNING':
        return <Badge variant="warning">WARNING</Badge>;
      case 'SUCCESS':
        return <Badge variant="success">RESOLVED</Badge>;
      default:
        return <Badge variant="info">INFO</Badge>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
      return `${Math.floor(diff / 86400)} days ago`;
    } catch {
      return '';
    }
  };

  const unreadTotal = data?.meta.unreadCount ?? 0;
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-8"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Notifications & System Alerts Center
            </h1>
            {unreadTotal > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {unreadTotal} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time audit alerts, minimum safety stock breaches, subcontracting job work, and production milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isLoading={syncAlerts.isPending}
            onClick={handleSyncAlerts}
            leftIcon={<RotateCw className="h-3.5 w-3.5" />}
          >
            Scan & Sync Alerts
          </Button>
          {unreadTotal > 0 && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={markAllAsRead.isPending}
              onClick={handleMarkAllRead}
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">Search Alerts</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, SKU, batch..."
                className="w-full bg-secondary/50 border border-border rounded-md text-xs pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">Alert Category</label>
            <Select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'All Categories', value: 'ALL' },
                { label: 'Stock Safety & Levels', value: 'STOCK_ALERT' },
                { label: 'Subcontracting & Job Work', value: 'JOB_WORK' },
                { label: 'Gauze & Gamjee Production', value: 'PRODUCTION' },
                { label: 'Payroll & Approvals', value: 'PAYROLL' },
                { label: 'Customer Orders', value: 'CUSTOMER_ORDER' },
                { label: 'System & Audit Logs', value: 'SYSTEM' },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">Severity Level</label>
            <Select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'All Severities', value: 'ALL' },
                { label: 'Critical (Error)', value: 'ERROR' },
                { label: 'Warnings', value: 'WARNING' },
                { label: 'Informational', value: 'INFO' },
                { label: 'Success / Resolved', value: 'SUCCESS' },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">Status</label>
            <Select
              value={isReadFilter}
              onChange={(e) => {
                setIsReadFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Unread Only', value: 'UNREAD' },
                { label: 'Read Only', value: 'READ' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 3. Notification List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <RotateCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs">Loading notification feed...</p>
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
            <h3 className="font-semibold text-foreground text-sm">No Notifications Found</h3>
            <p className="text-xs max-w-sm mx-auto">
              There are no alerts matching your active filters. Click "Scan & Sync Alerts" to scan the live database.
            </p>
          </div>
        ) : (
          data.items.map((item) => (
            <div
              key={item.id}
              className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                !item.isRead ? 'bg-secondary/25' : 'hover:bg-secondary/15'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-md bg-secondary/80 border border-border mt-0.5">
                  {getNotificationIcon(item.type, item.severity)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold text-xs sm:text-sm ${!item.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.title}
                    </span>
                    {getSeverityBadge(item.severity)}
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono pt-1">
                    <span>{formatTimeAgo(item.createdAt)}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                {item.link && (
                  <Link href={item.link}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!item.isRead) markAsRead.mutate(item.id);
                      }}
                      rightIcon={<ExternalLink className="h-3 w-3" />}
                    >
                      View Resource
                    </Button>
                  </Link>
                )}

                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(item.id)}
                    title="Mark as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  title="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <span>
            Showing page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong> ({totalItems} total alerts)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
