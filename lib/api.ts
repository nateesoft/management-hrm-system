const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001/api';

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('hrm_token', token);
  } else {
    localStorage.removeItem('hrm_token');
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('hrm_token');
  }
  return authToken;
};

// Base fetch function with auth
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH ====================
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  logout: () => {
    setAuthToken(null);
  },

  getProfile: () => fetchApi<{ id: number; username: string; role: string; name: string }>('/auth/profile'),
};

// ==================== DEPARTMENTS ====================
export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    positions: number;
    employees: number;
  };
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export const departmentsApi = {
  getAll: (params?: { search?: string; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const query = searchParams.toString();
    return fetchApi<Department[]>(`/departments${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => fetchApi<Department>(`/departments/${id}`),

  create: (data: CreateDepartmentDto) =>
    fetchApi<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateDepartmentDto>) =>
    fetchApi<Department>(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<Department>(`/departments/${id}`, { method: 'DELETE' }),

  getEmployees: (id: number) => fetchApi<Employee[]>(`/departments/${id}/employees`),

  getPositions: (id: number) => fetchApi<Position[]>(`/departments/${id}/positions`),
};

// ==================== POSITIONS ====================
export interface Position {
  id: number;
  code: string;
  name: string;
  description?: string;
  level: number;
  baseSalary?: number;
  departmentId: number;
  isActive: boolean;
  department?: { id: number; name: string; code: string };
  _count?: { employees: number };
}

export interface CreatePositionDto {
  code: string;
  name: string;
  description?: string;
  level?: number;
  baseSalary?: number;
  departmentId: number;
  isActive?: boolean;
}

export const positionsApi = {
  getAll: (params?: { search?: string; departmentId?: number; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    const query = searchParams.toString();
    return fetchApi<Position[]>(`/positions${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => fetchApi<Position>(`/positions/${id}`),

  create: (data: CreatePositionDto) =>
    fetchApi<Position>('/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreatePositionDto>) =>
    fetchApi<Position>(`/positions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<Position>(`/positions/${id}`, { method: 'DELETE' }),
};

// ==================== EMPLOYEES ====================
export interface Employee {
  id: number;
  employeeCode: string;
  foodOrderingUserId?: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationalId?: string;
  departmentId: number;
  positionId: number;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  startDate: string;
  endDate?: string;
  baseSalary: number;
  bankAccount?: string;
  bankName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  imageUrl?: string;
  department?: { id: number; name: string; code: string };
  position?: { id: number; name: string; code: string };
}

export interface CreateEmployeeDto {
  employeeCode: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationalId?: string;
  departmentId: number;
  positionId: number;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  startDate?: string;
  baseSalary: number;
  bankAccount?: string;
  bankName?: string;
  imageUrl?: string;
  foodOrderingUserId?: number;
}

export interface EmployeesResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const employeesApi = {
  getAll: (params?: {
    search?: string;
    departmentId?: number;
    positionId?: number;
    status?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.departmentId) searchParams.set('departmentId', String(params.departmentId));
    if (params?.positionId) searchParams.set('positionId', String(params.positionId));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.employmentType) searchParams.set('employmentType', params.employmentType);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return fetchApi<EmployeesResponse>(`/employees${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => fetchApi<Employee>(`/employees/${id}`),

  generateCode: () => fetchApi<string>('/employees/generate-code'),

  create: (data: CreateEmployeeDto) =>
    fetchApi<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateEmployeeDto> & { status?: string }) =>
    fetchApi<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<Employee>(`/employees/${id}`, { method: 'DELETE' }),

  linkUser: (id: number, foodOrderingUserId: number) =>
    fetchApi<Employee>(`/employees/${id}/link-user`, {
      method: 'POST',
      body: JSON.stringify({ foodOrderingUserId }),
    }),

  unlinkUser: (id: number) =>
    fetchApi<Employee>(`/employees/${id}/unlink-user`, { method: 'POST' }),

  getSalaryHistory: (id: number) => fetchApi<SalaryRecord[]>(`/employees/${id}/salary-history`),

  getBenefits: (id: number) => fetchApi<EmployeeBenefit[]>(`/employees/${id}/benefits`),
};

// ==================== SALARY ====================
export interface SalaryRecord {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  bonus: number;
  allowances: number;
  commission: number;
  socialSecurity: number;
  tax: number;
  otherDeductions: number;
  deductionNotes?: string;
  grossSalary: number;
  netSalary: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  notes?: string;
  employee?: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    position?: { name: string };
    department?: { name: string };
  };
}

export interface CreateSalaryDto {
  employeeId: number;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  bonus?: number;
  allowances?: number;
  commission?: number;
  socialSecurity?: number;
  tax?: number;
  otherDeductions?: number;
  deductionNotes?: string;
  notes?: string;
}

export interface SalaryResponse {
  data: SalaryRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SalaryByMonthResponse {
  data: SalaryRecord[];
  summary: {
    totalRecords: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalDeductions: number;
    paidCount: number;
    pendingCount: number;
  };
}

export const salaryApi = {
  getAll: (params?: {
    employeeId?: number;
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.employeeId) searchParams.set('employeeId', String(params.employeeId));
    if (params?.month) searchParams.set('month', String(params.month));
    if (params?.year) searchParams.set('year', String(params.year));
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return fetchApi<SalaryResponse>(`/salary${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => fetchApi<SalaryRecord>(`/salary/${id}`),

  getByMonth: (year: number, month: number) =>
    fetchApi<SalaryByMonthResponse>(`/salary/by-month/${year}/${month}`),

  getSummary: (year?: number, month?: number) => {
    const searchParams = new URLSearchParams();
    if (year) searchParams.set('year', String(year));
    if (month) searchParams.set('month', String(month));
    const query = searchParams.toString();
    return fetchApi<any>(`/salary/summary${query ? `?${query}` : ''}`);
  },

  create: (data: CreateSalaryDto) =>
    fetchApi<SalaryRecord>('/salary', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Omit<CreateSalaryDto, 'employeeId' | 'month' | 'year'>>) =>
    fetchApi<SalaryRecord>(`/salary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<SalaryRecord>(`/salary/${id}`, { method: 'DELETE' }),

  generate: (month: number, year: number, employeeIds?: number[]) =>
    fetchApi<{ created: number; skipped: number; errors: string[] }>('/salary/generate', {
      method: 'POST',
      body: JSON.stringify({ month, year, employeeIds }),
    }),

  approve: (id: number) =>
    fetchApi<SalaryRecord>(`/salary/${id}/approve`, { method: 'PATCH' }),

  markAsPaid: (id: number, paymentMethod?: string, paymentRef?: string) => {
    const searchParams = new URLSearchParams();
    if (paymentMethod) searchParams.set('paymentMethod', paymentMethod);
    if (paymentRef) searchParams.set('paymentRef', paymentRef);
    const query = searchParams.toString();
    return fetchApi<SalaryRecord>(`/salary/${id}/pay${query ? `?${query}` : ''}`, {
      method: 'PATCH',
    });
  },
};

// ==================== BENEFITS ====================
export interface Benefit {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: 'HEALTH_INSURANCE' | 'TRANSPORTATION' | 'MEAL_ALLOWANCE' | 'HOUSING' | 'PHONE_ALLOWANCE' | 'BONUS' | 'OTHER';
  defaultAmount?: number;
  isActive: boolean;
  _count?: { employeeBenefits: number };
}

export interface CreateBenefitDto {
  code: string;
  name: string;
  description?: string;
  type: Benefit['type'];
  defaultAmount?: number;
  isActive?: boolean;
}

export interface EmployeeBenefit {
  id: number;
  employeeId: number;
  benefitId: number;
  amount: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  employee?: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    position?: { name: string };
  };
  benefit?: Benefit;
}

export interface AssignBenefitDto {
  employeeId: number;
  benefitId: number;
  amount: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export const benefitsApi = {
  getAll: (isActive?: boolean) => {
    const query = isActive !== undefined ? `?isActive=${isActive}` : '';
    return fetchApi<Benefit[]>(`/benefits${query}`);
  },

  getById: (id: number) => fetchApi<Benefit>(`/benefits/${id}`),

  getSummary: () => fetchApi<any[]>('/benefits/summary'),

  create: (data: CreateBenefitDto) =>
    fetchApi<Benefit>('/benefits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateBenefitDto>) =>
    fetchApi<Benefit>(`/benefits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<Benefit>(`/benefits/${id}`, { method: 'DELETE' }),

  // Employee Benefits
  getEmployeeBenefits: (employeeId?: number, benefitId?: number) => {
    const searchParams = new URLSearchParams();
    if (employeeId) searchParams.set('employeeId', String(employeeId));
    if (benefitId) searchParams.set('benefitId', String(benefitId));
    const query = searchParams.toString();
    return fetchApi<EmployeeBenefit[]>(`/benefits/employee-benefits${query ? `?${query}` : ''}`);
  },

  assignBenefit: (data: AssignBenefitDto) =>
    fetchApi<EmployeeBenefit>('/benefits/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEmployeeBenefit: (id: number, data: Partial<AssignBenefitDto>) =>
    fetchApi<EmployeeBenefit>(`/benefits/employee-benefits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  removeEmployeeBenefit: (id: number) =>
    fetchApi<EmployeeBenefit>(`/benefits/employee-benefits/${id}`, { method: 'DELETE' }),
};

// ==================== DASHBOARD ====================
export interface DashboardOverview {
  employees: {
    total: number;
    active: number;
    onLeave: number;
    newThisMonth: number;
  };
  salary: {
    month: number;
    year: number;
    totalAmount: number;
    paidCount: number;
    pendingCount: number;
    totalRecords: number;
  };
  departments: number;
  positions: number;
}

export const dashboardApi = {
  getOverview: () => fetchApi<DashboardOverview>('/dashboard/overview'),

  getEmployeeStats: () => fetchApi<any>('/dashboard/employee-stats'),

  getSalarySummary: (year?: number) => {
    const query = year ? `?year=${year}` : '';
    return fetchApi<any>(`/dashboard/salary-summary${query}`);
  },

  getDepartmentStats: () => fetchApi<any>('/dashboard/department-stats'),

  getRecentActivities: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchApi<any[]>(`/dashboard/recent-activities${query}`);
  },
};

// ==================== INTEGRATION ====================
export const integrationApi = {
  syncUsers: () =>
    fetchApi<{ synced: number; created: number; updated: number; skipped: number; errors: string[] }>(
      '/integration/sync-users',
      { method: 'POST' }
    ),

  getUnlinkedUsers: () =>
    fetchApi<{ id: number; username: string; name: string; role: string; isActive: boolean }[]>(
      '/integration/unlinked-users'
    ),
};
