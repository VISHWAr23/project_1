'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGamjeeMasters,
  useDeleteGamjeeSize,
  useDeleteGamjeeOperation,
  useDeleteGamjeeProductMaster,
  useDeleteGamjeeCottonSpec,
} from '@/hooks/useGamjeeProduction';
import { MasterModal } from '@/components/gamjee-production/master-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  Scissors,
  Ruler,
  Boxes,
  ScrollText,
  Edit2,
  Trash2,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { toast } from '@/components/ui/toast';

export default function GamjeeMastersPage() {
  const { data: masters, isLoading } = useGamjeeMasters();
  const deleteSize = useDeleteGamjeeSize();
  const deleteOp = useDeleteGamjeeOperation();
  const deleteProd = useDeleteGamjeeProductMaster();
  const deleteCotton = useDeleteGamjeeCottonSpec();

  const [modalState, setModalState] = useState<{
    type: 'size' | 'operation' | 'product' | 'cotton-spec';
    data?: any;
  } | null>(null);

  const sizes = masters?.sizes || [];
  const operations = masters?.operations || [];
  const products = masters?.products || [];
  const cottonSpecs = masters?.cottonSpecs || [];

  const handleDeleteSize = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete size specification "${name}"?`)) return;
    try {
      await deleteSize.mutateAsync(id);
      toast.success(`Size "${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete size');
    }
  };

  const handleDeleteOperation = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete operation "${name}"?`)) return;
    try {
      await deleteOp.mutateAsync(id);
      toast.success(`Operation "${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete operation');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product template "${name}"?`)) return;
    try {
      await deleteProd.mutateAsync(id);
      toast.success(`Product template "${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product template');
    }
  };

  const handleDeleteCottonSpec = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete cotton specification "${name}"?`)) return;
    try {
      await deleteCotton.mutateAsync(id);
      toast.success(`Cotton specification "${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete cotton specification');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/gamjee-production">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gamjee Production Master Data
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure reusable Gamjee Roll dimensions, cotton specifications, factory operations, and standard product templates.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Gamjee Sizes */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Gamjee Roll Size Specifications</h3>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => setModalState({ type: 'size' })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Size</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sizes.map((s) => (
                <div key={s.id} className="p-3.5 rounded-lg border border-border bg-secondary/30 flex flex-col justify-between group hover:border-border/80 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-xs text-foreground">{s.name}</div>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalState({ type: 'size', data: s })}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Edit Size"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSize(s.id, s.name)}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Size"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      Width: {s.width} {s.widthUom} | Length: {s.length} {s.lengthUom}
                    </div>
                    {s.description && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 2: Cotton Roll Specifications */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Cotton Roll Specifications</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Store cotton weight, web, and expected piece counts calculated per Gamjee width
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => setModalState({ type: 'cotton-spec' })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Cotton Type</span>
              </Button>
            </div>

            {cottonSpecs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-lg bg-secondary/10 text-xs text-muted-foreground">
                No cotton roll specifications registered yet. Click &quot;+ Add Cotton Type&quot; to configure your first specification.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cottonSpecs.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-lg border border-border bg-secondary/30 flex flex-col justify-between group hover:border-border/80 transition-all space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            {c.cottonType}
                            {!c.active && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            Weight: <strong className="text-foreground">{c.weightKg} KG</strong> • Web: <strong className="text-foreground">{c.web}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModalState({ type: 'cotton-spec', data: c })}
                            className="p-1 hover:bg-background rounded text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Edit Cotton Specification"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCottonSpec(c.id, `${c.cottonType} (${c.gamjeeWidthCm}cm)`)}
                            className="p-1 hover:bg-background rounded text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete Cotton Specification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Gamjee Width & Pieces Count Banner */}
                      <div className="p-2 rounded bg-background/60 border border-border/60 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Gamjee Width</span>
                          <span className="font-bold text-foreground">{c.gamjeeWidthCm} CM</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">Expected Pieces</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.piecesPerRoll} pcs / roll</span>
                        </div>
                      </div>

                      {c.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{c.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex justify-between items-center">
                      <span>e.g. 5 rolls = {c.piecesPerRoll * 5} pcs</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{c.active ? '● Active' : '○ Inactive'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 3: Operations */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Standard Factory Operations</h3>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => setModalState({ type: 'operation' })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Operation</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {operations.map((op) => (
                <div key={op.id} className="p-3.5 rounded-lg border border-border bg-secondary/30 flex flex-col justify-between group hover:border-border/80 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-foreground">{op.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          Step {op.sequence}
                        </span>
                        <button
                          onClick={() => setModalState({ type: 'operation', data: op })}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Edit Operation"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOperation(op.id, op.name)}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Operation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">Code: {op.code}</div>
                    {op.description && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{op.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 4: Product Configuration */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Product Specification Templates</h3>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                onClick={() => setModalState({ type: 'product' })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product Template</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {products.map((p) => (
                <div key={p.id} className="p-3.5 rounded-lg border border-border bg-secondary/30 flex flex-col justify-between group hover:border-border/80 transition-all space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-bold text-xs text-foreground">{p.productName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Type: {p.gamjeeType || 'Standard Roll'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalState({ type: 'product', data: p })}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Edit Product Template"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.productName)}
                          className="p-1 hover:bg-background rounded text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete Product Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/60 text-[11px] font-mono space-y-0.5 text-muted-foreground">
                      <p>Standard Cotton Req: <strong className="text-foreground">{p.cottonRequirement || '-'} {p.cottonUom}</strong></p>
                      <p>Standard Fabric Req: <strong className="text-foreground">{p.fabricRequirement || '-'} {p.fabricUom}</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal */}
      {modalState && (
        <MasterModal
          isOpen={Boolean(modalState)}
          onClose={() => setModalState(null)}
          type={modalState.type}
          initialData={modalState.data}
        />
      )}
    </div>
  );
}
