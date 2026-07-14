const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export const getMediaSrc = (url?: null | string) => {
  if (!url) return ''
  if (url.startsWith('/')) return url
  if (serverURL && url.startsWith(serverURL)) return url.slice(serverURL.length) || '/'
  return url
}
