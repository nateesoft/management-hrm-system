'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  employeesApi,
  departmentsApi,
  positionsApi,
  salaryApi,
  benefitsApi,
  dashboardApi,
  integrationApi,
  Employee,
  Department,
  Position,
  SalaryRecord,
  Benefit,
  EmployeeBenefit,
  CreateEmployeeDto,
  CreateDepartmentDto,
  CreatePositionDto,
  CreateSalaryDto,
  CreateBenefitDto,
  AssignBenefitDto,
} from './api';

// ==================== EMPLOYEES ====================
export function useEmployees(params?: Parameters<typeof employeesApi.getAll>[0]) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getAll(params),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useGenerateEmployeeCode() {
  return useQuery({
    queryKey: ['employee-generate-code'],
    queryFn: () => employeesApi.generateCode(),
    enabled: false, // only fetch on demand
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEmployeeDto> & { status?: string } }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// ==================== DEPARTMENTS ====================
export function useDepartments(params?: Parameters<typeof departmentsApi.getAll>[0]) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentsApi.getAll(params),
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentDto) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateDepartmentDto> }) =>
      departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

// ==================== POSITIONS ====================
export function usePositions(params?: Parameters<typeof positionsApi.getAll>[0]) {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: () => positionsApi.getAll(params),
  });
}

export function usePosition(id: number) {
  return useQuery({
    queryKey: ['position', id],
    queryFn: () => positionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePositionDto) => positionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePositionDto> }) =>
      positionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => positionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
}

// ==================== SALARY ====================
export function useSalaryRecords(params?: Parameters<typeof salaryApi.getAll>[0]) {
  return useQuery({
    queryKey: ['salary', params],
    queryFn: () => salaryApi.getAll(params),
  });
}

export function useSalaryByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['salary', 'by-month', year, month],
    queryFn: () => salaryApi.getByMonth(year, month),
  });
}

export function useSalarySummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['salary', 'summary', year, month],
    queryFn: () => salaryApi.getSummary(year, month),
  });
}

export function useCreateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalaryDto) => salaryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<CreateSalaryDto, 'employeeId' | 'month' | 'year'>> }) =>
      salaryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useGenerateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year, employeeIds }: { month: number; year: number; employeeIds?: number[] }) =>
      salaryApi.generate(month, year, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useApproveSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salaryApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

export function useMarkSalaryAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod, paymentRef }: { id: number; paymentMethod?: string; paymentRef?: string }) =>
      salaryApi.markAsPaid(id, paymentMethod, paymentRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
}

// ==================== BENEFITS ====================
export function useBenefits(isActive?: boolean) {
  return useQuery({
    queryKey: ['benefits', isActive],
    queryFn: () => benefitsApi.getAll(isActive),
  });
}

export function useBenefit(id: number) {
  return useQuery({
    queryKey: ['benefit', id],
    queryFn: () => benefitsApi.getById(id),
    enabled: !!id,
  });
}

export function useBenefitsSummary() {
  return useQuery({
    queryKey: ['benefits', 'summary'],
    queryFn: () => benefitsApi.getSummary(),
  });
}

export function useCreateBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBenefitDto) => benefitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
}

export function useUpdateBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateBenefitDto> }) =>
      benefitsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
}

export function useDeleteBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => benefitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
}

export function useEmployeeBenefits(employeeId?: number, benefitId?: number) {
  return useQuery({
    queryKey: ['employee-benefits', employeeId, benefitId],
    queryFn: () => benefitsApi.getEmployeeBenefits(employeeId, benefitId),
  });
}

export function useAssignBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignBenefitDto) => benefitsApi.assignBenefit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits'] });
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
}

export function useRemoveEmployeeBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => benefitsApi.removeEmployeeBenefit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-benefits'] });
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
}

// ==================== DASHBOARD ====================
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getOverview(),
  });
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: ['dashboard', 'employee-stats'],
    queryFn: () => dashboardApi.getEmployeeStats(),
  });
}

export function useDashboardSalarySummary(year?: number) {
  return useQuery({
    queryKey: ['dashboard', 'salary-summary', year],
    queryFn: () => dashboardApi.getSalarySummary(year),
  });
}

export function useDepartmentStats() {
  return useQuery({
    queryKey: ['dashboard', 'department-stats'],
    queryFn: () => dashboardApi.getDepartmentStats(),
  });
}

export function useRecentActivities(limit?: number) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities', limit],
    queryFn: () => dashboardApi.getRecentActivities(limit),
  });
}

// ==================== INTEGRATION ====================
export function useSyncUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => integrationApi.syncUsers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUnlinkedUsers() {
  return useQuery({
    queryKey: ['integration', 'unlinked-users'],
    queryFn: () => integrationApi.getUnlinkedUsers(),
  });
}
