// app/page.tsx
'use client';

import { Users, DollarSign, TrendingUp, Clock, Loader2, Building2, Briefcase } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useDashboardOverview,
  useEmployeeStats,
  useDashboardSalarySummary,
  useDepartmentStats,
  useRecentActivities,
} from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview, error: overviewError } = useDashboardOverview();
  const { data: employeeStats } = useEmployeeStats();
  const { data: salarySummary } = useDashboardSalarySummary(new Date().getFullYear());
  const { data: departmentStats } = useDepartmentStats();
  const { data: recentActivities } = useRecentActivities(10);

  const isLoading = loadingOverview;
  const error = overviewError;

  const stats = [
    {
      name: 'พนักงานทั้งหมด',
      value: overview?.totalEmployees?.toString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      change: `${overview?.activeEmployees || 0} คนที่ใช้งาน`,
    },
    {
      name: 'เงินเดือนรวม (เดือนนี้)',
      value: formatCurrency(salarySummary?.currentMonth?.totalNetSalary || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      change: `${salarySummary?.currentMonth?.paidCount || 0} จ่ายแล้ว / ${salarySummary?.currentMonth?.pendingCount || 0} รอจ่าย`,
    },
    {
      name: 'แผนก',
      value: overview?.totalDepartments?.toString() || '0',
      icon: Building2,
      color: 'bg-purple-500',
      change: 'แผนกทั้งหมด',
    },
    {
      name: 'ตำแหน่ง',
      value: overview?.totalPositions?.toString() || '0',
      icon: Briefcase,
      color: 'bg-orange-500',
      change: 'ตำแหน่งทั้งหมด',
    },
  ];

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'EMPLOYEE_CREATED':
      case 'SALARY_PAID':
        return 'bg-green-500';
      case 'EMPLOYEE_UPDATED':
      case 'SALARY_GENERATED':
        return 'bg-blue-500';
      case 'EMPLOYEE_TERMINATED':
      case 'LEAVE_REQUESTED':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityText = (activity: any) => {
    const { type, data } = activity;
    switch (type) {
      case 'EMPLOYEE_CREATED':
        return `พนักงานใหม่: ${data?.name || 'ไม่ระบุชื่อ'}`;
      case 'EMPLOYEE_UPDATED':
        return `อัปเดตข้อมูล: ${data?.name || 'ไม่ระบุชื่อ'}`;
      case 'EMPLOYEE_TERMINATED':
        return `ออกจากงาน: ${data?.name || 'ไม่ระบุชื่อ'}`;
      case 'SALARY_GENERATED':
        return `สร้างเงินเดือน: ${data?.month}/${data?.year}`;
      case 'SALARY_PAID':
        return `จ่ายเงินเดือน: ${data?.name || 'ไม่ระบุชื่อ'}`;
      case 'LEAVE_REQUESTED':
        return `ขอลา: ${data?.name || 'ไม่ระบุชื่อ'}`;
      default:
        return activity.description || type;
    }
  };

  const formatActivityTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return 'เมื่อกี้';
  };

  return (
    <div className="min-h-screen">
      <Header
        title="แดชบอร์ด"
        description="ภาพรวมของระบบจัดการพนักงาน"
      />

      <div className="p-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>เกิดข้อผิดพลาด: {(error as Error).message}</p>
            <p className="text-sm mt-1">กรุณาตรวจสอบว่า Backend API กำลังทำงานอยู่ที่ http://localhost:3005</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">กำลังโหลด...</span>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                          <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                        </div>
                        <div className={`${stat.color} p-3 rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>กิจกรรมล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(!recentActivities || recentActivities.length === 0) ? (
                      <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีกิจกรรม</p>
                    ) : (
                      recentActivities.map((activity: any, index: number) => (
                        <div
                          key={activity.id || index}
                          className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${getActivityTypeColor(activity.type)}`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatActivityTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Department Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>สรุปพนักงานตามแผนก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(!departmentStats || departmentStats.length === 0) ? (
                      <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลแผนก</p>
                    ) : (
                      departmentStats.map((dept: any, index: number) => {
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                        const color = colors[index % colors.length];
                        return (
                          <div key={dept.id || dept.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${color}`} />
                              <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{dept.employeeCount || dept._count?.employees || 0} คน</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Stats by Status */}
            {employeeStats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>สถานะพนักงาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{employeeStats.active || 0}</p>
                      <p className="text-sm text-gray-600">ทำงานอยู่</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{employeeStats.onLeave || 0}</p>
                      <p className="text-sm text-gray-600">ลางาน</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">{employeeStats.inactive || 0}</p>
                      <p className="text-sm text-gray-600">ไม่ใช้งาน</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{employeeStats.terminated || 0}</p>
                      <p className="text-sm text-gray-600">ออกจากงาน</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Salary Summary */}
            {salarySummary && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>สรุปเงินเดือนปี {new Date().getFullYear() + 543}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">รวมทั้งปี</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(salarySummary.yearTotal || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">จ่ายแล้ว</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(salarySummary.yearPaid || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">รอจ่าย</p>
                      <p className="text-xl font-bold text-yellow-600">
                        {formatCurrency(salarySummary.yearPending || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
