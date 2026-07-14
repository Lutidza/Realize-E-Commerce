/**
 * @file src/RealizeCore/ui/layout/header/ThemeToggle/index.ts
 * @version 1.0.0 – 2025-12-03 20:40
 * @description
 * Точка входа модуля переключателя темы для шапки приложения.
 *
 * Файл:
 * - реэкспортирует контейнер ThemeToggle (по умолчанию и по именованному экспорту);
 * - реэкспортирует презентационный компонент ThemeToggleView;
 * - реэкспортирует хук useThemeToggle и связанные типы.
 *
 * Использование:
 * - в большинстве случаев достаточно:
 *   import { ThemeToggle } from '@/RealizeCore/ui/layout/header/ThemeToggle'
 *
 * - при необходимости можно обратиться к низкоуровневым частям:
 *   import { ThemeToggleView, useThemeToggle } from '@/RealizeCore/ui/layout/header/ThemeToggle'
 */

import { ThemeToggle, ThemeToggleView } from './ThemeToggle'
import type { ThemeToggleViewProps, UseThemeToggleResult } from './ThemeToggle.types'
import { useThemeToggle } from './useThemeToggle'

/**
 * @remarks
 * Основной контейнер переключателя темы.
 * В типичном случае используется именно этот экспорт.
 */
export { ThemeToggle }

/**
 * @remarks
 * Чистая вьюха переключателя темы (без логики).
 * Может использоваться в тестах, Storybook или при кастомном управлении состоянием.
 */
export { ThemeToggleView }

/**
 * @remarks
 * Хук с бизнес-логикой переключения темы.
 * Позволяет использовать ту же логику в других компонентах при необходимости.
 */
export { useThemeToggle }

/**
 * @remarks
 * Типы, связанные с переключателем темы:
 * - ThemeToggleViewProps — пропсы презентационного компонента;
 * - UseThemeToggleResult — результат работы хука useThemeToggle.
 */
export type { ThemeToggleViewProps, UseThemeToggleResult }

/**
 * @remarks
 * Экспорт по умолчанию — контейнер ThemeToggle.
 * Это позволяет писать как:
 *   import ThemeToggle from '@/RealizeCore/ui/layout/header/ThemeToggle'
 */
export default ThemeToggle
