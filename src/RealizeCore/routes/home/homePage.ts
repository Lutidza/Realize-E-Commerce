import { notFound, redirect } from 'next/navigation'

import { getHomePage, HOME_GLOBAL_SLUG } from '@/RealizeCore/data/pages/home/getHomePage'
import { buildLocalizedPageMetadata } from '@/RealizeCore/data/pages/shared/pageMetadata'
import {
  formatLocalePath,
  isDefaultLocale,
  isSupportedLocale,
} from '@/RealizeCore/localization'
import {
  FALLBACK_KEYS,
  resolveFallbackMetadata,
} from '@/RealizeCore/fallbacks'

export type HomeFallbackVariant =
  (typeof FALLBACK_KEYS.pages.home)[keyof typeof FALLBACK_KEYS.pages.home]

export const ensureLocalizedHomeLocale = (value: string): string => {
  if (!isSupportedLocale(value)) {
    notFound()
  }

  if (isDefaultLocale(value)) {
    redirect('/')
  }

  return value
}

const buildFallbackContext = (locale: string) => ({
  locale,
  slug: HOME_GLOBAL_SLUG,
})

export const buildHomePageMetadata = async ({
  locale,
  fallbackVariant,
}: {
  locale: string
  fallbackVariant: HomeFallbackVariant
}) => {
  const page = await getHomePage(locale)
  const fallback = resolveFallbackMetadata(fallbackVariant, buildFallbackContext(locale))

  return buildLocalizedPageMetadata({
    locale,
    page,
    pathBuilder: (code) => formatLocalePath(code),
    fallback,
  })
}

export const loadHomePageRoute = async (locale: string) => {
  const page = await getHomePage(locale)

  return {
    locale,
    slug: HOME_GLOBAL_SLUG,
    page,
  }
}
