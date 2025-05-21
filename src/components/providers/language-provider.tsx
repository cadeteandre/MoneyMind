"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { getOptions } from '@/app/i18n/settings'
import { useUser } from '@clerk/nextjs'

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
    lng: 'en', // Idioma padrão
    interpolation: {
      escapeValue: false,
    }
  })

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [userLocale, setLocale] = useState<Locale>('en')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    // Carregar a preferência de idioma do usuário ao montar o componente
    async function loadUserLocale() {
      try {
        // Se o usuário estiver logado, tenta carregar do servidor
        if (isSignedIn) {
          const response = await fetch('/api/user/language')
          if (response.ok) {
            const data = await response.json()
            if (data.locale && ['pt', 'en', 'es', 'de'].includes(data.locale)) {
              setLocale(data.locale as Locale)
              await i18next.changeLanguage(data.locale)
              return
            }
          }
        }

        // Se não estiver logado ou falhar ao carregar do servidor, tenta carregar do localStorage
        const savedLocale = localStorage.getItem('userLocale')
        if (savedLocale && ['pt', 'en', 'es', 'de'].includes(savedLocale)) {
          setLocale(savedLocale as Locale)
          await i18next.changeLanguage(savedLocale)
        }
      } catch (error) {
        console.error('Error loading user language preference:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded) {
      loadUserLocale()
    }
  }, [isLoaded, isSignedIn])

  // Função para alterar o idioma
  const setUserLocale = async (locale: Locale) => {
    setIsLoading(true)
    try {
      // Se o usuário estiver logado, atualiza no servidor
      if (isSignedIn) {
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
      }

      // Salva no localStorage independente de estar logado ou não
      localStorage.setItem('userLocale', locale)
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