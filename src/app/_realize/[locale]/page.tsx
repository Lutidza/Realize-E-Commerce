/**
 * @file src/app/(realize)/[locale]/page.tsx
 * @version 1.0.0 – 2025-11-30 19:50
 * @description
 * Локализованная главная страница приложения Realize для маршрутов вида "/[locale]".
 * Файл:
 * - генерирует метаданные для главной страницы с учётом переданной локали;
 * - нормализует locale через ensureLocalizedHomeLocale;
 * - загружает данные главной страницы из Payload CMS для заданной локали;
 * - рендерит HomePageContent с fallback-вариантом "localized".
 *
 * Последние изменения в версии 1.0.0:
 * - добавлены JSDoc-комментарии для generateMetadata и LocalizedHomePage;
 * - зафиксирована роль файла как локализованной home-страницы под [locale]-layout.
 */

import type { Metadata } from 'next'

import { FALLBACK_KEYS } from '@/RealizeCore/fallbacks'
import {
  buildHomePageMetadata,
  ensureLocalizedHomeLocale,
  loadHomePageRoute,
} from '@/RealizeCore/routes/home'
import HomePageContent from '@/RealizeCore/ui/pages/home/HomePageContent'

/**
 * @remarks
 * Локализованная главная страница также должна быть динамической и не кэшироваться,
 * так как контент загружается из Payload CMS и может часто меняться.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageParams = {
  locale: string
}

/**
 * @remarks
 * Генерация метаданных для локализованной главной страницы по маршруту "/[locale]".
 *
 * Поведение:
 * - ожидает params как Promise<PageParams>, чтобы быть совместимой с асинхронным API Next.js;
 * - извлекает значение locale из params;
 * - нормализует locale через ensureLocalizedHomeLocale (учёт алиасов/регистра);
 * - строит метаданные через buildHomePageMetadata с fallback-вариантом "pages.home.localized".
 *
 * @param input - Объект с params (Promise<PageParams>), предоставляемый Next.js.
 * @returns Объект Metadata для Next.js.
 */
export const generateMetadata = async ({
                                         params,
                                       }: {
  params: Promise<PageParams>
}): Promise<Metadata> => {
  const resolvedParams = await params
  const locale = ensureLocalizedHomeLocale(resolvedParams.locale)

  return buildHomePageMetadata({
    locale,
    fallbackVariant: FALLBACK_KEYS.pages.home.localized,
  })
}

/**
 * @remarks
 * Локализованная главная страница по маршруту "/[locale]".
 *
 * Поведение:
 * - ожидает params как Promise<PageParams>, чтобы быть совместимой с текущим контрактом роутинга;
 * - извлекает locale из params и нормализует его через ensureLocalizedHomeLocale;
 * - загружает данные главной страницы через loadHomePageRoute(locale);
 * - рендерит HomePageContent с:
 *   - локалью, нормализованной для home;
 *   - slug и page, полученными из доменного роутера;
 *   - fallback-вариантом "pages.home.localized" на случай отсутствия корректной страницы в Payload.
 *
 * Валидация и редиректы по локали (notFound/redirect для defaultLocale) выполняются
 * на уровне src/app/(realize)/[locale]/layout.tsx, а не в этом файле.
 *
 * @param props - Объект с params (Promise<PageParams>), предоставляемый Next.js.
 * @returns JSX-разметка локализованной главной страницы.
 */
export default async function LocalizedHomePage({
                                                  params,
                                                }: {
  params: Promise<PageParams>
}) {
  const resolvedParams = await params
  const locale = ensureLocalizedHomeLocale(resolvedParams.locale)
  const { slug, page } = await loadHomePageRoute(locale)

  return (
      <HomePageContent
          fallbackVariant={FALLBACK_KEYS.pages.home.localized}
          locale={locale}
          page={page}
          slug={slug}
      />
  )
}
