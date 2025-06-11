"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, BarChart3, Wallet, PiggyBank, Shield, Loader2, Eye, TrendingUp, User } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from '@/app/i18n/client';
import { PreviewCard } from "@/components/demo/PreviewCard";

// Import demo screenshots
import dashboardScreenshot from "../../public/images/moneymind-demo-overview-optimized.webp";
import transactionsScreenshot from "../../public/images/moneymind-demo-transactions-optimized.webp";
import profileScreenshot from "../../public/images/moneymind-demo-profile-optimized.webp";

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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-in slide-in-from-bottom duration-700">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-900 delay-200">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom duration-1000 delay-400">
            <SignedOut>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <SignInButton>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto">
                    {t('getStarted')}
                  </Button>
                </SignInButton>
                <Button size="lg" variant="outline" asChild className="transition-all duration-300 hover:scale-105 hover:shadow-md w-full sm:w-auto">
                  <Link href="/demo/dashboard" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {t('tryDemo')}
                  </Link>
                </Button>
              </div>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Link href="/dashboard" className="flex items-center gap-2">
                  {t('goToDashboard')} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 animate-in slide-in-from-bottom duration-700">{t('features')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-lg bg-background border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in slide-in-from-bottom duration-700 delay-100">
              <BarChart3 className="h-8 w-8 text-primary mb-4 transition-transform duration-300 hover:scale-110" />
              <h3 className="text-xl font-semibold mb-2">{t('analytics.title')}</h3>
              <p className="text-muted-foreground">{t('analytics.description')}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in slide-in-from-bottom duration-700 delay-200">
              <PiggyBank className="h-8 w-8 text-primary mb-4 transition-transform duration-300 hover:scale-110" />
              <h3 className="text-xl font-semibold mb-2">{t('budgeting.title')}</h3>
              <p className="text-muted-foreground">{t('budgeting.description')}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-in slide-in-from-bottom duration-700 delay-300 sm:col-span-2 lg:col-span-1">
              <Shield className="h-8 w-8 text-primary mb-4 transition-transform duration-300 hover:scale-110" />
              <h3 className="text-xl font-semibold mb-2">{t('security.title')}</h3>
              <p className="text-muted-foreground">{t('security.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features in Action Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in slide-in-from-bottom duration-700">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{t('featuresInAction.title')}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('featuresInAction.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="animate-in slide-in-from-left duration-700 delay-100">
              <PreviewCard
                title={t('featuresInAction.dashboard.title')}
                description={t('featuresInAction.dashboard.description')}
                icon={TrendingUp}
                imageImport={dashboardScreenshot}
                demoLink="/demo/dashboard"
                features={[
                  t('featuresInAction.dashboard.features.0'),
                  t('featuresInAction.dashboard.features.1'),
                  t('featuresInAction.dashboard.features.2'),
                  t('featuresInAction.dashboard.features.3')
                ]}
              />
            </div>
            
            <div className="animate-in slide-in-from-bottom duration-700 delay-200">
              <PreviewCard
                title={t('featuresInAction.transactions.title')}
                description={t('featuresInAction.transactions.description')}
                icon={BarChart3}
                imageImport={transactionsScreenshot}
                demoLink="/demo/transactions"
                features={[
                  t('featuresInAction.transactions.features.0'),
                  t('featuresInAction.transactions.features.1'),
                  t('featuresInAction.transactions.features.2'),
                  t('featuresInAction.transactions.features.3')
                ]}
              />
            </div>
            
            <div className="animate-in slide-in-from-right duration-700 delay-300">
              <PreviewCard
                title={t('featuresInAction.profile.title')}
                description={t('featuresInAction.profile.description')}
                icon={User}
                imageImport={profileScreenshot}
                demoLink="/demo/profile"
                features={[
                  t('featuresInAction.profile.features.0'),
                  t('featuresInAction.profile.features.1'),
                  t('featuresInAction.profile.features.2'),
                  t('featuresInAction.profile.features.3')
                ]}
              />
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
