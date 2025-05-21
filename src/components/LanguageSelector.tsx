"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useLanguage } from "./providers/language-provider"
import { toast } from "sonner"
import { useTranslation } from '@/app/i18n/client'

interface LanguageSelectorProps {
  isProfilePage?: boolean;
}

export function LanguageSelector({ isProfilePage }: LanguageSelectorProps) {
  const { userLocale, setUserLocale, isLoading } = useLanguage()
  const { t } = useTranslation(userLocale, 'language-selector')
  const [open, setOpen] = useState(false)

  const handleLanguageSelect = async (locale: string) => {
    try {
      await setUserLocale(locale as 'pt' | 'en' | 'es' | 'de')
      toast.success(`${t('languageChanged')} ${t(`languageLabels.${locale}`)}`)
    } catch {
      toast.error(t('languageChangeFailed'))
    }
    setOpen(false)
  }

  const languages = [
    { value: 'pt', label: t('languageLabels.pt') },
    { value: 'en', label: t('languageLabels.en') },
    { value: 'es', label: t('languageLabels.es') },
    { value: 'de', label: t('languageLabels.de') }
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className={`w-full justify-between p-2 sm:px-4 sm:py-2 cursor-pointer ${isProfilePage ? "" : "bg-transparent border-none shadow-none"}`}
        >
          <div className="flex items-center gap-2">
            <Globe className={cn(
              "h-4 w-4 transition-transform duration-300",
              isLoading && "animate-spin"
            )} />
            {/* Texto visível apenas em desktop */}
            <span className={`${isProfilePage ? "inline" : "hidden sm:inline"}`}>
              {isLoading 
                ? t('loading')
                : languages.find((lang) => lang.value === userLocale)?.label || languages[0].label
              }
            </span>
          </div>
          {/* Ícone de seta visível apenas em desktop */}
          <ChevronsUpDown className={`${isProfilePage ? "block" : "hidden sm:block"} sm:block ml-2 h-4 w-4 shrink-0 opacity-50`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t('selectLanguage')} />
          <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
                className="cursor-pointer"
                onSelect={() => handleLanguageSelect(language.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    userLocale === language.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}