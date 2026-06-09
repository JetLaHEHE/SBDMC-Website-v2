# Phase 2: Core Content Pages — Multilingual Routing & Data Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `getStaticPaths` to all 21 content pages so they generate 5-language variants (`/`, `/zh/`, `/tl/`, `/ja/`, `/ko/`). Homepage uses translated hero data. All pages pass `lang` to Layout and components.

**Architecture:** Each page derives `lang` from `Astro.params`, exports `getStaticPaths` from the i18n helper, and passes `lang` to Layout + Breadcrumb. The infrastructure from Phase 1 (html lang, hreflang, og:locale, schema.org, LangSwitcher) automatically serves all language variants once pages generate them.

**Tech Stack:** Astro v6, `src/i18n/index.ts`, translation JSON files in `src/data/translations/`

---

### Task 1: Update Homepage (index.astro) with getStaticPaths + Translated Hero

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add i18n imports and getStaticPaths**

Change frontmatter from:
```astro
---
import Layout from "../layouts/Layout.astro";
import hero from "../data/hero.json";
import news from "../data/news.json";
import sbdmcBg from "../assets/sbdmc.jpg";
import FacebookFeed from "../components/FacebookFeed.astro";
const stats = hero.stats;
const newsItems = news.items;
---
```
To:
```astro
---
import Layout from "../layouts/Layout.astro";
import { getStaticPaths, getLangFromParams, t, type LangCode } from "../i18n";
import heroTranslations from "../data/translations/hero.json";
import news from "../data/news.json";
import sbdmcBg from "../assets/sbdmc.jpg";
import FacebookFeed from "../components/FacebookFeed.astro";
export { getStaticPaths };

const lang = getLangFromParams(Astro.params) as LangCode;
const ht = t(heroTranslations, lang);
const stats = ht.stats;
const newsItems = news.items;
---
```

- [ ] **Step 2: Pass `lang` to Layout**

Change `<Layout title="Subic Bay Gateway Park - Premier Industrial Park" description="...">` to `<Layout title={`${ht.headline} ${ht.headlineHighlight}`} description={ht.subtitle} lang={lang}>`.

- [ ] **Step 3: Replace hero.* with ht.* in template**

Replace `hero.badge` → `ht.badge`, `hero.headline` → `ht.headline`, `hero.headlineHighlight` → `ht.headlineHighlight`, `hero.subtitle` → `ht.subtitle`, `hero.ctaPrimary.text` → `ht.ctaPrimary.text`, `hero.ctaPrimary.link` → `ht.ctaPrimary.link`, `hero.ctaSecondary.*` → `ht.ctaSecondary.*`, `hero.servicesTitle` → `ht.servicesTitle`, `hero.servicesSubtitle` → `ht.servicesSubtitle`, `hero.featuresTitle` → `ht.featuresTitle`, `hero.featuresSubtitle` → `ht.featuresSubtitle`, `hero.ctaTitle` → `ht.ctaTitle`, `hero.ctaSubtitle` → `ht.ctaSubtitle`, `hero.ctaButton` → `ht.ctaButton`.

- [ ] **Step 4: Build and verify**

Run: `rtk npm run build 2>&1 | Select-String "page\(s\) built"`
Expected: `22 page(s) built in` (still 22 since index.astro doesn't have getStaticPaths until now — should increase)

- [ ] **Step 5: Commit**

```
git add src/pages/index.astro
git commit -m "feat(i18n): add getStaticPaths to homepage, use translated hero data"
```

---

### Task 2: Update Data-Driven Hero Pages (6 pages)

**Files:**
- Modify: `src/pages/about-sbdmc.astro`
- Modify: `src/pages/business-incentives.astro`
- Modify: `src/pages/business-services.astro`
- Modify: `src/pages/locators.astro`
- Modify: `src/pages/government-links.astro`
- Modify: `src/pages/other-reasons.astro`

- [ ] **Step 1: Apply the pattern to about-sbdmc.astro**

Change frontmatter from:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import data from "../data/about-sbdmc.json";
---
```
To:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import { getStaticPaths, getLangFromParams, type LangCode } from "../i18n";
export { getStaticPaths };
import data from "../data/about-sbdmc.json";

const lang = getLangFromParams(Astro.params) as LangCode;
---
```

Add `lang={lang}` to Layout call: `<Layout title="About SBDMC, Inc." description="..." lang={lang}>`.

Add `lang={lang}` to Breadcrumb call: `<Breadcrumb pages={[{ label: "About SBDMC, Inc." }]} lang={lang} />`.

- [ ] **Step 2: Apply same pattern to business-incentives.astro, business-services.astro, locators.astro, government-links.astro, other-reasons.astro**

Each follows the same template — add 4 lines to frontmatter, pass `lang` to Layout and Breadcrumb. The data files stay the same (English content; Phase 3 adds translated data files).

- [ ] **Step 3: Build and verify**

Run: `rtk npm run build 2>&1 | Select-String "page\(s\) built"`
Expected: More pages than before — 5 language variants × 6 pages = 30 additional pages (total ~52 pages)

- [ ] **Step 4: Commit**

```
git add src/pages/about-sbdmc.astro src/pages/business-incentives.astro src/pages/business-services.astro src/pages/locators.astro src/pages/government-links.astro src/pages/other-reasons.astro
git commit -m "feat(i18n): add getStaticPaths and lang support to data-driven hero pages"
```

---

### Task 3: Update Hardcoded Hero Pages — Part 1 (7 pages)

**Files:**
- Modify: `src/pages/about-sbma.astro`
- Modify: `src/pages/description.astro`
- Modify: `src/pages/for-lease.astro`
- Modify: `src/pages/forms.astro`
- Modify: `src/pages/gallery.astro`
- Modify: `src/pages/handy-guide.astro`
- Modify: `src/pages/map.astro`

- [ ] **Step 1: Apply the pattern to each page**

Each page currently has frontmatter like:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
---
```

Change to:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import { getStaticPaths, getLangFromParams, type LangCode } from "../i18n";
export { getStaticPaths };

const lang = getLangFromParams(Astro.params) as LangCode;
---
```

Add `lang={lang}` to Layout call. Add `lang={lang}` to Breadcrumb call.

- [ ] **Step 2: Apply to all 7 pages**

Each file gets the same 4-line addition + `lang={lang}` on Layout and Breadcrumb. Content stays hardcoded in English (Phase 3 adds translated data).

- [ ] **Step 3: Commit**

```
git add src/pages/about-sbma.astro src/pages/description.astro src/pages/for-lease.astro src/pages/forms.astro src/pages/gallery.astro src/pages/handy-guide.astro src/pages/map.astro
git commit -m "feat(i18n): add getStaticPaths and lang support to hardcoded hero pages (part 1)"
```

---

### Task 4: Update Hardcoded Hero Pages — Part 2 (7 pages)

**Files:**
- Modify: `src/pages/privacy.astro`
- Modify: `src/pages/rental-information.astro`
- Modify: `src/pages/rfid.astro`
- Modify: `src/pages/terms.astro`
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/faq.astro`
- Modify: `src/pages/job-opportunities.astro`

- [ ] **Step 1: Apply the base pattern to privacy.astro, rental-information.astro, rfid.astro, terms.astro**

Same as Task 3 — add 4 lines to frontmatter + `lang={lang}` on Layout and Breadcrumb.

- [ ] **Step 2: Update contact.astro**

Frontmatter change:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import { getStaticPaths, getLangFromParams, t, type LangCode } from "../i18n";
import contactTranslations from "../data/translations/contact.json";
export { getStaticPaths };
import contact from "../data/contact.json";

const lang = getLangFromParams(Astro.params) as LangCode;
const ct = t(contactTranslations, lang);
---
```

Add `lang={lang}` to Layout.
Add `lang={lang}` to Breadcrumb.
Replace hardcoded hero text:
- `"Get in Touch"` → `{ct.title || "Get in Touch"}`
- `"Contact Us"` → `{ct.title || "Contact Us"}`
- `"We'd love to hear from you"` → `{ct.subtitle || "We'd love to hear from you"}`

- [ ] **Step 3: Update faq.astro**

Frontmatter change:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import { getStaticPaths, getLangFromParams, type LangCode } from "../i18n";
export { getStaticPaths };
import faqData from "../data/faq.json";

const lang = getLangFromParams(Astro.params) as LangCode;
const faqCategories = faqData.categories;
---
```

Add `lang={lang}` to Layout. Add `lang={lang}` to Breadcrumb.
Keep hardcoded hero text and FAQPage schema (English; Phase 3).

- [ ] **Step 4: Update job-opportunities.astro**

Frontmatter change:
```astro
---
import Layout from "../layouts/Layout.astro";
import Breadcrumb from "../components/Breadcrumb.astro";
import { getStaticPaths, getLangFromParams, type LangCode } from "../i18n";
export { getStaticPaths };
import jobs from "../data/jobs.json";

const lang = getLangFromParams(Astro.params) as LangCode;
---
```

Add `lang={lang}` to Layout. Add `lang={lang}` to Breadcrumb.

- [ ] **Step 5: Build and verify**

Run: `rtk npm run build 2>&1`
Expected: Build succeeds. Count pages — should be approximately 105 (21 pages × 5 languages).

- [ ] **Step 6: Commit**

```
git add src/pages/privacy.astro src/pages/rental-information.astro src/pages/rfid.astro src/pages/terms.astro src/pages/contact.astro src/pages/faq.astro src/pages/job-opportunities.astro
git commit -m "feat(i18n): add getStaticPaths and lang support to remaining content pages"
```

---

### Task 5: Final Build & Verify

- [ ] **Step 1: Clean build**

Run: `rtk Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue; if ($?) { npm run build }`
Expected: ~105 pages generated. Check for `/zh/index.html`, `/tl/index.html`, etc. in dist.

- [ ] **Step 2: Spot-check language variants**

Run: `Get-ChildItem dist/zh -Depth 0; Get-ChildItem dist/tl -Depth 0; Get-ChildItem dist/ja -Depth 0; Get-ChildItem dist/ko -Depth 0`
Expected: Each directory has subdirectories for pages.

- [ ] **Step 3: Verify hreflang on language-specific pages**

Run: `Select-String "hreflang" dist/zh/index.html | Select-Object -First 1`
Expected: Shows hreflang links with correct language codes.

- [ ] **Step 4: Verify html lang attribute**

Run: `Select-String "html lang=" dist/zh/index.html`
Expected: `<html lang="zh">`

- [ ] **Step 5: Deploy**

Run: `rtk npx netlify deploy --prod --build 2>&1 | Select-Object -Last 5`
Expected: Deploy success.

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "feat(i18n): Phase 2 complete — all pages generate 5-language variants"
```
