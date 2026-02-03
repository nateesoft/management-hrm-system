// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, DollarSign, Gift, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard },
  { name: 'พนักงาน', href: '/employees', icon: Users },
  { name: 'เงินเดือน', href: '/salary', icon: DollarSign },
  { name: 'สวัสดิการ', href: '/benefits', icon: Gift },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">ระบบ HRM</h1>
        <p className="text-sm text-gray-400 mt-1">ร้านอาหาร</p>
      </div>
      
      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 mb-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          <p>Restaurant HRM v1.0</p>
          <p className="mt-1">© 2024</p>
        </div>
      </div>
    </div>
  );
}
