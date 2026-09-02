import React from 'react';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InventoryTransactionItem } from '@/types/raw-materials.types';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Truck, RotateCcw, Shuffle, FileText } from 'lucide-react';

interface StockHistoryLedgerProps {
  items: InventoryTransactionItem[];
  unitAbbreviation?: string;
}

export function StockHistoryLedger({ items, unitAbbreviation = 'Units' }: StockHistoryLedgerProps) {
  const getTransactionBadge = (type: InventoryTransactionItem['transactionType']) => {
    switch (type) {
      case 'PURCHASE_RECEIPT':
        return (
          <Badge variant="success" icon={<ArrowDownLeft className="h-3 w-3" />}>
            Purchase Receipt
          </Badge>
        );
      case 'ADJUSTMENT_ADD':
        return (
          <Badge variant="success" icon={<ArrowDownLeft className="h-3 w-3" />}>
            Stock Add
          </Badge>
        );
      case 'JOB_WORK_RETURN':
        return (
          <Badge variant="info" icon={<RotateCcw className="h-3 w-3" />}>
            Job Work Return
          </Badge>
        );
      case 'WORK_ORDER_ISSUE':
        return (
          <Badge variant="warning" icon={<ArrowUpRight className="h-3 w-3" />}>
            Work Order Issue
          </Badge>
        );
      case 'JOB_WORK_DISPATCH':
        return (
          <Badge variant="warning" icon={<Truck className="h-3 w-3" />}>
            Job Work Dispatch
          </Badge>
        );
      case 'ADJUSTMENT_SUBTRACT':
        return (
          <Badge variant="error" icon={<ArrowUpRight className="h-3 w-3" />}>
            Stock Subtract
          </Badge>
        );
      case 'TRANSFER':
        return (
          <Badge variant="info" icon={<Shuffle className="h-3 w-3" />}>
            Transfer
          </Badge>
        );
      case 'MANUAL_CORRECTION':
      default:
        return (
          <Badge variant="neutral" icon={<RefreshCw className="h-3 w-3" />}>
            Correction
          </Badge>
        );
    }
  };

  const columns: Column<InventoryTransactionItem>[] = [
    {
      key: 'createdAt',
      header: 'Date & Time',
      sortable: true,
      width: '180px',
      render: (row) => {
        const d = new Date(row.createdAt);
        const dateStr = d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap inline-block">
            {dateStr}, {timeStr}
          </span>
        );
      },
    },
    {
      key: 'transactionType',
      header: 'Transaction Type',
      width: '165px',
      render: (row) => getTransactionBadge(row.transactionType),
    },
    {
      key: 'quantity',
      header: 'Weight / Qty',
      align: 'right',
      width: '135px',
      render: (row) => {
        const isAddition =
          ['PURCHASE_RECEIPT', 'ADJUSTMENT_ADD', 'JOB_WORK_RETURN'].includes(row.transactionType) ||
          Number(row.newStock) > Number(row.previousStock);
        return (
          <span
            className={`font-mono font-bold text-xs whitespace-nowrap ${
              isAddition ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
            }`}
          >
            {isAddition ? '+' : '-'}{Math.abs(Number(row.quantity || 0)).toFixed(2)} {unitAbbreviation}
          </span>
        );
      },
    },
    {
      key: 'previousStock',
      header: 'Prev Stock',
      align: 'right',
      width: '120px',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {Math.max(0, Number(row.previousStock || 0)).toFixed(2)} {unitAbbreviation}
        </span>
      ),
    },
    {
      key: 'newStock',
      header: 'New Stock',
      align: 'right',
      width: '120px',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-foreground whitespace-nowrap">
          {Math.max(0, Number(row.newStock || 0)).toFixed(2)} {unitAbbreviation}
        </span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      width: '120px',
      render: (row) => (
        <span className="text-xs text-muted-foreground truncate max-w-[120px] block">
          {row.createdBy?.email?.split('@')[0] || 'System Admin'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Remarks / Notes',
      render: (row) => (
        <span className="text-xs text-muted-foreground italic truncate max-w-[280px] block">
          {row.notes || '-'}
        </span>
      ),
    },
  ];

  return <Table columns={columns} data={items} keyExtractor={(row) => row.id} />;
}
