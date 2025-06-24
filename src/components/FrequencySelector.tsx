"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';

export type RecurrenceFrequency = 
  | 'WEEKLY' 
  | 'BIWEEKLY' 
  | 'MONTHLY' 
  | 'QUARTERLY' 
  | 'SEMIANNUALLY' 
  | 'ANNUALLY' 
  | 'CUSTOM';

interface FrequencySelectorProps {
  value?: RecurrenceFrequency;
  onValueChange: (value: RecurrenceFrequency) => void;
  disabled?: boolean;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'recurring-transactions');

  const frequencies: { value: RecurrenceFrequency; labelKey: string }[] = [
    { value: 'WEEKLY', labelKey: 'frequency.weekly' },
    { value: 'BIWEEKLY', labelKey: 'frequency.biweekly' },
    { value: 'MONTHLY', labelKey: 'frequency.monthly' },
    { value: 'QUARTERLY', labelKey: 'frequency.quarterly' },
    { value: 'SEMIANNUALLY', labelKey: 'frequency.semiannually' },
    { value: 'ANNUALLY', labelKey: 'frequency.annually' },
    { value: 'CUSTOM', labelKey: 'frequency.custom' },
  ];

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('form.selectFrequency')} />
      </SelectTrigger>
      <SelectContent>
        {frequencies.map(({ value, labelKey }) => (
          <SelectItem key={value} value={value}>
            {t(labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 