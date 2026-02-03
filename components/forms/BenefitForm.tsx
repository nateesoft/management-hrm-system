// components/forms/BenefitForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CreateBenefitDto } from '@/lib/api';

interface BenefitFormProps {
  onSubmit: (data: CreateBenefitDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function BenefitForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BenefitFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'OTHER',
    defaultAmount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeOptions = [
    { value: 'HEALTH_INSURANCE', label: 'ประกันสุขภาพ' },
    { value: 'TRANSPORTATION', label: 'ค่าเดินทาง' },
    { value: 'MEAL_ALLOWANCE', label: 'ค่าอาหาร' },
    { value: 'HOUSING', label: 'ค่าที่พัก' },
    { value: 'PHONE_ALLOWANCE', label: 'ค่าโทรศัพท์' },
    { value: 'BONUS', label: 'โบนัส' },
    { value: 'OTHER', label: 'อื่นๆ' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = 'กรุณากรอกรหัสสวัสดิการ';
    if (!formData.name.trim()) newErrors.name = 'กรุณากรอกชื่อสวัสดิการ';
    if (!formData.type) newErrors.type = 'กรุณาเลือกประเภท';

    if (formData.defaultAmount && Number(formData.defaultAmount) < 0) {
      newErrors.defaultAmount = 'จำนวนเงินต้องมากกว่า 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateBenefitDto = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: formData.type as any,
    };

    if (formData.description.trim()) dto.description = formData.description.trim();
    if (formData.defaultAmount && Number(formData.defaultAmount) > 0) {
      dto.defaultAmount = Number(formData.defaultAmount);
    }

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
          ข้อมูลสวัสดิการ
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="รหัสสวัสดิการ *"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            error={errors.code}
            placeholder="HEALTH_INS"
          />
          <Select
            label="ประเภท *"
            options={typeOptions}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            error={errors.type}
          />
        </div>
        <div className="mt-4">
          <Input
            label="ชื่อสวัสดิการ *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="ประกันสุขภาพกลุ่ม"
          />
        </div>
        <div className="mt-4">
          <Input
            label="คำอธิบาย"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="รายละเอียดสวัสดิการ"
          />
        </div>
        <div className="mt-4">
          <Input
            label="จำนวนเงินเริ่มต้น (บาท/เดือน)"
            type="number"
            value={formData.defaultAmount}
            onChange={(e) => handleChange('defaultAmount', e.target.value)}
            error={errors.defaultAmount}
            placeholder="1500"
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
