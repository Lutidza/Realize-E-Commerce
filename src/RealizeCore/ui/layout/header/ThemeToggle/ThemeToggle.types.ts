/**
 * @file src/RealizeCore/ui/layout/header/ThemeToggle/ThemeToggle.types.ts
 * @version 1.1.0 – 2025-12-03 19:05
 * @description
 * Типы для модуля переключателя темы (ThemeToggle) в шапке приложения.
 *
 * Файл:
 * - содержит интерфейс пропсов презентационного компонента ThemeToggleViewProps;
 * - содержит тип результата логического хука UseThemeToggleResult;
 * - используется в ThemeToggle.tsx и useThemeToggle.ts как единый источник типизации.
 */

/**
 * @remarks
 * Пропсы презентационного компонента ThemeToggle.
 *
 * Логику получения этих значений инкапсулирует хук useThemeToggle.
 * Компонент ThemeToggle.tsx опирается только на этот контракт.
 */
export type ThemeToggleViewProps = {
  /**
   * @remarks
   * Флаг текущей темы:
   * - true  — активна тёмная тема;
   * - false — активна светлая тема.
   *
   * Используется:
   * - для aria-атрибута (aria-pressed),
   * - для возможных визуальных состояний (если потребуется).
   *
   * Сами иконки переключаются через CSS-классы и класс .dark на <html>.
   */
  isDark: boolean

  /**
   * @remarks
   * Обработчик клика по кнопке.
   * Должен переключать тему между 'light' и 'dark' (через useThemeToggle).
   *
   * @returns Ничего не возвращает; побочный эффект — изменение темы.
   */
  onToggleAction: () => void

  /**
   * @remarks
   * Признак готовности к взаимодействию (до монтирования отключаем кнопку).
   */
  isReady: boolean
}

/**
 * @remarks
 * Результат хука useThemeToggle.
 *
 * Структура:
 * - служебный флаг mounted, чтобы контейнер/компоновщик мог решать,
 *   рендерить ли вьюху (избегаем ошибок гидратации);
 * - остальные поля полностью совпадают с ThemeToggleViewProps,
 *   чтобы их можно было напрямую передать в презентационный компонент.
 */
export type UseThemeToggleResult = {
  /**
   * @remarks
   * Флаг, указывающий, что компонент (логика переключателя темы)
   * смонтирован на клиенте.
   *
   * Пока false — контейнер (index.tsx) не должен рендерить вьюху,
   * чтобы избежать ошибок гидратации (рассинхрон SSR/CSR).
   */
  mounted: boolean
} & ThemeToggleViewProps
