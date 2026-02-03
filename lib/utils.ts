// lib/utils.ts
import { EmployeePosition, EmployeeStatus } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

export function getPositionLabel(position: EmployeePosition): string {
  const labels: Record<EmployeePosition, string> = {
    server: 'พนักงานเสิร์ฟ',
    kitchen: 'พนักงานครัว',
    cashier: 'พนักงานแคชเชียร์',
    manager: 'ผู้จัดการ',
  };
  return labels[position];
}

export function getStatusLabel(status: EmployeeStatus): string {
  const labels: Record<EmployeeStatus, string> = {
    active: 'ทำงานอยู่',
    inactive: 'ลาออก',
    onleave: 'ลาพักงาน',
  };
  return labels[status];
}

export function getStatusColor(status: EmployeeStatus): string {
  const colors: Record<EmployeeStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    onleave: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status];
}

export function calculateAge(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const months = (today.getFullYear() - start.getFullYear()) * 12 + 
                 (today.getMonth() - start.getMonth());
  return months;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
