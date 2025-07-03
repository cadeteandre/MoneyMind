"use client";

import React from "react";
import type { IRecurringPayment } from "@/interfaces/IRecurringTransaction";
import type { ICategory } from "@/interfaces/ICategory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "./providers/currency-provider";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { useCategoryTranslation } from '@/hooks/useCategoryTranslation';
import { format } from "date-fns";

interface RecurringPaymentCardProps {
  payment: IRecurringPayment & {
    recurringTransaction: {
      category: string;
      type: "INCOME" | "EXPENSE";
      description?: string | null;
    };
  };
  onPay?: (payment: IRecurringPayment) => void;
  onSkip?: (payment: IRecurringPayment) => void;
  isProcessing?: boolean;
  categories?: ICategory[]; // Nova prop opcional para evitar múltiplas chamadas da API
}

export const RecurringPaymentCard = React.memo<RecurringPaymentCardProps>(({
  payment,
  onPay,
  onSkip,
  isProcessing = false,
  categories = [],
}) => {
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');
  
  const { translateCategoryName } = useCategoryTranslation();

  // Função para traduzir nome da categoria usando as categorias passadas como prop
  const getTranslatedCategoryName = React.useMemo(() => {
    return (categoryName: string) => {
      // Verificar se a categoria existe no banco (é padrão)
      const categoryObj = categories.find(cat => cat.name === categoryName);
      if (categoryObj && categoryObj.isDefault) {
        return translateCategoryName(categoryName, true);
      }
      // Se não for categoria padrão, manter nome original
      return categoryName;
    };
  }, [categories, translateCategoryName]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'default' as const;
      case 'OVERDUE':
        return 'destructive' as const;
      case 'PAID':
        return 'secondary' as const;
      case 'SKIPPED':
        return 'outline' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('paymentStatus.pending');
      case 'OVERDUE':
        return t('paymentStatus.overdue');
      case 'PAID':
        return t('paymentStatus.paid');
      case 'SKIPPED':
        return t('paymentStatus.skipped');
      default:
        return status;
    }
  };

  const isOverdue = payment.status === 'OVERDUE' || 
    (payment.status === 'PENDING' && new Date(payment.dueDate) < new Date());

  return (
    <Card className={`p-3 sm:p-4 ${isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="font-medium text-sm sm:text-base truncate">{getTranslatedCategoryName(payment.recurringTransaction.category)}</h3>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge variant={getStatusBadgeVariant(payment.status)} className="text-xs">
                {getStatusLabel(payment.status)}
              </Badge>
              <Badge variant={payment.recurringTransaction.type === "INCOME" ? "success" : "destructive"} className="text-xs">
                {payment.recurringTransaction.type === "INCOME" ? t('type.income') : t('type.expense')}
              </Badge>
            </div>
          </div>
          
          {payment.recurringTransaction.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {payment.recurringTransaction.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">{t('payment.dueDate')}: {format(new Date(payment.dueDate), "dd/MM/yyyy")}</span>
            </div>
            
            {payment.paidDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{t('payment.paidDate')}: {format(new Date(payment.paidDate), "dd/MM/yyyy")}</span>
              </div>
            )}
          </div>

          {payment.notes && (
            <p className="text-xs sm:text-sm text-muted-foreground italic line-clamp-2">
              {t('payment.notes')}: {payment.notes}
            </p>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="text-left sm:text-right">
            <p className={`font-semibold text-base sm:text-lg ${
              payment.recurringTransaction.type === "INCOME" ? "text-green-600" : "text-red-600"
            }`}>
              {payment.recurringTransaction.type === "INCOME" ? "+" : "-"}
              {formatCurrency(payment.amount, userCurrency)}
            </p>
          </div>

          {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && !isProcessing && (
            <div className="flex flex-row sm:flex-col gap-2">
              <Button
                size="sm"
                onClick={() => onPay?.(payment)}
                className="h-8 text-xs px-3"
              >
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">{t('payment.markAsPaid')}</span>
                <span className="sm:hidden">{t('payment.markAsPaidShort')}</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSkip?.(payment)}
                className="h-8 text-xs px-3"
              >
                <span className="hidden sm:inline">{t('payment.skip')}</span>
                <span className="sm:hidden">{t('payment.skipShort')}</span>
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              {t('payment.processing')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

RecurringPaymentCard.displayName = 'RecurringPaymentCard'; 