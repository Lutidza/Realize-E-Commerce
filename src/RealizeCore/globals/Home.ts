/**
 * @file src/globals/Home.ts
 * @version 1.0.0 – 2025-02-18 13:20
 * @description Глобальная сущность главной страницы с локализованными SEO-полями.
 */

import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'meta',
      label: 'Meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Meta title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          label: 'Meta description',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}

export default Home
