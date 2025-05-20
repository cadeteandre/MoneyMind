"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "./providers/language-provider";
import { useTranslation } from '@/app/i18n/client';

interface Props {
  onFilter: (startDate?: Date, endDate?: Date) => void;
}

export function DateRangeFilter({ onFilter }: Props) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'filters');

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFilter(undefined, undefined);
  };

  return (
    <div className="flex items-center justify-between flex-col gap-2">
      {/* Filter and Clear buttons */}
      <div className="flex self-end gap-2">
        <Button variant="outline" onClick={() => onFilter(startDate, endDate)} className="dark:bg-black dark:text-gray-300 cursor-pointer">{t('filter')}</Button>
        {(startDate || endDate) && (
          <Button variant="outline" onClick={handleClear} className="gap-2 dark:bg-black dark:text-gray-300 cursor-pointer">
            <X className="h-4 w-4" />
            {t('clear')}
          </Button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Start Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[160px] justify-start text-left cursor-pointer", !startDate && "text-muted-foreground dark:bg-black")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy") : t('startDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
          </PopoverContent>
        </Popover>

        {/* End date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[160px] justify-start text-left cursor-pointer", !endDate && "text-muted-foreground dark:bg-black")}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy") : t('endDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}