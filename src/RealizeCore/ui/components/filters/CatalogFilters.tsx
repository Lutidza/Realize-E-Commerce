/**
 * @file src/RealizeCore/ui/components/filters/CatalogFilters.tsx
 * @version 0.1.0 – 2026-03-01 16:20
 * @description Универсальный отображатель фильтров, собранных из Search Profile.
 */

import Link from 'next/link'

import { cn } from '@/lib/utils'

export type CatalogFilterOption = {
  label: string
  href: string
  isActive: boolean
  valueId: number
  isDisabled?: boolean
}

export type CatalogFilterGroup = {
  key: string
  label: string
  options: CatalogFilterOption[]
}

const CatalogFilters: React.FC<{
  groups: CatalogFilterGroup[]
}> = ({ groups }) => {
  if (!groups || groups.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Catalog filters"
      className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      {groups.map((group) => (
        <div
          key={group.key}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) =>
              option.isDisabled ? (
                <span
                  key={`${group.key}-${option.valueId}`}
                  className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground opacity-50"
                >
                  {option.label}
                </span>
              ) : (
                <Link
                  key={`${group.key}-${option.valueId}`}
                  href={option.href}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    option.isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/60',
                  )}
                >
                  {option.label}
                </Link>
              ),
            )}
          </div>
        </div>
      ))}
    </section>
  )
}

export default CatalogFilters
