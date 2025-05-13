"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CURRENCY_OPTIONS } from '@/lib/utils'

type CurrencyContextType = {
  userCurrency: string
  setUserCurrency: (currency: string) => Promise<void>
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
  userCurrency: 'EUR',
  setUserCurrency: async () => {},
  isLoading: true
})

export const useCurrency = () => useContext(CurrencyContext)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [userCurrency, setUserCurrencyState] = useState<string>('EUR')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isUserLoaded || !user) {
        setIsLoading(false)
        return
      }

      try {
        console.log('Fetching user data to get currency...')
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          console.log('User data fetched:', userData)
          if (userData.currency && CURRENCY_OPTIONS[userData.currency]) {
            console.log('Setting currency to:', userData.currency)
            setUserCurrencyState(userData.currency)
          }
        }
      } catch (error) {
        console.error('Error fetching user currency:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isUserLoaded, user])

  const setUserCurrency = async (currency: string) => {
    if (!user || !CURRENCY_OPTIONS[currency]) return

    try {
      setIsLoading(true)
      console.log('Updating currency to:', currency)
      const response = await fetch('/api/user/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currency })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Currency update response:', data)
        setUserCurrencyState(currency)
        console.log('Currency state updated to:', currency)
      } else {
        console.error('Failed to update currency:', await response.text())
      }
    } catch (error) {
      console.error('Error updating user currency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CurrencyContext.Provider value={{ userCurrency, setUserCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
} 