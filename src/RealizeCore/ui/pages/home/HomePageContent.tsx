import type { ReactNode } from 'react'

import { PageFallback } from '@/RealizeCore/fallbacks'
import type { HomeFallbackVariant } from '@/RealizeCore/routes/home'
import type { Home } from '@/payload-types'

type HomePageContentProps = {
  locale: string
  slug: string
  page: Home | null
  fallbackVariant: HomeFallbackVariant
  children?: ReactNode
}

const resolveTitle = (page: Home | null): string | null =>
  typeof page?.title === 'string' ? page.title : null

const resolveDescription = (page: Home | null): string | null =>
  typeof page?.description === 'string' ? page.description : null

export default function HomePageContent({
  locale,
  slug,
  page,
  fallbackVariant,
  children,
}: HomePageContentProps) {
  const title = resolveTitle(page)
  const description = resolveDescription(page)

  if (!title) {
    return (
      <PageFallback
        context={{ locale, slug }}
        variant={fallbackVariant}
      />
    )
  }

  return (
    <article data-locale={locale} data-slug={slug}>
      <header>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      <section>
        {children ?? (
          <p>
            Контент страницы &quot;{title}&quot; (locale: {locale}) должен быть реализован через блоки Payload и
            компоненты фронтенда.
          </p>
        )}
      </section>
    </article>
  )
}
