/**
 * @file src/app/(realize)/(default)/info/[[...segments]]/page.tsx
 * @version 1.0.4 – 2025-11-30 21:30
 * @description
 * Главная точка входа для информационных страниц (info) в default-локали по маршрутам вида:
 * - "/info"
 * - "/info/segment"
 * - "/info/segment/subsegment"
 *
 * Файл:
 * - принимает catch-all сегменты [[...segments]] без явного locale в URL;
 * - использует defaultLocale для загрузки данных инфостраниц из Payload CMS;
 * - генерирует метаданные и контент через доменный роутер info;
 * - передаёт данные в InfoPageContent, который отвечает за рендер блоков/страницы.
 *
 * Последние изменения в версии 1.0.4:
 * - проп path в InfoPageContent теперь получает строку, собранную из segments через "/";
 */

import type { Metadata } from 'next'

import { defaultLocale } from '@/RealizeCore/localization'
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

type InfoSegmentsParams = {
    /**
     * @remarks
     * Массив сегментов после "/info".
     * Примеры:
     * - /info             → segments = undefined / []
     * - /info/about       → segments = ["about"]
     * - /info/about/team  → segments = ["about", "team"]
     */
    segments?: string[]
}

/**
 * @remarks
 * Генерация метаданных для информационных страниц default-локали.
 *
 * Поведение:
 * - получает catch-all сегменты [[...segments]] из params;
 * - использует defaultLocale (так как URL без префикса [locale]);
 * - делегирует построение метаданных доменному роутеру info.
 *
 * @param input - Объект с params (Promise<InfoSegmentsParams>), предоставляемый Next.js.
 * @returns Объект Metadata для Next.js.
 */
export const generateMetadata = async ({
                                           params,
                                       }: {
    params: Promise<InfoSegmentsParams>
}): Promise<Metadata> => {
    const resolvedParams = await params
    const segments = resolvedParams.segments ?? []

    return buildInfoPageMetadata({
        locale: defaultLocale,
        segments,
    })
}

/**
 * @remarks
 * Страница информационного раздела для default-локали по маршрутам "/info[[...segments]]".
 *
 * Поведение:
 * - читает catch-all сегменты [[...segments]] из params;
 * - использует defaultLocale как текущую локаль;
 * - загружает данные страницы через loadInfoPage({ locale: defaultLocale, segments });
 * - собирает строковый path из segments (через "/") для InfoPageContent;
 * - передаёт locale, slug, page, path и fallbackVariant в InfoPageContent.
 *
 * @param input - Объект с params (Promise<InfoSegmentsParams>), предоставляемый Next.js.
 * @returns JSX-разметка информационной страницы.
 */
export default async function DefaultInfoPage({
                                                  params,
                                              }: {
    params: Promise<InfoSegmentsParams>
}) {
    const resolvedParams = await params
    const segments = resolvedParams.segments ?? []
    const path = segments.join('/')

    const { locale, slug, page } = await loadInfoPage({
        locale: defaultLocale,
        segments,
    })

    return (
        <InfoPageContent
            locale={locale}
            page={page}
            slug={slug}
            path={path}
            fallbackVariant={FALLBACK_KEYS.pages.info.default}
        />
    )
}
