"use client"

import Link from "next/link"
import { LanguageSelector } from "./LanguageSelector"
import { ThemeToggle } from "./theme-toggle"
import { useLanguage } from "./providers/language-provider"

// Traduções simplificadas para o header
const translations = {
  pt: {
    home: 'Início',
    dashboard: 'Dashboard',
    profile: 'Perfil'
  },
  en: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile'
  },
  es: {
    home: 'Inicio',
    dashboard: 'Panel',
    profile: 'Perfil'
  },
  de: {
    home: 'Startseite',
    dashboard: 'Dashboard',
    profile: 'Profil'
  }
}

export function Header() {
  const { userLocale } = useLanguage()
  const t = translations[userLocale as keyof typeof translations] || translations.en

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            MoneyMind
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              {t.home}
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              {t.dashboard}
            </Link>
            <Link href="/dashboard/profile" className="text-sm font-medium hover:underline">
              {t.profile}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <LanguageSelector />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 