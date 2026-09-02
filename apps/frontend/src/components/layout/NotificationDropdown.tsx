'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Package,
  Truck,
  Layers,
  Banknote,
  RotateCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useSyncSystemAlerts,
} from '@/hooks/useNotifications';
import { Notification, NotificationType, NotificationSeverity } from '@/types/notifications.types';
import { Button } from '@/components/ui/button';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'ALERTS'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: countData } = useUnreadNotificationCount();
  const unreadCount = countData?.unreadCount ?? 0;

  const { data: notificationsData, isLoading } = useNotifications({
    isRead: activeTab === 'UNREAD' ? false : undefined,
    severity: activeTab === 'ALERTS' ? ('WARNING' as any) : undefined,
    limit: 10,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const syncAlerts = useSyncSystemAlerts();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      markAsRead.mutate(notif.id);
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
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

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications & System Alerts"
        aria-label="Open notifications"
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors relative flex items-center justify-center"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-rose-600 text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover border border-border rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col text-xs"
          >
            {/* Header */}
            <div className="p-3 bg-secondary/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">Notifications</span>
                {unreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-secondary rounded-full">
                    All caught up
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => syncAlerts.mutate()}
                  disabled={syncAlerts.isPending}
                  title="Scan database & sync alerts"
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${syncAlerts.isPending ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    disabled={markAllAsRead.isPending}
                    title="Mark all as read"
                    className="p-1 text-muted-foreground hover:text-emerald-500 hover:bg-secondary rounded transition-colors"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs Filter */}
            <div className="flex border-b border-border bg-secondary/10 px-3 py-1.5 gap-2 text-[11px]">
              {(['ALL', 'UNREAD', 'ALERTS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-0.5 rounded transition-all font-medium ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'UNREAD' ? 'Unread' : 'Alerts'}
                </button>
              ))}
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground space-y-2">
                  <RotateCw className="h-4 w-4 animate-spin mx-auto text-emerald-500" />
                  <p className="text-[11px]">Loading notifications...</p>
                </div>
              ) : !notificationsData?.items || notificationsData.items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                  <p className="font-medium text-foreground text-xs">No notifications</p>
                  <p className="text-[11px]">You're all caught up with production & inventory events.</p>
                </div>
              ) : (
                notificationsData.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-secondary/40 ${
                      !item.isRead ? 'bg-secondary/20' : ''
                    }`}
                  >
                    <div className="mt-0.5">{getNotificationIcon(item.type, item.severity)}</div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`font-semibold truncate text-xs ${!item.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-secondary/30 border-t border-border flex items-center justify-between text-[11px]">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Notification Center</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
