import { TransactionForm } from "@/components/TransactionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/signIn");
  }

  return (
      <section className="bg-card max-w-[400px] mt-4 p-6 rounded-xl shadow-sm mx-auto">
        <h2 className="text-xl font-semibold mb-2">Add transaction</h2>
        <TransactionForm />
      </section>
  );
}