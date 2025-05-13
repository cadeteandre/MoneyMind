"use client"

import { useCurrency } from "./providers/currency-provider"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

interface UserData {
  id: string;
  email: string;
  name: string | null;
  currency?: string;
  _count?: {
    transactions: number;
  };
}

export function CurrencyDebug() {
  const { userCurrency, isLoading } = useCurrency()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user')
      const data = await res.json()
      setUserData(data)
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  useEffect(() => {
    if (showDebug) {
      fetchUserData()
    }
  }, [showDebug])

  if (!showDebug) {
    return (
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-2 right-2 opacity-30 hover:opacity-100"
      >
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-2 right-2 bg-black/80 text-white p-4 rounded-lg text-xs w-80 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Currency Debug</h3>
        <Button size="sm" variant="ghost" onClick={() => setShowDebug(false)} className="h-6 w-6 p-0">
          ×
        </Button>
      </div>
      
      <div className="space-y-2">
        <p>Current currency from context: <span className="font-bold">{isLoading ? "Loading..." : userCurrency}</span></p>
        <p>Loading state: <span className="font-bold">{isLoading ? "true" : "false"}</span></p>
        
        <div className="border-t border-gray-600 my-2 pt-2">
          <p className="font-bold mb-1">User data from API:</p>
          {userData ? (
            <pre className="whitespace-pre-wrap text-xs overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={fetchUserData} className="w-full text-xs">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
} 