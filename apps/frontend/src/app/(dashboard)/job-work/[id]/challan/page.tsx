'use client';

import React, { use } from 'react';
import { motion } from 'framer-motion';
import { useJobWorkOrderDetail } from '@/hooks/useJobWork';
import { DeliveryChallanPDF } from '@/components/job-work/delivery-challan-pdf';

export default function ChallanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading } = useJobWorkOrderDetail(id);

  if (isLoading || !order) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-sm">
        Loading Delivery Challan PDF...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DeliveryChallanPDF order={order} />
    </motion.div>
  );
}
