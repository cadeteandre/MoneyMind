"use client";

import { MockDataProviderI18n } from "@/components/demo/MockDataProviderI18n";
import DemoSidebar from "@/components/demo/DemoSidebar";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MockDataProviderI18n>
      <div className="flex h-screen flex-col md:flex-row bg-white dark:bg-gray-950">
        <DemoSidebar />
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto dark:text-white">
          {children}
        </main>
      </div>
    </MockDataProviderI18n>
  );
} 