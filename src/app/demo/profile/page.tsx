"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, User, Mail, Globe, DollarSign, Calendar, Shield } from "lucide-react";
import { useMockData } from "@/components/demo/MockDataProviderI18n";
import { useDemo } from "@/hooks/useDemo";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";
import Image from "next/image";

export default function DemoProfilePage() {
  const mockData = useMockData();
  const { formatDate } = useDemo();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'dashboard');

  const currencies = ['EUR', 'USD', 'GBP', 'BRL', 'JPY', 'CAD', 'AUD', 'CHF'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' }
  ];

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {t('profile')} - Demo
          </h1>
          <p className="text-muted-foreground mt-1">{t('manageProfile')}</p>
        </div>
      </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profilePicture')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={mockData.user.avatar}
                  alt={mockData.user.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{mockData.user.name}</h3>
                <p className="text-muted-foreground">{mockData.user.email}</p>
              </div>
              <Button variant="outline" disabled className="w-full">
                {t('changePhoto')}
              </Button>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('basicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">{t('fullName')}</label>
                  <Input
                    id="name"
                    value={mockData.user.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">{t('email')}</label>
                  <Input
                    id="email"
                    type="email"
                    value={mockData.user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  {t('memberSince')}
                </label>
                <Input
                  value={formatDate(mockData.user.createdAt)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  {t('defaultCurrency')}
                </label>
                <Select value={mockData.user.currency} disabled>
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  {t('language')}
                </label>
                <Select value={mockData.user.language} disabled>
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                {t('demoNote')}
              </p>
              <Button disabled className="w-full md:w-auto">
                {t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('accountStats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {mockData.metrics.transactionCount}
                </div>
                <p className="text-sm text-muted-foreground">{t('totalTransactions')}</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {mockData.metrics.savingsRate}%
                </div>
                <p className="text-sm text-muted-foreground">{t('savingsRate')}</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {mockData.categories.length}
                </div>
                <p className="text-sm text-muted-foreground">{t('activeCategories')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Actions */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                {t('readyToStart')}
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                {t('createAccountDescription')}
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {t('createAccount')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
} 