export const logListingRoute = (context: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.debug('[ListingRoute]', JSON.stringify(context, null, 2))
}

export const logListingError = (context: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.error('[ListingRoute:error]', JSON.stringify(context, null, 2))
}
