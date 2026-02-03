// app/employees/page.tsx
'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Users,
  UserCheck,
  UserX,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Eye,
  CalendarDays,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmployeeForm from '@/components/forms/EmployeeForm';
import { useEmployees, useDeleteEmployee, useCreateEmployee } from '@/lib/hooks';
import { employeesApi, CreateEmployeeDto } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'ทำงานอยู่',
    INACTIVE: 'ไม่ทำงาน',
    ON_LEAVE: 'ลาพักร้อน',
    TERMINATED: 'สิ้นสุดสัญญา',
  };
  return labels[status] || status;
};

const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    ACTIVE: 'success',
    ON_LEAVE: 'warning',
    TERMINATED: 'danger',
    INACTIVE: 'default',
  };
  return map[status] || 'default';
};

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

const getEmploymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    FULL_TIME: 'เต็มเวลา',
    PART_TIME: 'พาร์ทไทม์',
    CONTRACT: 'สัญญาจ้าง',
    INTERN: 'นักศึกษาฝึกงาน',
  };
  return labels[type] || type;
};

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const { data, isLoading, error, refetch } = useEmployees({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const deleteEmployee = useDeleteEmployee();
  const createEmployee = useCreateEmployee();

  const handleOpenCreate = async () => {
    try {
      const code = await employeesApi.generateCode();
      setGeneratedCode(typeof code === 'string' ? code : (code as any)?.code || '');
    } catch {
      setGeneratedCode('');
    }
    setShowCreateModal(true);
  };

  const handleCreateEmployee = async (data: CreateEmployeeDto) => {
    try {
      await createEmployee.mutateAsync(data);
      setShowCreateModal(false);
      setGeneratedCode('');
    } catch (err: any) {
      alert(err?.message || 'เกิดข้อผิดพลาดในการสร้างพนักงาน');
    }
  };

  const employees = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: number) => {
    if (confirm('ต้องการลบพนักงานนี้?')) {
      try {
        await deleteEmployee.mutateAsync(id);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  const activeCount = employees.filter((e: any) => e.status === 'ACTIVE').length;
  const onLeaveCount = employees.filter((e: any) => e.status === 'ON_LEAVE').length;
  const totalSalary = employees.reduce((sum: number, e: any) => sum + e.baseSalary, 0);
  const totalCount = meta?.total || employees.length;

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'ACTIVE', label: 'ทำงานอยู่' },
    { value: 'ON_LEAVE', label: 'ลาพักร้อน' },
    { value: 'INACTIVE', label: 'ไม่ทำงาน' },
    { value: 'TERMINATED', label: 'สิ้นสุดสัญญา' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        title="จัดการพนักงาน"
        description="ดูและจัดการข้อมูลพนักงานทั้งหมด"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">พนักงานทั้งหมด</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalCount}</p>
                  <p className="text-xs text-gray-400">คน</p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300" />
            </CardContent>
          </Card>

          {/* Active */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">กำลังทำงาน</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{activeCount}</p>
                  <p className="text-xs text-gray-400">คน</p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-300" />
            </CardContent>
          </Card>

          {/* On Leave */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">ลาพักร้อน</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">{onLeaveCount}</p>
                  <p className="text-xs text-gray-400">คน</p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
            </CardContent>
          </Card>

          {/* Salary */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">เงินเดือนรวม</p>
                  <p className="text-xl sm:text-2xl font-bold text-violet-600">{formatCurrency(totalSalary)}</p>
                  <p className="text-xs text-gray-400">บาท/เดือน</p>
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-300" />
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัส, อีเมล..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 !py-2.5"
                />
              </div>

              {/* Filter */}
              <div className="w-full sm:w-44">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" onClick={() => refetch()} size="md">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button onClick={handleOpenCreate} size="md">
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">เพิ่มพนักงาน</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</p>
                <p className="text-sm text-red-600 mt-0.5">{(error as Error).message}</p>
                <p className="text-xs text-red-500 mt-1">กรุณาตรวจสอบว่า Backend API ทำงานอยู่ที่ http://localhost:3005</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-3" />
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูลพนักงาน...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-600">
                  {searchTerm || statusFilter ? 'ไม่พบพนักงานที่ค้นหา' : 'ยังไม่มีข้อมูลพนักงาน'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || statusFilter
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                    : 'เริ่มต้นโดยการเพิ่มพนักงานใหม่'}
                </p>
                {!searchTerm && !statusFilter && (
                  <Button className="mt-4" onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    เพิ่มพนักงาน
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile & Tablet: Card Layout */}
                <div className="block xl:hidden space-y-3">
                  {employees.map((employee: any) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        {/* Card Top */}
                        <div className="p-4 pb-3">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-11 h-11 rounded-full ${getAvatarColor(employee.id)} flex items-center justify-center shrink-0`}>
                              <span className="text-white font-semibold text-sm">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                              </span>
                            </div>

                            {/* Name & Code */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {employee.firstName} {employee.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {employee.employeeCode}
                                    {employee.nickname && (
                                      <span className="text-gray-400"> ({employee.nickname})</span>
                                    )}
                                  </p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(employee.status)}>
                                  {getStatusLabel(employee.status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="px-4 pb-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{employee.position?.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{employee.department?.name || '-'}</span>
                            </div>
                            {employee.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{employee.phone}</span>
                              </div>
                            )}
                            {employee.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{employee.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100 rounded-b-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">เงินเดือน</p>
                              <p className="text-sm font-bold text-gray-900">{formatCurrency(employee.baseSalary)}</p>
                            </div>
                            <div className="hidden sm:block">
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">เริ่มงาน</p>
                              <p className="text-sm text-gray-700">{formatDate(employee.startDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-white transition-colors"
                              onClick={() => alert('TODO: View employee')}
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-white transition-colors"
                              onClick={() => alert('TODO: Edit employee')}
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
                              onClick={() => handleDelete(employee.id)}
                              disabled={deleteEmployee.isPending}
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop: Table Layout */}
                <Card className="hidden xl:block overflow-hidden">
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            พนักงาน
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            ตำแหน่ง / แผนก
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            สถานะ
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            ติดต่อ
                          </th>
                          <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            เงินเดือน
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            เริ่มงาน
                          </th>
                          <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                            จัดการ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {employees.map((employee: any) => (
                          <tr
                            key={employee.id}
                            className="group hover:bg-blue-50/40 transition-colors"
                          >
                            {/* Employee */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${getAvatarColor(employee.id)} flex items-center justify-center shrink-0`}>
                                  <span className="text-white font-semibold text-xs">
                                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {employee.firstName} {employee.lastName}
                                    {employee.nickname && (
                                      <span className="font-normal text-gray-400 ml-1">({employee.nickname})</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">{employee.employeeCode}</p>
                                </div>
                              </div>
                            </td>

                            {/* Position / Department */}
                            <td className="px-5 py-4">
                              <p className="text-sm text-gray-900">{employee.position?.name || '-'}</p>
                              <p className="text-xs text-gray-500">{employee.department?.name || '-'}</p>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <Badge variant={getStatusBadgeVariant(employee.status)}>
                                {getStatusLabel(employee.status)}
                              </Badge>
                              <p className="text-xs text-gray-400 mt-1">
                                {getEmploymentTypeLabel(employee.employmentType)}
                              </p>
                            </td>

                            {/* Contact */}
                            <td className="px-5 py-4">
                              {employee.phone && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <span>{employee.phone}</span>
                                </div>
                              )}
                              {employee.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="truncate max-w-[180px]">{employee.email}</span>
                                </div>
                              )}
                            </td>

                            {/* Salary */}
                            <td className="px-5 py-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">{formatCurrency(employee.baseSalary)}</p>
                            </td>

                            {/* Start Date */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                <span>{formatDate(employee.startDate)}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                  onClick={() => alert('TODO: View employee')}
                                  title="ดูรายละเอียด"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  onClick={() => alert('TODO: Edit employee')}
                                  title="แก้ไข"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={() => handleDelete(employee.id)}
                                  disabled={deleteEmployee.isPending}
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-sm text-gray-500">
                  แสดง <span className="font-medium text-gray-700">{(page - 1) * 20 + 1}-{Math.min(page * 20, meta.total)}</span> จาก{' '}
                  <span className="font-medium text-gray-700">{meta.total}</span> รายการ
                </p>
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc: (number | string)[], p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === 'string' ? (
                        <span key={`dots-${idx}`} className="px-1 text-gray-400 text-sm">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === item
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-white hover:text-gray-900'
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  <button
                    className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Employee Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="เพิ่มพนักงานใหม่"
        size="lg"
      >
        <EmployeeForm
          initialCode={generatedCode}
          onSubmit={handleCreateEmployee}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={createEmployee.isPending}
        />
      </Modal>
    </div>
  );
}
