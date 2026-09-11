'use client';

import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingDown,
  Scale,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { JobWorkCompanyReportResponse, JobWorkCompanySummary, JobWorkOrderBreakdown } from '@/types/reports.types';
import { exportToCsv } from '@/lib/export-utils';
import { exportJobWorkLedgerPDF, exportJobWorkStatementPDF } from '@/lib/reports-pdf-export';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format-utils';

interface JobWorkCompanyReportViewProps {
  data?: JobWorkCompanyReportResponse;
  isLoading: boolean;
  selectedCompanyId: string;
  onSelectCompanyId: (id: string) => void;
  companiesList: { id: string; companyName: string }[];
}

export function JobWorkCompanyReportView({
  data,
  isLoading,
  selectedCompanyId,
  onSelectCompanyId,
  companiesList,
}: JobWorkCompanyReportViewProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [statementModalCompany, setStatementModalCompany] = useState<JobWorkCompanySummary | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCompanies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const summary = data?.summary || {
    totalOrders: 0,
    totalCompanies: 0,
    totalIssuedWeightKg: 0,
    totalReturnedWeightKg: 0,
    totalScrapWeightKg: 0,
    totalPendingWeightKg: 0,
    totalWagesEarned: 0,
    totalSettledAmount: 0,
    totalOutstandingBalance: 0,
    overallScrapRate: 0,
  };

  const rawCompanies = Array.isArray(data?.companies)
    ? data.companies
    : Array.isArray((data as any)?.companyBreakdown)
    ? (data as any).companyBreakdown
    : [];

  const companies: JobWorkCompanySummary[] = rawCompanies.map((c: any) => ({
    companyId: c.companyId || c.id || '',
    companyName: c.companyName || c.name || 'Unassigned Vendor',
    companyCode: c.companyCode || (c.companyName || 'JW').substring(0, 4).toUpperCase(),
    contactPerson: c.contactPerson || undefined,
    phone: c.phone || undefined,
    gstin: c.gstin || undefined,
    city: c.city || undefined,
    processTypes: Array.isArray(c.processTypes) ? c.processTypes : [],
    totalOrders: c.totalOrders ?? c.ordersCount ?? (Array.isArray(c.orders) ? c.orders.length : 0),
    completedOrders: c.completedOrders ?? 0,
    pendingOrders: c.pendingOrders ?? 0,
    totalIssuedWeightKg: c.totalIssuedWeightKg ?? c.issuedWeightKg ?? 0,
    totalReturnedWeightKg: c.totalReturnedWeightKg ?? c.returnedWeightKg ?? 0,
    totalScrapWeightKg: c.totalScrapWeightKg ?? c.wastageWeightKg ?? 0,
    totalPendingWeightKg: c.totalPendingWeightKg ?? c.pendingWeightKg ?? 0,
    avgScrapPercentage: c.avgScrapPercentage ?? c.scrapPercentage ?? 0,
    totalWagesEarned: c.totalWagesEarned ?? c.wagesEarned ?? 0,
    totalSettledAmount: c.totalSettledAmount ?? c.settledAmount ?? 0,
    totalOutstandingBalance: c.totalOutstandingBalance ?? c.outstandingBalance ?? 0,
    orders: Array.isArray(c.orders) ? c.orders : [],
  }));

  const dateRange = data?.dateRange || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  const completedOrdersCount = companies.reduce((s, c) => s + (Number(c.completedOrders) || 0), 0);
  const pendingOrdersCount = companies.reduce((s, c) => s + (Number(c.pendingOrders) || 0), 0);

  const handleExportSummaryCsv = () => {
    if (!companies.length) return;

    const rows = companies.map((c) => ({
      'Company Name': c.companyName,
      'Company Code': c.companyCode,
      'Contact Person': c.contactPerson || '',
      Phone: c.phone || '',
      City: c.city || '',
      GSTIN: c.gstin || '',
      'Total Orders': c.totalOrders,
      'Completed Orders': c.completedOrders,
      'Pending Orders': c.pendingOrders,
      'Issued Weight (Kg)': c.totalIssuedWeightKg,
      'Returned Weight (Kg)': c.totalReturnedWeightKg,
      'Scrap Weight (Kg)': c.totalScrapWeightKg,
      'Scrap %': `${c.avgScrapPercentage}%`,
      'Earned Wages (₹)': c.totalWagesEarned,
      'Settled Amount (₹)': c.totalSettledAmount,
      'Balance Pending (₹)': c.totalOutstandingBalance,
    }));

    exportToCsv(
      `JobWork_Vendors_Summary_${dateRange.startDate}_to_${dateRange.endDate}`,
      rows
    );
  };

  const handleExportDetailedLedgerCsv = () => {
    if (!companies.length) return;

    const rows: Record<string, any>[] = [];
    companies.forEach((c) => {
      (c.orders || []).forEach((o) => {
        rows.push({
          'Company Name': c.companyName,
          'Company Code': c.companyCode,
          'Order Number': o.orderNumber || (o as any).jobWorkNumber || '',
          'Challan Number': o.challanNumber || '',
          'Process Type': o.processType || '',
          Status: o.status || '',
          'Order Date': o.createdAt ? o.createdAt.split('T')[0] : '',
          'Closed Date': o.closedAt ? o.closedAt.split('T')[0] : 'Open',
          'Issued Weight (Kg)': o.issuedWeightKg ?? 0,
          'Returned Weight (Kg)': o.returnedWeightKg ?? 0,
          'Scrap Weight (Kg)': o.scrapWeightKg ?? 0,
          'Scrap %': `${o.scrapPercentage ?? 0}%`,
          'Earned Wages (₹)': o.earnedWages ?? (o as any).totalWagesEarned ?? 0,
          'Settled Amount (₹)': o.settledAmount ?? 0,
          'Balance Pending (₹)': o.balancePending ?? (o as any).outstandingBalance ?? 0,
        });
      });
    });

    exportToCsv(
      `JobWork_Detailed_Ledger_${dateRange.startDate}_to_${dateRange.endDate}`,
      rows
    );
  };

  const handleExportLedgerPdf = () => {
    if (!data) return;
    const selectedCompany = companiesList.find((c) => c.id === selectedCompanyId)?.companyName;
    exportJobWorkLedgerPDF(data, selectedCompany);
  };

  const handleExportStatementPdf = (company: JobWorkCompanySummary) => {
    exportJobWorkStatementPDF(company, dateRange);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-muted/60 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-muted/40 rounded-xl"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No report data available for selected filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        {/* Vendor Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Select Vendor:</span>
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => onSelectCompanyId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none w-full sm:w-64"
          >
            <option value="">All Job Work Companies ({companiesList.length})</option>
            {companiesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLedgerPdf}
            className="text-xs gap-1.5 whitespace-nowrap text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Export Ledger PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummaryCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Vendor Summary CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportDetailedLedgerCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <Receipt className="h-3.5 w-3.5 text-blue-600" />
            <span>Full Orders Ledger CSV</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Orders */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-muted/20">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Orders Processed
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-foreground">{formatNumber(summary.totalOrders)}</span>
            <span className="text-[11px] text-muted-foreground">across {summary.totalCompanies ?? companies.length} co.</span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{formatNumber(completedOrdersCount)} Done</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{formatNumber(pendingOrdersCount)} Active</span>
          </div>
        </Card>

        {/* Issued Weight */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-muted/20">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Material Issued
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              {formatNumber(summary.totalIssuedWeightKg)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Kg</span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Dispatched for processing</div>
        </Card>

        {/* Returned Weight */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-muted/20">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Received Output
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(summary.totalReturnedWeightKg)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Kg</span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {Number(summary.totalIssuedWeightKg) > 0
              ? `${Math.round((Number(summary.totalReturnedWeightKg) / Number(summary.totalIssuedWeightKg)) * 100)}% return rate`
              : '0%'}
          </div>
        </Card>

        {/* Scrap & Wastage */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-muted/20">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            Scrap Loss
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl sm:text-2xl font-bold ${Number(summary.overallScrapRate) > 4 ? 'text-amber-600' : 'text-foreground'}`}>
              {formatNumber(summary.totalScrapWeightKg)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Kg</span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1">
            <span className={`font-semibold ${Number(summary.overallScrapRate) > 4 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {formatPercent(summary.overallScrapRate)} avg scrap
            </span>
          </div>
        </Card>

        {/* Wages / Charges Earned */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-emerald-500/5 border-emerald-500/20">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Wages Earned
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              ₹{formatCurrency(summary.totalWagesEarned)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Gross processing charges</div>
        </Card>

        {/* Outstanding Balance */}
        <Card hoverElevation={false} className="p-3 sm:p-4 bg-amber-500/5 border-amber-500/20">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            Pending Balance
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{formatCurrency(summary.totalOutstandingBalance)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Settled: ₹{formatCurrency(summary.totalSettledAmount)}
          </div>
        </Card>
      </div>

      {/* Companies Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <span>Company Performance & Financial Ledger</span>
            <span className="text-xs font-normal text-muted-foreground">
              ({companies.length} {companies.length === 1 ? 'company' : 'companies'} recorded)
            </span>
          </h2>
        </div>

        {companies.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-xl">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No job work activity found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No job work orders match the selected date range ({dateRange.startDate} to {dateRange.endDate}).
            </p>
          </div>
        ) : (
          companies.map((company) => {
            const isExpanded = expandedCompanies[company.companyId] ?? true;
            const orders = Array.isArray(company.orders) ? company.orders : [];
            const isBalancePositive = Number(company.totalOutstandingBalance) > 0;

            return (
              <Card key={company.companyId} hoverElevation={false} className="overflow-hidden border border-border">
                {/* Header Row */}
                <div className="p-4 sm:p-5 bg-card border-b border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-foreground">
                        {company.companyName}
                      </span>
                      <Badge variant="neutral">{company.companyCode}</Badge>
                      {company.city && (
                        <span className="text-xs text-muted-foreground">📍 {company.city}</span>
                      )}
                      {company.phone && (
                        <span className="text-xs text-muted-foreground font-mono">📞 {company.phone}</span>
                      )}
                    </div>
                    {company.gstin && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-1">
                        GSTIN: {company.gstin}
                      </p>
                    )}
                    {company.processTypes?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {company.processTypes.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            {String(p).replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial & Work Pill Metrics */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-muted/40 p-2.5 sm:p-3 rounded-xl border border-border/60">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Wages Earned</div>
                      <div className="text-sm sm:text-base font-bold text-foreground">
                        ₹{formatCurrency(company.totalWagesEarned)}
                      </div>
                    </div>
                    <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Settled</div>
                      <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{formatCurrency(company.totalSettledAmount)}
                      </div>
                    </div>
                    <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Balance Pending</div>
                      <div className={`text-sm sm:text-base font-bold ${isBalancePositive ? 'text-amber-600' : 'text-foreground'}`}>
                        ₹{formatCurrency(company.totalOutstandingBalance)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExportStatementPdf(company)}
                        className="text-xs h-8 gap-1 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                        title="Download PDF statement for this vendor"
                      >
                        <FileDown className="h-3.5 w-3.5 text-rose-500" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setStatementModalCompany(company)}
                        className="text-xs h-8 gap-1"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Statement</span>
                      </Button>
                      <button
                        onClick={() => toggleExpand(company.companyId)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title={isExpanded ? 'Collapse orders' : 'Expand orders'}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-bar: Physical volume recap */}
                <div className="px-4 py-2 bg-muted/20 border-b border-border text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>
                      Orders: <strong className="text-foreground">{formatNumber(company.totalOrders)}</strong> ({formatNumber(company.completedOrders)} completed)
                    </span>
                    <span>•</span>
                    <span>
                      Issued: <strong className="text-foreground">{formatNumber(company.totalIssuedWeightKg)}</strong> kg
                    </span>
                    <span>•</span>
                    <span>
                      Returned: <strong className="text-foreground">{formatNumber(company.totalReturnedWeightKg)}</strong> kg
                    </span>
                    <span>•</span>
                    <span>
                      Scrap:{' '}
                      <strong className={Number(company.avgScrapPercentage) > 4 ? 'text-rose-600 font-bold' : 'text-foreground'}>
                        {formatNumber(company.totalScrapWeightKg)} kg ({formatPercent(company.avgScrapPercentage)})
                      </strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground italic">
                    Period: {dateRange.startDate} to {dateRange.endDate}
                  </div>
                </div>

                {/* Orders Breakdown Table (Expandable) */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                          <th className="py-2.5 px-3">Order / Challan</th>
                          <th className="py-2.5 px-3">Process</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Issued (Kg)</th>
                          <th className="py-2.5 px-3 text-right">Returned (Kg)</th>
                          <th className="py-2.5 px-3 text-right">Scrap (Kg / %)</th>
                          <th className="py-2.5 px-3 text-right">Earned Wages (₹)</th>
                          <th className="py-2.5 px-3 text-right">Settled (₹)</th>
                          <th className="py-2.5 px-3 text-right">Pending (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-muted-foreground">
                              No orders found for this company in the given period.
                            </td>
                          </tr>
                        ) : (
                          orders.map((o: any) => (
                            <tr key={o.id || o.orderNumber} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-foreground">{o.orderNumber || o.jobWorkNumber || '—'}</div>
                                {o.challanNumber && (
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    Challan: {o.challanNumber}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-foreground">{o.processType || 'Processing'}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge
                                  variant={
                                    o.status === 'COMPLETED' || o.status === 'CLOSED'
                                      ? 'success'
                                      : o.status === 'CANCELLED'
                                      ? 'error'
                                      : 'warning'
                                  }
                                >
                                  {String(o.status || 'ACTIVE').replace(/_/g, ' ')}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {formatNumber(o.issuedWeightKg)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                {formatNumber(o.returnedWeightKg)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                <span className={Number(o.scrapPercentage) > 4 ? 'text-rose-600 font-bold' : 'text-muted-foreground'}>
                                  {formatNumber(o.scrapWeightKg)} kg ({formatPercent(o.scrapPercentage)})
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                                ₹{formatCurrency(o.earnedWages ?? o.totalWagesEarned)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                                ₹{formatCurrency(o.settledAmount)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                                ₹{formatCurrency(o.balancePending ?? o.outstandingBalance)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Printable / Audit Statement Modal */}
      {statementModalCompany && (
        <Modal
          isOpen={Boolean(statementModalCompany)}
          onClose={() => setStatementModalCompany(null)}
          size="4xl"
          title={`Vendor Wage & Settlement Statement — ${statementModalCompany.companyName}`}
          description={`Period: ${dateRange.startDate} to ${dateRange.endDate} | Statement for Subcontractor Work Reconciliation`}
        >
          <div className="space-y-6 text-foreground print:p-0">
            {/* Header info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <h4 className="font-bold text-sm text-foreground">{statementModalCompany.companyName}</h4>
                <p className="text-muted-foreground">Code: {statementModalCompany.companyCode}</p>
                {statementModalCompany.contactPerson && (
                  <p className="text-muted-foreground">Contact: {statementModalCompany.contactPerson}</p>
                )}
                {statementModalCompany.phone && (
                  <p className="text-muted-foreground font-mono">Phone: {statementModalCompany.phone}</p>
                )}
                {statementModalCompany.city && (
                  <p className="text-muted-foreground">City: {statementModalCompany.city}</p>
                )}
              </div>
              <div className="sm:text-right">
                <p className="font-semibold text-foreground">Manufacturing Plant IMS Statement</p>
                <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
                <p className="text-muted-foreground font-mono">GSTIN: {statementModalCompany.gstin || 'Not Listed'}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-background border border-border rounded-lg">
                  <span className="text-[11px] text-muted-foreground">Net Outstanding Balance:</span>{' '}
                  <span className="text-sm font-bold text-amber-600">
                    ₹{formatCurrency(statementModalCompany.totalOutstandingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Weight Summary Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Total Issued</span>
                <span className="text-base font-bold">{formatNumber(statementModalCompany.totalIssuedWeightKg)} Kg</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Returned Fabric</span>
                <span className="text-base font-bold text-emerald-600">
                  {formatNumber(statementModalCompany.totalReturnedWeightKg)} Kg
                </span>
              </div>
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Gross Wages</span>
                <span className="text-base font-bold text-foreground">
                  ₹{formatCurrency(statementModalCompany.totalWagesEarned)}
                </span>
              </div>
              <div className="p-3 bg-muted/20 border border-border rounded-lg">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Settled Paid</span>
                <span className="text-base font-bold text-emerald-600">
                  ₹{formatCurrency(statementModalCompany.totalSettledAmount)}
                </span>
              </div>
            </div>

            {/* Itemized statement rows */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-[11px] font-semibold text-muted-foreground">
                    <th className="py-2 px-3">Order / Challan</th>
                    <th className="py-2 px-3">Process</th>
                    <th className="py-2 px-3 text-right">Returned Qty</th>
                    <th className="py-2 px-3 text-right">Scrap</th>
                    <th className="py-2 px-3 text-right">Charges Earned</th>
                    <th className="py-2 px-3 text-right">Settled</th>
                    <th className="py-2 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(statementModalCompany.orders || []).map((o: any) => (
                    <tr key={o.id || o.orderNumber}>
                      <td className="py-2 px-3">
                        <span className="font-semibold">{o.orderNumber || o.jobWorkNumber}</span>
                        {o.challanNumber && (
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            {o.challanNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">{o.processType}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatNumber(o.returnedWeightKg)} kg</td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                        {formatNumber(o.scrapWeightKg)} kg ({formatPercent(o.scrapPercentage)})
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium">
                        ₹{formatCurrency(o.earnedWages ?? o.totalWagesEarned)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600">
                        ₹{formatCurrency(o.settledAmount)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">
                        ₹{formatCurrency(o.balancePending ?? o.outstandingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportStatementPdf(statementModalCompany)}
                className="gap-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <FileDown className="h-4 w-4 text-rose-500" />
                <span>Download PDF Statement</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Statement</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStatementModalCompany(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
