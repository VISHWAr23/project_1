import React, { useState } from 'react';
import { Plus, Trash2, Scale, PackagePlus, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useRawMaterialUnits, useCreateRawMaterial } from '@/hooks/useRawMaterials';
import { RawMaterialItem } from '@/types/job-work.types';

export interface RollReturnRow {
  id: string;
  finishedProductId: string;
  rollNumber: string;
  unitWeight?: number;
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
  onProductCreated?: (newProduct: RawMaterialItem) => void;
}

export function MultiRollReturnTable({
  rows,
  onChange,
  availableProducts,
  pendingWeight,
  onProductCreated,
}: MultiRollReturnTableProps) {
  const { toast } = useToast();
  const { data: units = [] } = useRawMaterialUnits();
  const createMaterialMutation = useCreateRawMaterial();

  const [localProducts, setLocalProducts] = useState<RawMaterialItem[]>(availableProducts);

  // Sync availableProducts when parent updates
  React.useEffect(() => {
    if (availableProducts.length > 0) {
      setLocalProducts(availableProducts);
    }
  }, [availableProducts]);

  // Quick Create Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductUnitId, setNewProductUnitId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getProductInfo = (productId: string) => {
    const prod = localProducts.find((p) => p.id === productId);
    const uom = prod?.unit?.abbreviation || prod?.unit?.name || 'Pcs';
    const isDiscrete =
      ['pc', 'pcs', 'nos', 'box', 'pk', 'pkt', 'dzn', 'unit', 'units'].includes(uom.toLowerCase()) ||
      prod?.name.toLowerCase().includes('cover') ||
      prod?.name.toLowerCase().includes('sheet') ||
      prod?.name.toLowerCase().includes('swab');
    return { prod, uom, isDiscrete };
  };

  const addRow = () => {
    const defaultProduct = localProducts[0]?.id || '';
    const { isDiscrete } = getProductInfo(defaultProduct);
    const nextIndex = rows.length + 1;
    const defaultWeight = Math.min(50, pendingWeight > 0 ? pendingWeight : 50);
    const newRow: RollReturnRow = {
      id: Math.random().toString(36).substring(2, 9),
      finishedProductId: defaultProduct,
      rollNumber: isDiscrete ? `BDL-FG-${1000 + nextIndex}` : `ROLL-FG-${5000 + nextIndex}`,
      unitWeight: isDiscrete ? 0.2 : defaultWeight,
      returnedWeight: defaultWeight,
      returnedQty: isDiscrete ? 50 : 1,
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
    if (field === 'finishedProductId' && value === '__CREATE_NEW__') {
      setActiveRowId(id);
      setIsModalOpen(true);
      return;
    }

    onChange(
      rows.map((r) => {
        if (r.id === id) {
          if (field === 'finishedProductId') {
            const { isDiscrete } = getProductInfo(value);
            return {
              ...r,
              finishedProductId: value,
              rollNumber: isDiscrete ? `BDL-FG-1001` : `ROLL-FG-5001`,
              returnedQty: isDiscrete ? 50 : 1,
              unitWeight: isDiscrete ? 0.2 : 50,
            };
          }
          if (field === 'returnedQty') {
            const newQty = Math.max(0, Number(value) || 0);
            const unitWeight = r.unitWeight && r.unitWeight > 0 ? r.unitWeight : 50;
            const newWeight = Number((newQty * unitWeight).toFixed(2));
            return {
              ...r,
              returnedQty: newQty,
              returnedWeight: newWeight > 0 ? newWeight : r.returnedWeight,
            };
          }
          if (field === 'returnedWeight') {
            const newWeight = Math.max(0, Number(value) || 0);
            const currentQty = Number(r.returnedQty) || 1;
            const newUnitWeight = currentQty > 0 ? Number((newWeight / currentQty).toFixed(3)) : newWeight;
            return {
              ...r,
              returnedWeight: newWeight,
              unitWeight: newUnitWeight > 0 ? newUnitWeight : (r.unitWeight || 50),
            };
          }
          return { ...r, [field]: value };
        }
        return r;
      }),
    );
  };

  const handleQuickCreateProduct = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newProductName.trim()) {
      toast('Required Field', 'Please enter product name', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedUnit = units.find((u) => u.id === newProductUnitId) || units[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedSku = `FG-${new Date().getFullYear()}-${randomSuffix}`;

      const created = await createMaterialMutation.mutateAsync({
        sku: generatedSku,
        name: newProductName.trim(),
        description: newProductDesc.trim() || undefined,
        unitId: selectedUnit?.id,
        minimumStockLevel: 10,
        initialStock: 0,
      });

      const newProductItem: RawMaterialItem = {
        id: created.id,
        sku: created.sku,
        name: created.name,
        minimumStockLevel: Number(created.minimumStockLevel) || 10,
        reorderQuantity: Number(created.reorderQuantity) || 0,
        currentStockBalance: Number(created.currentStockBalance) || 0,
        unitCost: Number(created.unitCost) || 0,
        unit: selectedUnit ? { id: selectedUnit.id, name: selectedUnit.name, abbreviation: selectedUnit.abbreviation } : undefined,
      };

      setLocalProducts((prev) => [newProductItem, ...prev]);
      if (onProductCreated) {
        onProductCreated(newProductItem);
      }

      // Automatically select the new product in the active row
      if (activeRowId) {
        updateRow(activeRowId, 'finishedProductId', created.id);
      } else if (rows.length > 0) {
        updateRow(rows[0].id, 'finishedProductId', created.id);
      }

      toast('Product Created', `"${created.name}" created and selected!`, 'success');
      setIsModalOpen(false);
      setNewProductName('');
      setNewProductDesc('');
      setNewProductUnitId('');
      setActiveRowId(null);
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create finished product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoFillFullPending = () => {
    const defaultProduct = localProducts[0]?.id || '';
    const { isDiscrete } = getProductInfo(defaultProduct);
    const rollsCount = Math.max(1, Math.ceil(pendingWeight / 50));
    const generated: RollReturnRow[] = [];
    let remaining = pendingWeight;

    for (let i = 1; i <= rollsCount; i++) {
      const weightForThisRoll = Math.min(50, remaining);
      generated.push({
        id: Math.random().toString(36).substring(2, 9),
        finishedProductId: defaultProduct,
        rollNumber: isDiscrete ? `BDL-FG-${1000 + i}` : `ROLL-FG-${5000 + i}`,
        unitWeight: isDiscrete ? 0.2 : Number(weightForThisRoll.toFixed(2)),
        returnedWeight: Number(weightForThisRoll.toFixed(2)),
        returnedQty: isDiscrete ? Math.round(weightForThisRoll / 0.2) : 1,
        wastageWeight: 0,
        wastageQty: 0,
        remarks: 'Batch Return Receipt',
      });
      remaining -= weightForThisRoll;
      if (remaining <= 0) break;
    }
    onChange(generated);
  };

  const totalReturnedWeight = rows.reduce((sum, r) => sum + (Number(r.returnedWeight) || 0), 0);
  const totalWastageWeight = rows.reduce((sum, r) => sum + (Number(r.wastageWeight) || 0), 0);
  const totalQty = rows.reduce((sum, r) => sum + (Number(r.returnedQty) || 0), 0);

  const remainingAfterThisBatch = Math.max(0, pendingWeight - totalReturnedWeight - totalWastageWeight);

  const isFinishedGoodItem = (p: RawMaterialItem) => {
    if (p.sku?.startsWith('FP-') || p.sku?.startsWith('FG-')) return true;
    if (p.sku?.startsWith('RM-')) return false;
    const cat = p.category?.name?.toLowerCase() || '';
    return (
      cat.includes('dressing') ||
      cat.includes('surgical') ||
      cat.includes('patient') ||
      cat.includes('hygienic') ||
      cat.includes("women's care") ||
      cat.includes('adult care') ||
      cat.includes('baby care') ||
      cat.includes('mosquito') ||
      cat.includes('finished')
    );
  };

  const finishedProductsList = localProducts.filter((p) => isFinishedGoodItem(p));
  const displayedProducts = finishedProductsList.length > 0 ? finishedProductsList : localProducts;

  const productOptions = [
    {
      label: '+ Create New Finished Product...',
      value: '__CREATE_NEW__',
    },
    ...displayedProducts.map((p) => {
      const uom = p.unit?.abbreviation || 'Pcs';
      return {
        label: `${p.name} (${p.sku}) • [${uom}]`,
        value: p.id,
      };
    }),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-400" />
            Finished Goods Return Register Table
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select an existing product or create a new finished product on the fly.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              setActiveRowId(rows[0]?.id || null);
              setIsModalOpen(true);
            }}
            leftIcon={<PackagePlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
            className="text-xs text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
          >
            Create New Product
          </Button>

          {pendingWeight > 0 && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={autoFillFullPending}
              className="text-xs text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
            >
              Auto-Fill Full Pending ({pendingWeight.toFixed(1)} Kg)
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={addRow}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Return Item
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 min-w-[220px]">Finished Product & Unit</th>
              <th className="p-3 min-w-[150px]">Roll / Bundle / Lot #</th>
              <th className="p-3 w-32 min-w-[110px]">Net Weight (Kg)</th>
              <th className="p-3 w-28 min-w-[100px]">Return Qty</th>
              <th className="p-3 w-36 min-w-[135px]">Scrap Waste (Kg)</th>
              <th className="p-3 min-w-[160px]">Remarks / Quality</th>
              <th className="p-3 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => {
              const { uom, isDiscrete } = getProductInfo(row.finishedProductId);
              return (
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
                      placeholder={isDiscrete ? 'BDL-PC-101' : 'ROLL-FG-5001'}
                      required
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={row.returnedWeight !== undefined ? row.returnedWeight : ''}
                      onChange={(e) => updateRow(row.id, 'returnedWeight', parseFloat(e.target.value) || 0)}
                      placeholder="95.00"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                      required
                    />
                  </td>
                  <td className="p-3">
                    <div className="relative">
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        value={row.returnedQty !== undefined ? row.returnedQty : ''}
                        onChange={(e) => updateRow(row.id, 'returnedQty', parseFloat(e.target.value) || 0)}
                        placeholder={isDiscrete ? '500' : '1'}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
                        required
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.wastageWeight !== undefined ? row.wastageWeight : ''}
                      onChange={(e) => updateRow(row.id, 'wastageWeight', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono w-full"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      value={row.remarks}
                      onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                      placeholder="QC grade / inspection"
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
              );
            })}
          </tbody>
          <tfoot className="bg-muted/30 border-t border-border font-semibold text-foreground">
            <tr>
              <td colSpan={3} className="p-3 text-right font-medium">Batch Summary ({rows.length} entries):</td>
              <td className="p-3 font-mono text-emerald-400">
                <span className="flex items-center gap-1 font-bold">
                  <Scale className="h-3.5 w-3.5" />
                  {totalReturnedWeight.toFixed(2)} Kg
                </span>
              </td>
              <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{totalQty} Units/Pcs</td>
              <td className="p-3 font-mono text-amber-400 font-bold">{totalWastageWeight.toFixed(2)} Kg</td>
              <td colSpan={2} className="p-3 font-mono text-right text-xs">
                Remaining Fabric Balance:{' '}
                <span
                  className={`font-bold ${
                    remainingAfterThisBatch <= 0.01 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {remainingAfterThisBatch.toFixed(2)} Kg
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Quick Create Finished Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Quick Create Finished Product"
        description="Add a new product with Name, Description, and Unit to immediately use in return receipts."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="e.g. Cotton Pillow Cover 18x27"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Description / Specifications
            </label>
            <Input
              value={newProductDesc}
              onChange={(e) => setNewProductDesc(e.target.value)}
              placeholder="e.g. Standard bleached hospital pillow cover with hemmed borders"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Unit of Measurement (UOM) <span className="text-red-500">*</span>
            </label>
            <Select
              options={
                units.length > 0
                  ? units.map((u) => ({
                      label: `${u.name} (${u.abbreviation})`,
                      value: u.id,
                    }))
                  : [
                      { label: 'Pieces (Pcs)', value: 'u-pcs' },
                      { label: 'Kilograms (Kg)', value: 'u-kg' },
                      { label: 'Meters (m)', value: 'u-m' },
                      { label: 'Rolls', value: 'u-roll' },
                      { label: 'Boxes (Box)', value: 'u-box' },
                      { label: 'Packs (Pkt)', value: 'u-pkt' },
                      { label: 'Dozens (Dzn)', value: 'u-dzn' },
                    ]
              }
              value={newProductUnitId || (units[0]?.id || '')}
              onChange={(e) => setNewProductUnitId(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleQuickCreateProduct}
              isLoading={isSubmitting}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Create & Select Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
