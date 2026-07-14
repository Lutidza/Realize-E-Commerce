/**
 * @file src/RealizeCore/ui/layout/header/LanguageToggle/LanguageToggle.types.ts
 * @version 1.0.0 – 2025-12-03 22:25
 * @description
 * Типы для компонентного модуля переключателя языка в шапке.
 */

import type { PayloadLocale } from '@/RealizeCore/localization'
import type { StaticImageData } from 'next/image'

/**
 * @remarks
 * Опция локали, отображаемая в выпадающем списке.
 */
export type LanguageToggleOption = {
  /**
   * @remarks
   * Код локали (en, ru, ka ...).
   */
  value: PayloadLocale

  /**
   * @remarks
   * Локализованное название локали (например, English, Русский).
   */
  label: string

  /**
   * @remarks
   * Изображение флага (StaticImageData). Может отсутствовать, тогда
   * используется текстовый бейдж с кодом локали.
   */
  icon?: StaticImageData
}

/**
 * @remarks
 * Пропсы презентационной вьюхи LanguageToggleView.
 */
export type LanguageToggleViewProps = {
  /**
   * @remarks
   * aria-label / title для кнопки.
   */
  ariaLabel: string

  /**
   * @remarks
   * Заголовок дропдауна (подсказка пользователю).
   */
  menuLabel: string

  /**
   * @remarks
   * Текущая активная локаль.
   */
  currentLocale: PayloadLocale

  /**
   * @remarks
   * Набор доступных локалей.
   */
  options: LanguageToggleOption[]

  /**
   * @remarks
   * Коллбэк для переключения локали.
   */
  onSelectAction: (locale: PayloadLocale) => void

  /**
   * @remarks
   * Состояние открытия меню (контролируется контейнером).
   */
  isOpen: boolean

  /**
   * @remarks
   * Изменение состояния открытия меню.
   */
  onOpenChangeAction: (open: boolean) => void
}

/**
 * @remarks
 * Результат хука useLanguageToggle.
 * Содержит полный набор данных для вьюхи,
 * кроме локального состояния открытия меню.
 */
export type UseLanguageToggleResult = Omit<
  LanguageToggleViewProps,
  'isOpen' | 'onOpenChangeAction'
> & {
  onSelectAction: (locale: PayloadLocale) => void
}
