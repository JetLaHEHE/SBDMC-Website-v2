# Multilingual Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete multilingual translation by generating non-English content for all page files, fixing navbar text wrapping, and fixing hardcoded English strings.

**Architecture:** All pages already have `getStaticPaths()`, `t()` translation function, and translation JSON files. The translation files only have `en` keys — we add `zh`, `tl`, `ja`, `ko` keys. Navbar fix is Tailwind class additions in Header.astro. Hardcoded strings use existing `t()` pattern or add new keys.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS v4, JSON translation files

---

### Task 1: Fix navbar text wrapping in Header.astro

**Files:**
- Modify: `src/components/Header.astro:15-25,38,43`

- [ ] **Step 1: Add `whitespace-nowrap` to linkClass function and dropdown button**

Edit `linkClass` return values in Header.astro to add `whitespace-nowrap`:

```astro
function linkClass(href: string, base = false): string {
  const active = isActive(href);
  if (base) {
    return active
      ? "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-primary-500 transition-all"
      : "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:text-primary-500";
  }
  return active
    ? "block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-primary-600 bg-accent-50 transition-all"
    : "block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-accent-50 hover:text-accent-600";
}
```

- [ ] **Step 2: Add `whitespace-nowrap` to dropdown trigger button**

Line 43 — the `<button>` inside dropdown groups:
```astro
<button class="flex whitespace-nowrap items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:text-primary-500">
```

- [ ] **Step 3: Add overflow handling to desktop nav container**

Line 38 — the desktop nav container div:
```astro
<div class="hidden items-center gap-1 overflow-x-auto max-w-full lg:flex">
```

- [ ] **Step 4: Build to verify**

Run: `npm run build`
Expected: Build succeeds, no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "fix(nav): add whitespace-nowrap to prevent nav link text wrapping"
```

---

### Task 2: Fix for-lease.astro hardcoded description

**Files:**
- Modify: `src/pages/for-lease.astro:12`

- [ ] **Step 1: Replace hardcoded description with translated one**

Change line 12 from:
```astro
<Layout title={tx.title} description="View available warehouse and office spaces for lease at Subic Bay Gateway Park in the Freeport Zone." lang={lang}>
```
to:
```astro
<Layout title={tx.title} description={tx.description} lang={lang}>
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/for-lease.astro
git commit -m "fix(i18n): use translated description meta on for-lease page"
```

---

### Task 3: Fix privacy.astro hardcoded description

**Files:**
- Modify: `src/pages/privacy.astro:12`

- [ ] **Step 1: Replace hardcoded description**

Change line 12 from:
```astro
<Layout title={tx.title} description="Privacy Policy of Subic Bay Gateway Park (SBDMC, Inc.)." lang={lang}>
```
to:
```astro
<Layout title={tx.title} description={tx.subtitle} lang={lang}>
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/privacy.astro
git commit -m "fix(i18n): use translated description meta on privacy page"
```

---

### Task 4: Fix faq.astro hardcoded English JSON-LD schema

**Files:**
- Modify: `src/pages/faq.astro`

- [ ] **Step 1: Build dynamic JSON-LD in frontmatter**

Replace the hardcoded `<script is:inline type="application/ld+json">` block (lines 25-80) with a dynamically-generated version. In the frontmatter (after line 11), add:

```astro
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  ),
};
```

Replace lines 25-80 with:
```astro
<script is:inline type="application/ld+json" set:html={JSON.stringify(faqSchema)}></script>
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/faq.astro
git commit -m "fix(i18n): generate FAQPage JSON-LD dynamically from translation data"
```

---

### Task 5: Fix contact.astro hardcoded iframe title

**Files:**
- Modify: `src/pages/contact.astro:109`
- Modify: `src/data/translations/contact.json`

- [ ] **Step 1: Add mapTitle key to contact.json**

Add `"mapTitle": "SBDMC, Inc. Location Map"` to the `en` object in contact.json, and add the same key to zh/tl/ja/ko objects (once translations are generated in Task 7).

- [ ] **Step 2: Use translated title in contact.astro**

Change line 109 from:
```astro
<iframe src="..." title="SBDMC, Inc. Location Map"></iframe>
```
to:
```astro
<iframe src="..." title={ct.mapTitle}></iframe>
```

- [ ] **Step 3: Commit**
```bash
git add src/pages/contact.astro src/data/translations/contact.json
git commit -m "fix(i18n): use translated iframe title on contact page"
```

---

### Task 6: Fix 404.astro hardcoded English link labels + index.astro news title

**Files:**
- Modify: `src/pages/404.astro`
- Modify: `src/data/translations/not-found.json`
- Modify: `src/pages/index.astro`
- Modify: `src/data/translations/index.json`

- [ ] **Step 1: Add suggestedLinks to not-found.json**

Add to the `en` object in not-found.json:
```json
"suggestedLinks": [
  { "label": "RFID Access", "href": "/rfid" },
  { "label": "Business Services", "href": "/business-services" },
  { "label": "FAQ", "href": "/faq" },
  { "label": "Downloads", "href": "/forms" },
  { "label": "Contact Us", "href": "/contact" }
]
```

And add the same array to zh/tl/ja/ko objects with translated labels (done in Task 7).

- [ ] **Step 2: Update 404.astro to use dynamic links**

Replace lines 20-26 in 404.astro:
```astro
<div class="flex flex-wrap justify-center gap-3">
  <a href={getLangPrefix(lang) + "/rfid"} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">RFID Access</a>
  <a href={getLangPrefix(lang) + "/business-services"} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">Business Services</a>
  <a href={getLangPrefix(lang) + "/faq"} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">FAQ</a>
  <a href={getLangPrefix(lang) + "/forms"} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">Downloads</a>
  <a href={getLangPrefix(lang) + "/contact"} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">Contact Us</a>
</div>
```
with:
```astro
<div class="flex flex-wrap justify-center gap-3">
  {nf.suggestedLinks.map((link) => (
    <a href={getLangPrefix(lang) + link.href} class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary-500 hover:text-primary-500">
      {link.label}
    </a>
  ))}
</div>
```

- [ ] **Step 3: Fix index.astro news section to use translated title**

Add `newsTitle` and `newsSubtitle` keys to the `en` object in index.json:
```json
"newsTitle": "Latest News",
"newsSubtitle": "Stay updated with the latest announcements from SBDMC, Inc."
```

In index.astro, change lines 123-124 from:
```astro
<h2 class="section-title text-center">{news.title}</h2>
<p class="section-subtitle text-center">{news.subtitle}</p>
```
to:
```astro
<h2 class="section-title text-center">{itx.newsTitle}</h2>
<p class="section-subtitle text-center">{itx.newsSubtitle}</p>
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/404.astro src/data/translations/not-found.json src/pages/index.astro src/data/translations/index.json
git commit -m "fix(i18n): translate 404 suggested links and index news section"
```

---

### Task 7: Generate non-English translations for all 22 page files

**Files:**
- Modify (all in `src/data/translations/`): hero.json, index.json, about-sbdmc.json, about-sbma.json, description.json, business-incentives.json, business-services.json, contact.json, faq.json, gallery.json, government-links.json, jobs.json, locators.json, not-found.json, other-reasons.json, for-lease.json, rental-information.json, rfid.json, forms.json, handy-guide.json, map.json, privacy.json, terms.json

- [ ] **Step 1: Generate translations for shared hero/index files (hero.json, index.json)**

For each file, the pattern is to copy the `en` structure into `zh`, `tl`, `ja`, `ko` objects with translated strings. Start with the two shared files used by the index page.

Example structure for hero.json (add after the closing `}` of `en`):
```json
"zh": {
  "badge": "關於蘇比克灣門戶工業園區",
  "headline": "您的合作夥伴",
  "headlineHighlight": "於蘇比克灣自由港區",
  ...
}
```

Use the existing navigation.json translations as reference for terminology consistency.

- [ ] **Step 2: Generate translations for Phase 2 page files (about-sbdmc, about-sbma, description, business-incentives, business-services, contact, faq, gallery, government-links, jobs, locators, not-found, other-reasons)**

Each file gets `zh`, `tl`, `ja`, `ko` objects mirroring the `en` structure. These are text-heavy files (about pages, services, FAQ, etc.).

- [ ] **Step 3: Generate translations for Phase 3 page files (for-lease, rental-information, rfid, forms, handy-guide, map, privacy, terms)**

These include legal/privacy/terms content which needs careful translation. Include Chinese (zh-TW), Tagalog, Japanese, and Korean versions.

- [ ] **Step 4: Build and verify 110 pages**

Run: `npm run build`
Expected: 110 pages built, no errors

Sample URL checks:
- Visit `/zh/for-lease` — should show Chinese text
- Visit `/tl/contact` — should show Tagalog text
- Visit `/ja/rfid` — should show Japanese text

- [ ] **Step 5: Commit**
```bash
git add src/data/translations/*.json
git commit -m "feat(i18n): add non-English translations for all 22 page files"
```
