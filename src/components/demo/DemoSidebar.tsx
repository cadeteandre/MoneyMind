'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Menu, X, Eye, Home } from "lucide-react";
import { ThemeToggle } from '../theme-toggle';
import { useLanguage } from '../providers/language-provider';
import { LanguageSelector } from '../LanguageSelector';
import { useTranslation } from '@/app/i18n/client';

export default function DemoSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'sidebar');
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on loading
    checkIfMobile();

    // Add listener for resizing
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close the sidebar when clicking a link (mobile only)
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const isActivePath = (path: string) => pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-20 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger button for mobile*/}
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-gray-200 dark:hover:bg-neutral-800 md:hidden cursor-pointer mt-2 ml-2 transition-all duration-300 hover:scale-110"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-20 w-64 bg-gray-100 dark:bg-neutral-800 p-4 border-r h-full transition-all duration-500 ease-in-out transform
          ${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobile ? 'shadow-2xl' : ''}`}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg font-bold dark:text-white transition-colors duration-300">{t('dashboard')} - Demo</h2>
          </div>
          {isMobile && (
            <Button 
              variant="ghost"
              size="icon"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-black cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Demo Banner in Sidebar */}
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg transition-all duration-300 hover:shadow-md">
          <p className="text-xs text-amber-800 dark:text-amber-200 text-center font-medium">
            🎯 {t('demoMode')}
          </p>
        </div>
        
        <ul className="space-y-1">
          <li>
            <Link
              href="/demo/dashboard"
              className={`block px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105
                      ${isActivePath('/demo/dashboard') 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-black dark:hover:text-white hover:shadow-md'}`}
              onClick={handleLinkClick}
            >
              {t('overview')}
            </Link>
          </li>
          <li>
            <Link
              href="/demo/transactions"
              className={`block px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105
                      ${isActivePath('/demo/transactions') 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-black dark:hover:text-white hover:shadow-md'}`}
              onClick={handleLinkClick}
            >
              {t('transactions')}
            </Link>
          </li>
          <li>
            <Link
              href="/demo/profile"
              className={`block px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105
                      ${isActivePath('/demo/profile') 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-black dark:hover:text-white hover:shadow-md'}`}
              onClick={handleLinkClick}
            >
              {t('profile')}
            </Link>
          </li>
        </ul>

        <div className="border-t mt-6 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105
                    text-gray-700 hover:bg-gray-300 hover:text-gray-900
                    dark:text-gray-300 dark:hover:bg-black dark:hover:text-white hover:shadow-md"
            onClick={handleLinkClick}
          >
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="transition-transform duration-300 hover:scale-110">
              <ThemeToggle />
            </div>
            <div className="transition-transform duration-300 hover:scale-110">
              <LanguageSelector />
            </div>
          </div>
          
          {/* CTA for creating account */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
            <p className="text-xs text-blue-800 dark:text-blue-200 text-center mb-2">
              {t('readyToStart')}
            </p>
            <Button asChild size="sm" className="w-full transition-all duration-300 hover:shadow-md">
              <Link href="/">
                {t('createAccount')}
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
} 