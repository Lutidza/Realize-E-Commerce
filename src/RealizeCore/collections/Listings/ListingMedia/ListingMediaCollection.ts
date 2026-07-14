/**
 * @file src/RealizeCore/collections/Listings/ListingMedia/ListingMediaCollection.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Payload-коллекция для доменной связи объявлений с медиафайлами.
 */

import type { CollectionConfig } from 'payload'

export const ListingMediaCollection: CollectionConfig = {
  slug: 'listing-media',
  labels: {
    singular: 'Медиа объявления',
    plural: 'Медиа объявлений',
  },
  admin: {
    useAsTitle: 'seoSlug',
    defaultColumns: ['listing', 'media', 'role', 'sortOrder', 'isPrimary', 'updatedAt'],
    group: 'ОБЪЯВЛЕНИЯ',
    description: 'Доменные элементы галерей объявлений: порядок, роль изображения, SEO и связь с исходным media.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Связь',
          fields: [
            {
              name: 'listing',
              label: 'Объявление',
              type: 'relationship',
              relationTo: 'listings',
              required: true,
              index: true,
            },
            {
              name: 'media',
              label: 'Медиафайл',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Payload upload field сохраняет штатный media UI и связь с upload collection.',
              },
            },
          ],
        },
        {
          label: 'Показ',
          fields: [
            {
              name: 'role',
              label: 'Роль изображения',
              type: 'select',
              required: true,
              defaultValue: 'gallery',
              index: true,
              options: [
                { label: 'Обложка', value: 'cover' },
                { label: 'Галерея', value: 'gallery' },
                { label: 'Планировка', value: 'floorPlan' },
                { label: 'Интерьер', value: 'interior' },
                { label: 'Экстерьер', value: 'exterior' },
                { label: 'Документ', value: 'document' },
                { label: 'Другое', value: 'other' },
              ],
            },
            {
              name: 'sortOrder',
              label: 'Порядок сортировки',
              type: 'number',
              required: true,
              defaultValue: 0,
              index: true,
              admin: {
                description: 'Чем меньше число, тем раньше изображение отображается в галерее.',
              },
            },
            {
              name: 'isPrimary',
              label: 'Основное изображение',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Ограничение одного основного изображения на объявление будет реализовано отдельным hook/service.',
              },
            },
            {
              name: 'moderationStatus',
              label: 'Статус модерации в объявлении',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              index: true,
              options: [
                { label: 'Черновик', value: 'draft' },
                { label: 'Ожидает проверки', value: 'pendingReview' },
                { label: 'Одобрено', value: 'approved' },
                { label: 'Отклонено', value: 'rejected' },
                { label: 'Карантин', value: 'quarantined' },
              ],
            },
          ],
        },
        {
          label: 'SEO и описание',
          fields: [
            {
              name: 'seoSlug',
              label: 'SEO-алиас изображения',
              type: 'text',
              index: true,
              admin: {
                description: 'Безопасная основа для SEO-имени файла фотографии объявления.',
              },
            },
            {
              name: 'alt',
              label: 'Альтернативный текст',
              type: 'text',
              localized: true,
            },
            {
              name: 'title',
              label: 'Заголовок',
              type: 'text',
              localized: true,
            },
            {
              name: 'caption',
              label: 'Подпись',
              type: 'textarea',
              localized: true,
            },
          ],
        },
        {
          label: 'Проекция',
          fields: [
            {
              name: 'projection',
              label: 'Проекция для выдачи',
              type: 'group',
              fields: [
                {
                  name: 'cardPreset',
                  label: 'Пресет карточки',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'galleryPreset',
                  label: 'Пресет галереи',
                  type: 'text',
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default ListingMediaCollection
