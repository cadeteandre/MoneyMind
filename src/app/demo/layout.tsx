"use client";

import { MockDataProviderI18n } from "@/components/demo/MockDataProviderI18n";
import { DemoModalProvider } from "@/components/demo/DemoModalProvider";
import DemoSidebar from "@/components/demo/DemoSidebar";
import { DemoLimitationModal } from "@/components/demo/DemoLimitationModal";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MockDataProviderI18n>
      <DemoModalProvider>
        <div className="flex h-screen flex-col md:flex-row bg-white dark:bg-gray-950">
          <DemoSidebar />
          
          {/* Conteúdo principal */}
          <main className="flex-1 overflow-auto dark:text-white">
            {children}
          </main>
          
          {/* Demo Limitation Modal */}
          <DemoLimitationModal />
        </div>
      </DemoModalProvider>
    </MockDataProviderI18n>
  );
} 