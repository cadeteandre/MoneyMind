"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Coins } from "lucide-react"
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
import { CURRENCY_OPTIONS } from "@/lib/utils"
import { useCurrency } from "./providers/currency-provider"
import { toast } from "sonner"

export function CurrencySelector() {
  const { userCurrency, setUserCurrency, isLoading } = useCurrency()
  const [open, setOpen] = useState(false)

  const handleCurrencySelect = async (currency: string) => {
    try {
      await setUserCurrency(currency)
      toast.success(`Currency changed to ${currency}`)
    } catch {
      toast.error("Failed to change currency")
    }
    setOpen(false)
  }

  const currencies = Object.entries(CURRENCY_OPTIONS).map(([code, config]) => ({
    value: code,
    label: `${code} (${new Intl.NumberFormat(config.locale, { style: 'currency', currency: code }).format(0)})`
  }))

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
            <Coins className="h-4 w-4" />
            {isLoading 
              ? "Loading..." 
              : currencies.find((c) => c.value === userCurrency)?.label || currencies[0].label
            }
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup>
            {currencies.map((currency) => (
              <CommandItem
                key={currency.value}
                value={currency.value}
                onSelect={() => handleCurrencySelect(currency.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    userCurrency === currency.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {currency.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 