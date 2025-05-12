import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, BarChart3, Wallet, PiggyBank, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MoneyMind</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" className="cursor-pointer">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Take Control of Your Finances
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MoneyMind helps you track, analyze, and optimize your financial life with powerful insights and intuitive tools.
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <SignInButton>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 cursor-pointer">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border">
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Financial Analytics</h3>
              <p className="text-muted-foreground">Get detailed insights into your spending patterns and financial health.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <PiggyBank className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Budgeting</h3>
              <p className="text-muted-foreground">Create and track budgets that help you reach your financial goals.</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your financial data is protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} MoneyMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
