import { TransactionForm } from "@/components/TransactionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/signIn");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard 👋</h1>
      <p className="text-muted-foreground">User ID: {userId}</p>
      <div>
        <TransactionForm />
      </div>
    </div>
  );
}