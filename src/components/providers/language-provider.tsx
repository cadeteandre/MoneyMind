"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/app/i18n/settings'

type Locale = 'pt' | 'en' | 'es' | 'de'

interface LanguageContextType {
  userLocale: Locale
  setUserLocale: (locale: Locale) => Promise<void>
  isLoading: boolean
}

// Inicializa i18next
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => 
    import(`../../../public/locales/${language}/${namespace}.json`)
  ))
  .init({
    ...getOptions(),
    lng: 'pt', // Idioma padrão
    interpolation: {
      escapeValue: false,
    }
  })

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [userLocale, setLocale] = useState<Locale>('pt')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Carregar a preferência de idioma do usuário ao montar o componente
    async function loadUserLocale() {
      try {
        const response = await fetch('/api/user/language')
        if (response.ok) {
          const data = await response.json()
          if (data.locale && ['pt', 'en', 'es', 'de'].includes(data.locale)) {
            setLocale(data.locale as Locale)
            await i18next.changeLanguage(data.locale)
          }
        }
      } catch (error) {
        console.error('Error loading user language preference:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserLocale()
  }, [])

  // Função para alterar o idioma
  const setUserLocale = async (locale: Locale) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      })

      if (!response.ok) {
        throw new Error('Failed to update language preference')
      }

      setLocale(locale)
      // Muda o idioma sem recarregar a página
      await i18next.changeLanguage(locale)
      router.refresh()
      return Promise.resolve()
    } catch (error) {
      console.error('Error updating language preference:', error)
      toast.error('Failed to update language preference')
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        userLocale,
        setUserLocale,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 