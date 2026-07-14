/**
 * @file src/RealizeCore/collections/Media/MediaCollection.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Payload-коллекция для загруженных медиафайлов.
 */

import type { CollectionConfig } from 'payload'

import { applyMediaStorageIdentityBeforeChange } from '@/RealizeCore/collections/Media/hooks/applyMediaStorageIdentityBeforeChange'
import { validateMediaUploadBeforeOperation } from '@/RealizeCore/collections/Media/hooks/validateMediaUploadBeforeOperation'
import { DEFAULT_MEDIA_SETTINGS } from '@/RealizeCore/media/constants/defaultMediaSettings'

export const MediaCollection: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиа',
    plural: 'Медиа',
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'kind', 'moderationStatus', 'ownerType', 'updatedAt'],
    group: 'МЕДИА',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [applyMediaStorageIdentityBeforeChange],
    beforeOperation: [validateMediaUploadBeforeOperation],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            {
              name: 'alt',
              label: 'Альтернативный текст',
              type: 'text',
              required: true,
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
            {
              name: 'kind',
              label: 'Тип медиа',
              type: 'select',
              required: true,
              index: true,
              defaultValue: 'systemImage',
              options: [
                { label: 'Аватар аккаунта', value: 'accountAvatar' },
                { label: 'Логотип компании', value: 'companyLogo' },
                { label: 'Обложка компании', value: 'companyCover' },
                { label: 'Фото объявления', value: 'listingPhoto' },
                { label: 'Обложка объявления', value: 'listingCover' },
                { label: 'Изображение контента', value: 'contentImage' },
                { label: 'Системное изображение', value: 'systemImage' },
              ],
              admin: {
                description: 'Стабильное доменное назначение для доступа, пресетов обработки, путей и DTO.',
              },
            },
            {
              name: 'moderationStatus',
              label: 'Статус модерации',
              type: 'select',
              required: true,
              index: true,
              defaultValue: 'draft',
              options: [
                { label: 'Черновик', value: 'draft' },
                { label: 'Ожидает проверки', value: 'pendingReview' },
                { label: 'Одобрено', value: 'approved' },
                { label: 'Отклонено', value: 'rejected' },
                { label: 'Карантин', value: 'quarantined' },
              ],
              admin: {
                description: 'Публичный UI должен отдавать только одобренные медиа, если сервис явно не разрешает другое.',
              },
            },
          ],
        },
        {
          label: 'Владение',
          fields: [
            {
              name: 'ownerType',
              label: 'Тип владельца',
              type: 'select',
              required: true,
              index: true,
              defaultValue: 'backoffice',
              options: [
                { label: 'Аккаунт', value: 'account' },
                { label: 'Компания', value: 'company' },
                { label: 'Администратор', value: 'backoffice' },
                { label: 'Система', value: 'system' },
              ],
            },
            {
              name: 'ownerAccount',
              label: 'Аккаунт-владелец',
              type: 'relationship',
              relationTo: 'accounts',
              admin: {
                condition: (data) => data?.ownerType === 'account',
              },
            },
            {
              name: 'ownerCompany',
              label: 'Компания-владелец',
              type: 'relationship',
              relationTo: 'companies',
              admin: {
                condition: (data) => data?.ownerType === 'company',
              },
            },
            {
              name: 'ownerUser',
              label: 'Администратор',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                condition: (data) => data?.ownerType === 'backoffice',
              },
            },
          ],
        },
        {
          label: 'Обработка',
          fields: [
            {
              name: 'mediaKey',
              label: 'Ключ медиа',
              type: 'text',
              unique: true,
              index: true,
              admin: {
                readOnly: true,
                description: 'Стабильный непрозрачный ключ для путей хранения и имён вариантов.',
              },
            },
            {
              name: 'filenameStrategy',
              label: 'Стратегия имени файла',
              type: 'select',
              required: true,
              defaultValue: 'opaque',
              options: [
                { label: 'Непрозрачное имя', value: 'opaque' },
                { label: 'SEO-имя', value: 'seo' },
              ],
            },
            {
              name: 'safeOriginalFilename',
              label: 'Безопасное исходное имя файла',
              type: 'text',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'originalHash',
              label: 'Хэш оригинала',
              type: 'text',
              index: true,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'settingsHash',
              label: 'Хэш настроек',
              type: 'text',
              index: true,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'imageMetadata',
              label: 'Метаданные изображения',
              type: 'group',
              fields: [
                {
                  name: 'orientation',
                  label: 'Ориентация',
                  type: 'select',
                  options: [
                    { label: 'Горизонтальная', value: 'landscape' },
                    { label: 'Вертикальная', value: 'portrait' },
                    { label: 'Квадратная', value: 'square' },
                  ],
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'aspectRatio',
                  label: 'Соотношение сторон',
                  type: 'number',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'dominantColor',
                  label: 'Доминирующий цвет',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    description: 'Ожидаемый hex-цвет, извлечённый во время обработки изображения.',
                  },
                },
                {
                  name: 'technicalMetadata',
                  label: 'Технические метаданные',
                  type: 'json',
                  admin: {
                    readOnly: true,
                  },
                },
              ],
            },
            {
              name: 'variants',
              label: 'Сгенерированные варианты',
              type: 'array',
              admin: {
                description: 'Сгенерированные варианты изображений с именами на основе хэша для безопасного кеширования через CDN.',
              },
              fields: [
                {
                  name: 'preset',
                  label: 'Пресет',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'format',
                  label: 'Формат',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'JPEG', value: 'jpeg' },
                    { label: 'WebP', value: 'webp' },
                    { label: 'AVIF', value: 'avif' },
                  ],
                },
                {
                  name: 'filename',
                  label: 'Имя файла',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  label: 'URL',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'width',
                  label: 'Ширина',
                  type: 'number',
                },
                {
                  name: 'height',
                  label: 'Высота',
                  type: 'number',
                },
                {
                  name: 'filesize',
                  label: 'Размер файла',
                  type: 'number',
                },
                {
                  name: 'mimeType',
                  label: 'MIME-тип',
                  type: 'text',
                },
                {
                  name: 'variantHash',
                  label: 'Хэш варианта',
                  type: 'text',
                  required: true,
                  index: true,
                },
                {
                  name: 'settingsHash',
                  label: 'Хэш настроек',
                  type: 'text',
                },
                {
                  name: 'isStale',
                  label: 'Устарел',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  upload: {
    mimeTypes: [...DEFAULT_MEDIA_SETTINGS.allowedMimeTypes],
  },
}

export default MediaCollection
