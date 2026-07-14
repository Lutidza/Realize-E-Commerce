/**
 * @file src/RealizeCore/ui/pages/listings/ListingDetailPage.tsx
 * @version 1.0.0 – 2025-02-18 23:35
 * @description Временный контент карточки объявления.
 */

import { FALLBACK_KEYS, PageFallback } from '@/RealizeCore/fallbacks'
import type { ListingRouteMatch } from '@/RealizeCore/routes/listings'

type ListingDetailPageProps = {
  match: ListingRouteMatch
}

const ListingDebugList = ({ match }: ListingDetailPageProps) => (
  <dl>
    <dt>Locale</dt>
    <dd>{match.locale}</dd>
    <dt>Listing ID</dt>
    <dd>{match.listing.id}</dd>
    <dt>Listing alias</dt>
    <dd>{match.listing.alias}</dd>
    <dt>Facets</dt>
    <dd>
      {match.facets.length > 0 ? (
        <ul>
          {match.facets.map((facet) => (
            <li key={`${facet.key}-${facet.value}`}>
              {facet.key}: {facet.value} (<code>{facet.alias}</code>)
            </li>
          ))}
        </ul>
      ) : (
        <span>—</span>
      )}
    </dd>
    <dt>Geo</dt>
    <dd>
      <code>{JSON.stringify(match.geo)}</code>
    </dd>
    <dt>City record</dt>
    <dd>
      {match.city ? (
        <code>{JSON.stringify(match.city)}</code>
      ) : (
        <span>—</span>
      )}
    </dd>
  </dl>
)

export default function ListingDetailPage({ match }: ListingDetailPageProps) {
  return (
    <article data-locale={match.locale} data-listing-id={match.listing.id}>
      <header>
        <h1>Listing #{match.listing.id}</h1>
      </header>
      <section>
        <PageFallback
          context={{ locale: match.locale, slug: match.listing.alias }}
          variant={FALLBACK_KEYS.listings.default}
        />
      </section>
      <section>
        <ListingDebugList match={match} />
      </section>
    </article>
  )
}
