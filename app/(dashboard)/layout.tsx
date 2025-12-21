'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}