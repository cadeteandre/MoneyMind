"use client";

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMockData } from '@/components/demo/MockDataProviderI18n';
import { useLanguage } from '@/components/providers/language-provider';
import { useTranslation } from '@/app/i18n/client';

export function useDemo() {
  const router = useRouter();
  const pathname = usePathname();
  const mockData = useMockData();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'sidebar');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check if current route is a demo route
  const isDemoRoute = pathname.startsWith('/demo');

  // Navigate to demo version of a page
  const goToDemo = useCallback((page: 'dashboard' | 'transactions' | 'profile') => {
    setIsTransitioning(true);
    router.push(`/demo/${page}`);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [router]);

  // Navigate to real version (with sign-up prompt)
  const exitDemo = useCallback(() => {
    setIsTransitioning(true);
    router.push('/');
    setTimeout(() => setIsTransitioning(false), 300);
  }, [router]);

  // Simulate user action with demo limitations
  const simulateAction = useCallback((actionName: string, callback?: () => void) => {
    // In demo mode, show a modal or toast explaining the limitation
    console.log(`Demo limitation: ${actionName} is not available in demo mode`);
    
    // Could trigger a modal here showing:
    // "This feature is available when you create an account. Sign up to get started!"
    
    if (callback) {
      callback();
    }
  }, []);

  // Get demo-specific navigation items
  const getDemoNavigation = useCallback(() => {
    return [
      {
        label: t('dashboard'),
        href: '/demo/dashboard',
        isActive: pathname === '/demo/dashboard'
      },
      {
        label: t('transactions'),
        href: '/demo/transactions',
        isActive: pathname === '/demo/transactions'
      },
      {
        label: t('profile'),
        href: '/demo/profile',
        isActive: pathname === '/demo/profile'
      }
    ];
  }, [pathname, t]);

  // Format currency for demo (using mock user currency and current locale)
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat(userLocale, {
      style: 'currency',
      currency: mockData.user.currency,
    }).format(amount);
  }, [userLocale, mockData.user.currency]);

  // Format date for demo (using current locale)
  const formatDate = useCallback((date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(userLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }, [userLocale]);

  return {
    // State
    isDemoRoute,
    isTransitioning,
    mockData,

    // Navigation
    goToDemo,
    exitDemo,
    getDemoNavigation,

    // Actions
    simulateAction,

    // Utilities
    formatCurrency,
    formatDate,
  };
} 