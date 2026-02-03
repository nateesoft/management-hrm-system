// components/forms/EmployeeForm.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useDepartments, usePositions } from '@/lib/hooks';
import { CreateEmployeeDto } from '@/lib/api';

interface EmployeeFormProps {
  initialData?: Partial<CreateEmployeeDto>;
  initialCode?: string;
  onSubmit: (data: CreateEmployeeDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function EmployeeForm({
  initialData,
  initialCode,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EmployeeFormProps) {
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();

  const [formData, setFormData] = useState({
    employeeCode: initialData?.employeeCode || initialCode || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    nickname: initialData?.nickname || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    gender: initialData?.gender || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    nationalId: initialData?.nationalId || '',
    departmentId: initialData?.departmentId ? String(initialData.departmentId) : '',
    positionId: initialData?.positionId ? String(initialData.positionId) : '',
    employmentType: initialData?.employmentType || 'FULL_TIME',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    baseSalary: initialData?.baseSalary ? String(initialData.baseSalary) : '',
    bankAccount: initialData?.bankAccount || '',
    bankName: initialData?.bankName || '',
    address: initialData?.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCode && !formData.employeeCode) {
      setFormData((prev) => ({ ...prev, employeeCode: initialCode }));
    }
  }, [initialCode]);

  const departmentOptions = [
    { value: '', label: 'เลือกแผนก' },
    ...((departments || []) as any[]).map((d: any) => ({
      value: String(d.id),
      label: d.name,
    })),
  ];

  // Filter positions by selected department
  const allPositions = (positions || []) as any[];
  const filteredPositions = formData.departmentId
    ? allPositions.filter((p: any) => String(p.departmentId) === formData.departmentId)
    : allPositions;

  const positionOptions = [
    { value: '', label: 'เลือกตำแหน่ง' },
    ...filteredPositions.map((p: any) => ({
      value: String(p.id),
      label: `${p.name} (${p.code})`,
    })),
  ];

  const genderOptions = [
    { value: '', label: 'เลือกเพศ' },
    { value: 'MALE', label: 'ชาย' },
    { value: 'FEMALE', label: 'หญิง' },
    { value: 'OTHER', label: 'อื่นๆ' },
  ];

  const employmentTypeOptions = [
    { value: 'FULL_TIME', label: 'เต็มเวลา' },
    { value: 'PART_TIME', label: 'พาร์ทไทม์' },
    { value: 'CONTRACT', label: 'สัญญาจ้าง' },
    { value: 'INTERN', label: 'นักศึกษาฝึกงาน' },
  ];

  const bankOptions = [
    { value: '', label: 'เลือกธนาคาร' },
    { value: 'กสิกรไทย', label: 'ธนาคารกสิกรไทย' },
    { value: 'กรุงเทพ', label: 'ธนาคารกรุงเทพ' },
    { value: 'กรุงไทย', label: 'ธนาคารกรุงไทย' },
    { value: 'ไทยพาณิชย์', label: 'ธนาคารไทยพาณิชย์' },
    { value: 'กรุงศรีอยุธยา', label: 'ธนาคารกรุงศรีอยุธยา' },
    { value: 'ทหารไทยธนชาต', label: 'ธนาคารทหารไทยธนชาต' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeCode.trim()) newErrors.employeeCode = 'กรุณากรอกรหัสพนักงาน';
    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.departmentId) newErrors.departmentId = 'กรุณาเลือกแผนก';
    if (!formData.positionId) newErrors.positionId = 'กรุณาเลือกตำแหน่ง';

    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      newErrors.baseSalary = 'กรุณากรอกเงินเดือนที่ถูกต้อง';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateEmployeeDto = {
      employeeCode: formData.employeeCode.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      departmentId: Number(formData.departmentId),
      positionId: Number(formData.positionId),
      baseSalary: Number(formData.baseSalary),
    };

    // Optional fields
    if (formData.nickname.trim()) dto.nickname = formData.nickname.trim();
    if (formData.email.trim()) dto.email = formData.email.trim();
    if (formData.phone.trim()) dto.phone = formData.phone.trim();
    if (formData.gender) dto.gender = formData.gender as any;
    if (formData.dateOfBirth) dto.dateOfBirth = formData.dateOfBirth;
    if (formData.nationalId.trim()) dto.nationalId = formData.nationalId.trim();
    if (formData.employmentType) dto.employmentType = formData.employmentType as any;
    if (formData.startDate) dto.startDate = formData.startDate;
    if (formData.bankAccount.trim()) dto.bankAccount = formData.bankAccount.trim();
    if (formData.bankName) dto.bankName = formData.bankName;
    if (formData.address.trim()) dto.address = formData.address.trim();

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
    // Reset position when department changes
    if (field === 'departmentId') {
      setFormData((prev) => ({ ...prev, departmentId: value, positionId: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Section: Basic Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          ข้อมูลพื้นฐาน
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="รหัสพนักงาน *"
            value={formData.employeeCode}
            onChange={(e) => handleChange('employeeCode', e.target.value)}
            error={errors.employeeCode}
            placeholder="EMP006"
          />
          <Select
            label="เพศ"
            options={genderOptions}
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Input
            label="ชื่อ *"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="สมชาย"
          />
          <Input
            label="นามสกุล *"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="ใจดี"
          />
          <Input
            label="ชื่อเล่น"
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="ชาย"
          />
        </div>
      </div>

      {/* Section: Work Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          ข้อมูลการทำงาน
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="แผนก *"
            options={departmentOptions}
            value={formData.departmentId}
            onChange={(e) => handleChange('departmentId', e.target.value)}
            error={errors.departmentId}
          />
          <Select
            label="ตำแหน่ง *"
            options={positionOptions}
            value={formData.positionId}
            onChange={(e) => handleChange('positionId', e.target.value)}
            error={errors.positionId}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Select
            label="ประเภทการจ้าง"
            options={employmentTypeOptions}
            value={formData.employmentType}
            onChange={(e) => handleChange('employmentType', e.target.value)}
          />
          <Input
            label="วันที่เริ่มงาน"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          <Input
            label="เงินเดือน (บาท) *"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => handleChange('baseSalary', e.target.value)}
            error={errors.baseSalary}
            placeholder="25000"
          />
        </div>
      </div>

      {/* Section: Contact */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          ข้อมูลติดต่อ
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="อีเมล"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="somchai@restaurant.com"
          />
          <Input
            label="เบอร์โทรศัพท์"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="0891234567"
          />
        </div>
      </div>

      {/* Section: Personal / Bank (collapsible feeling) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
          ข้อมูลเพิ่มเติม
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="วันเกิด"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />
          <Input
            label="เลขบัตรประชาชน"
            value={formData.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
            placeholder="1234567890123"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Select
            label="ธนาคาร"
            options={bankOptions}
            value={formData.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
          />
          <Input
            label="เลขบัญชีธนาคาร"
            value={formData.bankAccount}
            onChange={(e) => handleChange('bankAccount', e.target.value)}
            placeholder="1234567890"
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
          ) : initialData ? (
            'บันทึกการแก้ไข'
          ) : (
            'เพิ่มพนักงาน'
          )}
        </Button>
      </div>
    </form>
  );
}
