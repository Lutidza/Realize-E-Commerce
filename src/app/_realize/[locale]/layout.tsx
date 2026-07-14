/**
 * @file src/app/(realize)/[locale]/layout.tsx
 * @version 1.0.0 – 2025-11-30 20:05
 * @description
 * Layout для локализованных маршрутов вида "/[locale]" в группе (realize).
 * Файл:
 * - определяет статические параметры для всех поддерживаемых не-дефолтных локалей;
 * - генерирует метаданные (alternates) для локализованных страниц;
 * - выполняет валидацию locale и редиректит defaultLocale обратно на корень "/";
 *
 * Этот layout всегда находится под:
 * - глобальным app/layout.tsx (локаль по заголовкам, тема, admin / front разделение);
 * - (realize)/layout.tsx (общий каркас фронта).
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

import {
  buildLocaleAlternates,
  defaultLocale,
  formatLocalePath,
  getNonDefaultLocaleParams,
  isDefaultLocale,
  isSupportedLocale,
} from '@/RealizeCore/localization'

/**
 * @remarks
 * Разрешает динамические сегменты [locale].
 * Это позволяет Next.js обрабатывать локали, не перечисленные на этапе билда,
 * в том числе для on-demand ISR или полностью динамического рендеринга.
 */
export const dynamicParams = true

type LocaleParams = {
  locale: string
}

/**
 * @remarks
 * Генерирует статические параметры для не-дефолтных локалей.
 * Используется Next.js для предварительной генерации маршрутов "/[locale]" на этапе билда.
 *
 * @returns Массив объектов вида { locale: string } для всех не-дефолтных локалей.
 */
export function generateStaticParams(): LocaleParams[] {
  return getNonDefaultLocaleParams()
}

/**
 * @remarks
 * Генерирует метаданные для всех страниц под маршрутом "/[locale]".
 *
 * Поведение:
 * - принимает params как Promise<LocaleParams> (контракт Next.js для layout generateMetadata);
 * - извлекает locale из params;
 * - если locale не поддерживается, используется defaultLocale для построения alternates;
 * - для defaultLocale возвращает пустой объект метаданных (canonical = "/", без alternates);
 * - для не-дефолтных локалей возвращает alternates, построенные через buildLocaleAlternates.
 *
 * @param input - Объект с params (Promise<LocaleParams>), предоставляемый Next.js.
 * @returns Объект Metadata с полем alternates для локализованных маршрутов либо пустой объект.
 */
export const generateMetadata = async ({
                                         params,
                                       }: {
  params: Promise<LocaleParams>
}): Promise<Metadata> => {
  const resolvedParams = await params
  const locale = isSupportedLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale

  if (isDefaultLocale(locale)) {
    // Для дефолтной локали canonical остаётся "/", alternates не требуются.
    return {}
  }

  return {
    alternates: buildLocaleAlternates((code) => formatLocalePath(code)),
  }
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<LocaleParams>
}

/**
 * @remarks
 * Layout для всех маршрутов внутри "/[locale]" в группе (realize).
 *
 * Поведение:
 * - извлекает locale из params;
 * - если локаль не поддерживается — возвращает 404 (notFound);
 * - если локаль является дефолтной — выполняет redirect('/') для избежания дублей вида "/ru" для defaultLocale;
 * - для валидной не-дефолтной локали пробрасывает data-locale в контейнер,
 *   чтобы нижележащие компоненты могли читать текущую локаль из DOM при необходимости.
 *
 * Важное замечание:
 * - этот layout не меняет <html lang="...">, атрибут lang на уровне html
 *   устанавливается в глобальном app/layout.tsx на основе заголовка x-realize-locale.
 *
 * @param props - Объект с params (Promise<LocaleParams>) и дочерними элементами.
 * @returns JSX-разметка layout-обёртки для локализованных маршрутов.
 */
export default async function LocaleLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params
  const locale = resolvedParams.locale

  if (!isSupportedLocale(locale)) {
    notFound()
  }

  if (isDefaultLocale(locale)) {
    redirect('/')
  }

  return <div data-locale={locale}>{children}</div>
}
