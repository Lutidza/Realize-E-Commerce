import { defaultLocale } from '@/RealizeCore/localization'

const pageTestSelectTranslations = {
  'option-a': {
    ru: 'Первый вариант',
    en: 'First option',
    ka: 'პირველი ვარიანტი',
  },
  'option-b': {
    ru: 'Второй вариант',
    en: 'Second option',
    ka: 'მეორე ვარიანტი',
  },
  'option-c': {
    ru: 'Третий вариант',
    en: 'Third option',
    ka: 'მესამე ვარიანტი',
  },
} as const

export type PageTestSelectValue = keyof typeof pageTestSelectTranslations

type PageTestSelectLabels = (typeof pageTestSelectTranslations)[PageTestSelectValue]

const resolveDefaultLabel = (labels: PageTestSelectLabels): string =>
  labels[defaultLocale as keyof PageTestSelectLabels] ??
  labels.ru ??
  Object.values(labels)[0] ??
  ''

export const pageTestSelectOptions = (Object.entries(pageTestSelectTranslations) as Array<
  [PageTestSelectValue, PageTestSelectLabels]
>).map(([value, labels]) => ({
  value,
  label: resolveDefaultLabel(labels),
}))

export const resolvePageTestSelectLabel = (
  value: string | null | undefined,
  locale: string,
): string | null => {
  if (!value) {
    return null
  }

  const labels = pageTestSelectTranslations[value as PageTestSelectValue]

  if (!labels) {
    return null
  }

  return (
    labels[locale as keyof PageTestSelectLabels] ??
    resolveDefaultLabel(labels) ??
    null
  )
}
