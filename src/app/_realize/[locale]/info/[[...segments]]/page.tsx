/**
 * @file src/app/(realize)/[locale]/info/[[...segments]]/page.tsx
 * @version 1.0.0 – 2025-11-30 21:40
 * @description
 * Локализованные информационные страницы (info) для маршрутов вида:
 * - "/[locale]/info"
 * - "/[locale]/info/segment"
 * - "/[locale]/info/segment/subsegment"
 *
 * Файл:
 * - принимает сегмент локали [locale] и catch-all сегменты [[...segments]];
 * - использует locale из params (валидация и редиректы выполняются в [locale]/layout.tsx);
 * - загружает данные инфостраниц из Payload CMS через доменный роутер info;
 * - генерирует метаданные и контент с учётом локали;
 * - передаёт данные в InfoPageContent, который отвечает за рендер блоков/страницы.
 */

import type { Metadata } from 'next'

import { FALLBACK_KEYS } from '@/RealizeCore/fallbacks'
import { buildInfoPageMetadata, loadInfoPage } from '@/RealizeCore/routes/info'
import InfoPageContent from '@/RealizeCore/ui/pages/info/InfoPageContent'

/**
 * @remarks
 * Информационные страницы завязаны на данные из Payload CMS и могут часто меняться.
 * На текущем этапе отключаем кеширование и форсируем динамическую генерацию.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

type LocalizedInfoParams = {
  locale: string
  /**
   * @remarks
   * Массив сегментов после "/[locale]/info".
   * Примеры:
   * - /ru/info             → segments = undefined / []
   * - /ru/info/about       → segments = ["about"]
   * - /ru/info/about/team  → segments = ["about", "team"]
   */
  segments?: string[]
}

/**
 * @remarks
 * Генерация метаданных для локализованных информационных страниц.
 *
 * Поведение:
 * - получает locale и catch-all segments из params;
 * - использует переданную locale (её поддержка/редиректы контролируются в [locale]/layout.tsx);
 * - делегирует построение метаданных доменному роутеру info;
 * - применяет fallback-вариант "pages.info.localized" внутри buildInfoPageMetadata.
 *
 * @param input - Объект с params (Promise<LocalizedInfoParams>), предоставляемый Next.js.
 * @returns Объект Metadata для Next.js.
 */
export const generateMetadata = async ({
                                         params,
                                       }: {
  params: Promise<LocalizedInfoParams>
}): Promise<Metadata> => {
  const resolvedParams = await params
  const { locale } = resolvedParams
  const segments = resolvedParams.segments ?? []

  return buildInfoPageMetadata({
    locale,
    segments,
  })
}

/**
 * @remarks
 * Локализованные информационные страницы по маршрутам "/[locale]/info[[...segments]]".
 *
 * Поведение:
 * - читает locale и catch-all segments из params;
 * - загружает данные страницы через loadInfoPage({ locale, segments });
 * - собирает строковый path из segments (через "/") для InfoPageContent;
 * - передаёт locale, slug, page, path и fallbackVariant в InfoPageContent.
 *
 * Валидация locale (поддержка, редирект для defaultLocale и т.п.)
 * выполняется на уровне src/app/(realize)/[locale]/layout.tsx.
 *
 * @param input - Объект с params (Promise<LocalizedInfoParams>), предоставляемый Next.js.
 * @returns JSX-разметка локализованной информационной страницы.
 */
export default async function LocalizedInfoPage({
                                                  params,
                                                }: {
  params: Promise<LocalizedInfoParams>
}) {
  const resolvedParams = await params
  const { locale } = resolvedParams
  const segments = resolvedParams.segments ?? []
  const path = segments.join('/')

  const { slug, page } = await loadInfoPage({
    locale,
    segments,
  })

  return (
      <InfoPageContent
          locale={locale}
          page={page}
          slug={slug}
          path={path}
          fallbackVariant={FALLBACK_KEYS.pages.info.localized}
      />
  )
}
