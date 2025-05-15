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

export function LanguageSelector() {
  const { userLocale, setUserLocale, isLoading } = useLanguage()
  const [open, setOpen] = useState(false)

  const handleLanguageSelect = async (locale: string) => {
    try {
      await setUserLocale(locale as 'pt' | 'en' | 'es' | 'de')
      toast.success(`Idioma alterado para ${languageLabels[locale as keyof typeof languageLabels]}`)
    } catch {
      toast.error("Falha ao alterar o idioma")
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
          className="w-full justify-between whitespace-nowrap"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {isLoading 
              ? "Carregando..." 
              : languages.find((lang) => lang.value === userLocale)?.label || languages[0].label
            }
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Selecione o idioma" />
          <CommandEmpty>Nenhum idioma encontrado.</CommandEmpty>
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