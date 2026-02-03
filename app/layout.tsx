// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Restaurant HRM - ระบบจัดการพนักงานร้านอาหาร',
  description: 'ระบบจัดการทรัพยากรบุคคลสำหรับร้านอาหาร',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
