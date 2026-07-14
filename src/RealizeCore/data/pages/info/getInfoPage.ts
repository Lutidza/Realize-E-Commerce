/**
 * @file src/RealizeCore/data/pages/info/getInfoPage.ts
 * @version 1.0.0 – 2025-02-18 13:10
 * @description Хелпер для получения документов из ветки `/info/...`.
 */

import { fetchPageBySlug } from '../shared/getPageBySlug'

export const getInfoPage = async (locale: string, slug: string) =>
  fetchPageBySlug({
    locale,
    slug,
  })
