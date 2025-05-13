import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { CurrencyProvider } from '@/components/providers/currency-provider'
import { CurrencyDebug } from '@/components/CurrencyDebug'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoneyMind',
  description: 'Personal finance dashboard',
  icons: {
    icon: '/money_mind_logo.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CurrencyProvider>
              {children}
              <CurrencyDebug />
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
