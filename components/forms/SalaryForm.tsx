// components/forms/SalaryForm.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useEmployees } from '@/lib/hooks';
import { CreateSalaryDto } from '@/lib/api';

interface SalaryFormProps {
  initialMonth: number;
  initialYear: number;
  onSubmit: (data: CreateSalaryDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SalaryForm({
  initialMonth,
  initialYear,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SalaryFormProps) {
  const { data: employeesData } = useEmployees({ status: 'ACTIVE', limit: 100 });
  const employees = employeesData?.data || [];

  const [formData, setFormData] = useState({
    employeeId: '',
    month: String(initialMonth),
    year: String(initialYear),
    baseSalary: '',
    overtimeHours: '0',
    overtimeRate: '1.5',
    bonus: '0',
    allowances: '0',
    commission: '0',
    socialSecurity: '0',
    tax: '0',
    otherDeductions: '0',
    deductionNotes: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill baseSalary when employee is selected
  useEffect(() => {
    if (formData.employeeId) {
      const emp = employees.find((e: any) => String(e.id) === formData.employeeId);
      if (emp) {
        setFormData((prev) => ({
          ...prev,
          baseSalary: String(emp.baseSalary || 0),
          socialSecurity: String(Math.min((emp.baseSalary || 0) * 0.05, 750)),
        }));
      }
    }
  }, [formData.employeeId, employees]);

  const employeeOptions = [
    { value: '', label: 'เลือกพนักงาน' },
    ...employees.map((e: any) => ({
      value: String(e.id),
      label: `${e.employeeCode} - ${e.firstName} ${e.lastName}`,
    })),
  ];

  const monthOptions = [
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

  const now = new Date();
  const yearOptions = [
    { value: String(now.getFullYear()), label: String(now.getFullYear() + 543) },
    { value: String(now.getFullYear() - 1), label: String(now.getFullYear() - 1 + 543) },
  ];

  // Calculate preview
  const baseSalary = Number(formData.baseSalary) || 0;
  const overtimeHours = Number(formData.overtimeHours) || 0;
  const overtimeRate = Number(formData.overtimeRate) || 1.5;
  const overtimeAmount = baseSalary > 0 ? (baseSalary / (22 * 8)) * overtimeHours * overtimeRate : 0;
  const bonus = Number(formData.bonus) || 0;
  const allowances = Number(formData.allowances) || 0;
  const commission = Number(formData.commission) || 0;
  const grossSalary = baseSalary + overtimeAmount + bonus + allowances + commission;
  const socialSecurity = Number(formData.socialSecurity) || 0;
  const tax = Number(formData.tax) || 0;
  const otherDeductions = Number(formData.otherDeductions) || 0;
  const totalDeductions = socialSecurity + tax + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'กรุณาเลือกพนักงาน';
    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      newErrors.baseSalary = 'กรุณากรอกเงินเดือนพื้นฐาน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateSalaryDto = {
      employeeId: Number(formData.employeeId),
      month: Number(formData.month),
      year: Number(formData.year),
      baseSalary: Number(formData.baseSalary),
    };

    if (overtimeHours > 0) dto.overtimeHours = overtimeHours;
    if (overtimeRate !== 1.5) dto.overtimeRate = overtimeRate;
    if (bonus > 0) dto.bonus = bonus;
    if (allowances > 0) dto.allowances = allowances;
    if (commission > 0) dto.commission = commission;
    if (socialSecurity > 0) dto.socialSecurity = socialSecurity;
    if (tax > 0) dto.tax = tax;
    if (otherDeductions > 0) dto.otherDeductions = otherDeductions;
    if (formData.deductionNotes.trim()) dto.deductionNotes = formData.deductionNotes.trim();
    if (formData.notes.trim()) dto.notes = formData.notes.trim();

    onSubmit(dto);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const formatNum = (n: number) =>
    n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Section: Employee & Period */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          ข้อมูลพนักงานและงวด
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Select
              label="พนักงาน *"
              options={employeeOptions}
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              error={errors.employeeId}
            />
          </div>
          <Select
            label="เดือน"
            options={monthOptions}
            value={formData.month}
            onChange={(e) => handleChange('month', e.target.value)}
          />
          <Select
            label="ปี"
            options={yearOptions}
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
          />
          <Input
            label="เงินเดือนพื้นฐาน (บาท) *"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleChange('baseSalary', e.target.value)}
            error={errors.baseSalary}
            placeholder="25000"
          />
        </div>
      </div>

      {/* Section: Income */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          รายได้เพิ่มเติม
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="ชั่วโมงล่วงเวลา"
            type="number"
            value={formData.overtimeHours}
            onChange={(e) => handleChange('overtimeHours', e.target.value)}
            placeholder="0"
          />
          <Input
            label="เรทค่าล่วงเวลา (เท่า)"
            type="number"
            value={formData.overtimeRate}
            onChange={(e) => handleChange('overtimeRate', e.target.value)}
            placeholder="1.5"
          />
          <div className="flex items-end">
            <div className="w-full bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-xs text-gray-500">ค่าล่วงเวลา</p>
              <p className="text-sm font-semibold text-green-600">+฿{formatNum(overtimeAmount)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Input
            label="โบนัส (บาท)"
            type="number"
            value={formData.bonus}
            onChange={(e) => handleChange('bonus', e.target.value)}
            placeholder="0"
          />
          <Input
            label="เบี้ยเลี้ยง (บาท)"
            type="number"
            value={formData.allowances}
            onChange={(e) => handleChange('allowances', e.target.value)}
            placeholder="0"
          />
          <Input
            label="คอมมิชชัน (บาท)"
            type="number"
            value={formData.commission}
            onChange={(e) => handleChange('commission', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Section: Deductions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          รายการหัก
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="ประกันสังคม (บาท)"
            type="number"
            value={formData.socialSecurity}
            onChange={(e) => handleChange('socialSecurity', e.target.value)}
            placeholder="0"
          />
          <Input
            label="ภาษี (บาท)"
            type="number"
            value={formData.tax}
            onChange={(e) => handleChange('tax', e.target.value)}
            placeholder="0"
          />
          <Input
            label="หักอื่นๆ (บาท)"
            type="number"
            value={formData.otherDeductions}
            onChange={(e) => handleChange('otherDeductions', e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="mt-4">
          <Input
            label="หมายเหตุการหัก"
            value={formData.deductionNotes}
            onChange={(e) => handleChange('deductionNotes', e.target.value)}
            placeholder="เช่น หักค่าเสียหาย, หักเงินกู้"
          />
        </div>
      </div>

      {/* Summary Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">สรุปเงินเดือน</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">เงินเดือนพื้นฐาน</span>
            <span className="font-medium">฿{formatNum(baseSalary)}</span>
          </div>
          {overtimeAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">ค่าล่วงเวลา ({overtimeHours} ชม. x{overtimeRate})</span>
              <span className="font-medium text-green-600">+฿{formatNum(overtimeAmount)}</span>
            </div>
          )}
          {bonus > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">โบนัส</span>
              <span className="font-medium text-green-600">+฿{formatNum(bonus)}</span>
            </div>
          )}
          {allowances > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">เบี้ยเลี้ยง</span>
              <span className="font-medium text-green-600">+฿{formatNum(allowances)}</span>
            </div>
          )}
          {commission > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">คอมมิชชัน</span>
              <span className="font-medium text-green-600">+฿{formatNum(commission)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-700 font-medium">รายได้รวม</span>
            <span className="font-semibold">฿{formatNum(grossSalary)}</span>
          </div>
          {totalDeductions > 0 && (
            <>
              {socialSecurity > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ประกันสังคม</span>
                  <span className="font-medium text-red-600">-฿{formatNum(socialSecurity)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ภาษี</span>
                  <span className="font-medium text-red-600">-฿{formatNum(tax)}</span>
                </div>
              )}
              {otherDeductions > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">หักอื่นๆ</span>
                  <span className="font-medium text-red-600">-฿{formatNum(otherDeductions)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between border-t-2 border-gray-300 pt-2">
            <span className="text-gray-900 font-bold">เงินเดือนสุทธิ</span>
            <span className="font-bold text-lg text-primary-600">฿{formatNum(netSalary)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <Input
        label="หมายเหตุ"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="หมายเหตุเพิ่มเติม"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            'บันทึกรายการเงินเดือน'
          )}
        </Button>
      </div>
    </form>
  );
}
