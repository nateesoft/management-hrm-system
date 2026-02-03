// components/forms/AssignBenefitForm.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useEmployees, useBenefits } from '@/lib/hooks';
import { AssignBenefitDto } from '@/lib/api';

interface AssignBenefitFormProps {
  onSubmit: (data: AssignBenefitDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function AssignBenefitForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AssignBenefitFormProps) {
  const { data: employeesData } = useEmployees({ status: 'ACTIVE', limit: 100 });
  const { data: benefitsData } = useBenefits(true);

  const employees = employeesData?.data || [];
  const benefits = (benefitsData || []) as any[];

  const [formData, setFormData] = useState({
    employeeId: '',
    benefitId: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill amount when benefit is selected
  useEffect(() => {
    if (formData.benefitId) {
      const benefit = benefits.find((b: any) => String(b.id) === formData.benefitId);
      if (benefit?.defaultAmount) {
        setFormData((prev) => ({
          ...prev,
          amount: String(benefit.defaultAmount),
        }));
      }
    }
  }, [formData.benefitId, benefits]);

  const employeeOptions = [
    { value: '', label: 'เลือกพนักงาน' },
    ...employees.map((e: any) => ({
      value: String(e.id),
      label: `${e.employeeCode} - ${e.firstName} ${e.lastName}`,
    })),
  ];

  const benefitOptions = [
    { value: '', label: 'เลือกสวัสดิการ' },
    ...benefits.map((b: any) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })),
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'กรุณาเลือกพนักงาน';
    if (!formData.benefitId) newErrors.benefitId = 'กรุณาเลือกสวัสดิการ';
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'กรุณากรอกจำนวนเงินที่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: AssignBenefitDto = {
      employeeId: Number(formData.employeeId),
      benefitId: Number(formData.benefitId),
      amount: Number(formData.amount),
    };

    if (formData.startDate) dto.startDate = formData.startDate;
    if (formData.endDate) dto.endDate = formData.endDate;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          เพิ่มสวัสดิการให้พนักงาน
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="พนักงาน *"
            options={employeeOptions}
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
            error={errors.employeeId}
          />
          <Select
            label="สวัสดิการ *"
            options={benefitOptions}
            value={formData.benefitId}
            onChange={(e) => handleChange('benefitId', e.target.value)}
            error={errors.benefitId}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Input
            label="จำนวนเงิน (บาท/เดือน) *"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            placeholder="1500"
          />
          <Input
            label="วันที่เริ่มต้น"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          <Input
            label="วันที่สิ้นสุด"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Input
            label="หมายเหตุ"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม"
          />
        </div>
      </div>

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
            'เพิ่มสวัสดิการ'
          )}
        </Button>
      </div>
    </form>
  );
}
