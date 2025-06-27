"use client";

import type { IRecurringPayment } from "@/interfaces/IRecurringTransaction";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "./providers/currency-provider";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
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
}

export const RecurringPaymentCard: React.FC<RecurringPaymentCardProps> = ({
  payment,
  onPay,
  onSkip,
  isProcessing = false,
}) => {
  const { userCurrency } = useCurrency();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');

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
    <Card className={`p-4 ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{payment.recurringTransaction.category}</h3>
            <Badge variant={getStatusBadgeVariant(payment.status)}>
              {getStatusLabel(payment.status)}
            </Badge>
            <Badge variant={payment.recurringTransaction.type === "INCOME" ? "success" : "destructive"}>
              {payment.recurringTransaction.type === "INCOME" ? t('type.income') : t('type.expense')}
            </Badge>
          </div>
          
          {payment.recurringTransaction.description && (
            <p className="text-sm text-muted-foreground">
              {payment.recurringTransaction.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{t('payment.dueDate')}: {format(new Date(payment.dueDate), "dd/MM/yyyy")}</span>
            </div>
            
            {payment.paidDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{t('payment.paidDate')}: {format(new Date(payment.paidDate), "dd/MM/yyyy")}</span>
              </div>
            )}
          </div>

          {payment.notes && (
            <p className="text-sm text-muted-foreground italic">
              {t('payment.notes')}: {payment.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className={`font-semibold text-lg ${
              payment.recurringTransaction.type === "INCOME" ? "text-green-600" : "text-red-600"
            }`}>
              {payment.recurringTransaction.type === "INCOME" ? "+" : "-"}
              {formatCurrency(payment.amount, userCurrency)}
            </p>
          </div>

          {payment.status === 'PENDING' && !isProcessing && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => onPay?.(payment)}
                className="h-8"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {t('payment.markAsPaid')}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSkip?.(payment)}
                className="h-8"
              >
                {t('payment.skip')}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center text-sm text-muted-foreground">
              {t('payment.processing')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 