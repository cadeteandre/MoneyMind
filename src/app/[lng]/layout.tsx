import { Locale, i18n } from '../i18n/settings';
import { Inter } from 'next/font/google'
import { dir } from 'i18next';
import '../globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CurrencyProvider } from '@/components/providers/currency-provider';
import { LanguageProvider } from '@/components/providers/language-provider';

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return i18n.locales.map(lng => ({ lng }));
}

export default function RootLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: Locale };
}) {
  return (
    <ClerkProvider>
      <html lang={lng} dir={dir(lng)} className={inter.className} suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CurrencyProvider>
              <LanguageProvider>
                {children}
              </LanguageProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
} 