"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, BarChart3, Wallet, PiggyBank, Shield, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from '@/app/i18n/client';

// Loading component 
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function Home() {
  const { userLocale, isLoading } = useLanguage();
  const { t } = useTranslation(userLocale, 'home');

  // If language is still loading, show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <LanguageSelector />
            </div>
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" className="cursor-pointer">{t('signIn')}</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <SignInButton>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 cursor-pointer">
                  {t('getStarted')}
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  {t('goToDashboard')} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border">
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('analytics.title')}</h3>
              <p className="text-muted-foreground">{t('analytics.description')}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <PiggyBank className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('budgeting.title')}</h3>
              <p className="text-muted-foreground">{t('budgeting.description')}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('security.title')}</h3>
              <p className="text-muted-foreground">{t('security.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('appName')}. {t('footer')}</p>
        </div>
      </footer>
    </div>
  );
}
