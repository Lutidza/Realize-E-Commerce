/**
 * @file src/RealizeCore/collections/Media/MediaSettingsGlobal.ts
 * @version 1.0.0 - 2026-06-23
 * @docref media-technical-reference
 * @see documentation/media/media-technical-reference.md
 * @description Payload Global для базовых настроек обработки, хранения и кеширования медиа.
 */

import type { GlobalConfig } from 'payload'

import { invalidateMediaSettingsCacheAfterChange } from '@/RealizeCore/collections/Media/hooks/invalidateMediaSettingsCacheAfterChange'
import { DEFAULT_MEDIA_SETTINGS } from '@/RealizeCore/media/constants/defaultMediaSettings'

export const MediaSettingsGlobal: GlobalConfig = {
  slug: 'media-settings',
  label: 'Настройки медиа',
  admin: {
    group: 'МЕДИА',
  },
  hooks: {
    afterChange: [invalidateMediaSettingsCacheAfterChange],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Загрузка',
          fields: [
            {
              name: 'maxOriginalFileSizeMb',
              label: 'Максимальный размер оригинала, МБ',
              type: 'number',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.maxOriginalFileSizeMb,
              min: 1,
              max: 200,
              admin: {
                description: 'Ограничение размера исходного файла до обработки variants.',
              },
            },
            {
              name: 'allowedMimeTypes',
              label: 'Разрешённые MIME-типы',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: [...DEFAULT_MEDIA_SETTINGS.allowedMimeTypes],
              options: [
                { label: 'JPEG', value: 'image/jpeg' },
                { label: 'PNG', value: 'image/png' },
                { label: 'WebP', value: 'image/webp' },
                { label: 'AVIF', value: 'image/avif' },
              ],
              admin: {
                description: 'Первый этап ограничен безопасными растровыми изображениями.',
              },
            },
          ],
        },
        {
          label: 'Форматы и качество',
          fields: [
            {
              name: 'outputFormats',
              label: 'Форматы variants',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: [...DEFAULT_MEDIA_SETTINGS.outputFormats],
              options: [
                { label: 'AVIF', value: 'avif' },
                { label: 'WebP', value: 'webp' },
                { label: 'JPEG', value: 'jpeg' },
              ],
              admin: {
                description: 'AVIF включён сразу, WebP/JPEG остаются fallback-форматами.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'jpegQuality',
                  label: 'Качество JPEG',
                  type: 'number',
                  required: true,
                  defaultValue: DEFAULT_MEDIA_SETTINGS.jpegQuality,
                  min: 1,
                  max: 100,
                },
                {
                  name: 'webpQuality',
                  label: 'Качество WebP',
                  type: 'number',
                  required: true,
                  defaultValue: DEFAULT_MEDIA_SETTINGS.webpQuality,
                  min: 1,
                  max: 100,
                },
                {
                  name: 'avifQuality',
                  label: 'Качество AVIF',
                  type: 'number',
                  required: true,
                  defaultValue: DEFAULT_MEDIA_SETTINGS.avifQuality,
                  min: 1,
                  max: 100,
                },
              ],
            },
          ],
        },
        {
          label: 'Пресеты',
          fields: [
            {
              name: 'presets',
              label: 'Пресеты изображений',
              type: 'array',
              required: true,
              minRows: 1,
              defaultValue: DEFAULT_MEDIA_SETTINGS.presets.map((preset) => ({ ...preset })),
              admin: {
                description: 'Размеры первого этапа можно уточнять через админку без изменения schema.',
              },
              fields: [
                {
                  name: 'preset',
                  label: 'Пресет',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Аватар', value: 'avatar' },
                    { label: 'Логотип', value: 'logo' },
                    { label: 'Обложка', value: 'cover' },
                    { label: 'Карточка объявления', value: 'listingCard' },
                    { label: 'Галерея объявления', value: 'listingGallery' },
                    { label: 'Контент', value: 'content' },
                    { label: 'Open Graph', value: 'openGraph' },
                  ],
                },
                {
                  name: 'enabled',
                  label: 'Включён',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'width',
                      label: 'Ширина',
                      type: 'number',
                      required: true,
                      min: 1,
                      max: 8000,
                    },
                    {
                      name: 'height',
                      label: 'Высота',
                      type: 'number',
                      min: 1,
                      max: 8000,
                    },
                  ],
                },
                {
                  name: 'fit',
                  label: 'Режим вписывания',
                  type: 'select',
                  required: true,
                  defaultValue: 'cover',
                  options: [
                    { label: 'Обрезать под размер', value: 'cover' },
                    { label: 'Вписать внутрь', value: 'inside' },
                    { label: 'Сохранить целиком', value: 'contain' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'useFocalPoint',
                      label: 'Использовать focal point',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'allowUpscale',
                      label: 'Разрешить увеличение',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Метаданные',
          fields: [
            {
              name: 'normalizeExifOrientation',
              label: 'Нормализовать EXIF orientation',
              type: 'checkbox',
              defaultValue: DEFAULT_MEDIA_SETTINGS.normalizeExifOrientation,
            },
            {
              name: 'extractDominantColor',
              label: 'Извлекать доминирующий цвет',
              type: 'checkbox',
              defaultValue: DEFAULT_MEDIA_SETTINGS.extractDominantColor,
            },
            {
              name: 'extractTechnicalMetadata',
              label: 'Сохранять технические метаданные',
              type: 'checkbox',
              defaultValue: DEFAULT_MEDIA_SETTINGS.extractTechnicalMetadata,
            },
            {
              name: 'keepOriginalFilenameInMetadata',
              label: 'Сохранять исходное имя в метаданных',
              type: 'checkbox',
              defaultValue: DEFAULT_MEDIA_SETTINGS.keepOriginalFilenameInMetadata,
              admin: {
                description: 'Исходное имя не используется в публичном URL.',
              },
            },
          ],
        },
        {
          label: 'Кеширование',
          fields: [
            {
              name: 'settingsCacheTtlSeconds',
              label: 'TTL кеша настроек, секунды',
              type: 'number',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.settingsCacheTtlSeconds,
              min: 5,
              max: 3600,
            },
            {
              name: 'publicCacheMaxAgeSeconds',
              label: 'Public cache max-age, секунды',
              type: 'number',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.publicCacheMaxAgeSeconds,
              min: 0,
              max: 31536000,
            },
            {
              name: 'staleWhileRevalidateSeconds',
              label: 'Stale-while-revalidate, секунды',
              type: 'number',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.staleWhileRevalidateSeconds,
              min: 0,
              max: 604800,
            },
          ],
        },
        {
          label: 'Модерация',
          fields: [
            {
              name: 'userUploadDefaultStatus',
              label: 'Статус пользовательской загрузки',
              type: 'select',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.userUploadDefaultStatus,
              options: [
                { label: 'Черновик', value: 'draft' },
                { label: 'Ожидает проверки', value: 'pendingReview' },
                { label: 'Одобрено', value: 'approved' },
                { label: 'Отклонено', value: 'rejected' },
                { label: 'Карантин', value: 'quarantined' },
              ],
            },
            {
              name: 'backofficeUploadDefaultStatus',
              label: 'Статус загрузки из админки',
              type: 'select',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.backofficeUploadDefaultStatus,
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
          label: 'Хранилище',
          fields: [
            {
              name: 'storageProvider',
              label: 'Провайдер хранилища',
              type: 'select',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.storageProvider,
              options: [
                { label: 'Локальное хранилище', value: 'local' },
                { label: 'S3-compatible хранилище', value: 's3' },
              ],
              admin: {
                description: 'S3-compatible provider зарезервирован для следующего этапа и не хранит secrets.',
              },
            },
            {
              name: 'localBasePath',
              label: 'Локальная базовая папка',
              type: 'text',
              required: true,
              defaultValue: DEFAULT_MEDIA_SETTINGS.localBasePath,
            },
            {
              name: 'publicBaseUrl',
              label: 'Публичный базовый URL',
              type: 'text',
              admin: {
                description: 'Опциональный origin/CDN URL без секретов и токенов доступа.',
              },
            },
          ],
        },
      ],
    },
  ],
}

export default MediaSettingsGlobal
