'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from './theme-toggle';

export default function SidebarToggle() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-20" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger button for mobile*/}
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-gray-200 dark:hover:bg-gray-800 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-20 w-64 bg-gray-100 dark:bg-gray-900 p-4 border-r dark:border-gray-700 h-full transition-all duration-300
          ${sidebarOpen || !isMobile ? 'left-0' : '-left-64'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold dark:text-white">Dashboard</h2>
          {isMobile && (
            <Button 
              variant="ghost"
              size="icon"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard" 
              className="hover:underline block py-2 dark:text-gray-200 dark:hover:text-white"
              onClick={handleLinkClick}
            >
              Overview
            </Link>
          </li>
          <li>
            <Link 
              href="/dashboard/profile" 
              className="hover:underline block py-2 dark:text-gray-200 dark:hover:text-white"
              onClick={handleLinkClick}
            >
              Profile
            </Link>
          </li>
        </ul>
        
        <div className="mt-10 flex items-center gap-3">
          <UserButton />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}