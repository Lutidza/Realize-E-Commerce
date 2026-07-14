import payloadConfigPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AccountRole } from '@/payload-types'

let cachedRoles: AccountRole[] | null = null
let cacheExpiresAt = 0
const CACHE_TTL = 60 * 1000

export const getAccountRoles = async (): Promise<AccountRole[]> => {
  const now = Date.now()
  if (cachedRoles && cacheExpiresAt > now) {
    return cachedRoles
  }

  const config = await payloadConfigPromise
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'account-roles',
    where: { state: { equals: 'enable' } },
    depth: 0,
    limit: 50,
    overrideAccess: true,
  })

  cachedRoles = docs as AccountRole[]
  cacheExpiresAt = now + CACHE_TTL

  return cachedRoles ?? []
}

export default getAccountRoles
