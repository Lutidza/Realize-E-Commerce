/**
 * @file src/RealizeCore/routes/srp/helpers/pageSegmentHelper.ts
 * @version 1.0.0 – 2026-03-02 18:35
 * @description Работа с сегментами пагинации вида page-N.
 */

const PAGE_SEGMENT_REGEXP = /^page-(?<page>\d+)$/

export const parsePageSegment = (segment: string) => {
  const match = segment.match(PAGE_SEGMENT_REGEXP)

  if (!match || !match.groups) {
    return null
  }

  const page = Number(match.groups.page)

  if (!Number.isFinite(page) || page < 1) {
    return null
  }

  return page
}
