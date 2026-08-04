'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Plus,
  Filter,
  RefreshCw,
  QrCode,
  ArrowUpRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Scissors,
  PackageCheck,
  Building2,
} from 'lucide-react';
import {
  rollTrackingService,
  CottonRoll,
  RollStatus,
  RollStage,
  RollStats,
} from '@/services/roll-tracking.service';

export default function RollTrackingPage() {
  const [rolls, setRolls] = useState<CottonRoll[]>([]);
  const [stats, setStats] = useState<RollStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RollStatus | ''>('');
  const [selectedStage, setSelectedStage] = useState<RollStage | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status Change Dialog state
  const [statusModalRoll, setStatusModalRoll] = useState<CottonRoll | null>(null);
  const [newStatus, setNewStatus] = useState<RollStatus>('RAW_RECEIVED');
  const [newLocation, setNewLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  // Quick New Roll Intake Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialName: 'Bleached Gauze Fabric Roll',
    batchNumber: 'BAT-2026-08',
    widthInches: 48,
    lengthMeters: 500,
    weightKg: 42.5,
    gsm: 30,
    stage: 'GREY_FABRIC_ROLL' as RollStage,
    status: 'RAW_RECEIVED' as RollStatus,
    currentLocation: 'RM Warehouse - Bin A-12',
  });
  const [creating, setCreating] = useState(false);

  const fetchRolls = async () => {
    setLoading(true);
    try {
      const [rollRes, statRes] = await Promise.all([
        rollTrackingService.getRolls({
          search: search || undefined,
          status: selectedStatus || undefined,
          stage: selectedStage || undefined,
          page,
          limit: 15,
        }),
        rollTrackingService.getRollStats(),
      ]);

      setRolls(rollRes.data);
      setTotalPages(rollRes.meta.totalPages);
      setTotalCount(rollRes.meta.total);
      setStats(statRes);
    } catch (err) {
      console.error('Failed to load rolls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolls();
  }, [search, selectedStatus, selectedStage, page]);

  const handleUpdateStatus = async () => {
    if (!statusModalRoll) return;
    setUpdating(true);
    try {
      await rollTrackingService.updateRollStatus(statusModalRoll.rollNumber, {
        status: newStatus,
        location: newLocation || statusModalRoll.currentLocation,
        remarks,
        performedBy: 'Floor Supervisor',
      });
      setStatusModalRoll(null);
      fetchRolls();
    } catch (err) {
      console.error('Failed to update roll status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await rollTrackingService.createRoll(formData);
      setCreateModalOpen(false);
      fetchRolls();
    } catch (err) {
      console.error('Failed to create roll:', err);
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: RollStatus) => {
    const statusMap: Record<RollStatus, { label: string; bg: string; text: string }> = {
      RAW_RECEIVED: { label: 'Raw Received', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
      STORED_IN_RM: { label: 'Stored in RM', bg: 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30', text: 'text-[#3ECF8E]' },
      ISSUED_TO_JOBWORK: { label: 'Issued to Jobwork', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
      PROCESS_IN_PROGRESS: { label: 'Processing', bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' },
      RETURNED_FROM_JOBWORK: { label: 'Returned Jobwork', bg: 'bg-teal-500/10 border-teal-500/30', text: 'text-teal-400' },
      QC_PENDING: { label: 'QC Pending', bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400' },
      QC_APPROVED: { label: 'QC Approved', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
      QC_REJECTED: { label: 'QC Rejected', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' },
      IN_PRODUCTION: { label: 'In Production', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400' },
      CONVERTED: { label: 'Converted', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' },
      PACKED: { label: 'Packed', bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400' },
      DISPATCHED: { label: 'Dispatched', bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400' },
      SCRAPPED: { label: 'Scrapped', bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
    };

    const style = statusMap[status] || { label: status, bg: 'bg-secondary', text: 'text-foreground' };
    return (
      <span className={`px-2.5 py-1 rounded-sm border text-[11px] font-mono font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-[#3ECF8E]/10 p-2 rounded-xl text-[#3ECF8E]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Serialized Cotton Roll Engine
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Item-level Roll Lineage, Job Work Subcontracting & QC Ledger
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRolls}
            className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#0F1117] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Intake New Cotton Roll
          </button>
        </div>
      </div>

      {/* SDLC Roll Lifecycle 5-Stage Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
            Roll Engine SDLC Lifecycle Stages
          </span>
          <span className="text-[#3ECF8E] font-bold">1-Tap Filter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
          {[
            { status: 'RAW_RECEIVED', label: '1. Raw Inward', desc: 'Received at RM' },
            { status: 'ISSUED_TO_JOBWORK', label: '2. Jobwork Dispatch', desc: 'At Bleaching Subcontractor' },
            { status: 'RETURNED_FROM_JOBWORK', label: '3. Jobwork Return', desc: 'Bleached Gauze Received' },
            { status: 'QC_APPROVED', label: '4. QC Approved', desc: 'Passed GSM & Absorbency' },
            { status: 'IN_PRODUCTION', label: '5. Cut & Dispatch', desc: 'Bandage / Gamjee Units' },
          ].map((st) => (
            <button
              key={st.status}
              onClick={() => setSelectedStatus(selectedStatus === st.status ? '' : (st.status as RollStatus))}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedStatus === st.status
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E] text-[#3ECF8E] font-bold shadow-xs'
                  : 'bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground'
              }`}
            >
              <p className="font-bold text-foreground text-xs">{st.label}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{st.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-sm bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Total Tracked Rolls</span>
            <Layers className="h-4 w-4 text-[#3ECF8E]" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{stats?.totalRolls || 0}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Aggregate Weight: <span className="text-[#3ECF8E] font-semibold">{Number(stats?.totalWeightKg || 0).toFixed(1)} kg</span>
          </p>
        </div>

        <div className="p-4 rounded-sm bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>At Job Workers</span>
            <Truck className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {stats?.statusBreakdown.find((s) => s.currentStatus === 'ISSUED_TO_JOBWORK')?._count._all || 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">Bleaching & Scouring Subcontracting</p>
        </div>

        <div className="p-4 rounded-sm bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>QC Approved Rolls</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {stats?.statusBreakdown.find((s) => s.currentStatus === 'QC_APPROVED')?._count._all || 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">Ready for Converting & Slitting</p>
        </div>

        <div className="p-4 rounded-sm bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>In Production / Slitting</span>
            <Scissors className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-400">
            {stats?.statusBreakdown.find((s) => s.currentStatus === 'IN_PRODUCTION')?._count._all || 0}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">Active Floor Work Center Processing</p>
        </div>
      </div>

      {/* Filter & Barcode Search Bar */}
      <div className="p-4 rounded-sm bg-card border border-border/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan Barcode or Search Roll #, Batch #, Material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border/80 pl-9 pr-4 py-2 rounded-sm text-xs font-mono text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RollStatus)}
              className="bg-secondary/50 border border-border/80 px-3 py-2 rounded-sm text-xs font-mono text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
            >
              <option value="">All Statuses</option>
              <option value="RAW_RECEIVED">RAW RECEIVED</option>
              <option value="STORED_IN_RM">STORED IN RM</option>
              <option value="ISSUED_TO_JOBWORK">ISSUED TO JOBWORK</option>
              <option value="RETURNED_FROM_JOBWORK">RETURNED FROM JOBWORK</option>
              <option value="QC_PENDING">QC PENDING</option>
              <option value="QC_APPROVED">QC APPROVED</option>
              <option value="IN_PRODUCTION">IN PRODUCTION</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="PACKED">PACKED</option>
              <option value="DISPATCHED">DISPATCHED</option>
            </select>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as RollStage)}
              className="bg-secondary/50 border border-border/80 px-3 py-2 rounded-sm text-xs font-mono text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
            >
              <option value="">All Stages</option>
              <option value="RAW_COTTON_BALE">RAW COTTON BALE</option>
              <option value="GREY_FABRIC_ROLL">GREY FABRIC ROLL</option>
              <option value="BLEACHED_GAUZE_ROLL">BLEACHED GAUZE ROLL</option>
              <option value="SLIT_ROLL">SLIT ROLL</option>
              <option value="FINISHED_PRODUCT_ROLL">FINISHED PRODUCT ROLL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roll Directory Table */}
      <div className="rounded-sm bg-card border border-border/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border/80">
              <tr>
                <th className="p-3">Roll Serial / Barcode</th>
                <th className="p-3">Material & Batch</th>
                <th className="p-3">Dimensions & Weight</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Current Location</th>
                <th className="p-3">Job Worker / Work Center</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#3ECF8E]" />
                    Fetching roll tracking ledger...
                  </td>
                </tr>
              ) : rolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                    No cotton rolls matching the query filter.
                  </td>
                </tr>
              ) : (
                rolls.map((roll) => (
                  <tr key={roll.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <Link
                        href={`/roll-tracking/${encodeURIComponent(roll.rollNumber)}`}
                        className="group block"
                      >
                        <div className="font-mono font-bold text-foreground group-hover:text-[#3ECF8E] flex items-center gap-1.5">
                          <QrCode className="h-3.5 w-3.5 text-[#3ECF8E]" />
                          {roll.rollNumber}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {roll.barcode}
                        </span>
                      </Link>
                    </td>

                    <td className="p-3">
                      <p className="font-medium text-foreground">{roll.materialName}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Batch: {roll.batchNumber}
                      </span>
                    </td>

                    <td className="p-3 font-mono">
                      <p className="text-foreground font-semibold">{roll.weightKg} kg</p>
                      <span className="text-[10px] text-muted-foreground">
                        {roll.widthInches}" × {roll.lengthMeters}m {roll.gsm ? `(${roll.gsm} GSM)` : ''}
                      </span>
                    </td>

                    <td className="p-3">{getStatusBadge(roll.currentStatus)}</td>

                    <td className="p-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-[#3ECF8E]" />
                        <span className="font-mono">{roll.currentLocation}</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      {roll.jobWorkCompany ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {roll.jobWorkCompany.companyName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setStatusModalRoll(roll);
                            setNewStatus(roll.currentStatus);
                            setNewLocation(roll.currentLocation);
                          }}
                          className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-mono font-medium rounded-sm border border-border/80 transition-colors"
                        >
                          Update Status
                        </button>
                        <Link
                          href={`/roll-tracking/${encodeURIComponent(roll.rollNumber)}`}
                          className="p-1 text-muted-foreground hover:text-[#3ECF8E] transition-colors"
                          title="View Lineage Tree"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-secondary/40 border-t border-border/80 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{rolls.length}</strong> of{' '}
            <strong className="text-foreground">{totalCount}</strong> cotton rolls
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 bg-card hover:bg-secondary border border-border/80 rounded-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 bg-card hover:bg-secondary border border-border/80 rounded-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Status Change Ledger Entry */}
      {statusModalRoll && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-sm max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-foreground text-sm font-mono flex items-center gap-2">
                <QrCode className="h-4 w-4 text-[#3ECF8E]" />
                Update Status: {statusModalRoll.rollNumber}
              </h3>
              <button
                onClick={() => setStatusModalRoll(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-muted-foreground mb-1">New Roll Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RollStatus)}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                >
                  <option value="RAW_RECEIVED">RAW RECEIVED</option>
                  <option value="STORED_IN_RM">STORED IN RM</option>
                  <option value="ISSUED_TO_JOBWORK">ISSUED TO JOBWORK</option>
                  <option value="PROCESS_IN_PROGRESS">PROCESS IN PROGRESS</option>
                  <option value="RETURNED_FROM_JOBWORK">RETURNED FROM JOBWORK</option>
                  <option value="QC_PENDING">QC PENDING</option>
                  <option value="QC_APPROVED">QC APPROVED</option>
                  <option value="QC_REJECTED">QC REJECTED</option>
                  <option value="IN_PRODUCTION">IN PRODUCTION</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="SCRAPPED">SCRAPPED</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Current Location (Bin / Machine)</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Bleaching Station 2 / Bin C-04"
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Remarks / Ledger Note</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason for status change, quality findings, etc."
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
              <button
                onClick={() => setStatusModalRoll(null)}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono rounded-sm"
              >
                Cancel
              </button>
              <button
                disabled={updating}
                onClick={handleUpdateStatus}
                className="px-4 py-1.5 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#0F1117] font-bold text-xs font-mono rounded-sm"
              >
                {updating ? 'Updating...' : 'Record Status Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Intake New Cotton Roll */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRoll}
            className="bg-card border border-border rounded-sm max-w-lg w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-foreground text-sm font-mono flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#3ECF8E]" />
                Intake New Cotton / Gauze Roll
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="col-span-2">
                <label className="block text-muted-foreground mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Storage Location Bin</label>
                <input
                  type="text"
                  required
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Width (Inches)</label>
                <input
                  type="number"
                  required
                  value={formData.widthInches}
                  onChange={(e) => setFormData({ ...formData, widthInches: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Length (Meters)</label>
                <input
                  type="number"
                  required
                  value={formData.lengthMeters}
                  onChange={(e) => setFormData({ ...formData, lengthMeters: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">GSM (Target)</label>
                <input
                  type="number"
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                  className="w-full bg-secondary border border-border px-3 py-2 rounded-sm text-foreground focus:outline-hidden focus:border-[#3ECF8E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/80">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1.5 bg-[#3ECF8E] hover:bg-[#3ECF8E]/90 text-[#0F1117] font-bold text-xs font-mono rounded-sm"
              >
                {creating ? 'Generating Roll...' : 'Create & Print Barcode'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
