/**
 * @file src/RealizeCore/fallbacks/PageFallback.tsx
 * @version 1.0.0 – 2025-02-18 12:20
 * @description React-компонент для отображения fallback-состояния страниц.
 */

import type { ReactNode } from 'react'

import { FALLBACK_KEYS, resolveFallback } from './registry'
import type { FallbackContext, FallbackDescriptor } from './types'

export type PageFallbackContext = FallbackContext & {
  locale: string
  slug: string
}

export type PageFallbackProps = {
  context: PageFallbackContext
  variant?: FallbackDescriptor
  heading?: string
  children?: ReactNode
}

const PageFallback = ({
  context,
  variant = FALLBACK_KEYS.default,
  heading,
  children,
}: PageFallbackProps) => {
  const resolved = resolveFallback(variant, context)
  const headingText = heading ?? resolved.heading
  const fallbackBody =
    resolved.body ?? (resolved.description ? <p>{resolved.description}</p> : null)

  return (
    <article data-locale={context.locale} data-slug={context.slug}>
      <header>
        <h1>{headingText}</h1>
      </header>
      <section>
        {fallbackBody}
        {children}
      </section>
    </article>
  )
}

export default PageFallback
export { PageFallback }
