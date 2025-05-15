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

const languageLabels = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  de: 'Deutsch'
};

// Translations for the language selector
const translations = {
  pt: {
    loading: 'Carregando...',
    selectLanguage: 'Selecione o idioma',
    noLanguageFound: 'Nenhum idioma encontrado.',
    languageChanged: 'Idioma alterado para',
    languageChangeFailed: 'Falha ao alterar o idioma'
  },
  en: {
    loading: 'Loading...',
    selectLanguage: 'Select language',
    noLanguageFound: 'No language found.',
    languageChanged: 'Language changed to',
    languageChangeFailed: 'Failed to change language'
  },
  es: {
    loading: 'Cargando...',
    selectLanguage: 'Seleccione el idioma',
    noLanguageFound: 'No se encontró ningún idioma.',
    languageChanged: 'Idioma cambiado a',
    languageChangeFailed: 'Error al cambiar el idioma'
  },
  de: {
    loading: 'Wird geladen...',
    selectLanguage: 'Sprache auswählen',
    noLanguageFound: 'Keine Sprache gefunden.',
    languageChanged: 'Sprache geändert zu',
    languageChangeFailed: 'Sprache konnte nicht geändert werden'
  }
};

interface LanguageSelectorProps {
  isProfilePage?: boolean;
}

export function LanguageSelector({ isProfilePage }: LanguageSelectorProps) {
  const { userLocale, setUserLocale, isLoading } = useLanguage()
  const [open, setOpen] = useState(false)
  
  // Get the translations based on current locale
  const t = translations[userLocale as keyof typeof translations] || translations.en

  const handleLanguageSelect = async (locale: string) => {
    try {
      await setUserLocale(locale as 'pt' | 'en' | 'es' | 'de')
      toast.success(`${t.languageChanged} ${languageLabels[locale as keyof typeof languageLabels]}`)
    } catch {
      toast.error(t.languageChangeFailed)
    }
    setOpen(false)
  }

  const languages = [
    { value: 'pt', label: languageLabels.pt },
    { value: 'en', label: languageLabels.en },
    { value: 'es', label: languageLabels.es },
    { value: 'de', label: languageLabels.de },
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
                ? t.loading
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
          <CommandInput placeholder={t.selectLanguage} />
          <CommandEmpty>{t.noLanguageFound}</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                value={language.value}
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