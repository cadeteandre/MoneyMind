import { RecurrenceFrequency } from '@/interfaces/IRecurringTransaction';

/**
 * Calcula a próxima data de vencimento baseada na frequência
 */
export function calculateNextDueDate(
  currentDate: Date,
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
  customDays?: number | null
): Date {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case 'WEEKLY':
      // Se dayOfWeek especificado, ajustar para esse dia da semana
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const currentDayOfWeek = nextDate.getDay();
        const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;

    case 'BIWEEKLY':
      // Similar ao semanal, mas a cada 2 semanas
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        const currentDayOfWeek = nextDate.getDay();
        const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysToAdd === 0 ? 14 : daysToAdd + 7));
      } else {
        nextDate.setDate(nextDate.getDate() + 14);
      }
      break;

    case 'MONTHLY':
      // Avançar um mês e ajustar o dia se especificado
      nextDate.setMonth(nextDate.getMonth() + 1);
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        // Ajustar para o dia específico, tratando meses com menos dias
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;

    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3);
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;

    case 'SEMIANNUALLY':
      nextDate.setMonth(nextDate.getMonth() + 6);
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;

    case 'ANNUALLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;

    case 'CUSTOM':
      if (customDays !== null && customDays !== undefined && customDays > 0) {
        nextDate.setDate(nextDate.getDate() + customDays);
      } else {
        throw new Error('customDays must be specified for CUSTOM frequency');
      }
      break;

    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  return nextDate;
}

/**
 * Verifica se uma data de vencimento está atrasada
 */
export function isOverdue(dueDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

/**
 * Calcula quantos dias restam até o vencimento
 */
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Valida se os parâmetros de frequência estão corretos
 */
export function validateFrequencyParams(
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
  customDays?: number | null
): { isValid: boolean; error?: string } {
  switch (frequency) {
    case 'WEEKLY':
    case 'BIWEEKLY':
      if (dayOfWeek !== null && dayOfWeek !== undefined) {
        if (dayOfWeek < 0 || dayOfWeek > 6) {
          return { isValid: false, error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' };
        }
      }
      break;

    case 'MONTHLY':
    case 'QUARTERLY':
    case 'SEMIANNUALLY':
    case 'ANNUALLY':
      if (dayOfMonth !== null && dayOfMonth !== undefined) {
        if (dayOfMonth < 1 || dayOfMonth > 31) {
          return { isValid: false, error: 'dayOfMonth must be between 1 and 31' };
        }
      }
      break;

    case 'CUSTOM':
      if (!customDays || customDays <= 0) {
        return { isValid: false, error: 'customDays must be a positive number for CUSTOM frequency' };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Retorna o nome da frequência em inglês (padrão da aplicação)
 * A tradução deve ser feita na UI usando o sistema i18n
 */
export function getFrequencyDisplayKey(frequency: RecurrenceFrequency): string {
  const frequencyKeys: Record<RecurrenceFrequency, string> = {
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly', 
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    SEMIANNUALLY: 'semiannually',
    ANNUALLY: 'annually',
    CUSTOM: 'custom'
  };

  return frequencyKeys[frequency];
}

/**
 * Retorna informações básicas sobre a frequência para uso na UI
 * A formatação final deve ser feita na UI com tradução
 */
export function getFrequencyInfo(
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
  customDays?: number | null
): {
  frequency: RecurrenceFrequency;
  frequencyKey: string;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  customDays?: number | null;
} {
  return {
    frequency,
    frequencyKey: getFrequencyDisplayKey(frequency),
    dayOfMonth,
    dayOfWeek,
    customDays
  };
} 