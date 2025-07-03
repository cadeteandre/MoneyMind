"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import React, { useState, useEffect, useMemo } from "react";
import type { IRecurringTransaction, ICreateRecurringTransaction } from "@/interfaces/IRecurringTransaction";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';
import { CategorySelector } from '@/components/CategorySelector';
import { FrequencySelector } from './FrequencySelector';
import { format } from "date-fns";

const createFormSchema = (t: (key: string) => string) => z.object({
  amount: z.number().positive().multipleOf(0.01),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUALLY", "ANNUALLY", "CUSTOM"]),
  customDays: z.number().positive().optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startDate: z.date().min(new Date(new Date().setHours(0, 0, 0, 0)), {
    message: t('validation.startDateMinToday')
  }),
  endDate: z.union([z.date(), z.undefined()]).optional(),
  isActive: z.boolean(),
});

type FormData = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  categoryId?: string;
  description?: string;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "ANNUALLY" | "CUSTOM";
  customDays?: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
};

export interface RecurringTransactionFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  transaction?: IRecurringTransaction;
}

export const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ 
  onSuccess, 
  onClose, 
  transaction 
}) => {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');
  
  // Create schema with translations
  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction ? {
      amount: parseFloat(transaction.amount.toString()),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      frequency: transaction.frequency,
      customDays: transaction.customDays || undefined,
      dayOfMonth: transaction.dayOfMonth || undefined,
      dayOfWeek: transaction.dayOfWeek || undefined,
      startDate: new Date(transaction.startDate),
      endDate: transaction.endDate ? new Date(transaction.endDate) : undefined,
      isActive: transaction.isActive,
    } : {
      isActive: true,
    },
  });

  const frequency = watch("frequency");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const isEditing = !!transaction;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definir categoria inicial para edição
  useEffect(() => {
    if (transaction?.category && isEditing) {
      setSelectedCategoryId(transaction.category);
    }
  }, [transaction, isEditing]);

  // Set default startDate after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!transaction && !startDate) {
      setValue("startDate", new Date());
    }
  }, [transaction, startDate, setValue]);

  // Função para lidar com mudança de categoria
  const handleCategoryChange = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
    setValue("category", categoryName);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const endpoint = isEditing 
        ? `/api/recurring-transactions/${transaction.id}` 
        : '/api/recurring-transactions';
      
      const method = isEditing ? 'PUT' : 'POST';

      toast.loading(isEditing ? t('form.updating') : t('form.creating'));
      
      // Preparar dados para envio
      const submitData: ICreateRecurringTransaction = {
        amount: data.amount,
        type: data.type,
        category: data.category,
        categoryId: data.categoryId,
        description: data.description,
        frequency: data.frequency,
        customDays: data.frequency === 'CUSTOM' ? data.customDays : undefined,
        dayOfMonth: data.dayOfMonth,
        dayOfWeek: data.dayOfWeek,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isEditing ? t('form.updateError') : t('form.createError')));
      }

      reset({
        amount: 0,
        type: undefined,
        category: '',
        categoryId: undefined,
        description: '',
        frequency: undefined,
        customDays: undefined,
        dayOfMonth: undefined,
        dayOfWeek: undefined,
        startDate: new Date(),
        endDate: undefined,
        isActive: true,
      });

      setSelectedCategoryId('');

      toast.dismiss();
      toast.success(isEditing ? t('form.updateSuccess') : t('form.createSuccess'));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : t('form.unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Tipo de Transação e Valor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.type')}</label>
          <Select onValueChange={(value) => setValue("type", value as "INCOME" | "EXPENSE")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('form.selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">{t('type.income')}</SelectItem>
              <SelectItem value="EXPENSE">{t('type.expense')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.amount')}</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="text-sm"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('form.category')}</label>
        <CategorySelector
          type={watch("type") || "EXPENSE"}
          value={selectedCategoryId}
          onChange={handleCategoryChange}
        />
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('form.description')}</label>
        <Textarea
          placeholder={t('form.descriptionPlaceholder')}
          {...register("description")}
          className="min-h-[80px] resize-none text-sm"
        />
      </div>

      {/* Frequência */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('form.frequency')}</label>
        <FrequencySelector
          value={frequency}
          onValueChange={(value) => setValue("frequency", value)}
        />
        {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
      </div>

      {/* Campos customizados para frequência CUSTOM */}
      {frequency === 'CUSTOM' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.customDays')}</label>
          <Input
            type="number"
            min="1"
            placeholder="30"
            {...register("customDays", { valueAsNumber: true })}
          />
          <p className="text-xs sm:text-sm text-muted-foreground">{t('form.customDaysHelp')}</p>
          {errors.customDays && <p className="text-sm text-red-500">{errors.customDays.message}</p>}
        </div>
      )}

      {/* Dia do mês para frequência mensal */}
      {frequency === 'MONTHLY' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.dayOfMonth')}</label>
          <Select onValueChange={(value) => setValue("dayOfMonth", parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('form.selectDayOfMonth')} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dayOfMonth && <p className="text-sm text-red-500">{errors.dayOfMonth.message}</p>}
        </div>
      )}

      {/* Dia da semana para frequência semanal */}
      {(frequency === 'WEEKLY' || frequency === 'BIWEEKLY') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('form.dayOfWeek')}</label>
          <Select onValueChange={(value) => setValue("dayOfWeek", parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('form.selectDayOfWeek')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t('weekdays.sunday')}</SelectItem>
              <SelectItem value="1">{t('weekdays.monday')}</SelectItem>
              <SelectItem value="2">{t('weekdays.tuesday')}</SelectItem>
              <SelectItem value="3">{t('weekdays.wednesday')}</SelectItem>
              <SelectItem value="4">{t('weekdays.thursday')}</SelectItem>
              <SelectItem value="5">{t('weekdays.friday')}</SelectItem>
              <SelectItem value="6">{t('weekdays.saturday')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.dayOfWeek && <p className="text-sm text-red-500">{errors.dayOfWeek.message}</p>}
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate-input" className="text-sm font-medium">{t('form.startDate')}</label>
          <div 
            className="relative cursor-pointer"
            onClick={(e) => {
              // Se não clicou no input em si, force o foco e abertura
              const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
              if (input && e.target !== input) {
                input.focus();
                input.showPicker?.(); // Método moderno para abrir o date picker
              }
            }}
          >
            <Input
              id="startDate-input"
              type="date"
              className="cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 text-sm"
              value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                if (newDate) {
                  setValue("startDate", newDate);
                }
              }}
              onClick={(e) => {
                // Garantir que o picker abra ao clicar no input
                const input = e.target as HTMLInputElement;
                input.showPicker?.();
              }}
            />
          </div>
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate-input" className="text-sm font-medium">
            {t('form.endDate')}
          </label>
          <div 
            className="relative cursor-pointer"
            onClick={(e) => {
              // Se não clicou no input em si, force o foco e abertura
              const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
              if (input && e.target !== input) {
                input.focus();
                input.showPicker?.(); // Método moderno para abrir o date picker
              }
            }}
          >
            <Input
              id="endDate-input"
              type="date"
              className="cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 text-sm"
              value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
              min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                setValue("endDate", newDate);
              }}
              onClick={(e) => {
                // Garantir que o picker abra ao clicar no input
                const input = e.target as HTMLInputElement;
                input.showPicker?.();
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Ativo */}
      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="rounded border-gray-300 h-4 w-4"
        />
        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
          {t('form.isActive')}
        </label>
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6">
        {onClose && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer w-full sm:w-auto order-2 sm:order-1"
          >
            {t('form.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="cursor-pointer w-full sm:w-auto order-1 sm:order-2">
          {isSubmitting ? t('form.submitting') : (isEditing ? t('form.update') : t('form.create'))}
        </Button>
      </div>
    </form>
  );
}; 