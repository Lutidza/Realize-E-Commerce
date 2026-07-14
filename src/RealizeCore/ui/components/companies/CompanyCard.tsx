/**
 * @file src/RealizeCore/ui/components/companies/CompanyCard.tsx
 * @version 0.2.0 – 2025-12-27 13:45
 * @description Карточка компании на основе атрибутов и гео данных.
 */

import React from 'react'
import Link from 'next/link'

import type { Company, AdministrativeArea } from '@/payload-types'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import type { CompanyRouteFacet } from '@/RealizeCore/routes/companies/types'

const resolveAreaTitle = (area: Company['city'] | Company['administrativeArea']): string | null => {
  if (area && typeof area === 'object') {
    return (area as AdministrativeArea).title ?? null
  }

  return null
}

const resolvePrimaryFacet = (facets: CompanyRouteFacet[]): CompanyRouteFacet | undefined => {
  if (!facets || facets.length === 0) {
    return undefined
  }

  return [...facets].sort((a, b) => a.order - b.order)[0]
}

export type CompanyCardProps = {
  company: Company & Required<Pick<Company, 'urlAlias'>>
  facets: CompanyRouteFacet[]
  detailHref: string
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, facets, detailHref }) => {
  const cityTitle = resolveAreaTitle(company.city)
  const areaTitle = resolveAreaTitle(company.administrativeArea)
  const primaryFacet = resolvePrimaryFacet(facets)
  const secondaryFacet = facets.find((facet) => facet !== primaryFacet)

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <Link href={detailHref} className="text-xl font-semibold text-primary hover:underline">
          {company.companyName}
        </Link>
        <p className="text-sm text-muted-foreground">
          {primaryFacet?.valueLabel ?? '—'}
          {secondaryFacet ? ` · ${secondaryFacet.valueLabel}` : null}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {company.description || 'Description will be published soon.'}
      </p>

      <div className="text-sm">
        {cityTitle ? <p className="text-foreground">{cityTitle}</p> : null}
        {areaTitle ? <p className="text-muted-foreground">Region: {areaTitle}</p> : null}
        {company.address ? <p className="text-muted-foreground">Address: {company.address}</p> : null}
      </div>

      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full justify-center">
          <Link href={detailHref}>View profile</Link>
        </Button>
      </div>
    </article>
  )
}

export default CompanyCard
