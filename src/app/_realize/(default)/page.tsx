/**
 * @file src/app/(realize)/(default)/page.tsx
 * @version 1.0.0 – 2025-11-30 19:40
 * @description
 * Главная страница приложения Realize для базового (default) locale по корневому маршруту "/".
 * Файл:
 * - генерирует метаданные для главной страницы на основе Payload CMS;
 * - загружает данные главной страницы для defaultLocale через доменный роутер;
 * - рендерит HomePageContent с fallback-вариантом "default".
 *
 * Последние изменения в версии 1.0.0:
 * - добавлены JSDoc-комментарии для generateMetadata и DefaultHomePage;
 * - зафиксирована роль страницы как корневой home без URL-локали.
 */

import type { Metadata } from 'next'

import { defaultLocale } from '@/RealizeCore/localization'
import { FALLBACK_KEYS } from '@/RealizeCore/fallbacks'
import { buildHomePageMetadata, loadHomePageRoute } from '@/RealizeCore/routes/home'
import HomePageContent from '@/RealizeCore/ui/pages/home/HomePageContent'

/**
 * @remarks
 * Страница главной всегда должна быть динамической и не кэшироваться,
 * так как контент загружается из Payload CMS и может часто меняться.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * @remarks
 * Генерация метаданных для главной страницы по корневому маршруту "/".
 * Использует defaultLocale и fallback-вариант "pages.home.default".
 *
 * @returns Объект Metadata для Next.js, построенный через buildHomePageMetadata.
 */
export const generateMetadata = async (): Promise<Metadata> => {
  return buildHomePageMetadata({
    locale: defaultLocale,
    fallbackVariant: FALLBACK_KEYS.pages.home.default,
  })
}

/**
 * @remarks
 * Главная страница для defaultLocale по маршруту "/".
 *
 * Поведение:
 * - загружает данные главной страницы через loadHomePageRoute(defaultLocale);
 * - передаёт slug, page и locale в HomePageContent;
 * - использует fallback-вариант "pages.home.default" для контента,
 *   если соответствующая страница в Payload отсутствует или некорректна.
 *
 * Временно рендерит текст-заглушку внутри HomePageContent, до полного
 * переноса контента на блоки Payload и фронтовые компоненты.
 *
 * @returns JSX-разметка главной страницы.
 */
export default async function DefaultHomePage() {
  const { locale, slug, page } = await loadHomePageRoute(defaultLocale)

  return (
      <HomePageContent
          fallbackVariant={FALLBACK_KEYS.pages.home.default}
          locale={locale}
          page={page}
          slug={slug}
      >
        <p>
          Контент главной страницы должен быть реализован через блоки Payload и компоненты фронтенда.
        </p>
      </HomePageContent>
  )
}
