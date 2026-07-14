import type { Page } from '@/payload-types'
import { FALLBACK_KEYS, PageFallback } from '@/RealizeCore/fallbacks'

type InfoFallbackVariant =
  (typeof FALLBACK_KEYS.pages.info)[keyof typeof FALLBACK_KEYS.pages.info]

type InfoPageContentProps = {
  locale: string
  slug: string
  path: string
  page: Page | null
  fallbackVariant: InfoFallbackVariant
  selectLabel?: string | null
  selectValue?: string | null
}

export default function InfoPageContent({
  locale,
  slug,
  path,
  page,
  fallbackVariant,
  selectLabel,
  selectValue,
}: InfoPageContentProps) {
  if (!page) {
    return (
      <PageFallback
        context={{ locale, slug, path }}
        variant={fallbackVariant}
      />
    )
  }

  return (
    <article data-locale={locale} data-slug={slug}>
      <header>
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
        {selectLabel && selectValue && (
          <p data-test-select>
            {selectLabel}: <strong>{selectValue}</strong>
          </p>
        )}
      </header>
      <section>
        <p>
          Контент страницы &quot;{page.title}&quot; (slug: {slug}) должен быть реализован через блоки Payload и
          компоненты фронтенда.
        </p>
      </section>
    </article>
  )
}
