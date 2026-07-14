/**
 * @file src/RealizeCore/ui/layout/containers/BaseContentContainer.tsx
 * @version 0.1.0 – 2025-12-24 03:15
 * @description
 * Базовый контентный контейнер для внутренних страниц (центральная колонка с max-width).
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface BaseContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @remarks
 * Центрирует контент, задаёт max-width и стандартные отступы.
 * @param props HTML-атрибуты контейнера.
 * @returns JSX-обёртка для страниц.
 */
export const BaseContentContainer: React.FC<BaseContentContainerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <main
      className={cn('container w-full mx-auto px-4 py-4 md:px-4 md:py-10 space-y-6', className)}
      {...props}
    >
      {children}
    </main>
  )
}

export default BaseContentContainer
