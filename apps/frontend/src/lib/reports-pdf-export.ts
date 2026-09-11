'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ReportDateRange,
  JobWorkCompanyReportResponse,
  JobWorkCompanySummary,
  StockValuationReportResponse,
  ProductionEfficiencyReportResponse,
  PayrollExpenseReportResponse,
  CustomerOrdersReportResponse,
  ExecutiveOverviewResponse,
} from '@/types/reports.types';
import { formatCurrency, formatNumber, formatPercent } from './format-utils';

/**
 * Clean text for PDF rendering (replaces unicode dashes/special chars that cause font glitches)
 */
function clean(val: any): string {
  if (val === null || val === undefined || val === '') return '-';
  return String(val).replace(/[—–]/g, '-').trim();
}

/**
 * Safe currency string for jsPDF (uses 'Rs.' instead of unicode ₹ to guarantee clean typography)
 */
function formatRs(amount?: number | string | null): string {
  return `Rs. ${formatCurrency(amount)}`;
}

/**
 * Hook to automatically synchronize table header alignment with column horizontal alignment,
 * ensuring right-aligned numbers have right-aligned headers and center-aligned badges have center-aligned headers.
 */
function syncHeaderAlign(data: any) {
  if (data.section === 'head' && data.column?.styles?.halign) {
    data.cell.styles.halign = data.column.styles.halign;
  }
}

/**
 * Format category name cleanly for printing
 */
function formatCategory(cat?: string | null): string {
  if (!cat) return '-';
  return cat
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Draw branded document header banner
 */
function drawHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  dateRangeStr?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Corporate deep navy header banner
  doc.setFillColor(30, 58, 138); // #1E3A8A
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Emerald accent stripe
  doc.setFillColor(16, 185, 129); // #10B981
  doc.rect(0, 23, pageWidth, 1.5, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SHRI LATHIKKA SURGICALS', 14, 10);

  // Subtitle / Document Type
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(subtitle, 14, 16);

  // Generation timestamp & Date filter
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const genStr = `Generated: ${new Date().toLocaleString('en-IN')}`;
  doc.text(genStr, pageWidth - 14, 10, { align: 'right' });

  if (dateRangeStr) {
    doc.text(`Period: ${dateRangeStr}`, pageWidth - 14, 16, { align: 'right' });
  }

  // Document Title below banner
  const startY = 32;
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, startY);

  return startY + 6;
}

/**
 * Standard footer drawer for pages
 */
function addPageFooters(doc: jsPDF, reportName: string) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('helvetica', 'normal');

    // Left: confidential notice
    doc.text('Shri Lathikka Surgicals ERP - Confidential Internal Ledger', 14, pageHeight - 7);

    // Right: Page numbers
    doc.text(`${reportName} | Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

// ============================================================================
// 1. JOB WORK COMPANY REPORT (LEDGER & ORDERS)
// ============================================================================
export function exportJobWorkLedgerPDF(
  report: JobWorkCompanyReportResponse,
  selectedCompanyName?: string
) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const periodStr = `${report.dateRange.startDate} to ${report.dateRange.endDate}`;
  const subTitle = selectedCompanyName
    ? `Subcontractor Ledger: ${selectedCompanyName}`
    : 'Subcontractor Job Work Volume, Wages & Settlement Ledger';

  let y = drawHeader(doc, 'Job Work Reconciliation & Company Ledger', subTitle, periodStr);

  const summary = report.summary || {
    totalCompanies: report.companies?.length || 0,
    totalOrders: 0,
    totalIssuedWeightKg: 0,
    totalReturnedWeightKg: 0,
    totalScrapWeightKg: 0,
    totalPendingWeightKg: 0,
    totalWagesEarned: 0,
    totalSettledAmount: 0,
    totalOutstandingBalance: 0,
    overallScrapRate: 0,
  };

  // KPI Summary Table
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [
      [
        'Total Companies',
        'Orders Processed',
        'Material Issued',
        'Output Received',
        'Scrap Loss',
        'Scrap Rate',
        'Wages Earned',
        'Settled Amount',
        'Outstanding Balance',
      ],
    ],
    body: [
      [
        String(summary.totalCompanies),
        String(summary.totalOrders),
        `${formatNumber(summary.totalIssuedWeightKg)} Kg`,
        `${formatNumber(summary.totalReturnedWeightKg)} Kg`,
        `${formatNumber(summary.totalScrapWeightKg)} Kg`,
        formatPercent(summary.overallScrapRate),
        formatRs(summary.totalWagesEarned),
        formatRs(summary.totalSettledAmount),
        formatRs(summary.totalOutstandingBalance),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Company Overview Summary Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Company-Wise Work & Financial Breakdown', 14, y);

  const companyRows = (report.companies || []).map((c) => [
    c.companyName,
    c.companyCode,
    c.city || '-',
    String(c.totalOrders),
    `${formatNumber(c.totalIssuedWeightKg)} Kg`,
    `${formatNumber(c.totalReturnedWeightKg)} Kg`,
    `${formatNumber(c.totalScrapWeightKg)} Kg (${formatPercent(c.avgScrapPercentage)})`,
    formatRs(c.totalWagesEarned),
    formatRs(c.totalSettledAmount),
    formatRs(c.totalOutstandingBalance),
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [
      [
        'Company Name',
        'Code',
        'City',
        'Orders',
        'Issued',
        'Returned',
        'Scrap Loss',
        'Wages Earned',
        'Settled',
        'Balance Due',
      ],
    ],
    body: companyRows.length ? companyRows : [['No company data recorded for this range.', '', '', '', '', '', '', '', '', '']],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 48, halign: 'left' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'left' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 27, halign: 'right' },
      7: { cellWidth: 27, halign: 'right' },
      8: { cellWidth: 26, halign: 'right' },
      9: { cellWidth: 29, halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] },
    },
    didParseCell: syncHeaderAlign,
  });

  // Detailed Orders Ledger across companies
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Itemized Orders Ledger', 14, y);

  const orderRows: (string | number)[][] = [];
  (report.companies || []).forEach((c) => {
    (c.orders || []).forEach((o: any) => {
      orderRows.push([
        c.companyName,
        o.orderNumber || o.jobWorkNumber || '-',
        o.challanNumber || '-',
        clean(o.processType),
        clean(o.status),
        formatNumber(o.issuedWeightKg),
        formatNumber(o.returnedWeightKg),
        `${formatNumber(o.scrapWeightKg)} (${formatPercent(o.scrapPercentage)})`,
        formatRs(o.earnedWages ?? o.totalWagesEarned),
        formatRs(o.settledAmount),
        formatRs(o.balancePending ?? o.outstandingBalance),
      ]);
    });
  });

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [
      [
        'Company',
        'Order #',
        'Challan #',
        'Process',
        'Status',
        'Issued (Kg)',
        'Returned (Kg)',
        'Scrap',
        'Wages Earned',
        'Settled',
        'Balance (INR)',
      ],
    ],
    body: orderRows.length ? orderRows : [['No orders recorded for selected period.', '', '', '', '', '', '', '', '', '', '']],
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 36, halign: 'left' },
      1: { cellWidth: 24, halign: 'left' },
      2: { cellWidth: 24, halign: 'left' },
      3: { cellWidth: 26, halign: 'left' },
      4: { cellWidth: 21, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 24, halign: 'right' },
      9: { cellWidth: 22, halign: 'right' },
      10: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, 'Job Work Ledger');
  doc.save(`Job_Work_Ledger_${report.dateRange.startDate}_to_${report.dateRange.endDate}.pdf`);
}

// ============================================================================
// 2. SINGLE JOB WORK COMPANY VENDOR STATEMENT
// ============================================================================
export function exportJobWorkStatementPDF(
  company: JobWorkCompanySummary,
  dateRange: ReportDateRange
) {
  if (!company) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const periodStr = `${dateRange.startDate} to ${dateRange.endDate}`;

  let y = drawHeader(
    doc,
    'Subcontractor Wage & Settlement Statement',
    `Vendor: ${company.companyName} (${company.companyCode})`,
    periodStr
  );

  // Vendor Information Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Information', 18, y + 5);
  doc.text('Reconciliation Period', pageWidth / 2 + 10, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Company: ${company.companyName} [${company.companyCode}]`, 18, y + 10);
  doc.text(`Contact: ${company.contactPerson || '-'} | Phone: ${company.phone || '-'}`, 18, y + 15);
  doc.text(`City: ${company.city || '-'} | GSTIN: ${company.gstin || 'Not Listed'}`, 18, y + 19);

  doc.text(`Period Range: ${periodStr}`, pageWidth / 2 + 10, y + 10);
  doc.text(`Total Orders: ${company.totalOrders} (${company.completedOrders} Completed)`, pageWidth / 2 + 10, y + 15);
  doc.text(`Net Outstanding Balance: ${formatRs(company.totalOutstandingBalance)}`, pageWidth / 2 + 10, y + 19);

  y += 27;

  // KPI Summary Bar
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [
      [
        'Total Issued',
        'Total Returned',
        'Scrap Loss',
        'Avg Scrap Rate',
        'Gross Wages',
        'Settled Paid',
        'Net Due Balance',
      ],
    ],
    body: [
      [
        `${formatNumber(company.totalIssuedWeightKg)} Kg`,
        `${formatNumber(company.totalReturnedWeightKg)} Kg`,
        `${formatNumber(company.totalScrapWeightKg)} Kg`,
        formatPercent(company.avgScrapPercentage),
        formatRs(company.totalWagesEarned),
        formatRs(company.totalSettledAmount),
        formatRs(company.totalOutstandingBalance),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Detailed Order-By-Order Reconciliation', 14, y);

  const orderRows = (company.orders || []).map((o: any) => [
    o.orderNumber || o.jobWorkNumber || '-',
    o.challanNumber || '-',
    clean(o.processType),
    `${formatNumber(o.issuedWeightKg)} kg`,
    `${formatNumber(o.returnedWeightKg)} kg`,
    `${formatNumber(o.scrapWeightKg)} kg (${formatPercent(o.scrapPercentage)})`,
    formatRs(o.earnedWages ?? o.totalWagesEarned),
    formatRs(o.settledAmount),
    formatRs(o.balancePending ?? o.outstandingBalance),
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [
      [
        'Order #',
        'Challan',
        'Process',
        'Issued',
        'Returned',
        'Scrap Loss',
        'Charges Earned',
        'Settled',
        'Pending Balance',
      ],
    ],
    body: orderRows.length ? orderRows : [['No orders recorded for this company.', '', '', '', '', '', '', '', '']],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 22, halign: 'left' },
      1: { cellWidth: 20, halign: 'left' },
      2: { cellWidth: 22, halign: 'left' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 21, halign: 'right' },
      7: { cellWidth: 21, halign: 'right' },
      8: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, `Statement - ${company.companyCode}`);
  doc.save(`Statement_${company.companyCode}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`);
}

// ============================================================================
// 3. STOCK VALUATION & AUDIT REPORT
// ============================================================================
export function exportStockValuationPDF(
  report: StockValuationReportResponse,
  categoryFilter?: string,
  onlyLowStock?: boolean
) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const asOfStr = report.asOfDate ? new Date(report.asOfDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const filterDesc = [
    categoryFilter ? `Category: ${categoryFilter}` : 'All Categories',
    onlyLowStock ? 'Low Stock Items Only' : 'All Stock Items',
  ].join(' | ');

  let y = drawHeader(doc, 'Inventory Stock Valuation & Audit Report', filterDesc, `As of: ${asOfStr}`);

  const summary = report.summary || {
    totalItems: report.items?.length || 0,
    totalValuation: 0,
    lowStockCount: 0,
  };

  // KPI Summary
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Total SKUs in Inventory', 'Total Portfolio Valuation', 'Low Stock Alert Count', 'Active Categories Tracked']],
    body: [
      [
        String(summary.totalItems),
        formatRs(summary.totalValuation),
        String(summary.lowStockCount),
        String(report.categoryBreakdown?.length || 0),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Category Breakdown Table
  if (report.categoryBreakdown && report.categoryBreakdown.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Valuation By Material Category', 14, y);

    const catRows = report.categoryBreakdown.map((c) => [
      formatCategory(c.category),
      String(c.itemCount),
      formatRs(c.valuation),
      summary.totalValuation > 0 ? formatPercent((c.valuation / summary.totalValuation) * 100) : '0%',
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Category Name', 'Item Count', 'Total Valuation', '% Portfolio Share']],
      body: catRows,
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 104, halign: 'left' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 65, halign: 'right' },
        3: { cellWidth: 60, halign: 'right' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Filter items if active
  let items = report.items || [];
  if (categoryFilter) {
    items = items.filter((i) => i.category === categoryFilter);
  }
  if (onlyLowStock) {
    items = items.filter((i) => i.isLowStock);
  }

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Inventory Stock Register (${items.length} items listed)`, 14, y);

  const itemRows = items.map((i) => [
    i.itemCode,
    i.name,
    formatCategory(i.category),
    `${formatNumber(i.currentStock)} ${i.uom || ''}`,
    `${formatNumber(i.reorderLevel)} ${i.uom || ''}`,
    formatRs(i.unitCost),
    formatRs(i.totalValuation),
    i.isLowStock ? 'LOW STOCK' : 'NORMAL',
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Item Code', 'Description / Item Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit Cost', 'Total Value', 'Status']],
    body: itemRows.length ? itemRows : [['No inventory items found matching filter.', '', '', '', '', '', '', '']],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 28, halign: 'left' },
      1: { cellWidth: 68, halign: 'left' },
      2: { cellWidth: 36, halign: 'left' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 23, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, 'Stock Valuation');
  doc.save(`Stock_Valuation_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================================
// 4. PRODUCTION EFFICIENCY & YIELD REPORT
// ============================================================================
export function exportProductionEfficiencyPDF(
  report: ProductionEfficiencyReportResponse,
  activeDept: 'all' | 'gauze' | 'gamjee' = 'all'
) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodStr = `${report.dateRange.startDate} to ${report.dateRange.endDate}`;
  const deptTitle =
    activeDept === 'gauze'
      ? 'Gauze Production Yield Analysis'
      : activeDept === 'gamjee'
      ? 'Gamjee Production Yield Analysis'
      : 'Comprehensive Gauze & Gamjee Production Efficiency';

  let y = drawHeader(doc, 'Production Efficiency & Yield Audit', deptTitle, periodStr);

  const summary = report.summary || {
    totalBatches: 0,
    totalInputWeightKg: 0,
    totalOutputWeightKg: 0,
    totalWastageKg: 0,
    overallYieldRate: 0,
    gauzeBatchesCount: 0,
    gamjeeBatchesCount: 0,
  };

  // KPI Summary Bar
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Total Batches', 'Material Input', 'Output Produced', 'Process Wastage', 'Average Yield Rate']],
    body: [
      [
        String(summary.totalBatches),
        `${formatNumber(summary.totalInputWeightKg)} Kg`,
        `${formatNumber(summary.totalOutputWeightKg)} Kg`,
        `${formatNumber(summary.totalWastageKg)} Kg`,
        formatPercent(summary.overallYieldRate),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Gauze Production Batches Section
  if (activeDept === 'all' || activeDept === 'gauze') {
    const gauze = report.gauzeProduction;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Gauze Production Batches (${gauze?.totalBatches || 0} batches | Avg Yield: ${gauze?.avgYieldRate || 0}%)`, 14, y);

    const gauzeRows = (gauze?.batches || []).map((b) => [
      b.batchNumber,
      clean(b.status),
      `${formatNumber(b.inputQuantity)} kg`,
      `${formatNumber(b.outputQuantity)} kg`,
      formatPercent(b.yieldPercentage),
      b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : '-',
      b.completedDate ? new Date(b.completedDate).toLocaleDateString('en-IN') : 'In Progress',
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Batch Number', 'Status', 'Input Qty', 'Output Qty', 'Yield %', 'Start Date', 'Completion Date']],
      body: gauzeRows.length ? gauzeRows : [['No gauze batches recorded for period.', '', '', '', '', '', '']],
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 34, halign: 'left' },
        1: { cellWidth: 24, halign: 'center' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 29, halign: 'center' },
        6: { cellWidth: 29, halign: 'center' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Gamjee Production Batches Section
  if (activeDept === 'all' || activeDept === 'gamjee') {
    const gamjee = report.gamjeeProduction;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Gamjee Production Batches (${gamjee?.totalBatches || 0} batches | Avg Yield: ${gamjee?.avgYieldRate || 0}%)`, 14, y);

    const gamjeeRows = (gamjee?.batches || []).map((b) => [
      b.batchNumber,
      clean(b.status),
      `${formatNumber(b.productionQuantity)} kg`,
      `${formatNumber(b.outputQuantity)} kg`,
      formatPercent(b.yieldPercentage),
      b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : '-',
      b.completedDate ? new Date(b.completedDate).toLocaleDateString('en-IN') : 'In Progress',
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Batch Number', 'Status', 'Input Qty', 'Output Qty', 'Yield %', 'Start Date', 'Completion Date']],
      body: gamjeeRows.length ? gamjeeRows : [['No gamjee batches recorded for period.', '', '', '', '', '', '']],
      headStyles: { fillColor: [109, 40, 217], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 34, halign: 'left' },
        1: { cellWidth: 24, halign: 'center' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 29, halign: 'center' },
        6: { cellWidth: 29, halign: 'center' },
      },
      didParseCell: syncHeaderAlign,
    });
  }

  addPageFooters(doc, 'Production Efficiency');
  doc.save(`Production_Efficiency_${report.dateRange.startDate}_to_${report.dateRange.endDate}.pdf`);
}

// ============================================================================
// 5. PAYROLL & EXPENSES REPORT
// ============================================================================
export function exportPayrollExpensePDF(report: PayrollExpenseReportResponse) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodStr = `${report.dateRange.startDate} to ${report.dateRange.endDate}`;

  let y = drawHeader(doc, 'Payroll & Workforce Expense Ledger', 'Labor Attendance, Gross Wages & Net Disbursements', periodStr);

  const summary = report.summary || {
    activeStaff: 0,
    attendanceRate: 0,
    presentDaysRecorded: 0,
    totalGrossPayroll: 0,
    totalNetDisbursed: 0,
    totalPayrollRuns: 0,
  };

  // KPI Summary Bar
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Active Staff', 'Attendance Rate', 'Present Punches', 'Gross Payroll', 'Net Disbursed']],
    body: [
      [
        String(summary.activeStaff),
        formatPercent(summary.attendanceRate),
        formatNumber(summary.presentDaysRecorded),
        formatRs(summary.totalGrossPayroll),
        formatRs(summary.totalNetDisbursed),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Attendance Distribution Breakdown
  if (report.attendanceSummary && report.attendanceSummary.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Workforce Attendance Distribution', 14, y);

    const attRows = report.attendanceSummary.map((a) => [
      clean(a.status).replace(/_/g, ' '),
      formatNumber(a.count),
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Status Category', 'Total Recorded Punches / Days']],
      body: attRows,
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 100, halign: 'left' },
        1: { cellWidth: 82, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Payroll Runs Table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Payroll Runs & Disbursement Batches', 14, y);

  const runRows = (report.payrollRuns || []).map((r) => [
    r.payrollCode,
    `${r.month}/${r.year} (${clean(r.periodType)})`,
    clean(r.status),
    String(r.totalEmployees),
    formatRs(r.totalGross),
    formatRs(r.totalNet),
    r.generatedAt ? new Date(r.generatedAt).toLocaleDateString('en-IN') : '-',
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Payroll Code', 'Cycle / Month', 'Status', 'Staff Count', 'Total Gross', 'Net Disbursed', 'Generated Date']],
    body: runRows.length ? runRows : [['No payroll disbursements recorded for period.', '', '', '', '', '', '']],
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      1: { cellWidth: 36, halign: 'left' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 24, halign: 'center' },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, 'Payroll Expenses');
  doc.save(`Payroll_Expenses_${report.dateRange.startDate}_to_${report.dateRange.endDate}.pdf`);
}

// ============================================================================
// 6. CUSTOMER ORDERS REPORT
// ============================================================================
export function exportCustomerOrdersPDF(report: CustomerOrdersReportResponse) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const periodStr = `${report.dateRange.startDate} to ${report.dateRange.endDate}`;

  let y = drawHeader(doc, 'Commercial Customer Orders Report', 'Customer Sales, Fulfillment Rates & Order Register', periodStr);

  const summary = report.summary || {
    totalOrders: 0,
    fulfilledOrders: 0,
    pendingOrders: 0,
    fulfillmentRate: 0,
    totalRevenue: 0,
    deliveredRevenue: 0,
  };

  // KPI Summary Bar
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Total Commercial Revenue', 'Delivered Revenue', 'Orders Placed', 'Fulfilled Orders', 'Pending Orders', 'Fulfillment Rate']],
    body: [
      [
        formatRs(summary.totalRevenue),
        formatRs(summary.deliveredRevenue),
        String(summary.totalOrders),
        String(summary.fulfilledOrders),
        String(summary.pendingOrders),
        formatPercent(summary.fulfillmentRate),
      ],
    ],
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 23, 42],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Top Customers Table
  if (report.topCustomers && report.topCustomers.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Key Customer Accounts Breakdown', 14, y);

    const topRows = report.topCustomers.map((c) => [
      c.customerName,
      String(c.orderCount),
      formatRs(c.totalAmount),
      summary.totalRevenue > 0 ? formatPercent((c.totalAmount / summary.totalRevenue) * 100) : '0%',
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Customer Name / Buyer', 'Orders Placed', 'Total Revenue Contributed', '% Revenue Share']],
      body: topRows,
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 114, halign: 'left' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 65, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 50, halign: 'right' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Commercial Orders Register Table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Commercial Orders Register', 14, y);

  const orderRows = (report.orders || []).map((o) => [
    o.orderNumber,
    o.customerName,
    o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : '-',
    o.deliveryDueDate ? new Date(o.deliveryDueDate).toLocaleDateString('en-IN') : '-',
    String(o.itemCount || 0),
    formatRs(o.totalAmount),
    clean(o.status),
  ]);

  autoTable(doc, {
    startY: y + 2,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['Order Number', 'Customer Account', 'Order Date', 'Due Date', 'Item Units', 'Total Amount', 'Fulfillment Status']],
    body: orderRows.length ? orderRows : [['No commercial orders found for selected period.', '', '', '', '', '', '']],
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 36, halign: 'left' },
      1: { cellWidth: 75, halign: 'left' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 44, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 38, halign: 'center' },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, 'Customer Orders');
  doc.save(`Customer_Orders_${report.dateRange.startDate}_to_${report.dateRange.endDate}.pdf`);
}

// ============================================================================
// 7. EXECUTIVE OVERVIEW REPORT
// ============================================================================
export function exportExecutiveOverviewPDF(report: ExecutiveOverviewResponse) {
  if (!report) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodStr = `${report.dateRange.startDate} to ${report.dateRange.endDate}`;

  let y = drawHeader(doc, 'Executive Operations & Financial Overview', 'Holistic Plant Performance, Inventory, Production & Payroll Scorecard', periodStr);

  const kpis = report.kpis;

  // Operational Pillars Matrix
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Operational Pillar', 'Primary Metric', 'Secondary Metrics & Status']],
    body: [
      [
        'Job Work Subcontracting',
        `${formatNumber(kpis.totalJobWorkOrders)} Orders Processed`,
        `Material Returned: ${formatNumber(kpis.jobWorkReturnedKg)} / ${formatNumber(kpis.jobWorkIssuedKg)} Kg\nWages: ${formatRs(kpis.jobWorkWagesEarned)} | Pending: ${formatRs(kpis.jobWorkPendingSettlement)}`,
      ],
      [
        'Inventory & Stock Valuation',
        formatRs(kpis.totalInventoryValuation),
        `Portfolio Value Across All Warehouses\nLow Stock Warnings: ${kpis.lowStockAlertCount} SKUs below reorder point`,
      ],
      [
        'Manufacturing & Production',
        `${formatPercent(kpis.productionYieldRate)} Yield Rate`,
        `Total Batches: ${formatNumber(kpis.totalBatches)} completed\nGauze & Gamjee composite efficiency`,
      ],
      [
        'Workforce & Payroll',
        formatRs(kpis.payrollDisbursed),
        `Active Headcount: ${formatNumber(kpis.activeStaffCount)} employees\nWorkforce Attendance: ${formatPercent(kpis.attendanceRate)}`,
      ],
      [
        'Commercial Sales & Orders',
        formatRs(kpis.ordersRevenue),
        `Fulfillment Success Rate: ${formatPercent(kpis.orderFulfillmentRate)}\nDirect B2B Hospital & Clinic Orders`,
      ],
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'bold', cellWidth: 45, halign: 'center' },
      2: { cellWidth: 87 },
    },
    didParseCell: syncHeaderAlign,
  });

  addPageFooters(doc, 'Executive Overview');
  doc.save(`Executive_Overview_${report.dateRange.startDate}_to_${report.dateRange.endDate}.pdf`);
}

// ============================================================================
// 8. MASTER ALL-REPORTS CONSOLIDATED AUDIT PACK (PDF)
// ============================================================================
export interface ConsolidatedAuditData {
  dateRange: ReportDateRange;
  overview?: ExecutiveOverviewResponse;
  jobWork?: JobWorkCompanyReportResponse;
  stock?: StockValuationReportResponse;
  production?: ProductionEfficiencyReportResponse;
  payroll?: PayrollExpenseReportResponse;
  orders?: CustomerOrdersReportResponse;
}

export function exportAllReportsConsolidatedPDF(data: ConsolidatedAuditData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const periodStr = `${data.dateRange.startDate} to ${data.dateRange.endDate}`;

  // Page 1: Executive Overview & Cover
  let y = drawHeader(
    doc,
    'Comprehensive Manufacturing & Financial Audit Dossier',
    'Integrated Executive Report: Job Work, Inventory, Production, Payroll & Commercial Operations',
    periodStr
  );

  // Section 1: Executive KPIs
  if (data.overview?.kpis) {
    const k = data.overview.kpis;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. Executive Operations & KPI Summary', 14, y);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      head: [['Job Work Orders', 'Job Work Wages', 'Inventory Valuation', 'Production Yield', 'Payroll Disbursed', 'Commercial Revenue']],
      body: [
        [
          String(k.totalJobWorkOrders),
          formatRs(k.jobWorkWagesEarned),
          formatRs(k.totalInventoryValuation),
          formatPercent(k.productionYieldRate),
          formatRs(k.payrollDisbursed),
          formatRs(k.ordersRevenue),
        ],
      ],
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, fontStyle: 'bold', halign: 'center', textColor: [15, 23, 42] },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Section 2: Job Work Subcontracting
  if (data.jobWork) {
    const jSummary = data.jobWork.summary;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. Job Work Subcontractor Ledger Summary', 14, y);

    const jRows = (data.jobWork.companies || []).map((c) => [
      c.companyName,
      c.companyCode,
      String(c.totalOrders),
      `${formatNumber(c.totalIssuedWeightKg)} kg`,
      `${formatNumber(c.totalReturnedWeightKg)} kg`,
      `${formatNumber(c.totalScrapWeightKg)} kg (${formatPercent(c.avgScrapPercentage)})`,
      formatRs(c.totalWagesEarned),
      formatRs(c.totalSettledAmount),
      formatRs(c.totalOutstandingBalance),
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Vendor Name', 'Code', 'Orders', 'Issued Qty', 'Returned Qty', 'Scrap Loss', 'Wages Earned', 'Settled Paid', 'Pending Balance']],
      body: jRows.length ? jRows : [['No job work activity recorded.', '', '', '', '', '', '', '', '']],
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 48, halign: 'left' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 26, halign: 'right' },
        5: { cellWidth: 27, halign: 'right' },
        6: { cellWidth: 26, halign: 'right' },
        7: { cellWidth: 26, halign: 'right' },
        8: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Section 3: Stock Valuation & Audit
  if (data.stock) {
    // Add page break for stock valuation if space is tight
    if (y > 130) {
      doc.addPage();
      y = drawHeader(doc, 'Comprehensive Audit Dossier (Continued)', 'Inventory Stock & Production Yields', periodStr);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`3. Inventory Stock Valuation (Total Value: ${formatRs(data.stock.summary?.totalValuation)} | ${data.stock.summary?.lowStockCount || 0} Low Stock Alerts)`, 14, y);

    const sRows = (data.stock.items || []).slice(0, 30).map((i) => [
      i.itemCode,
      i.name,
      formatCategory(i.category),
      `${formatNumber(i.currentStock)} ${i.uom || ''}`,
      formatRs(i.unitCost),
      formatRs(i.totalValuation),
      i.isLowStock ? 'LOW STOCK' : 'NORMAL',
    ]);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'striped',
      head: [['Item Code', 'Item Name', 'Category', 'Stock Level', 'Unit Cost', 'Total Valuation', 'Status']],
      body: sRows.length ? sRows : [['No inventory records.', '', '', '', '', '', '']],
      headStyles: { fillColor: [217, 119, 6], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 28, halign: 'left' },
        1: { cellWidth: 70, halign: 'left' },
        2: { cellWidth: 38, halign: 'left' },
        3: { cellWidth: 33, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 42, halign: 'right', fontStyle: 'bold' },
        6: { cellWidth: 28, halign: 'center' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Section 4: Production Efficiency
  if (data.production) {
    if (y > 130) {
      doc.addPage();
      y = drawHeader(doc, 'Comprehensive Audit Dossier (Continued)', 'Production Yields & Workforce Payroll', periodStr);
    }

    const pSum = data.production.summary;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`4. Manufacturing Yield & Wastage (Total Batches: ${pSum?.totalBatches || 0} | Overall Yield: ${formatPercent(pSum?.overallYieldRate)})`, 14, y);

    autoTable(doc, {
      startY: y + 2,
      margin: { left: 14, right: 14 },
      theme: 'grid',
      head: [['Department', 'Batches Run', 'Input Consumed', 'Finished Goods', 'Process Scrap', 'Average Yield Rate']],
      body: [
        [
          'Gauze Production',
          String(data.production.gauzeProduction?.totalBatches || 0),
          `${formatNumber(data.production.gauzeProduction?.inputKg)} kg`,
          `${formatNumber(data.production.gauzeProduction?.outputKg)} kg`,
          `${formatNumber(data.production.gauzeProduction?.wastageKg)} kg`,
          formatPercent(data.production.gauzeProduction?.avgYieldRate),
        ],
        [
          'Gamjee Production',
          String(data.production.gamjeeProduction?.totalBatches || 0),
          `${formatNumber(data.production.gamjeeProduction?.inputKg)} kg`,
          `${formatNumber(data.production.gamjeeProduction?.outputKg)} kg`,
          `${formatNumber(data.production.gamjeeProduction?.wastageKg)} kg`,
          formatPercent(data.production.gamjeeProduction?.avgYieldRate),
        ],
      ],
      headStyles: { fillColor: [109, 40, 217], textColor: 255, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 45, halign: 'left' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 48, halign: 'right' },
        3: { cellWidth: 48, halign: 'right' },
        4: { cellWidth: 48, halign: 'right' },
        5: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: syncHeaderAlign,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Section 5: Payroll & Customer Orders
  if (data.payroll || data.orders) {
    if (y > 120) {
      doc.addPage();
      y = drawHeader(doc, 'Comprehensive Audit Dossier (Continued)', 'Workforce Payroll & Commercial Sales', periodStr);
    }

    if (data.payroll) {
      const paySum = data.payroll.summary;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`5. Payroll & Labor Expenses (Active Staff: ${paySum?.activeStaff || 0} | Total Net Paid: ${formatRs(paySum?.totalNetDisbursed)})`, 14, y);

      const payRows = (data.payroll.payrollRuns || []).map((r) => [
        r.payrollCode,
        `${r.month}/${r.year} (${clean(r.periodType)})`,
        String(r.totalEmployees),
        formatRs(r.totalGross),
        formatRs(r.totalNet),
        clean(r.status),
      ]);

      autoTable(doc, {
        startY: y + 2,
        margin: { left: 14, right: 14 },
        theme: 'striped',
        head: [['Payroll Code', 'Cycle', 'Staff Headcount', 'Gross Payroll', 'Net Disbursed', 'Status']],
        body: payRows.length ? payRows : [['No payroll disbursements recorded.', '', '', '', '', '']],
        headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 44, halign: 'left' },
          1: { cellWidth: 55, halign: 'left' },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 45, halign: 'right' },
          4: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
          5: { cellWidth: 40, halign: 'center' },
        },
        didParseCell: syncHeaderAlign,
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    if (data.orders) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`6. Commercial Orders (Revenue: ${formatRs(data.orders.summary?.totalRevenue)} | Fulfillment: ${formatPercent(data.orders.summary?.fulfillmentRate)})`, 14, y);

      const topCustRows = (data.orders.topCustomers || []).map((c) => [
        c.customerName,
        String(c.orderCount),
        formatRs(c.totalAmount),
      ]);

      autoTable(doc, {
        startY: y + 2,
        margin: { left: 14, right: 14 },
        theme: 'striped',
        head: [['Customer Name', 'Order Count', 'Total Sales Revenue']],
        body: topCustRows.length ? topCustRows : [['No customer orders recorded.', '', '']],
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 129, halign: 'left' },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 90, halign: 'right', fontStyle: 'bold' },
        },
        didParseCell: syncHeaderAlign,
      });
    }
  }

  addPageFooters(doc, 'Comprehensive IMS Audit Pack');
  doc.save(`All_Reports_Audit_Pack_${data.dateRange.startDate}_to_${data.dateRange.endDate}.pdf`);
}
