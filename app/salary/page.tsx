// app/salary/page.tsx
'use client';

import { useState } from 'react';
import {
  Plus,
  DollarSign,
  Loader2,
  RefreshCw,
  Check,
  Clock,
  Banknote,
  FileText,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import SalaryForm from '@/components/forms/SalaryForm';
import { useSalaryByMonth, useGenerateSalary, useMarkSalaryAsPaid, useCreateSalary, useApproveSalary } from '@/lib/hooks';
import { CreateSalaryDto } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    PAID: { variant: 'success', label: 'จ่ายแล้ว' },
    APPROVED: { variant: 'default', label: 'อนุมัติแล้ว' },
    PENDING: { variant: 'warning', label: 'รอดำเนินการ' },
    CANCELLED: { variant: 'danger', label: 'ยกเลิก' },
  };
  const c = config[status] || { variant: 'default' as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
};

export default function SalaryPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useSalaryByMonth(selectedYear, selectedMonth);
  const generateSalary = useGenerateSalary();
  const markAsPaid = useMarkSalaryAsPaid();
  const createSalary = useCreateSalary();
  const approveSalary = useApproveSalary();

  const records = data?.data || [];
  const summary = data?.summary;

  const months = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const years = [
    { value: String(now.getFullYear()), label: String(now.getFullYear() + 543) },
    { value: String(now.getFullYear() - 1), label: String(now.getFullYear() - 1 + 543) },
  ];

  const handleGenerate = async () => {
    if (confirm(`ต้องการสร้างรายการเงินเดือนสำหรับเดือน ${months.find((m) => m.value === String(selectedMonth))?.label} ${selectedYear + 543}?`)) {
      try {
        const result = await generateSalary.mutateAsync({
          month: selectedMonth,
          year: selectedYear,
        });
        alert(`สร้างสำเร็จ ${result.created} รายการ, ข้าม ${result.skipped} รายการ`);
        refetch();
      } catch (err: any) {
        alert(err?.message || 'เกิดข้อผิดพลาดในการสร้างรายการ');
      }
    }
  };

  const handleCreateSalary = async (dto: CreateSalaryDto) => {
    try {
      await createSalary.mutateAsync(dto);
      setShowCreateModal(false);
      refetch();
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการสร้างรายการ');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await markAsPaid.mutateAsync({ id, paymentMethod: 'BANK_TRANSFER' });
      refetch();
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการบันทึกการจ่าย');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveSalary.mutateAsync(id);
      refetch();
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const monthLabel = months.find((m) => m.value === String(selectedMonth))?.label || '';

  // Summary stats
  const totalGross = summary?.totalGrossSalary || 0;
  const totalNet = summary?.totalNetSalary || 0;
  const totalDeductions = summary?.totalDeductions || 0;
  const paidCount = summary?.paidCount || 0;
  const pendingCount = summary?.pendingCount || 0;
  const totalRecords = summary?.totalRecords || 0;

  const summaryCards = [
    {
      label: 'เงินเดือนรวม (สุทธิ)',
      value: formatCurrency(totalNet),
      sub: `${totalRecords} รายการ`,
      icon: DollarSign,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-300',
    },
    {
      label: 'จ่ายแล้ว',
      value: `${paidCount}`,
      sub: 'รายการ',
      icon: Check,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-emerald-300',
    },
    {
      label: 'รอดำเนินการ',
      value: `${pendingCount}`,
      sub: 'รายการ',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      gradient: 'from-amber-500 to-amber-300',
    },
    {
      label: 'หักรวม',
      value: formatCurrency(totalDeductions),
      sub: 'ประกันสังคม+ภาษี',
      icon: FileText,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      gradient: 'from-violet-500 to-violet-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="จัดการเงินเดือน"
        description="ดูและจัดการข้อมูลเงินเดือนและโบนัสพนักงาน"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400">{card.sub}</p>
                  </div>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Month/Year selector */}
              <div className="flex gap-2 flex-1">
                <div className="w-36 sm:w-40">
                  <Select
                    options={months}
                    value={String(selectedMonth)}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  />
                </div>
                <div className="w-28 sm:w-32">
                  <Select
                    options={years}
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" onClick={() => refetch()} size="md">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={generateSalary.isPending}
                  size="md"
                >
                  {generateSalary.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin sm:mr-1.5" />
                  ) : (
                    <Banknote className="w-4 h-4 sm:mr-1.5" />
                  )}
                  <span className="hidden sm:inline">สร้างอัตโนมัติ</span>
                </Button>
                <Button onClick={() => setShowCreateModal(true)} size="md">
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">สร้างรายการ</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">เกิดข้อผิดพลาด: {(error as Error).message}</p>
            <p className="text-sm mt-1">กรุณาตรวจสอบว่า Backend API กำลังทำงานอยู่ที่ http://localhost:3005</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-3" />
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูลเงินเดือน...</p>
          </div>
        )}

        {/* Salary Records */}
        {!isLoading && !error && (
          <>
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <DollarSign className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  ยังไม่มีข้อมูลเงินเดือนสำหรับ{monthLabel} {selectedYear + 543}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  สร้างรายการอัตโนมัติสำหรับพนักงานทั้งหมด หรือสร้างรายบุคคล
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" onClick={handleGenerate} disabled={generateSalary.isPending}>
                    <Banknote className="w-4 h-4 mr-1.5" />
                    สร้างอัตโนมัติ
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    สร้างรายการ
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    รายการเงินเดือน - {monthLabel} {selectedYear + 543}
                    <span className="ml-2 text-gray-400 font-normal">({records.length} รายการ)</span>
                  </h3>
                </div>

                {/* Mobile: Card Layout */}
                <div className="block xl:hidden space-y-3">
                  {records.map((record: any) => (
                    <Card key={record.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                              <span className="text-white font-semibold text-xs">
                                {record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {record.employee?.firstName} {record.employee?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{record.employee?.employeeCode}</p>
                            </div>
                          </div>
                          {getStatusBadge(record.status)}
                        </div>

                        {/* Body */}
                        <div className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">เงินเดือนพื้นฐาน</p>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(record.baseSalary)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">ค่าล่วงเวลา</p>
                              <p className="text-sm font-medium text-green-600">+{formatCurrency(record.overtimeAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">โบนัส/เบี้ยเลี้ยง</p>
                              <p className="text-sm font-medium text-green-600">+{formatCurrency(record.bonus + record.allowances)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">หักรวม</p>
                              <p className="text-sm font-medium text-red-600">-{formatCurrency(record.socialSecurity + record.tax + record.otherDeductions)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">เงินเดือนสุทธิ</p>
                            <p className="text-base font-bold text-primary-600">{formatCurrency(record.netSalary)}</p>
                          </div>
                          <div className="flex gap-1">
                            {record.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleApprove(record.id)}
                                disabled={approveSalary.isPending}
                              >
                                อนุมัติ
                              </Button>
                            )}
                            {record.status !== 'PAID' && record.status !== 'CANCELLED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(record.id)}
                                disabled={markAsPaid.isPending}
                              >
                                บันทึกจ่าย
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop: Table Layout */}
                <Card className="hidden xl:block overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200">
                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              พนักงาน
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              เงินเดือนพื้นฐาน
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              ค่าล่วงเวลา
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              โบนัส/เบี้ยเลี้ยง
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              หักรวม
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              สุทธิ
                            </th>
                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              สถานะ
                            </th>
                            <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                              จัดการ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {records.map((record: any) => (
                            <tr key={record.id} className="group hover:bg-blue-50/40 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                    <span className="text-white font-semibold text-xs">
                                      {record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {record.employee?.firstName} {record.employee?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {record.employee?.employeeCode}
                                      {record.employee?.position?.name && (
                                        <span className="ml-1 text-gray-400">• {record.employee.position.name}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(record.baseSalary)}
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-green-600">
                                {record.overtimeAmount > 0 ? `+${formatCurrency(record.overtimeAmount)}` : '-'}
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-green-600">
                                {(record.bonus + record.allowances) > 0
                                  ? `+${formatCurrency(record.bonus + record.allowances)}`
                                  : '-'}
                              </td>
                              <td className="px-5 py-4 text-right text-sm text-red-600">
                                {(record.socialSecurity + record.tax + record.otherDeductions) > 0
                                  ? `-${formatCurrency(record.socialSecurity + record.tax + record.otherDeductions)}`
                                  : '-'}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(record.netSalary)}</p>
                              </td>
                              <td className="px-5 py-4 text-center">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  {record.status === 'PENDING' && (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleApprove(record.id)}
                                      disabled={approveSalary.isPending}
                                    >
                                      อนุมัติ
                                    </Button>
                                  )}
                                  {record.status !== 'PAID' && record.status !== 'CANCELLED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkAsPaid(record.id)}
                                      disabled={markAsPaid.isPending}
                                    >
                                      บันทึกจ่าย
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {records.length > 0 && (
                          <tfoot className="bg-gray-50/80 border-t-2 border-gray-300">
                            <tr>
                              <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                                รวมทั้งหมด ({records.length} รายการ)
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-semibold text-gray-700">
                                {formatCurrency(records.reduce((s: number, r: any) => s + r.baseSalary, 0))}
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-semibold text-green-600">
                                +{formatCurrency(records.reduce((s: number, r: any) => s + r.overtimeAmount, 0))}
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-semibold text-green-600">
                                +{formatCurrency(records.reduce((s: number, r: any) => s + r.bonus + r.allowances, 0))}
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-semibold text-red-600">
                                -{formatCurrency(records.reduce((s: number, r: any) => s + r.socialSecurity + r.tax + r.otherDeductions, 0))}
                              </td>
                              <td className="px-5 py-4 text-right text-sm font-bold text-primary-600">
                                {formatCurrency(totalNet)}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile: Summary footer */}
                <div className="block xl:hidden">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">รวมเงินเดือนสุทธิ</span>
                        <span className="text-lg font-bold text-primary-600">{formatCurrency(totalNet)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Create Salary Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="สร้างรายการเงินเดือน"
        size="lg"
      >
        <SalaryForm
          initialMonth={selectedMonth}
          initialYear={selectedYear}
          onSubmit={handleCreateSalary}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={createSalary.isPending}
        />
      </Modal>
    </div>
  );
}
