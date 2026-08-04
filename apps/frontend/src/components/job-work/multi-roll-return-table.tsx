import React from 'react';
import { Plus, Trash2, Scale, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { RawMaterialItem } from '@/types/job-work.types';

export interface RollReturnRow {
  id: string;
  finishedProductId: string;
  rollNumber: string;
  returnedWeight: number;
  returnedQty: number;
  wastageWeight: number;
  wastageQty: number;
  remarks: string;
  photoUrl?: string;
}

interface MultiRollReturnTableProps {
  rows: RollReturnRow[];
  onChange: (rows: RollReturnRow[]) => void;
  availableProducts: RawMaterialItem[];
  pendingWeight: number;
}

export function MultiRollReturnTable({ rows, onChange, availableProducts, pendingWeight }: MultiRollReturnTableProps) {
  const addRow = () => {
    const defaultProduct = availableProducts[0]?.id || '';
    const nextIndex = rows.length + 1;
    const newRow: RollReturnRow = {
      id: Math.random().toString(36).substring(2, 9),
      finishedProductId: defaultProduct,
      rollNumber: `ROLL-FG-${5000 + nextIndex}`,
      returnedWeight: Math.min(50, pendingWeight || 50),
      returnedQty: 1,
      wastageWeight: 0,
      wastageQty: 0,
      remarks: '',
    };
    onChange([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RollReturnRow, value: any) => {
    onChange(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      }),
    );
  };

  const totalReturnedWeight = rows.reduce((sum, r) => sum + (Number(r.returnedWeight) || 0), 0);
  const totalWastageWeight = rows.reduce((sum, r) => sum + (Number(r.wastageWeight) || 0), 0);
  const totalQty = rows.reduce((sum, r) => sum + (Number(r.returnedQty) || 0), 0);

  const remainingAfterThisBatch = Math.max(0, pendingWeight - totalReturnedWeight - totalWastageWeight);

  const productOptions = availableProducts.map((p) => ({
    label: `${p.name} (${p.sku})`,
    value: p.id,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Digital Return Roll Table</h4>
          <p className="text-xs text-muted-foreground">Enter returned rolls from vendor with net weight and waste.</p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={addRow} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add Returned Roll
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 w-48">Finished Product</th>
              <th className="p-3 w-36">Returned Roll #</th>
              <th className="p-3 w-28">Net Weight (Kg)</th>
              <th className="p-3 w-24">Qty</th>
              <th className="p-3 w-28">Scrap / Waste (Kg)</th>
              <th className="p-3">Remarks</th>
              <th className="p-3 w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-center text-muted-foreground font-mono">{index + 1}</td>
                <td className="p-3">
                  <Select
                    options={productOptions}
                    value={row.finishedProductId}
                    onChange={(e) => updateRow(row.id, 'finishedProductId', e.target.value)}
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={row.rollNumber}
                    onChange={(e) => updateRow(row.id, 'rollNumber', e.target.value)}
                    placeholder="ROLL-FG-001"
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={row.returnedWeight || ''}
                    onChange={(e) => updateRow(row.id, 'returnedWeight', parseFloat(e.target.value) || 0)}
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={row.returnedQty || ''}
                    onChange={(e) => updateRow(row.id, 'returnedQty', parseFloat(e.target.value) || 0)}
                    required
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.wastageWeight || ''}
                    onChange={(e) => updateRow(row.id, 'wastageWeight', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3">
                  <Input
                    value={row.remarks}
                    onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                    placeholder="QC observations"
                  />
                </td>
                <td className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="text-muted-foreground hover:text-red-400 p-1 h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30 border-t border-border font-semibold text-foreground">
            <tr>
              <td colSpan={3} className="p-3 text-right">Batch Summary:</td>
              <td className="p-3 font-mono text-emerald-400 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                {totalReturnedWeight.toFixed(2)} Kg
              </td>
              <td className="p-3 font-mono">{totalQty} Pcs</td>
              <td className="p-3 font-mono text-amber-400">{totalWastageWeight.toFixed(2)} Kg</td>
              <td colSpan={2} className="p-3 font-mono text-right text-xs">
                Remaining Balance: <span className="text-primary font-bold">{remainingAfterThisBatch.toFixed(2)} Kg</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
