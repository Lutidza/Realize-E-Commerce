/**
 * @file src/RealizeCore/fallbacks/registry.tsx
 * @version 1.0.0 – 2025-02-18 12:20
 * @description Реестр fallback-состояний и утилиты для их разрешения.
 *
 * Последние изменения:
 * - Перенесён из `RealizeCore/data` в выделенный модуль и снабжён типами.
 */

import type { ReactNode } from 'react'

import type {
  FallbackContext,
  FallbackDefinition,
  FallbackDescriptor,
  NodeValue,
  ResolvedFallback,
  TextValue,
} from './types'

export const FALLBACK_KEYS = {
  default: 'default',
  pages: {
    home: {
      default: 'pages.home.default',
      localized: 'pages.home.localized',
    },
    info: {
      default: 'pages.info.default',
      localized: 'pages.info.localized',
    },
  },
  agents: {
    default: 'agents.default',
  },
  developers: {
    default: 'developers.default',
  },
  listings: {
    default: 'listings.default',
  },
} as const

type KnownFallbackKey =
  | typeof FALLBACK_KEYS.default
  | typeof FALLBACK_KEYS.pages.home.default
  | typeof FALLBACK_KEYS.pages.home.localized
  | typeof FALLBACK_KEYS.pages.info.default
  | typeof FALLBACK_KEYS.pages.info.localized
  | typeof FALLBACK_KEYS.agents.default
  | typeof FALLBACK_KEYS.developers.default
  | typeof FALLBACK_KEYS.listings.default

const fallbackRegistry: Record<KnownFallbackKey, FallbackDefinition> = {
  default: {
    heading: 'Контент в разработке',
    description: 'Контент ещё не опубликован или находится в процессе подготовки.',
  },
  'pages.home.default': {
    heading: 'Страница в разработке',
    description: 'Главная страница ещё не опубликована.',
    body: <p>Главная страница ещё не опубликована в Payload.</p>,
    metadata: {
      title: 'Страница в разработке',
      description: 'Главная страница ещё не опубликована.',
    },
  },
  'pages.home.localized': {
    heading: 'Страница в разработке',
    description: 'Главная страница для выбранной локали ещё не опубликована.',
    body: ({ locale }) => (
      <p>
        Главная страница для локали <code>{locale}</code> ещё не опубликована. Создайте или опубликуйте
        документ в коллекции Pages.
      </p>
    ),
    metadata: {
      title: 'Страница в разработке',
      description: 'Главная страница для выбранной локали ещё не опубликована.',
    },
  },
  'pages.info.default': {
    heading: 'Страница в разработке',
    description: 'Страница не опубликована или ещё не создана.',
    body: ({ path }) => (
      <p>
        Для маршрута <code>{path}</code> пока нет опубликованного контента. Создайте или опубликуйте
        документ в коллекции Pages.
      </p>
    ),
    metadata: {
      title: 'Страница в разработке',
      description: 'Страница не опубликована или ещё не создана.',
    },
  },
  'pages.info.localized': {
    heading: 'Страница в разработке',
    description: 'Страница не опубликована или ещё не создана.',
    body: ({ path, locale }) => (
      <p>
        Для маршрута <code>{path}</code> и локали <code>{locale}</code> пока нет опубликованного контента.
        Создайте или опубликуйте документ в коллекции Pages.
      </p>
    ),
    metadata: {
      title: 'Страница в разработке',
      description: 'Страница не опубликована или ещё не создана.',
    },
  },
  'agents.default': {
    heading: 'Агент в разработке',
    description: 'Карточка агента ещё не опубликована или недоступна.',
    body: ({ slug }) => (
      <p>
        Карточка агента <code>{slug}</code> пока не опубликована. Пожалуйста, актуализируйте контент в
        соответствующей коллекции.
      </p>
    ),
    metadata: {
      title: 'Агент в разработке',
      description: 'Карточка агента ещё не опубликована или недоступна.',
    },
  },
  'developers.default': {
    heading: 'Застройщик в разработке',
    description: 'Карточка застройщика ещё не опубликована или недоступна.',
    body: ({ slug }) => (
      <p>
        Карточка застройщика <code>{slug}</code> пока не опубликована. Пожалуйста, актуализируйте контент в
        соответствующей коллекции.
      </p>
    ),
    metadata: {
      title: 'Застройщик в разработке',
      description: 'Карточка застройщика ещё не опубликована или недоступна.',
    },
  },
  'listings.default': {
    heading: 'Объявление в разработке',
    description: 'Объявление ещё не опубликовано или временно недоступно.',
    body: ({ slug }) => (
      <p>
        Объявление <code>{slug}</code> пока не опубликовано. Проверьте статус записи и опубликуйте её в
        админ-панели.
      </p>
    ),
    metadata: {
      title: 'Объявление в разработке',
      description: 'Объявление ещё не опубликовано или временно недоступно.',
    },
  },
}

const DEFAULT_KEY: KnownFallbackKey = FALLBACK_KEYS.default

const buildKeyFromDescriptor = (descriptor: FallbackDescriptor): string => {
  if (typeof descriptor === 'string') {
    return descriptor
  }

  return [descriptor.collection, descriptor.entity, descriptor.variant]
    .filter((segment): segment is string => Boolean(segment))
    .join('.')
}

/**
 * @param value Значение текста или функция, генерирующая текст.
 * @param context Текущий контекст фолбэка.
 */
const resolveTextValue = (
  value: TextValue | undefined,
  context: FallbackContext,
): string | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'function') {
    return value(context)
  }

  return value
}

/**
 * @param value Значение узла или функция, генерирующая ReactNode.
 * @param context Текущий контекст фолбэка.
 */
const resolveNodeValue = (
  value: NodeValue | undefined,
  context: FallbackContext,
): ReactNode | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'function') {
    return value(context)
  }

  return value
}

export const resolveFallback = (
  descriptor: FallbackDescriptor = DEFAULT_KEY,
  context: FallbackContext = {},
): ResolvedFallback => {
  const key = buildKeyFromDescriptor(descriptor)
  const fallbackDefinition =
    (fallbackRegistry as Record<string, FallbackDefinition>)[key] ?? fallbackRegistry[DEFAULT_KEY]
  const defaultDefinition = fallbackRegistry[DEFAULT_KEY]

  const heading =
    resolveTextValue(fallbackDefinition.heading, context) ??
    resolveTextValue(defaultDefinition.heading, context) ??
    'Контент в разработке'

  const description = resolveTextValue(
    fallbackDefinition.description,
    context,
  ) ?? resolveTextValue(defaultDefinition.description, context)

  const body =
    resolveNodeValue(fallbackDefinition.body, context) ??
    resolveNodeValue(defaultDefinition.body, context)

  const metadataDefinition = fallbackDefinition.metadata ?? {}
  const defaultMetadata = defaultDefinition.metadata ?? {}
  const metaTitle =
    resolveTextValue(metadataDefinition.title, context) ??
    resolveTextValue(defaultMetadata.title, context) ??
    heading
  const metaDescription =
    resolveTextValue(metadataDefinition.description, context) ??
    resolveTextValue(defaultMetadata.description, context) ??
    description

  return {
    heading,
    description,
    body,
    metadata: {
      title: metaTitle,
      description: metaDescription,
    },
  }
}

export const resolveFallbackMetadata = (
  descriptor: FallbackDescriptor = DEFAULT_KEY,
  context: FallbackContext = {},
) => resolveFallback(descriptor, context).metadata
