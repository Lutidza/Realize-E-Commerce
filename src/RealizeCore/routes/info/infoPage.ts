import { notFound, redirect } from 'next/navigation'

import { getInfoPage } from '@/RealizeCore/data/pages/info/getInfoPage'
import { buildLocalizedPageMetadata } from '@/RealizeCore/data/pages/shared/pageMetadata'
import {
  defaultLocale,
  formatLocalePath,
  getNonDefaultLocaleParams,
  isSupportedLocale,
} from '@/RealizeCore/localization'
import {
  FALLBACK_KEYS,
  resolveFallbackMetadata,
} from '@/RealizeCore/fallbacks'

const HOME_ALIAS = 'home'

export type InfoRouteParams = {
  locale: string
  segments?: string[]
}

export type DefaultInfoRouteParams = {
  segments?: string[]
}

const redirectHome = (locale: string): never => {
  redirect(formatLocalePath(locale))
}

const ensureLocale = (value: string): string => {
  if (!isSupportedLocale(value)) {
    notFound()
  }

  return value
}

const ensureSegments = (locale: string, segments?: string[]): string[] => {
  if (!segments || segments.length === 0) {
    redirectHome(locale)
  }

  const normalizedSegments = segments as string[]

  if (normalizedSegments.length === 1 && normalizedSegments[0] === HOME_ALIAS) {
    redirectHome(locale)
  }

  return normalizedSegments
}

const buildSlug = (segments: string[]): string => segments.join('/')

const buildInfoPath = (segments: string[]): string => ['info', ...segments].join('/')

const buildLocalizedPath = (locale: string, segments: string[]): string =>
  formatLocalePath(locale, buildInfoPath(segments))

export const resolveInfoParams = ({ locale, segments }: InfoRouteParams) => {
  const activeLocale = ensureLocale(locale)
  const activeSegments = ensureSegments(activeLocale, segments)
  const slug = buildSlug(activeSegments)
  const path = buildLocalizedPath(activeLocale, activeSegments)

  return {
    locale: activeLocale,
    segments: activeSegments,
    slug,
    path,
  }
}

export const buildInfoPageMetadata = async (params: InfoRouteParams) => {
  const resolved = resolveInfoParams(params)
  const page = await getInfoPage(resolved.locale, resolved.slug)
  const fallbackVariant =
    resolved.locale === defaultLocale
      ? FALLBACK_KEYS.pages.info.default
      : FALLBACK_KEYS.pages.info.localized
  const fallback = resolveFallbackMetadata(fallbackVariant, {
    locale: resolved.locale,
    slug: resolved.slug,
    path: resolved.path,
  })

  return buildLocalizedPageMetadata({
    locale: resolved.locale,
    page,
    pathBuilder: (locale) => buildLocalizedPath(locale, resolved.segments),
    fallback,
  })
}

export const loadInfoPage = async (params: InfoRouteParams) => {
  const resolved = resolveInfoParams(params)
  const page = await getInfoPage(resolved.locale, resolved.slug)

  return {
    ...resolved,
    page,
  }
}

export const getInfoStaticParams = () => getNonDefaultLocaleParams()

export const buildDefaultInfoRouteParams = async (
  params: Promise<DefaultInfoRouteParams>,
): Promise<InfoRouteParams> => {
  const resolved = await params

  return {
    locale: defaultLocale,
    segments: resolved.segments,
  }
}
