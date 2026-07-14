import 'dotenv/config'

import configPromise from '@payload-config'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'
import type { DataFromGlobalSlug, Payload, RequiredDataFromCollectionSlug } from 'payload'
import sharp from 'sharp'

type CategorySeed = {
  title: string
  slug: string
}

type ProductSeed = {
  title: string
  slug: string
  categorySlugs: string[]
  description: string
  image: {
    background: string
    foreground: string
    label: string
  }
  inventory: number
  priceInUSD: number
}

type ProductData = RequiredDataFromCollectionSlug<'products'>
type ProductDescription = NonNullable<ProductData['description']>
type HeaderData = Omit<DataFromGlobalSlug<'header'>, 'createdAt' | 'id' | 'updatedAt'>

const categories: CategorySeed[] = [
  { title: 'Электроника', slug: 'electronics' },
  { title: 'Дом и кухня', slug: 'home-kitchen' },
  { title: 'Одежда', slug: 'apparel' },
  { title: 'Аксессуары', slug: 'accessories' },
  { title: 'Спорт и отдых', slug: 'sport-outdoor' },
  { title: 'Красота и уход', slug: 'beauty-care' },
]

const products: ProductSeed[] = [
  {
    title: 'Беспроводные наушники Nova',
    slug: 'nova-wireless-headphones',
    categorySlugs: ['electronics', 'accessories'],
    description: 'Лёгкие Bluetooth-наушники с активным шумоподавлением и зарядным кейсом.',
    image: { background: '#0f172a', foreground: '#e0f2fe', label: 'NOVA' },
    inventory: 42,
    priceInUSD: 12900,
  },
  {
    title: 'Умная лампа Aura',
    slug: 'aura-smart-lamp',
    categorySlugs: ['electronics', 'home-kitchen'],
    description: 'Настольная лампа с регулировкой яркости, цветовой температуры и сценариями.',
    image: { background: '#1f2937', foreground: '#fde68a', label: 'AURA' },
    inventory: 35,
    priceInUSD: 7900,
  },
  {
    title: 'Керамический набор Table Set',
    slug: 'ceramic-table-set',
    categorySlugs: ['home-kitchen'],
    description: 'Минималистичный набор посуды для повседневной сервировки на четыре персоны.',
    image: { background: '#f8fafc', foreground: '#334155', label: 'TABLE' },
    inventory: 18,
    priceInUSD: 8900,
  },
  {
    title: 'Городской рюкзак Metro Pack',
    slug: 'metro-backpack',
    categorySlugs: ['accessories', 'apparel'],
    description: 'Водоотталкивающий рюкзак с отделением для ноутбука и скрытым карманом.',
    image: { background: '#111827', foreground: '#f9fafb', label: 'METRO' },
    inventory: 27,
    priceInUSD: 9900,
  },
  {
    title: 'Худи Core Cotton',
    slug: 'core-cotton-hoodie',
    categorySlugs: ['apparel'],
    description: 'Плотное хлопковое худи свободного кроя для базового гардероба.',
    image: { background: '#3f3f46', foreground: '#fafafa', label: 'CORE' },
    inventory: 64,
    priceInUSD: 6900,
  },
  {
    title: 'Йога-мат Balance',
    slug: 'balance-yoga-mat',
    categorySlugs: ['sport-outdoor'],
    description: 'Нескользящий коврик средней жёсткости для йоги, растяжки и домашних тренировок.',
    image: { background: '#064e3b', foreground: '#d1fae5', label: 'BALANCE' },
    inventory: 31,
    priceInUSD: 4900,
  },
  {
    title: 'Термокружка Daily Cup',
    slug: 'daily-thermal-cup',
    categorySlugs: ['home-kitchen', 'sport-outdoor'],
    description: 'Стальная термокружка с герметичной крышкой, сохраняет напиток горячим до 6 часов.',
    image: { background: '#7c2d12', foreground: '#ffedd5', label: 'DAILY' },
    inventory: 53,
    priceInUSD: 3900,
  },
  {
    title: 'Сыворотка Glow Serum',
    slug: 'glow-serum',
    categorySlugs: ['beauty-care'],
    description: 'Увлажняющая сыворотка с лёгкой текстурой для ежедневного ухода.',
    image: { background: '#831843', foreground: '#fce7f3', label: 'GLOW' },
    inventory: 24,
    priceInUSD: 4500,
  },
]

const headerData: HeaderData = {
  navItems: [
    {
      link: {
        type: 'custom',
        label: 'Главная',
        url: '/',
      },
    },
    {
      link: {
        type: 'custom',
        label: 'Каталог',
        url: '/shop',
      },
    },
    {
      link: {
        type: 'custom',
        label: 'Аккаунт',
        url: '/account',
      },
    },
    {
      link: {
        type: 'custom',
        label: 'Найти заказ',
        url: '/find-order',
      },
    },
  ],
}

const richText = (text: string): ProductDescription => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const createProductImage = async (product: ProductSeed): Promise<string> => {
  const assetsDir = path.join(os.tmpdir(), 'realize-ecommerce-seed-assets')
  await fs.mkdir(assetsDir, { recursive: true })

  const filePath = path.join(assetsDir, `${product.slug}.png`)
  const escapedTitle = product.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;')

  const svg = `
    <svg width="1200" height="1200" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1200" rx="96" fill="${product.image.background}"/>
      <circle cx="930" cy="260" r="170" fill="${product.image.foreground}" opacity="0.16"/>
      <circle cx="260" cy="940" r="220" fill="${product.image.foreground}" opacity="0.12"/>
      <rect x="180" y="260" width="840" height="520" rx="48" fill="${product.image.foreground}" opacity="0.92"/>
      <text x="600" y="540" text-anchor="middle" fill="${product.image.background}" font-family="Arial, Helvetica, sans-serif" font-size="112" font-weight="700">${product.image.label}</text>
      <text x="600" y="880" text-anchor="middle" fill="${product.image.foreground}" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">${escapedTitle}</text>
    </svg>
  `

  await sharp(Buffer.from(svg)).png().toFile(filePath)
  return filePath
}

const findBySlug = async (payload: Payload, collection: 'categories' | 'products', slug: string) => {
  const result = await payload.find({
    collection,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0]
}

const findMediaByFilename = async (payload: Payload, filename: string) => {
  const result = await payload.find({
    collection: 'media',
    limit: 1,
    pagination: false,
    where: {
      filename: {
        equals: filename,
      },
    },
  })

  return result.docs[0]
}

const seedCategories = async (payload: Payload) => {
  const categoryIDsBySlug = new Map<string, number>()

  for (const category of categories) {
    const existing = await findBySlug(payload, 'categories', category.slug)
    const data = {
      title: category.title,
      slug: category.slug,
    } satisfies RequiredDataFromCollectionSlug<'categories'>

    const doc = existing
      ? await payload.update({
          collection: 'categories',
          id: existing.id,
          data,
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'categories',
          data,
          overrideAccess: true,
        })

    categoryIDsBySlug.set(category.slug, doc.id)
  }

  return categoryIDsBySlug
}

const seedMedia = async (payload: Payload, product: ProductSeed) => {
  const filename = `${product.slug}.png`
  const existing = await findMediaByFilename(payload, filename)
  const data = {
    alt: product.title,
  } satisfies RequiredDataFromCollectionSlug<'media'>

  if (existing) {
    return payload.update({
      collection: 'media',
      id: existing.id,
      data,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'media',
    data,
    filePath: await createProductImage(product),
    overrideAccess: true,
  })
}

const seedProducts = async (payload: Payload, categoryIDsBySlug: Map<string, number>) => {
  for (const product of products) {
    const media = await seedMedia(payload, product)
    const categoryIDs = product.categorySlugs
      .map((slug) => categoryIDsBySlug.get(slug))
      .filter((id): id is number => typeof id === 'number')

    const existing = await findBySlug(payload, 'products', product.slug)
    const data = {
      title: product.title,
      slug: product.slug,
      description: richText(product.description),
      gallery: [
        {
          image: media.id,
        },
      ],
      categories: categoryIDs,
      inventory: product.inventory,
      enableVariants: false,
      priceInUSDEnabled: true,
      priceInUSD: product.priceInUSD,
      meta: {
        title: product.title,
        description: product.description,
        image: media.id,
      },
      _status: 'published',
    } satisfies RequiredDataFromCollectionSlug<'products'>

    if (existing) {
      await payload.update({
        collection: 'products',
        id: existing.id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'products',
        data,
        overrideAccess: true,
      })
    }
  }
}

const seedHeader = async (payload: Payload) => {
  await payload.updateGlobal({
    slug: 'header',
    data: headerData,
    context: {
      disableRevalidate: true,
    },
    overrideAccess: true,
  })
}

const main = async () => {
  const payload = await getPayload({ config: configPromise })

  payload.logger.info('Seeding Realize ecommerce categories, products, and header...')
  const categoryIDsBySlug = await seedCategories(payload)
  await seedProducts(payload, categoryIDsBySlug)
  await seedHeader(payload)
  payload.logger.info(
    `Seed complete: ${categories.length} categories, ${products.length} products, 1 header.`,
  )
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
