// src/app/dashboard/layout.tsx
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server'
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {

  async function GET() {
    // Use `auth()` to get the user's ID
    const { userId } = await auth()

    // Protect the route by checking if the user is signed in
    if (!userId) {
        redirect("/sign-in");
    }
  }
  GET();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Dashboard</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="hover:underline">Overview</Link>
          </li>
          <li>
            <Link href="/dashboard/perfil" className="hover:underline">Profile</Link>
          </li>
        </ul>
        <div className="mt-10">
          <UserButton />
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
