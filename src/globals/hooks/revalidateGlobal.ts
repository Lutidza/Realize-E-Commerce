import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateGlobal: GlobalAfterChangeHook = ({ global, req: { context, payload } }) => {
  if (context.disableRevalidate) return

  const tag = `global_${global.slug}`

  try {
    payload.logger.info(`Revalidating global cache tag: ${tag}`)
    revalidateTag(tag, 'max')
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: `Unable to revalidate global cache tag outside a Next.js request: ${tag}`,
    })
  }
}
