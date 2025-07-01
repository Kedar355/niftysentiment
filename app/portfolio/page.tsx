"use client"

import React from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import PortfolioOptimizer from '@/components/portfolio-optimizer';

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
        <PortfolioOptimizer />
      </div>
    </div>
  );
}