# SRP Route Factory

- Версия: 1.0.0
- Дата обновления: 2026-03-02

## Назначение

Модуль `src/RealizeCore/routes/srp` предоставляет движок для разбора и
построения SRP-маршрутов на основе `ResolvedSearchProfile`. Он работает
совместно с утилитами в `src/RealizeCore/srp`, но отвечает исключительно
за URL-слой:

- `createSearchRoute.ts` — объединяет парсер и билдер, экспортируемый как
  главная фабрика `createSearchRoute(profile)`.
- `createRouteParser.ts` — разбирает массив сегментов/путь в
  `SrpRouteMatch`, используя словарь фасетов конкретной коллекции.
- `createRouteBuilder.ts` — строит путь из DTO (`SrpRouteMatch` + overrides).
- `srp.index.ts` — публичный экспорт фабрики и всех типов.
- `srpRoutes.types.ts` — определения `SrpRouteMatch`, `SrpRouteFacet`,
  `SrpRouteParseResult` и ошибок парсинга.
- `helpers/`:
  - `pageSegmentHelper.ts` — работа с сегментами пагинации (`page-N`).
  - `routeErrorsHelper.ts` — построение стандартных ошибок парсинга.
  - `routeNormalizationHelper.ts` — нормализация сегментов (локаль,
    фасеты, geo).
  - `routeOrderingHelper.ts` — сортировка фасетов и проверка каноничности.

## Использование

1. Получить `ResolvedSearchProfile` (например,
   `getResolvedProfileForCollection`).
2. Вызвать `createSearchRoute(profile)` и использовать возвращённые
   методы `parseSegments`, `parsePath`, `buildPath`.
3. Словарь фасетов берётся через `getFacetDictionary(collectionSlug)` и
   кэшируется внутри парсера.

## Правила доработки

- При изменениях обязательно обновляйте версию и дату в этом README.
- Любой новый файл снабжайте заголовком в формате Typedoc с `@file` и
  `@version`.
- Если добавляются новые helper’ы, держите их в папке `helpers/` и
  документируйте назначения прямо в файле.
