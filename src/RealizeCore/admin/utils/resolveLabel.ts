/**
 * @file src/RealizeCore/admin/utils/resolveLabel.ts
 * @version 1.0.0 – 2025-02-18 15:40
 * @description Хелпер преобразования Payload StaticLabel в строку с учётом локалей.
 */

import type { StaticLabel } from 'payload'

/**
 * @remarks Использует fallback, если label не определён или является функцией.
 * @param label Значение label из конфигурации Payload (строка, объект локалей или false).
 * @param fallback Резервное значение (обычно имя поля).
 * @param localeCode Код активной локали формы (например, `en`, `ru`).
 * @returns Строка для отображения в UI.
 */
export const resolveLabel = (label?: StaticLabel | false, fallback?: string, localeCode?: string) => {
  if (!label || typeof label === 'function') {
    return fallback ?? ''
  }

  if (typeof label === 'string') {
    return label
  }

  if (localeCode && label[localeCode]) {
    return label[localeCode]
  }

  const [first] = Object.values(label)
  return first ?? fallback ?? ''
}

export default resolveLabel
