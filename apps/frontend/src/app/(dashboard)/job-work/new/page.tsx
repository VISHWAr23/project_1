'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  FilePlus,
  Building2,
  Package,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useJobWorkCompanies,
  useJobWorkMaterials,
  useCreateJobWorkOrder,
} from '@/hooks/useJobWork';
import { RawMaterialItem } from '@/types/job-work.types';
import Link from 'next/link';

function CreateJobWorkOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // If type=WEAVING is requested, smoothly redirect to dedicated weaving page
  useEffect(() => {
    if (searchParams.get('type') === 'WEAVING') {
      router.replace(`/job-work/weaving/new?${searchParams.toString()}`);
    }
  }, [searchParams, router]);

  const { data: companies = [], isLoading: isLoadingCompanies } = useJobWorkCompanies();
  const { data: materials = [], isLoading: isLoadingMaterials } = useJobWorkMaterials();
  const createMutation = useCreateJobWorkOrder();

  const [jobWorkCompanyId, setJobWorkCompanyId] = useState(
    searchParams.get('companyId') || ''
  );
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [finishedProductId, setFinishedProductId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 14);
    return future.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState(
    searchParams.get('workerNames')
      ? `Assigned Workforce: ${searchParams.get('workerNames')}`
      : ''
  );

  const isFinishedProduct = (m: RawMaterialItem) => {
    if (m.sku?.startsWith('FP-') || m.sku?.startsWith('FG-')) return true;
    if (m.sku?.startsWith('RM-')) return false;
    const cat = m.category?.name?.toLowerCase() || '';
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

  const rawMaterials = materials.filter((m) => !isFinishedProduct(m));
  const finishedProducts = materials.filter((m) => isFinishedProduct(m));

  const rawMaterialOptions = rawMaterials.map((m) => ({
    label: `${m.name} (${m.sku}) [Stock: ${m.currentStockBalance} ${m.unit?.abbreviation || 'Units'}]`,
    value: m.id,
  }));

  const finishedProductOptions = [
    { label: 'Select Target Finished Product...', value: '' },
    ...finishedProducts.map((m) => ({
      label: `${m.name} (${m.sku}) • [${m.unit?.abbreviation || 'Units'}]`,
      value: m.id,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobWorkCompanyId) {
      toast('Company Required', 'Please select a Job Working Company', 'warning');
      return;
    }

    if (!rawMaterialId) {
      toast('Material Required', 'Please select a Raw Material to issue', 'warning');
      return;
    }

    try {
      const order = await createMutation.mutateAsync({
        jobWorkCompanyId,
        rawMaterialId,
        finishedProductId: finishedProductId || undefined,
        expectedReturnDate,
        remarks,
      });

      toast('Job Work Order Created', `Order ${order.jobWorkNumber} generated successfully`, 'success');
      router.push(`/job-work/${order.id}`);
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Unable to create job work order', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <FilePlus className="h-6 w-6 text-primary" />
              <span>Create Job Work Order</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Issue subcontract manufacturing orders to external Job Working Companies
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Preview Badge */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">
              Job Work Order Number (Auto Generated)
            </span>
            <span className="font-mono font-bold text-primary text-lg">JWO-2026-XXXX</span>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Status: CREATED
          </span>
        </div>

        {/* Section 1: Vendor & General Particulars */}
        <Card className="p-6 space-y-5 bg-card border-border">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Job Working Company Details (Subcontractor)</span>
            </h2>
            <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
              Job Working Companies Only
            </span>
          </div>

          <div className="space-y-4">
            <MasterEntityDropdown
              label="Job Working Company / Vendor *"
              entityType="jobWorkCompany"
              placeholder="Select Job Working Vendor..."
              options={companies.map((c) => ({ label: c.companyName, value: c.id, raw: c }))}
              value={jobWorkCompanyId}
              onChange={(val) => setJobWorkCompanyId(val)}
              disabled={isLoadingCompanies}
              required
            />

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" />
                Select Raw Material to Issue *
              </label>
              <Select
                options={[{ label: 'Select Raw Material to Issue...', value: '' }, ...rawMaterialOptions]}
                value={rawMaterialId}
                onChange={(e) => setRawMaterialId(e.target.value)}
                disabled={isLoadingMaterials}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-400" />
                Target Finished Product / Processed Material (Optional)
              </label>
              <Select
                options={finishedProductOptions}
                value={finishedProductId}
                onChange={(e) => setFinishedProductId(e.target.value)}
                disabled={isLoadingMaterials}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Expected Return Date *"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
              />
              <Input
                label="Contract Remarks / Instructions"
                placeholder="e.g. Bleaching, processing, packaging specifications"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/job-work">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={createMutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Create Job Work Order
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function CreateJobWorkOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground font-mono text-sm">
          Loading Job Work Order Form...
        </div>
      }
    >
      <CreateJobWorkOrderContent />
    </Suspense>
  );
}
