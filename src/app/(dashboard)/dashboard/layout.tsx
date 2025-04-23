import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import SidebarToggle from "@/components/SidebarToggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  async function GET() {
    const { userId } = await auth()
    if (!userId) {
      redirect("/sign-in");
    }
  }
  GET();

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <SidebarToggle />
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}