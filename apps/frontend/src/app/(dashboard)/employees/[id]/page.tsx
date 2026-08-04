'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Edit,
  MapPin,
  Heart,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import {
  useEmployeeDetail,
  useUpdateEmployee,
  useDepartments,
  useDesignations,
} from '@/hooks/useEmployees';

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const empId = resolvedParams?.id;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'personal' | 'salary'>('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Data
  const { data: employee, isLoading } = useEmployeeDetail(empId);
  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();

  const updateMutation = useUpdateEmployee();

  // Edit Form State
  const [editForm, setEditForm] = useState<any>({});

  const openEditModal = () => {
    if (!employee) return;
    setEditForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      alternatePhone: employee.alternatePhone || '',
      email: employee.email || '',
      gender: employee.gender || '',
      dob: employee.dob ? employee.dob.split('T')[0] : '',
      bloodGroup: employee.bloodGroup || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      pinCode: employee.pinCode || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyPhone: employee.emergencyPhone || '',
      aadhaarNo: employee.aadhaarNo || '',
      panNo: employee.panNo || '',
      joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
      salaryType: employee.salaryType || 'Monthly Salary',
      baseWage: Number(employee.baseWage || 0),
      bankName: employee.bankName || '',
      bankAccountNo: employee.bankAccountNo || '',
      bankIfsc: employee.bankIfsc || '',
      upiId: employee.upiId || '',
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: empId,
        payload: editForm,
      });
      toast('Profile Updated', 'All employee details saved successfully', 'success');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast('Update Failed', err?.message || 'Could not update profile', 'error');
    }
  };

  const handleStatusToggle = async () => {
    if (!employee) return;
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({
        id: empId,
        payload: { status: newStatus },
      });
      toast('Status Changed', `Employee set to ${newStatus}`, newStatus === 'ACTIVE' ? 'success' : 'warning');
    } catch (err: any) {
      toast('Status Update Failed', err?.message || 'Could not change status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground bg-card border border-border rounded-xl">
        Fetching Employee Profile details...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center space-y-4 bg-card border border-border rounded-xl">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
        <div className="text-base font-bold text-foreground">Employee Profile Not Found</div>
        <Link href="/employees">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employee Directory
        </Link>
        <span className="text-xs font-mono text-muted-foreground">ERP Master ID: {empId}</span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3ECF8E]" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={`${employee.firstName} ${employee.lastName}`}
              src={employee.avatarUrl || undefined}
              size="lg"
              className="h-16 w-16 text-lg font-bold border-2 border-[#3ECF8E]"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground font-mono">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-[#3ECF8E] border border-[#3ECF8E]/30">
                  {employee.employeeCode}
                </span>
                <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                <span>{employee.designation?.name || 'Staff'}</span>
                <span>•</span>
                <span className="text-foreground">{employee.department?.name || 'Unassigned'}</span>
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Joined: {new Date(employee.joiningDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={openEditModal}
              leftIcon={<Edit className="h-3.5 w-3.5" />}
            >
              Edit Profile
            </Button>

            <Button
              variant={employee.status === 'ACTIVE' ? 'outline' : 'primary'}
              size="sm"
              onClick={handleStatusToggle}
              className={employee.status === 'ACTIVE' ? 'border-amber-500/40 text-amber-400' : ''}
              isLoading={updateMutation.isPending}
            >
              {employee.status === 'ACTIVE' ? 'Deactivate Staff' : 'Reactivate Staff'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto font-mono text-xs">
        {[
          { key: 'personal', label: '👤 Personal & Role Details' },
          { key: 'salary', label: '🏦 Bank & Salary Details' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal & Role Details */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3ECF8E]" />
              Identity & Department Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="text-foreground font-semibold">{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Department:</span>
                <span className="text-foreground font-semibold">{employee.department?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Designation:</span>
                <span className="text-foreground font-semibold">{employee.designation?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Joining Date:</span>
                <span className="text-foreground">{new Date(employee.joiningDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Gender:</span>
                <span className="text-foreground">{employee.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="text-foreground">{employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Blood Group:</span>
                <span className="text-foreground font-bold text-red-400">{employee.bloodGroup || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Aadhaar Card No:</span>
                <span className="text-foreground">{employee.aadhaarNo || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">PAN Card No:</span>
                <span className="text-foreground">{employee.panNo || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#3ECF8E]" />
              Contact Details & Address
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Primary Phone:</span>
                <span className="text-foreground font-bold">{employee.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Alternate Phone:</span>
                <span className="text-foreground">{employee.alternatePhone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">{employee.email || 'Optional / Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Address:</span>
                <span className="text-foreground text-right">{employee.address ? `${employee.address}, ${employee.city || ''}` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Emergency Contact:</span>
                <span className="text-foreground font-semibold">{employee.emergencyContact || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Emergency Phone:</span>
                <span className="text-foreground">{employee.emergencyPhone || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Salary & Bank */}
      {activeTab === 'salary' && (
        <div className="bg-card border border-border rounded-xl p-5 font-mono text-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#3ECF8E]" />
            Salary Structure & Payment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Salary Type:</span>
                <span className="text-foreground font-bold">{employee.salaryType || 'Monthly Salary'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Base Salary / Wage:</span>
                <span className="text-[#3ECF8E] font-bold">₹{Number(employee.baseWage || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bank Name:</span>
                <span className="text-foreground">{employee.bankName || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Bank Account No:</span>
                <span className="text-foreground font-mono">{employee.bankAccountNo || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">IFSC Code:</span>
                <span className="text-foreground font-mono">{employee.bankIfsc || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">UPI ID:</span>
                <span className="text-foreground font-mono">{employee.upiId || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal - Editing ALL Employee Fields */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Staff Profile: ${employee.employeeCode}`}
        description="Update any details of this staff member."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 font-mono text-xs">
          {/* Section 1: Basic Identity */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-[#3ECF8E] text-[11px] uppercase">1. Basic Identity & Contact</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">First Name *</label>
                <Input
                  required
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Last Name *</label>
                <Input
                  required
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Primary Phone</label>
                <Input
                  placeholder="+91 98765..."
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Alternate Phone</label>
                <Input
                  placeholder="Alt Phone"
                  value={editForm.alternatePhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, alternatePhone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="Optional"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Department & Joining */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-[#3ECF8E] text-[11px] uppercase">2. Role & Department</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Department</label>
                <select
                  value={editForm.departmentId || ''}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Designation</label>
                <select
                  value={editForm.designationId || ''}
                  onChange={(e) => setEditForm({ ...editForm, designationId: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Joining Date</label>
                <Input
                  type="date"
                  value={editForm.joiningDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Demographics & Government IDs */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-[#3ECF8E] text-[11px] uppercase">3. Demographics & Government IDs</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Gender</label>
                <select
                  value={editForm.gender || ''}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Date of Birth</label>
                <Input
                  type="date"
                  value={editForm.dob || ''}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Blood Group</label>
                <Input
                  placeholder="e.g. O+, A+"
                  value={editForm.bloodGroup || ''}
                  onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Aadhaar Card No</label>
                <Input
                  placeholder="5412-8901-4812"
                  value={editForm.aadhaarNo || ''}
                  onChange={(e) => setEditForm({ ...editForm, aadhaarNo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">PAN Card No</label>
                <Input
                  placeholder="ABCDE1234F"
                  value={editForm.panNo || ''}
                  onChange={(e) => setEditForm({ ...editForm, panNo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address & Emergency Contacts */}
          <div className="border-b border-border pb-3 space-y-3">
            <h4 className="font-bold text-[#3ECF8E] text-[11px] uppercase">4. Address & Emergency Info</h4>
            <div>
              <label className="text-muted-foreground block mb-1">Residential Address</label>
              <Input
                placeholder="Street address..."
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">City</label>
                <Input
                  placeholder="City"
                  value={editForm.city || ''}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">State</label>
                <Input
                  placeholder="State"
                  value={editForm.state || ''}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">PIN Code</label>
                <Input
                  placeholder="638001"
                  value={editForm.pinCode || ''}
                  onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Emergency Contact Person</label>
                <Input
                  placeholder="Name (Relationship)"
                  value={editForm.emergencyContact || ''}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Emergency Contact Phone</label>
                <Input
                  placeholder="+91 98765..."
                  value={editForm.emergencyPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Salary & Bank */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#3ECF8E] text-[11px] uppercase">5. Salary Structure & Bank Account</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Salary Type</label>
                <select
                  value={editForm.salaryType || 'Monthly Salary'}
                  onChange={(e) => setEditForm({ ...editForm, salaryType: e.target.value })}
                  className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="Monthly Salary">Monthly Salary</option>
                  <option value="Daily Wage">Daily Wage</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Base Wage / Salary (₹)</label>
                <Input
                  type="number"
                  value={editForm.baseWage || ''}
                  onChange={(e) => setEditForm({ ...editForm, baseWage: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">Bank Name</label>
                <Input
                  placeholder="e.g. HDFC Bank"
                  value={editForm.bankName || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Bank Account Number</label>
                <Input
                  placeholder="Account Number"
                  value={editForm.bankAccountNo || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">IFSC Code</label>
                <Input
                  placeholder="HDFC0001234"
                  value={editForm.bankIfsc || ''}
                  onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">UPI ID</label>
                <Input
                  placeholder="staff@upi"
                  value={editForm.upiId || ''}
                  onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border sticky bottom-0 bg-card py-2">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
              Save All Changes
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
