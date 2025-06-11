"use client";

import { AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className = "" }: DemoBannerProps) {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'demo-banner');

  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 dark:text-amber-200">
            🎯 <strong>{t('demoMode')}</strong> - {t('viewingFakeData')}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button size="sm" variant="outline" asChild className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200">
            <Link href="/" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {t('createAccount')}
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
} 