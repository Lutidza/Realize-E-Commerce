/**
 * @file src/RealizeCore/data/pages/shared/pageMetadata.ts
 * @version 1.0.0 – 2025-02-18 13:00
 * @description Построение локализованных SEO-метаданных для документов Pages.
 */

import type { Metadata } from 'next'

import { buildLocaleAlternates, getOgLocale } from '@/RealizeCore/localization'

type PageMetadataSource =
  | {
      title?: unknown
      description?: unknown
      meta?: {
        title?: unknown
        description?: unknown
      }
    }
  | null

type BuildLocalizedPageMetadataOptions = {
  locale: string
  page: PageMetadataSource
  pathBuilder: (locale: string) => string
  fallback: {
    title: string
    description?: string
  }
}

const normalizeText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined

const resolveTitle = (page: PageMetadataSource, fallback: string): string =>
  normalizeText(page?.meta?.title) ??
  normalizeText(page?.title) ??
  fallback

const resolveDescription = (page: PageMetadataSource, fallback?: string): string | undefined =>
  normalizeText(page?.meta?.description) ??
  normalizeText(page?.description) ??
  fallback

const buildAlternateOgLocales = (activeLocale: string, languages: Record<string, string>): string[] =>
  Object.keys(languages)
    .filter((code) => code !== activeLocale)
    .map((code) => getOgLocale(code))

export const buildLocalizedPageMetadata = ({
  locale,
  page,
  pathBuilder,
  fallback,
}: BuildLocalizedPageMetadataOptions): Metadata => {
  const title = resolveTitle(page, fallback.title)
  const description = resolveDescription(page, fallback.description)
  const alternates = buildLocaleAlternates(pathBuilder)
  const canonicalUrl = alternates.canonical
  const ogLocale = getOgLocale(locale)
  const alternateOgLocales = buildAlternateOgLocales(locale, alternates.languages)
  const currentPath = pathBuilder(locale)

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'realize:locale': locale,
      'realize:path': currentPath,
    },
  }
}
