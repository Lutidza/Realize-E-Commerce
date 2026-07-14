/**
 * @file src/RealizeCore/ui/layout/header/LanguageToggle/LanguageToggle.tsx
 * @version 1.0.0 – 2025-12-03 22:35
 * @description
 * Модуль переключателя локалей шапки: чистая вьюха + контейнер.
 */

'use client'

import React from 'react'

import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/RealizeCore/ui/components/shadcn/dropdown-menu'
import { RadioGroup, RadioGroupItem } from '@/RealizeCore/ui/components/shadcn/radio-group'
import { DropdownMenuSeparator } from '@/RealizeCore/ui/components/shadcn/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/RealizeCore/ui/components/shadcn/tooltip'
import type {
  LanguageToggleOption,
  LanguageToggleViewProps,
} from './LanguageToggle.types'
import { useLanguageToggle } from './useLanguageToggle'

/**
 * @remarks
 * Вьюха переключателя локалей.
 */
export const LanguageToggleView: React.FC<LanguageToggleViewProps> = ({
  ariaLabel,
  menuLabel,
  currentLocale,
  options,
  onSelectAction,
  isOpen,
  onOpenChangeAction,
}) => {
  const selectedOption = React.useMemo(() => {
    if (options.length === 0) {
      return null
    }

    return options.find((option) => option.value === currentLocale) ?? options[0]
  }, [currentLocale, options])

  const handleValueChange = React.useCallback(
    (nextValue: string): void => {
      if (!nextValue) {
        return
      }

      onSelectAction(nextValue as LanguageToggleOption['value'])
      onOpenChangeAction(false)
    },
    [onOpenChangeAction, onSelectAction],
  )

  return (
    <TooltipProvider delayDuration={800}>
      <Tooltip>
        <DropdownMenu open={isOpen} onOpenChange={onOpenChangeAction}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={ariaLabel}
              >
                <span className="sr-only">{ariaLabel}</span>
                {selectedOption ? (
                  selectedOption.icon ? (
                    <span
                      aria-hidden="true"
                      className="inline-flex h-4 w-5 bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedOption.icon.src})` }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="text-xs font-semibold uppercase"
                    >
                      {selectedOption.value}
                    </span>
                  )
                ) : null}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-2" />

            <RadioGroup
              value={currentLocale}
              onValueChange={handleValueChange}
              className="gap-0"
            >
              {options.map((option) => {
                const optionId = `language-option-${option.value}`
                const isActive = option.value === currentLocale

                return (
                  <label
                    key={option.value}
                    htmlFor={optionId}
                    className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-sm transition focus-within:bg-accent focus-within:text-accent-foreground ${
                      isActive
                        ? 'bg-pink-500/5 text-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <RadioGroupItem
                      id={optionId}
                      value={option.value}
                      className="sr-only"
                      checked={isActive}
                    />
                    {option.icon ? (
                      <span
                        aria-hidden="true"
                        className="mr-3 inline-flex h-4 w-5 bg-cover bg-center"
                        style={{ backgroundImage: `url(${option.icon.src})` }}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mr-3 inline-flex min-h-5 min-w-5 items-center justify-center rounded bg-accent px-1 text-[10px] font-semibold uppercase text-accent-foreground"
                      >
                        {option.value}
                      </span>
                    )}
                    <span className="leading-tight">{option.label}</span>
                  </label>
                )
              })}
            </RadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom">{ariaLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * @remarks
 * Контейнер: связывает хук и вьюху, управляет раскрытием меню.
 */
export const LanguageToggle: React.FC = () => {
  const viewModel = useLanguageToggle()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <LanguageToggleView
      {...viewModel}
      isOpen={isOpen}
      onOpenChangeAction={setIsOpen}
    />
  )
}

export default LanguageToggle
