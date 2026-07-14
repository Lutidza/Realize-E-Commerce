/**
 * @file src/RealizeCore/admin/Fields/LocationFields/utils/deriveSiblingPath.ts
 * @description Вычисляет путь соседнего поля относительно текущего.
 */

export const deriveSiblingPath = (path: string | undefined, sibling: string): string => {
  if (!path || path.trim().length === 0) {
    return sibling
  }

  const segments = path.split('.')

  if (segments.length === 0) {
    return sibling
  }

  segments[segments.length - 1] = sibling
  const derived = segments.filter(Boolean).join('.')

  return derived.length > 0 ? derived : sibling
}

export default deriveSiblingPath
