"use client"

import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import PerformanceDashboard from '@/components/performance-dashboard';
import { PerformanceMonitor } from '@/lib/performance-monitor';

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Start performance monitoring when component mounts
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMonitoring();

    return () => {
      // Clean up when component unmounts
      monitor.stopMonitoring();
    };
  }, []);

  if (!loading && !user) {
    router.push('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <PerformanceDashboard />
      </div>
    </div>
  );
}