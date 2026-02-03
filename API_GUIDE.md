# API Development Guide

## การเพิ่ม API Routes สำหรับเชื่อมต่อ Database

### 1. โครงสร้าง API Routes

สร้างไฟล์ใน `app/api/`:

\`\`\`
app/api/
├── employees/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE (specific employee)
├── salary/
│   ├── route.ts
│   └── [id]/route.ts
└── benefits/
    ├── route.ts
    └── [id]/route.ts
\`\`\`

### 2. ตัวอย่าง API Route - Employees

\`\`\`typescript
// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET - List all employees
export async function GET(request: NextRequest) {
  try {
    // TODO: Query from database
    // const employees = await db.employee.findMany();
    
    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validate input
    // TODO: Insert into database
    // const newEmployee = await db.employee.create({ data: body });
    
    return NextResponse.json({
      success: true,
      data: newEmployee,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
\`\`\`

\`\`\`typescript
// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET - Get specific employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // TODO: Query from database
    // const employee = await db.employee.findUnique({ where: { id } });
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // TODO: Validate input
    // TODO: Update in database
    // const updated = await db.employee.update({
    //   where: { id },
    //   data: body,
    // });
    
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // TODO: Delete from database
    // await db.employee.delete({ where: { id } });
    
    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
\`\`\`

### 3. Database Integration with Prisma

#### ติดตั้ง Prisma

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

#### Schema Example (prisma/schema.prisma)

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // หรือ "mysql", "sqlite"
  url      = env("DATABASE_URL")
}

model Employee {
  id          String   @id @default(uuid())
  firstName   String
  lastName    String
  position    String
  status      String
  phoneNumber String
  email       String   @unique
  startDate   DateTime
  salary      Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  salaries    SalaryRecord[]
  benefits    EmployeeBenefit[]
}

model SalaryRecord {
  id          String   @id @default(uuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  month       String
  baseSalary  Int
  overtime    Int
  bonus       Int
  deductions  Int
  netSalary   Int
  status      String
  paidDate    DateTime?
  createdAt   DateTime @default(now())
}

model Benefit {
  id                  String   @id @default(uuid())
  name                String
  description         String
  value               Int
  type                String
  eligiblePositions   String[] // Array of positions
  createdAt           DateTime @default(now())
  
  employeeBenefits    EmployeeBenefit[]
}

model EmployeeBenefit {
  id         String    @id @default(uuid())
  employeeId String
  employee   Employee  @relation(fields: [employeeId], references: [id])
  benefitId  String
  benefit    Benefit   @relation(fields: [benefitId], references: [id])
  startDate  DateTime
  endDate    DateTime?
  status     String
  createdAt  DateTime  @default(now())
}
\`\`\`

#### สร้าง Database Client

\`\`\`typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
\`\`\`

### 4. Environment Variables

สร้างไฟล์ `.env`:

\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_hrm"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 5. Data Fetching on Client

#### ใช้ fetch API

\`\`\`typescript
// lib/api.ts
export async function fetchEmployees() {
  const response = await fetch('/api/employees');
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}

export async function createEmployee(data: any) {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create employee');
  return response.json();
}

export async function updateEmployee(id: string, data: any) {
  const response = await fetch(\`/api/employees/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update employee');
  return response.json();
}

export async function deleteEmployee(id: string) {
  const response = await fetch(\`/api/employees/\${id}\`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete employee');
  return response.json();
}
\`\`\`

#### ใช้ใน Component

\`\`\`typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchEmployees, createEmployee } from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      setEmployees(data.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(formData: any) {
    try {
      await createEmployee(formData);
      loadEmployees(); // Reload list
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    // Your component JSX
  );
}
\`\`\`

### 6. ใช้ React Query (แนะนำ)

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

\`\`\`typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
\`\`\`

\`\`\`typescript
// ใช้ใน Component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // ...
}
\`\`\`

### 7. Authentication with NextAuth.js

\`\`\`bash
npm install next-auth
\`\`\`

สร้าง `app/api/auth/[...nextauth]/route.ts` สำหรับ authentication

### 8. Validation with Zod

\`\`\`bash
npm install zod
\`\`\`

\`\`\`typescript
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  position: z.enum(['server', 'kitchen', 'cashier', 'manager']),
  salary: z.number().positive('Salary must be positive'),
});

// ใน API Route
const result = employeeSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { success: false, errors: result.error.errors },
    { status: 400 }
  );
}
\`\`\`

## สรุป

1. สร้าง API Routes ใน `app/api/`
2. เชื่อมต่อ Database ด้วย Prisma
3. ใช้ React Query สำหรับ data fetching
4. เพิ่ม Authentication ด้วย NextAuth.js
5. Validate ข้อมูลด้วย Zod
6. จัดการ Error Handling ให้ดี
7. เพิ่ม Loading States
8. Implement Optimistic Updates
