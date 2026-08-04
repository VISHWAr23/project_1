import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Truck, RefreshCw, CheckCircle2, Lock, AlertTriangle, FilePlus } from 'lucide-react';
import { JobWorkStatus } from '@/types/job-work.types';

interface JobWorkStatusBadgeProps {
  status: JobWorkStatus;
  className?: string;
}

export function JobWorkStatusBadge({ status, className }: JobWorkStatusBadgeProps) {
  switch (status) {
    case 'CREATED':
      return (
        <Badge variant="neutral" className={className} icon={<FilePlus className="h-3 w-3" />}>
          Created
        </Badge>
      );
    case 'MATERIALS_ISSUED':
      return (
        <Badge variant="info" className={className} icon={<Truck className="h-3 w-3" />}>
          Materials Issued
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="info" className={className} icon={<Clock className="h-3 w-3" />}>
          In Progress
        </Badge>
      );
    case 'PARTIAL_RETURN':
      return (
        <Badge variant="warning" className={className} icon={<RefreshCw className="h-3 w-3 animate-spin-slow" />}>
          Partial Return
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className={className} icon={<CheckCircle2 className="h-3 w-3" />}>
          Completed
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="outline" className={`bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ${className}`} icon={<Lock className="h-3 w-3" />}>
          Closed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="error" className={className} icon={<AlertTriangle className="h-3 w-3" />}>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
}
