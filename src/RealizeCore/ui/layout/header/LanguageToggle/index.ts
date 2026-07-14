/**
 * @file src/RealizeCore/ui/layout/header/LanguageToggle/index.ts
 * @version 1.0.0 – 2025-12-03 22:35
 * @description
 * Точка входа модуля LanguageToggle.
 */

import { LanguageToggle, LanguageToggleView } from './LanguageToggle'
import type {
  LanguageToggleViewProps,
  LanguageToggleOption,
  UseLanguageToggleResult,
} from './LanguageToggle.types'
import { useLanguageToggle } from './useLanguageToggle'

export { LanguageToggle, LanguageToggleView, useLanguageToggle }
export type { LanguageToggleViewProps, LanguageToggleOption, UseLanguageToggleResult }

export default LanguageToggle
