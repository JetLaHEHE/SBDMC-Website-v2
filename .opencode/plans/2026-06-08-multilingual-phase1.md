# Phase 1: Multilingual Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full multilingual infrastructure — routing, i18n helpers, language switcher, and shared translation data across all components.

**Architecture:** URL-prefix based routing via Astro i18n config. Translation data in `src/data/translations/*.json` (5 languages per file). A shared `src/i18n/index.ts` module provides helpers. Components receive `lang` prop and use `t()` to render translated text.

**Tech Stack:** Astro v6 i18n, JSON translation files, `getStaticPaths()` for per-language page generation.

---

### Task 1: Create i18n Helper Module

**Files:**
- Create: `src/i18n/index.ts`

- [ ] **Step 1: Create the i18n module**

```typescript
export const LANGUAGES = [
  { code: "en", label: "English", native: "English", locale: "en_PH", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", locale: "zh_TW", dir: "ltr" },
  { code: "tl", label: "Tagalog", native: "Tagalog", locale: "tl_PH", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", locale: "ja_JP", dir: "ltr" },
  { code: "ko", label: "Korean", native: "한국어", locale: "ko_KR", dir: "ltr" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export function getLangFromParams(params: { lang?: string }): LangCode {
  const lang = params.lang || "en";
  return (LANGUAGES.some((l) => l.code === lang) ? lang : "en") as LangCode;
}

export function getStaticPaths(): { params: { lang?: string } }[] {
  return [
    { params: { lang: undefined } }, // English at root
    { params: { lang: "zh" } },
    { params: { lang: "tl" } },
    { params: { lang: "ja" } },
    { params: { lang: "ko" } },
  ];
}

export function t<T extends Record<string, any>>(
  translations: Record<string, T>,
  lang: LangCode,
): T {
  return translations[lang] ?? translations["en"];
}

export function getHreflangs(
  currentPath: string,
  baseUrl: string,
): { lang: string; href: string }[] {
  const path = currentPath.replace(/^\/(zh|tl|ja|ko)\/?/, "/");
  return [
    { lang: "en", href: `${baseUrl}${path}` },
    { lang: "zh", href: `${baseUrl}/zh${path}` },
    { lang: "tl", href: `${baseUrl}/tl${path}` },
    { lang: "ja", href: `${baseUrl}/ja${path}` },
    { lang: "ko", href: `${baseUrl}/ko${path}` },
    { lang: "x-default", href: `${baseUrl}${path}` },
  ];
}

export function getLangPrefix(lang: LangCode): string {
  return lang === "en" ? "" : `/${lang}`;
}
```

- [ ] **Step 2: Verify file is valid TypeScript**

Run: `npx tsc --noEmit src/i18n/index.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```
git add src/i18n/index.ts
git commit -m "feat(i18n): add shared i18n helper module with language config, t(), getStaticPaths()"
```

---

### Task 2: Update Astro Config for i18n

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add i18n configuration**

```javascript
// astro.config.mjs — add to `defineConfig`:
export default defineConfig({
  site: "https://sbdmc.netlify.app",
  // ...existing config...
  i18n: {
    locales: ["en", "zh", "tl", "ja", "ko"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
      strategy: "prefix-other-locales",
    },
  },
  integrations: [
    sitemap({
      i18n: {
        locales: {
          en: "en-PH",
          zh: "zh-TW",
          tl: "tl-PH",
          ja: "ja-JP",
          ko: "ko-KR",
        },
        defaultLocale: "en",
      },
    }),
    // ...other integrations...
  ],
});
```

- [ ] **Step 2: Verify config parses**

Run: `npx astro check`
Expected: No config errors

- [ ] **Step 3: Commit**

```
git add astro.config.mjs
git commit -m "feat(i18n): configure Astro i18n with 5 locales and URL prefix routing"
```

---

### Task 3: Create Translation Data Files (Phase 1)

**Files:**
- Create: `src/data/translations/layout.json`
- Create: `src/data/translations/navigation.json`
- Create: `src/data/translations/footer.json`
- Create: `src/data/translations/header.json`
- Create: `src/data/translations/hero.json`
- Create: `src/data/translations/cookie-consent.json`
- Create: `src/data/translations/search.json`
- Create: `src/data/translations/back-to-top.json`
- Create: `src/data/translations/breadcrumb.json`
- Create: `src/data/translations/404.json`
- Create: `src/data/translations/contact.json`
- Create: `src/data/translations/page-headers.json`

- [ ] **Step 1-12: Create each JSON translation file**

Each file follows this pattern:
```json
{
  "en": { "key": "English text" },
  "zh": { "key": "Chinese text" },
  "tl": { "key": "Tagalog text" },
  "ja": { "key": "Japanese text" },
  "ko": { "key": "Korean text" }
}
```

Contents for each file:

**`layout.json`:**
```json
{
  "en": {
    "skipLink": "Skip to main content",
    "siteName": "SBDMC, Inc. - Subic Bay Gateway Park",
    "defaultDescription": "Subic Bay Gateway Park — a premier business and industrial park in the Subic Bay Freeport Zone, Philippines.",
    "schemaName": "Subic Bay Gateway Park (SBDMC, Inc.)",
    "schemaDescription": "A premier business and industrial park in the Subic Bay Freeport Zone, Philippines.",
    "addressLocality": "Subic Bay Freeport Zone"
  },
  "zh": {
    "skipLink": "跳至主要内容",
    "siteName": "世正開發股份有限公司 - 蘇比克灣門戶工業園區",
    "defaultDescription": "蘇比克灣門戶工業園區 — 位於菲律賓蘇比克灣自由港區的頂級商業與工業園區。",
    "schemaName": "蘇比克灣門戶工業園區（世正開發股份有限公司）",
    "schemaDescription": "位於菲律賓蘇比克灣自由港區的頂級商業與工業園區。",
    "addressLocality": "蘇比克灣自由港區"
  },
  "tl": {
    "skipLink": "Laktawan sa pangunahing nilalaman",
    "siteName": "SBDMC, Inc. - Subic Bay Gateway Park",
    "defaultDescription": "Subic Bay Gateway Park — isang premier business at industrial park sa Subic Bay Freeport Zone, Pilipinas.",
    "schemaName": "Subic Bay Gateway Park (SBDMC, Inc.)",
    "schemaDescription": "Isang premier business at industrial park sa Subic Bay Freeport Zone, Pilipinas.",
    "addressLocality": "Subic Bay Freeport Zone"
  },
  "ja": {
    "skipLink": "メインコンテンツにスキップ",
    "siteName": "SBDMC株式会社 - スービックベイゲートウェイパーク",
    "defaultDescription": "スービックベイゲートウェイパーク — フィリピン、スービックベイ自由港区にある一流の商業・工業団地。",
    "schemaName": "スービックベイゲートウェイパーク（SBDMC株式会社）",
    "schemaDescription": "フィリピン、スービックベイ自由港区にある一流の商業・工業団地。",
    "addressLocality": "スービックベイ自由港区"
  },
  "ko": {
    "skipLink": "주요 콘텐츠로 건너뛰기",
    "siteName": "SBDMC, Inc. - 수빅 베이 게이트웨이 파크",
    "defaultDescription": "수빅 베이 게이트웨이 파크 — 필리핀 수빅 베이 자유무역지대의 프리미어 비즈니스 및 산업 단지.",
    "schemaName": "수빅 베이 게이트웨이 파크 (SBDMC, Inc.)",
    "schemaDescription": "필리핀 수빅 베이 자유무역지대의 프리미어 비즈니스 및 산업 단지.",
    "addressLocality": "수빅 베이 자유무역지대"
  }
}
```

**`header.json`:**
```json
{
  "en": { "logoAlt": "SBDMC, Inc.", "brand": "SBDMC, Inc.", "tagline": "Subic Bay Gateway Park", "search": "Search", "toggleMenu": "Toggle menu" },
  "zh": { "logoAlt": "世正開發股份有限公司", "brand": "世正開發股份有限公司", "tagline": "蘇比克灣門戶工業園區", "search": "搜索", "toggleMenu": "切換選單" },
  "tl": { "logoAlt": "SBDMC, Inc.", "brand": "SBDMC, Inc.", "tagline": "Subic Bay Gateway Park", "search": "Maghanap", "toggleMenu": "Ilipat ang menu" },
  "ja": { "logoAlt": "SBDMC株式会社", "brand": "SBDMC株式会社", "tagline": "スービックベイゲートウェイパーク", "search": "検索", "toggleMenu": "メニュー切替" },
  "ko": { "logoAlt": "SBDMC, Inc.", "brand": "SBDMC, Inc.", "tagline": "수빅 베이 게이트웨이 파크", "search": "검색", "toggleMenu": "메뉴 전환" }
}
```

**`breadcrumb.json`:**
```json
{
  "en": { "home": "Home" },
  "zh": { "home": "首頁" },
  "tl": { "home": "Tahanan" },
  "ja": { "home": "ホーム" },
  "ko": { "home": "홈" }
}
```

**`cookie-consent.json`:**
```json
{
  "en": { "dialogLabel": "Cookie consent", "message": "We use cookies to improve your browsing experience and analyze site traffic. By clicking \"Accept All\", you consent to our use of cookies.", "decline": "Decline", "accept": "Accept All" },
  "zh": { "dialogLabel": "Cookie 同意", "message": "我們使用 Cookie 來改善您的瀏覽體驗並分析網站流量。點擊\"全部接受\"，即表示您同意我們使用 Cookie。", "decline": "拒絕", "accept": "全部接受" },
  "tl": { "dialogLabel": "Pagpayag sa cookie", "message": "Gumagamit kami ng cookies upang mapabuti ang iyong karanasan sa pag-browse at suriin ang trapiko sa site. Sa pamamagitan ng pag-click \"Tanggapin Lahat\", sumasang-ayon ka sa paggamit namin ng cookies.", "decline": "Tumanggi", "accept": "Tanggapin Lahat" },
  "ja": { "dialogLabel": "Cookie同意", "message": "当サイトでは、ブラウジング体験の向上とサイトトラフィックの分析のためにCookieを使用しています。「すべて同意する」をクリックすると、Cookieの使用に同意したことになります。", "decline": "拒否", "accept": "すべて同意する" },
  "ko": { "dialogLabel": "쿠키 동의", "message": "당사는 귀하의 브라우징 경험을 개선하고 사이트 트래픽을 분석하기 위해 쿠키를 사용합니다. \"모두 수락\"을 클릭하면 당사의 쿠키 사용에 동의하는 것으로 간주됩니다.", "decline": "거부", "accept": "모두 수락" }
}
```

**`search.json`:**
```json
{
  "en": { "dialogLabel": "Search the site", "heading": "Search", "close": "Close search" },
  "zh": { "dialogLabel": "搜索網站", "heading": "搜索", "close": "關閉搜索" },
  "tl": { "dialogLabel": "Maghanap sa site", "heading": "Maghanap", "close": "Isara ang paghahanap" },
  "ja": { "dialogLabel": "サイト検索", "heading": "検索", "close": "検索を閉じる" },
  "ko": { "dialogLabel": "사이트 검색", "heading": "검색", "close": "검색 닫기" }
}
```

**`back-to-top.json`:**
```json
{
  "en": { "label": "Back to top" },
  "zh": { "label": "返回頂部" },
  "tl": { "label": "Bumalik sa itaas" },
  "ja": { "label": "トップに戻る" },
  "ko": { "label": "맨 위로" }
}
```

**`404.json`:**
```json
{
  "en": { "title": "Page Not Found", "code": "404", "message": "The page you're looking for doesn't exist or has been moved.", "backHome": "Back to Home", "suggestedHeading": "Suggested Pages" },
  "zh": { "title": "找不到頁面", "code": "404", "message": "您要找的頁面不存在或已移動。", "backHome": "返回首頁", "suggestedHeading": "建議頁面" },
  "tl": { "title": "Hindi Natagpuan ang Pahina", "code": "404", "message": "Ang pahinang hinahanap mo ay wala o nailipat na.", "backHome": "Bumalik sa Tahanan", "suggestedHeading": "Mga Mungkahing Pahina" },
  "ja": { "title": "ページが見つかりません", "code": "404", "message": "お探しのページは存在しないか、移動されました。", "backHome": "ホームに戻る", "suggestedHeading": "おすすめページ" },
  "ko": { "title": "페이지를 찾을 수 없음", "code": "404", "message": "찾고 계신 페이지가 존재하지 않거나 이동되었습니다.", "backHome": "홈으로 돌아가기", "suggestedHeading": "추천 페이지" }
}
```

**`navigation.json`:** Derive from existing `src/data/navigation.json`. Same structure but wrap in `{ "en": [...items], "zh": [...translatedItems], ... }`.

**`footer.json`:** Derive section headings and link labels from existing `src/data/footer.json`.

**`hero.json`:** Derive from existing `src/data/hero.json`.

**`contact.json`:** Derive from existing `src/data/contact.json`.

**`page-headers.json`:** Map each page's hero badge + h1 + subtitle.

- [ ] **Step 13: Verify JSON files parse**

Run: `node -e "require('fs').readdirSync('src/data/translations').forEach(f => require('./src/data/translations/'+f))"`
Expected: No errors

- [ ] **Step 14: Commit**

```
git add src/data/translations/
git commit -m "feat(i18n): add translation data files for shared components"
```

---

### Task 4: Update Layout.astro for Multilingual Support

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Read current Layout.astro fully**

Read `src/layouts/Layout.astro` to understand current structure.

- [ ] **Step 2: Add frontmatter for language and imports**

Add after `const defaultOgImage...`:
```astro
import { getLangFromParams, getHreflangs, t, LANGUAGES, type LangCode } from "../i18n";
const lang = getLangFromParams(Astro.params) as LangCode;
const langConfig = LANGUAGES.find(l => l.code === lang)!;
import layoutTranslations from "../data/translations/layout.json";
const lo = t(layoutTranslations, lang);
```

- [ ] **Step 3: Update `<html>` tag**

Change:
```astro
<html lang="en">
```
To:
```astro
<html lang={lang}>
```

- [ ] **Step 4: Update `<meta>` tags**

Change `og:locale` from hardcoded `en_PH` to `{langConfig.locale}`.

- [ ] **Step 5: Add hreflang `<link>` tags**

Add after the existing meta tags:
```astro
{getHreflangs(Astro.url.pathname, "https://sbdmc.netlify.app").map(({ lang: hl, href }) => (
  <link rel="alternate" hreflang={hl} href={href} />
))}
```

- [ ] **Step 6: Update skip link text**

Change skip link text from "Skip to main content" to `{lo.skipLink}`.

- [ ] **Step 7: Pass lang prop to child components**

Update component calls:
```astro
<Header currentPath={canonical} lang={lang} />
...
<CookieConsent lang={lang} />
<Search lang={lang} />
<Chatbot lang={lang} />
```

- [ ] **Step 8: Update title/description**

Change:
```astro
const siteName = "SBDMC, Inc. - Subic Bay Gateway Park";
const pageDesc = description || "Subic Bay Gateway Park — a premier business...";
```
To:
```astro
const siteName = lo.siteName;
const pageDesc = description || lo.defaultDescription;
```

- [ ] **Step 9: Update Schema.org JSON-LD**

Replace hardcoded English schema strings with `{lo.schemaName}`, `{lo.schemaDescription}`, `{lo.addressLocality}`.

- [ ] **Step 10: Verify build**

Run: `rtk npm run build`
Expected: Build succeeds. Check that pages have correct `<html lang>` attribute.

- [ ] **Step 11: Commit**

```
git add src/layouts/Layout.astro
git commit -m "feat(i18n): make Layout.astro language-aware with dynamic html lang, hreflang, skip link"
```

---

### Task 5: Update Header.astro with Language Switcher

**Files:**
- Modify: `src/components/Header.astro`
- Create: `src/components/LangSwitcher.astro`

- [ ] **Step 1: Create LangSwitcher.astro**

```astro
---
import { LANGUAGES, getLangPrefix, type LangCode } from "../i18n";
export interface Props {
  currentLang: LangCode;
  currentPath: string;
}
const { currentLang, currentPath } = Astro.props;
const cleanPath = currentPath.replace(/^\/(zh|tl|ja|ko)\/?/, "/") || "/";
---

<div class="relative group">
  <button class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800" aria-label="Switch language">
    <span class="text-sm">🌐</span>
    <span class="uppercase font-semibold">{currentLang}</span>
    <svg aria-hidden="true" class="h-3 w-3 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
  </button>
  <div class="invisible absolute right-0 top-full z-50 mt-1 w-44 origin-top-right translate-y-1 rounded-lg border border-gray-100 bg-white py-1 shadow-lg opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
    {LANGUAGES.map((lang) => (
      <a
        href={getLangPrefix(lang.code) + cleanPath}
        class={`flex items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-gray-50 ${lang.code === currentLang ? "font-semibold text-primary-500" : "text-gray-700"}`}
        hreflang={lang.code}
      >
        <span class="w-6 text-center">{lang.code === currentLang ? "✓" : ""}</span>
        <span class="text-base">{lang.native}</span>
        <span class="text-gray-400">{lang.label}</span>
      </a>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Update Header.astro frontmatter**

Add after `const { currentPath = "/" } = Astro.props;`:
```astro
const { currentPath = "/", lang = "en" } = Astro.props;
```
Then add import:
```astro
import LangSwitcher from "./LangSwitcher.astro";
```

- [ ] **Step 3: Add LangSwitcher to header**

In the `.flex.items-center.gap-1` div, add LangSwitcher between search-toggle and menu-toggle:
```astro
<LangSwitcher currentLang={lang} currentPath={currentPath} />
```

- [ ] **Step 4: Verify build**

Run: `rtk npm run build`
Expected: Build succeeds. Language switcher appears in header.

- [ ] **Step 5: Commit**

```
git add src/components/Header.astro src/components/LangSwitcher.astro
git commit -m "feat(i18n): add language switcher component and update Header"
```

---

### Task 6: Update Footer, CookieConsent, Search, BackToTop, Breadcrumb

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/CookieConsent.astro`
- Modify: `src/components/Search.astro`
- Modify: `src/components/BackToTop.astro`
- Modify: `src/components/Breadcrumb.astro`

- [ ] **Step 1-5: Update each component to accept `lang` prop and use translated text**

Pattern for each component:
```astro
---
import { t, type LangCode } from "../i18n";
const { lang = "en" } = Astro.props as { lang?: LangCode };
import footerTranslations from "../data/translations/footer.json";
const ft = t(footerTranslations, lang);
---
```

Then replace hardcoded English text with `{ft.keyName}`.

- [ ] **Step 6: Verify build**

Run: `rtk npm run build`
Expected: Build succeeds. All components use translated text.

- [ ] **Step 7: Commit**

```
git add src/components/Footer.astro src/components/CookieConsent.astro src/components/Search.astro src/components/BackToTop.astro src/components/Breadcrumb.astro
git commit -m "feat(i18n): update Footer, CookieConsent, Search, BackToTop, Breadcrumb with lang prop"
```

---

### Task 7: Update 404 Page

**Files:**
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Add getStaticPaths and lang support**

```astro
---
import { getStaticPaths, getLangFromParams, t, type LangCode } from "../i18n";
export { getStaticPaths };
const lang = getLangFromParams(Astro.params) as LangCode;
import layoutTranslations from "../data/translations/layout.json";
import notFoundTranslations from "../data/translations/404.json";
const lo = t(layoutTranslations, lang);
const nf = t(notFoundTranslations, lang);
---
```

- [ ] **Step 2: Replace hardcoded text**

Replace "Page Not Found", "404", etc. with `{nf.title}`, `{nf.code}`, etc.

- [ ] **Step 3: Verify build**

Run: `rtk npm run build`
Expected: 404 page renders with translated text.

- [ ] **Step 4: Commit**

```
git add src/pages/404.astro
git commit -m "feat(i18n): update 404 page with getStaticPaths and translations"
```

---

### Task 8: Update Chatbot Static Text + Sync Language

**Files:**
- Modify: `src/components/Chatbot.astro`

- [ ] **Step 1: Add lang prop and static text translations**

Accept `lang` prop from Layout.astro. Use it for the HTML template's hardcoded English text (panel header subtitle, placeholder attributes, button labels, aria-labels). Create `src/data/translations/chatbot.json` with these strings.

- [ ] **Step 2: Sync chatbot language with page language**

In the inline script, add at initialization:
```javascript
const pageLang = document.documentElement.lang;
if (SUPPORTED_LANGUAGES.includes(pageLang)) {
  langCode = pageLang;
  localStorage.setItem(LANG_STORAGE_KEY, langCode);
}
```

- [ ] **Step 3: Verify build**

Run: `rtk npm run build`
Expected: Chatbot static text matches page language, chatbot follows page language on load.

- [ ] **Step 4: Commit**

```
git add src/components/Chatbot.astro src/data/translations/chatbot.json
git commit -m "feat(i18n): make chatbot static text language-aware, sync with page language"
```

---

### Task 9: Update Netlify Config for Language Routes

**Files:**
- Modify: `netlify.toml`

- [ ] **Step 1: Add language route redirects**

```toml
[[redirects]]
  from = "/zh/*"
  to = "/zh/:splat"
  status = 200

[[redirects]]
  from = "/tl/*"
  to = "/tl/:splat"
  status = 200

[[redirects]]
  from = "/ja/*"
  to = "/ja/:splat"
  status = 200

[[redirects]]
  from = "/ko/*"
  to = "/ko/:splat"
  status = 200
```

- [ ] **Step 2: Verify netlify.toml parses**

The file is plain TOML — no validation step needed beyond reading.

- [ ] **Step 3: Commit**

```
git add netlify.toml
git commit -m "feat(i18n): add Netlify redirects for language-prefixed routes"
```

---

### Task 10: Build & Deploy Phase 1

- [ ] **Step 1: Full build**

Run: `rtk npm run build`
Expected: 110 pages built (22 pages × 5 languages). No errors.

- [ ] **Step 2: Verify output**

Check that:
- `/dist/index.html` has `<html lang="en">`, hreflang tags, language switcher
- `/dist/zh/index.html` has `<html lang="zh">`
- `/dist/tl/index.html` has `<html lang="tl">`
- All 5 language variants exist for several pages

- [ ] **Step 3: Deploy**

Run: `rtk npx netlify deploy --prod --build 2>&1 | Select-Object -Last 5`
Expected: Deploy successful.

- [ ] **Step 4: Verify live**

Visit https://sbdmc.netlify.app — language switcher should show, clicking ZH should go to /zh/ page.

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat(i18n): Phase 1 complete — multilingual infrastructure, routing, shared translations"
git push
```
