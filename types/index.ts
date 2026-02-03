// types/index.ts
export type EmployeePosition = 'server' | 'kitchen' | 'cashier' | 'manager';

export type EmployeeStatus = 'active' | 'inactive' | 'onleave';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: EmployeePosition;
  status: EmployeeStatus;
  phoneNumber: string;
  email: string;
  startDate: string;
  salary: number;
  imageUrl?: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM format
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paidDate?: string;
  status: 'pending' | 'paid';
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  value: number;
  type: 'health' | 'transportation' | 'meal' | 'other';
  eligiblePositions: EmployeePosition[];
}

export interface EmployeeBenefit {
  id: string;
  employeeId: string;
  benefitId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  overtimeHours: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewDate: string;
  rating: number; // 1-5
  comments: string;
  reviewedBy: string;
}
