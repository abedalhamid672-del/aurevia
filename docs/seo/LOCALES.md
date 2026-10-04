# Aurevia locale architecture

## Current supported locales

- `en` is the default locale and uses unprefixed public URLs.
- `ar` is explicitly prefixed with `/ar` and sets `html[lang="ar"]` and `dir="rtl"`.
- Currency remains a commercial concern; the current catalog is explicitly labeled as US USD snapshots and is not silently converted.

## URL model

| Content | English | Arabic |
|---|---|---|
| Home | `/` | `/ar` |
| Product | `/fragrance/{slug}` | `/ar/عطر/{slug}` |
| Account | `/account` | `/ar/account` |

The product slug remains the verified catalog slug across locales so product identity does not drift. Internal/auth/API routes remain unlocalized.

## Routing and persistence

An explicit locale prefix wins. The browser stores the selected locale in `aurevia:locale:v1`; there is no automatic country redirect yet, so crawlers and users are not exposed to redirect traps. A future country resolver must never override an explicit URL or user choice and must bypass API, auth, asset, sitemap, and robots paths.

## Metadata

`shared/seo.ts` is the source of truth for locale configuration, localized paths, canonical URLs, reciprocal `hreflang`, and `x-default`. `SeoHead` applies the same metadata to the client route without creating alternate URLs that do not exist.

## Translation governance

Translations are kept in `client/src/lib/i18n.ts`. `server/seo.i18n.test.ts` fails when locale keys diverge. Add a key to both locale records before using it in UI. Product names, brands, note names, prices, and source URLs are not translated or invented.

## RTL

RTL is applied through `lang` and `dir`; the existing visual system remains intact. New directional layout code should use logical CSS properties (`margin-inline`, `inset-inline`, `border-inline`) and preserve icon meaning rather than blindly mirroring every icon.

## Adding a locale

1. Add the locale to `TARGET_LOCALES` and `localeConfig`.
2. Add a complete copy record and update the parity test.
3. Add localized path functions and reciprocal entries in `alternateEntries`.
4. Add a real route in `App.tsx`.
5. Add the locale to sitemap generation only after its public pages exist.
6. Test `lang`, `dir`, metadata, canonical, hreflang, sitemap, and 404 behavior.
