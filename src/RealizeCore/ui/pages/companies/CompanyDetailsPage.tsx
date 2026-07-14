/**
 * @file src/RealizeCore/ui/pages/companies/CompanyDetailsPage.tsx
 * @version 0.2.0 – 2025-12-27 13:50
 * @description Публичная карточка компании с атрибутами и контактами.
 */

import React from 'react'
import Link from 'next/link'

import type { AdministrativeArea, Company } from '@/payload-types'
import { formatLocalePath } from '@/RealizeCore/localization'
import { Button } from '@/RealizeCore/ui/components/shadcn/button'
import type { CompanyRouteFacet } from '@/RealizeCore/routes/companies/types'

export type CompanyDetailsPageProps = {
  company: Company
  locale: string
  facets: CompanyRouteFacet[]
}

const resolveAreaTitle = (area: Company['city'] | Company['administrativeArea']): string | null => {
  if (area && typeof area === 'object') {
    return (area as AdministrativeArea).title ?? null
  }

  return null
}

export const CompanyDetailsPage: React.FC<CompanyDetailsPageProps> = ({ company, locale, facets }) => {
  const cityTitle = resolveAreaTitle(company.city)
  const areaTitle = resolveAreaTitle(company.administrativeArea)
  const backPath = formatLocalePath(locale, '/companies')

  const sortedFacets = [...facets].sort((a, b) => a.order - b.order)
  const primaryFacet = sortedFacets[0]
  const secondaryFacet = sortedFacets[1]

  const infoItems = [
    {
      label: primaryFacet?.attributeLabel ?? 'Attribute',
      value: primaryFacet?.valueLabel ?? 'Not specified',
    },
    {
      label: secondaryFacet?.attributeLabel ?? 'Attribute',
      value: secondaryFacet?.valueLabel ?? 'Not specified',
    },
    { label: 'Region', value: areaTitle ?? 'Not specified' },
    { label: 'City', value: cityTitle ?? 'Not specified' },
    { label: 'Address', value: company.address ?? 'Not specified' },
  ]

  const contactItems = [
    { label: 'Primary phone', value: company.phone ?? 'Not specified' },
    { label: 'Additional phone', value: company.additionalPhone ?? 'Not specified' },
    {
      label: 'Website',
      value: company.website ? (
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {company.website}
        </a>
      ) : (
        'Not specified'
      ),
    },
  ]

  return (
    <article className="space-y-10">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="px-0 text-sm text-muted-foreground hover:text-primary">
          <Link href={backPath}>← Back to companies</Link>
        </Button>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Company</p>
            <h1 className="text-3xl font-semibold text-foreground">{company.companyName}</h1>
            <p className="text-muted-foreground">
              {primaryFacet?.valueLabel ?? 'Not specified'} ·{' '}
              {secondaryFacet?.valueLabel ?? 'Not specified'}
            </p>
          </div>
          <p className="text-base text-foreground">
            {company.description ?? 'Company is preparing a public profile. Details will be published shortly.'}
          </p>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Company details</h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {infoItems.map((item) => (
            <div key={item.label}>
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-base text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Contacts</h2>
        <dl className="grid gap-4 md:grid-cols-2">
          {contactItems.map((item) => (
            <div key={item.label}>
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="text-base text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  )
}

export default CompanyDetailsPage
