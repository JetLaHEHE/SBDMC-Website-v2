# Multilingual Phase 3 — Page Translations + Navbar Fix

## Overview
Translate all page-specific content into 5 languages (EN/ZH/TL/JA/KO) and fix the navbar text wrapping issue. This completes the multilingual effort — after this, every page on the site renders fully translated content in all 5 languages.

## A. Navbar Text Wrapping Fix

### Problem
Desktop nav links in `Header.astro` wrap to multiple lines because:
- No `whitespace-nowrap` on nav link buttons (lines 19-24, 43, 56)
- Labels like "Government Links", "Products & Services", "Business Incentives", and CJK translations are long enough to wrap within their padded containers

### Fix
Add `whitespace-nowrap` to the `linkClass` function return values and the dropdown button. Also add `overflow-x-auto` to the desktop nav container to handle overflow gracefully instead of clipping.

**Files:**
- `src/components/Header.astro` — add `whitespace-nowrap` to link classes at lines 19-24, dropdown button at line 43; add `overflow-x-auto max-w-full` to nav container at line 38

## B. Non-English Translations (22 files)

### Problem
All page-specific translation files in `src/data/translations/` contain only an `en` key. The `t()` function falls back to English for missing languages, so non-English page variants show English content.

### Scope
Generate `zh`, `tl`, `ja`, `ko` keys for all 22 page-specific translation files:

1. `hero.json` — Hero section, stats, features, CTA (index page shared)
2. `index.json` — Service cards, feature cards (index page specific)
3. `about-sbdmc.json` — About SBDMC page
4. `about-sbma.json` — About SBMA page
5. `description.json` — About SBGP page
6. `business-incentives.json` — Business Incentives page
7. `business-services.json` — Business Services page
8. `contact.json` — Contact page
9. `faq.json` — FAQ page
10. `gallery.json` — Gallery page
11. `government-links.json` — Government Links page
12. `jobs.json` — Job Opportunities page
13. `locators.json` — Locators page
14. `not-found.json` — 404 page
15. `other-reasons.json` — More Advantages page
16. `for-lease.json` — For Lease page
17. `rental-information.json` — Rental Information page
18. `rfid.json` — RFID page
19. `forms.json` — Forms & Downloads page
20. `handy-guide.json` — Handy Guide page
21. `map.json` — Location Map page
22. `privacy.json` — Privacy Policy page
23. `terms.json` — Terms of Service page

### Translation Strategy
AI-generated translations using the existing navigation.json as reference for terminology consistency (e.g., "Subic Bay Gateway Park" → use same translation as in nav). The `t()` function's fallback ensures no breakage if any key is missed.

### Risk
Large files (~60-200 lines per file) means the translation calls will be token-intensive but mechanically straightforward — each file follows the same pattern of adding 4 new language objects.

## C. Hardcoded English String Fixes

### for-lease.astro:12
- **Issue:** `<Layout description="View available warehouse and office spaces...">` hardcoded English
- **Fix:** Change to `description={tx.description}`

### privacy.astro:12
- **Issue:** `<Layout description="Privacy Policy of Subic Bay Gateway Park...">` hardcoded English
- **Fix:** Change to `description={tx.subtitle}` (or add a `metaDescription` key to privacy.json)

### faq.astro:25-79
- **Issue:** `script is:inline type="application/ld+json"` block contains hardcoded English FAQPage schema
- **Fix:** Build the JSON-LD object in frontmatter by iterating `faqCategories` items, then render with `<script is:inline type="application/ld+json" set:html={JSON.stringify(faqSchema)}>`

### contact.astro:109
- **Issue:** iframe `title="SBDMC, Inc. Location Map"` hardcoded English
- **Fix:** Use `{ct.mapTitle}` — add `"mapTitle": "SBDMC, Inc. Location Map"` to contact.json's `en` and translated versions

### 404.astro:21-25
- **Issue:** Link labels "RFID Access", "Business Services", "FAQ", "Downloads", "Contact Us" hardcoded English
- **Fix:** Add `suggestedLinks` array (label+url pairs) to not-found.json translation data, then iterate in the template with translated labels

### index.astro:123-124
- **Issue:** `{news.title}` and `{news.subtitle}` reference static `news.json` (English only)
- **Fix:** Add `newsTitle` and `newsSubtitle` keys to index.json translation file

## Verification
- Build produces exactly 110 pages (22 × 5)
- Navbar links show on single line in all languages
- Each non-English page variant shows translated content (sample: /zh/for-lease, /tl/contact)
- No build errors from missing translation keys (t() fallback to English)
- JSON-LD on FAQ page dynamically generated from translation data
