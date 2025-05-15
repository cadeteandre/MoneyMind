"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, BarChart3, Wallet, PiggyBank, Shield, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LanguageSelector } from "@/components/LanguageSelector";

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

  // If language is still loading, show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Traduções para a página inicial
  const translations = {
    pt: {
      signIn: "Entrar",
      appName: "MoneyMind",
      title: "Assuma o Controle das Suas Finanças",
      description: "MoneyMind ajuda você a rastrear, analisar e otimizar sua vida financeira com insights poderosos e ferramentas intuitivas.",
      getStarted: "Começar",
      goToDashboard: "Ir para o Dashboard",
      features: "Recursos Poderosos",
      analytics: {
        title: "Análise Financeira",
        description: "Obtenha insights detalhados sobre seus padrões de gastos e saúde financeira."
      },
      budgeting: {
        title: "Orçamento Inteligente",
        description: "Crie e acompanhe orçamentos que ajudam você a atingir seus objetivos financeiros."
      },
      security: {
        title: "Seguro e Privado",
        description: "Seus dados financeiros são protegidos com segurança de nível empresarial."
      },
      footer: "Todos os direitos reservados."
    },
    en: {
      signIn: "Sign In",
      appName: "MoneyMind",
      title: "Take Control of Your Finances",
      description: "MoneyMind helps you track, analyze, and optimize your financial life with powerful insights and intuitive tools.",
      getStarted: "Get Started",
      goToDashboard: "Go to Dashboard",
      features: "Powerful Features",
      analytics: {
        title: "Financial Analytics",
        description: "Get detailed insights into your spending patterns and financial health."
      },
      budgeting: {
        title: "Smart Budgeting",
        description: "Create and track budgets that help you reach your financial goals."
      },
      security: {
        title: "Secure & Private",
        description: "Your financial data is protected with enterprise-grade security."
      },
      footer: "All rights reserved."
    },
    es: {
      signIn: "Iniciar Sesión",
      appName: "MoneyMind",
      title: "Toma el Control de tus Finanzas",
      description: "MoneyMind te ayuda a rastrear, analizar y optimizar tu vida financiera con poderosas perspectivas y herramientas intuitivas.",
      getStarted: "Comenzar",
      goToDashboard: "Ir al Panel",
      features: "Características Potentes",
      analytics: {
        title: "Análisis Financiero",
        description: "Obtenga información detallada sobre sus patrones de gasto y salud financiera."
      },
      budgeting: {
        title: "Presupuesto Inteligente",
        description: "Cree y haga seguimiento de presupuestos que le ayuden a alcanzar sus objetivos financieros."
      },
      security: {
        title: "Seguro y Privado",
        description: "Sus datos financieros están protegidos con seguridad de nivel empresarial."
      },
      footer: "Todos los derechos reservados."
    },
    de: {
      signIn: "Anmelden",
      appName: "MoneyMind",
      title: "Übernehmen Sie die Kontrolle über Ihre Finanzen",
      description: "MoneyMind hilft Ihnen, Ihr Finanzleben mit leistungsstarken Einblicken und intuitiven Tools zu verfolgen, zu analysieren und zu optimieren.",
      getStarted: "Loslegen",
      goToDashboard: "Zum Dashboard",
      features: "Leistungsstarke Funktionen",
      analytics: {
        title: "Finanzanalyse",
        description: "Erhalten Sie detaillierte Einblicke in Ihre Ausgabemuster und Ihre finanzielle Gesundheit."
      },
      budgeting: {
        title: "Intelligente Budgetierung",
        description: "Erstellen und verfolgen Sie Budgets, die Ihnen helfen, Ihre finanziellen Ziele zu erreichen."
      },
      security: {
        title: "Sicher & Privat",
        description: "Ihre Finanzdaten sind mit Sicherheit auf Unternehmensniveau geschützt."
      },
      footer: "Alle Rechte vorbehalten."
    }
  };

  // Seleciona a tradução baseada no idioma atual
  const t = translations[userLocale as keyof typeof translations] || translations.en;

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t.appName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <LanguageSelector />
            </div>
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" className="cursor-pointer">{t.signIn}</Button>
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
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.description}
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <SignInButton>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 cursor-pointer">
                  {t.getStarted}
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  {t.goToDashboard} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t.features}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background border">
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.analytics.title}</h3>
              <p className="text-muted-foreground">{t.analytics.description}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <PiggyBank className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.budgeting.title}</h3>
              <p className="text-muted-foreground">{t.budgeting.description}</p>
            </div>
            <div className="p-6 rounded-lg bg-background border">
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.security.title}</h3>
              <p className="text-muted-foreground">{t.security.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {t.appName}. {t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
