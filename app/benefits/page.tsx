// app/benefits/page.tsx
'use client';

import { useState } from 'react';
import {
  Plus,
  Gift,
  Heart,
  Car,
  Utensils,
  Home,
  Phone,
  Award,
  Loader2,
  RefreshCw,
  Users,
  UserPlus,
  Trash2,
  DollarSign,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import BenefitForm from '@/components/forms/BenefitForm';
import AssignBenefitForm from '@/components/forms/AssignBenefitForm';
import {
  useBenefits,
  useBenefitsSummary,
  useEmployeeBenefits,
  useCreateBenefit,
  useAssignBenefit,
  useRemoveEmployeeBenefit,
} from '@/lib/hooks';
import { CreateBenefitDto, AssignBenefitDto } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const getBenefitIcon = (type: string) => {
  const icons: Record<string, any> = {
    HEALTH_INSURANCE: Heart,
    TRANSPORTATION: Car,
    MEAL_ALLOWANCE: Utensils,
    HOUSING: Home,
    PHONE_ALLOWANCE: Phone,
    BONUS: Award,
  };
  return icons[type] || Gift;
};

const getBenefitColor = (type: string) => {
  const colors: Record<string, { bg: string; iconBg: string; text: string }> = {
    HEALTH_INSURANCE: { bg: 'bg-rose-50', iconBg: 'bg-rose-500', text: 'text-rose-600' },
    TRANSPORTATION: { bg: 'bg-blue-50', iconBg: 'bg-blue-500', text: 'text-blue-600' },
    MEAL_ALLOWANCE: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', text: 'text-emerald-600' },
    HOUSING: { bg: 'bg-orange-50', iconBg: 'bg-orange-500', text: 'text-orange-600' },
    PHONE_ALLOWANCE: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-500', text: 'text-cyan-600' },
    BONUS: { bg: 'bg-amber-50', iconBg: 'bg-amber-500', text: 'text-amber-600' },
  };
  return colors[type] || { bg: 'bg-violet-50', iconBg: 'bg-violet-500', text: 'text-violet-600' };
};

const getBenefitTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    HEALTH_INSURANCE: 'ประกันสุขภาพ',
    TRANSPORTATION: 'ค่าเดินทาง',
    MEAL_ALLOWANCE: 'ค่าอาหาร',
    HOUSING: 'ค่าที่พัก',
    PHONE_ALLOWANCE: 'ค่าโทรศัพท์',
    BONUS: 'โบนัส',
    OTHER: 'อื่นๆ',
  };
  return labels[type] || type;
};

export default function BenefitsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: benefitsData, isLoading, error, refetch } = useBenefits();
  const { data: summaryData, refetch: refetchSummary } = useBenefitsSummary();
  const { data: employeeBenefitsData, refetch: refetchEB } = useEmployeeBenefits();

  const createBenefit = useCreateBenefit();
  const assignBenefit = useAssignBenefit();
  const removeBenefit = useRemoveEmployeeBenefit();

  const benefits = (benefitsData || []) as any[];
  const summary = (summaryData || []) as any[];
  const employeeBenefits = (employeeBenefitsData || []) as any[];

  const totalBenefitTypes = benefits.length;
  const totalEmployeeBenefits = employeeBenefits.length;
  const totalMonthlyCost = employeeBenefits.reduce((sum: number, eb: any) => sum + (eb.amount || 0), 0);

  const getEmployeesWithBenefit = (benefitId: number) => {
    return employeeBenefits.filter((eb: any) => eb.benefitId === benefitId).length;
  };

  const handleCreateBenefit = async (data: CreateBenefitDto) => {
    try {
      await createBenefit.mutateAsync(data);
      setShowCreateModal(false);
      refetch();
      refetchSummary();
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการสร้างสวัสดิการ');
    }
  };

  const handleAssignBenefit = async (data: AssignBenefitDto) => {
    try {
      await assignBenefit.mutateAsync(data);
      setShowAssignModal(false);
      refetchEB();
      refetchSummary();
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการเพิ่มสวัสดิการ');
    }
  };

  const handleRemoveEmployeeBenefit = async (id: number) => {
    if (confirm('ต้องการยกเลิกสวัสดิการนี้?')) {
      try {
        await removeBenefit.mutateAsync(id);
        refetchEB();
        refetchSummary();
      } catch (err: any) {
        alert(err?.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  const summaryCards = [
    {
      label: 'ประเภทสวัสดิการ',
      value: `${totalBenefitTypes}`,
      sub: 'รายการ',
      icon: Gift,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      gradient: 'from-violet-500 to-violet-300',
    },
    {
      label: 'พนักงานที่ได้รับ',
      value: `${totalEmployeeBenefits}`,
      sub: 'สิทธิ์',
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-300',
    },
    {
      label: 'ค่าใช้จ่ายรวม',
      value: formatCurrency(totalMonthlyCost),
      sub: 'บาท/เดือน',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="จัดการสวัสดิการ"
        description="ดูและจัดการสวัสดิการพนักงาน"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-700">
                สวัสดิการทั้งหมด <span className="text-gray-400">({benefits.length} รายการ)</span>
              </p>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" onClick={() => { refetch(); refetchSummary(); refetchEB(); }} size="md">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="secondary" onClick={() => setShowAssignModal(true)} size="md">
                  <UserPlus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">เพิ่มให้พนักงาน</span>
                </Button>
                <Button onClick={() => setShowCreateModal(true)} size="md">
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">เพิ่มสวัสดิการ</span>
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
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูลสวัสดิการ...</p>
          </div>
        )}

        {/* Benefits Content */}
        {!isLoading && !error && (
          <>
            {benefits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Gift className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลสวัสดิการ</p>
                <p className="text-sm text-gray-400 mt-1">เริ่มต้นโดยการเพิ่มประเภทสวัสดิการใหม่</p>
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  เพิ่มสวัสดิการ
                </Button>
              </div>
            ) : (
              <>
                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {benefits.map((benefit: any) => {
                    const Icon = getBenefitIcon(benefit.type);
                    const color = getBenefitColor(benefit.type);
                    const employeeCount = benefit._count?.employeeBenefits || getEmployeesWithBenefit(benefit.id);

                    return (
                      <Card key={benefit.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          {/* Card Header */}
                          <div className="flex items-start gap-3 p-4 pb-3">
                            <div className={`w-11 h-11 rounded-xl ${color.iconBg} flex items-center justify-center shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">{benefit.name}</h3>
                                  <p className="text-xs text-gray-500 mt-0.5">{benefit.code}</p>
                                </div>
                                <Badge variant={benefit.isActive ? 'success' : 'default'}>
                                  {benefit.isActive ? 'ใช้งาน' : 'ปิด'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="px-4 pb-3">
                            {benefit.description && (
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{benefit.description}</p>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">ประเภท</p>
                                <p className="text-xs font-medium text-gray-700 mt-0.5">{getBenefitTypeLabel(benefit.type)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">มูลค่า</p>
                                <p className={`text-xs font-semibold mt-0.5 ${color.text}`}>
                                  {benefit.defaultAmount ? formatCurrency(benefit.defaultAmount) : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">พนักงาน</p>
                                <p className="text-xs font-medium text-gray-700 mt-0.5">{employeeCount} คน</p>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className={`h-1 ${color.iconBg} opacity-20`}></div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Employee Benefits Table */}
                {employeeBenefits.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        สวัสดิการที่เพิ่มให้พนักงาน
                        <span className="ml-2 text-gray-400 font-normal">({employeeBenefits.length} รายการ)</span>
                      </h3>
                    </div>

                    {/* Mobile: Cards */}
                    <div className="block xl:hidden space-y-3">
                      {employeeBenefits.map((eb: any) => (
                        <Card key={eb.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                                  <span className="text-white font-semibold text-xs">
                                    {eb.employee?.firstName?.charAt(0)}{eb.employee?.lastName?.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {eb.employee?.firstName} {eb.employee?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{eb.employee?.employeeCode}</p>
                                </div>
                              </div>
                              <Badge variant={eb.isActive ? 'success' : 'default'}>
                                {eb.isActive ? 'ใช้งาน' : 'ยกเลิก'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">สวัสดิการ</p>
                                  <p className="text-sm font-medium text-gray-900">{eb.benefit?.name}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">จำนวนเงิน</p>
                                  <p className="text-sm font-bold text-primary-600">{formatCurrency(eb.amount)}/เดือน</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end px-4 py-2 bg-gray-50/80 border-t border-gray-100">
                              {eb.isActive && (
                                <button
                                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
                                  onClick={() => handleRemoveEmployeeBenefit(eb.id)}
                                  disabled={removeBenefit.isPending}
                                  title="ยกเลิกสวัสดิการ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop: Table */}
                    <Card className="hidden xl:block overflow-hidden">
                      <CardContent className="p-0">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                พนักงาน
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                สวัสดิการ
                              </th>
                              <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                จำนวนเงิน
                              </th>
                              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                สถานะ
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                หมายเหตุ
                              </th>
                              <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                                จัดการ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {employeeBenefits.map((eb: any) => {
                              const color = getBenefitColor(eb.benefit?.type);
                              const Icon = getBenefitIcon(eb.benefit?.type);

                              return (
                                <tr key={eb.id} className="group hover:bg-blue-50/40 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
                                        <span className="text-white font-semibold text-xs">
                                          {eb.employee?.firstName?.charAt(0)}{eb.employee?.lastName?.charAt(0)}
                                        </span>
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                          {eb.employee?.firstName} {eb.employee?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {eb.employee?.employeeCode}
                                          {eb.employee?.position?.name && (
                                            <span className="ml-1 text-gray-400">• {eb.employee.position.name}</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-7 h-7 rounded-lg ${color.iconBg} flex items-center justify-center`}>
                                        <Icon className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{eb.benefit?.name}</p>
                                        <p className="text-xs text-gray-500">{getBenefitTypeLabel(eb.benefit?.type)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(eb.amount)}</p>
                                    <p className="text-xs text-gray-400">/เดือน</p>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    <Badge variant={eb.isActive ? 'success' : 'default'}>
                                      {eb.isActive ? 'ใช้งาน' : 'ยกเลิก'}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-4">
                                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                      {eb.notes || '-'}
                                    </p>
                                  </td>
                                  <td className="px-5 py-4 text-center">
                                    {eb.isActive && (
                                      <button
                                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        onClick={() => handleRemoveEmployeeBenefit(eb.id)}
                                        disabled={removeBenefit.isPending}
                                        title="ยกเลิกสวัสดิการ"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {employeeBenefits.length > 0 && (
                            <tfoot className="bg-gray-50/80 border-t-2 border-gray-300">
                              <tr>
                                <td colSpan={2} className="px-5 py-4 text-sm font-semibold text-gray-700">
                                  รวมค่าใช้จ่ายสวัสดิการ
                                </td>
                                <td className="px-5 py-4 text-right text-sm font-bold text-primary-600">
                                  {formatCurrency(totalMonthlyCost)}
                                </td>
                                <td colSpan={3}></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </CardContent>
                    </Card>

                    {/* Mobile: Summary footer */}
                    <div className="block xl:hidden">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">รวมค่าใช้จ่ายสวัสดิการ</span>
                            <span className="text-lg font-bold text-primary-600">{formatCurrency(totalMonthlyCost)}/เดือน</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create Benefit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="เพิ่มสวัสดิการใหม่"
        size="md"
      >
        <BenefitForm
          onSubmit={handleCreateBenefit}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={createBenefit.isPending}
        />
      </Modal>

      {/* Assign Benefit Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="เพิ่มสวัสดิการให้พนักงาน"
        size="md"
      >
        <AssignBenefitForm
          onSubmit={handleAssignBenefit}
          onCancel={() => setShowAssignModal(false)}
          isSubmitting={assignBenefit.isPending}
        />
      </Modal>
    </div>
  );
}
