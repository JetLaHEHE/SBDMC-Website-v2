# Multilingual Website — SBDMC v2

## Overview
Translate the entire SBDMC website into 5 languages: English, Tagalog, Traditional Chinese (zh-TW), Japanese, Korean.

## Languages & Rationale
| Language | Code | Rationale |
|---|---|---|
| English | `en` | Default business language, current site language |
| Tagalog | `tl` | Host country, 95%+ of 171,653 Freeport workforce |
| Traditional Chinese | `zh` | SBGP developed by Taiwan's Century Development Corp; ~70% locators are Taiwanese (Wistron, TECO, Taian, Tailin, Tong Lung, etc.) |
| Japanese | `ja` | Major investors: Nidec (₱4B expansion), Sanyo Denki, Hitachi, HHIC-Phil |
| Korean | `ko` | Active locators: Dong Yang, Hokei, High Glory |

## Routing Strategy
URL-prefix based. Each language gets a distinct path:
```
/                  → English (default, no prefix)
/zh/               → Traditional Chinese
/tl/               → Tagalog
/ja/               → Japanese
/ko/               → Korean
```

Each page generates 5 static variants via `getStaticPaths()`. English stays at root.

Astro config updated with `i18n` settings: 5 locales, `defaultLocale: "en"`, `routing: "prefix-other-locales"`.

## Language Switcher UI
**Placement:** Header, between search and mobile menu toggle buttons.

**Design:** Pill-shaped button with globe + language code:
```
[ 🔍 ] [ 🌐 EN ▾ ] [ ≡ ]
```

The pill uses a subtle border + light background to distinguish it from flat icon buttons. The country code (`EN`, `ZH`, `TL`, `JA`, `KO`) makes it instantly recognizable as a language switcher.

**Dropdown:** On click (or hover), a compact dropdown shows all 5 languages with native scripts:
```
🌐 EN
─────────
✓ English
  中文
  Tagalog
  日本語
  한국어
```

- Checkmark on current language
- Each item is a link to the URL-prefixed version of the current page
- Rendered server-side (no JS required), enhanced with JS for hover-to-open

**new component:** `src/components/LangSwitcher.astro`

## Translation Data Architecture
All translations stored in `src/data/translations/` as JSON files. Each file contains all 5 languages, matching the `chat-translations.json` pattern.

### Files
| File | Translates | Strings |
|---|---|---|
| `layout.json` | Skip link, site name, default description, schema.org strings | ~10 |
| `navigation.json` | All nav labels (top-level + children) | ~22 |
| `footer.json` | Section headings, link labels, copyright, tagline | ~16 |
| `header.json` | Logo alt, tagline, search/menu aria-labels | ~5 |
| `hero.json` | Homepage hero, stats badges, section titles, CTAs | ~20 |
| `cookie-consent.json` | Banner message, button labels, aria-labels | ~5 |
| `search.json` | Modal heading, close button label | ~4 |
| `back-to-top.json` | Button aria-label | ~1 |
| `breadcrumb.json` | "Home" root label | ~1 |
| `404.json` | 404 page text, heading, button, suggestions | ~8 |
| `chatbot.json` | Chatbot HTML template text (merge existing chat-translations.json) | ~16 |
| `chat-knowledge.json` | Chatbot RAG knowledge base | ~30 |
| `contact.json` | Address, phone, email, hours | ~4 |
| `page-headers.json` | Shared page hero pattern (badge + h1 + subtitle for each page) | ~66 |

### Data format per file
```json
{
  "en": { "skipLink": "Skip to main content", "siteName": "SBDMC, Inc." },
  "zh": { "skipLink": "跳至主要内容", "siteName": "世正開發股份有限公司" },
  "tl": { "skipLink": "Laktawan sa pangunahing nilalaman", "siteName": "SBDMC, Inc." },
  "ja": { "skipLink": "メインコンテンツにスキップ", "siteName": "SBDMC株式会社" },
  "ko": { "skipLink": "주요 콘텐츠로 건너뛰기", "siteName": "SBDMC, Inc." }
}
```

### i18n Helper
New module `src/i18n/index.ts` exports:

```typescript
// Generate Astro static paths for all 5 languages
export function getStaticPaths(lang?: string)

// Translate a key from the current language's translations
export function t(translations: Record<string, any>, key: string, lang: string): string

// Get language from Astro params
export function getLang(Astro: any): string

// Generate hreflang link tags
export function getHreflangs(currentPath: string, baseUrl: string): string

// Language metadata
export const LANGUAGES = [
  { code: "en", label: "English", native: "English", locale: "en_PH", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", locale: "zh_TW", dir: "ltr" },
  { code: "tl", label: "Tagalog", native: "Tagalog", locale: "tl_PH", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", locale: "ja_JP", dir: "ltr" },
  { code: "ko", label: "Korean", native: "한국어", locale: "ko_KR", dir: "ltr" },
]
```

## Phase Plan

### Phase 1 — Infrastructure + Shared Data (~100-120 strings)
High-leverage: translate everything that appears on every page.

**Scope:**
1. Create `src/i18n/index.ts` with helpers
2. Configure `astro.config.mjs` i18n
3. Update `Layout.astro` — dynamic `<html lang>`, hreflang, `og:locale`, pass `lang` param
4. Create `LangSwitcher.astro`
5. Create translation files for: layout, navigation, footer, header, hero, cookie-consent, search, back-to-top, breadcrumb, 404, chatbot, contact, page-headers
6. Update `Header.astro` — dynamic text via `t()`, add LangSwitcher
7. Update `Footer.astro` — dynamic section headings, link labels, tagline
8. Update `CookieConsent.astro`, `Search.astro`, `Breadcrumb.astro`, `BackToTop.astro`, `404.astro`
9. Update `Chatbot.astro` — make static HTML template text language-aware, merge existing `chat-translations.json`
10. Translate `chat-knowledge.json` (RAG knowledge base)
11. Add hreflang to sitemap

**Testing:** Build produces 22 pages × 5 languages = 110 HTML files. Verify all.

### Phase 2 — Core Content Pages (~150 strings)
Pages that drive business: home, about, services, incentives, contact, FAQ, etc.

**Scope:**
1. Create page-specific translation files for core pages with hardcoded text
2. Translate inline text in: index.astro (service + feature cards), about-sbdmc.astro, about-sbma.astro, description.astro, business-incentives.astro, business-services.astro, locators.astro, other-reasons.astro, faq.astro, contact.astro, job-opportunities.astro, gallery.astro, government-links.astro
3. Update each page to use `getStaticPaths()` + data file translations
4. Translate schema.org JSON-LD (FAQPage, Organization)

**Testing:** Each page renders correctly in all 5 languages.

### Phase 3 — Remaining Content Pages (~400 strings)
Largest volume: legal text, RFID guide, forms, handy guide, etc.

**Scope:**
1. Create page-specific translation files for: for-lease.astro, rental-information.astro, rfid.astro, forms.astro, handy-guide.astro, map.astro, privacy.astro, terms.astro
2. Update each page to use `getStaticPaths()` + data file translations
3. Translate legal/privacy/terms content (requires careful review)

**Testing:** All 110 pages (22 × 5) build successfully. Manual review of legal translations.

## SEO
Each page includes:
- `<html lang="{lang}">`
- `<meta property="og:locale" content="{locale}">`
- `<link rel="alternate" hreflang="{lang}" href="...">` for all 5 languages
- `<link rel="alternate" hreflang="x-default" href="https://sbdmc.netlify.app/">`
- Sitemap includes all language variants

## Translation Source
Phase 1 translations will be AI-generated (DeepL/Google Translate) with spot-checking for accuracy. Phase 2-3 legal and technical content (Privacy, Terms, RFID, Forms) requires human review — flag these for verification before Phase 3 deployment.

## Out of Scope
- **Date/number/currency localization** — dates remain in "Month DD, YYYY" format, numbers unchanged, currency in USD/PHP as-is
- **Dynamic content translation** — FAQ, jobs, and other CMS-managed content remains English-only; CMS would need multilingual support as a separate project

## Edge Cases
- **404 pages:** Generated per language — `/zh/404`, `/tl/404`, etc.
- **Missing translations:** `t()` falls back to English key if translation missing
- **Language redirect:** User visits `/zh/` — no redirect. User controls via switcher.
- **localStorage persistence:** Language preference saved for return visits
- **Chatbot:** Sync chatbot language with page language on load
- **Search:** Pagefind indexes each language separately

## Verification
- Build produces exactly 110 pages (22 pages × 5 languages)
- Each page has correct `<html lang>`, `og:locale`, hreflang tags
- Language switcher shows on all pages, all 5 options work
- No key missing errors — `t()` falls back gracefully
- chatbot-knowledge translated to all 5 languages
- hreflang sitemap validates
