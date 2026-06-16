# News/Blog Section Design

## Overview
Add a news/blog section to sbdmc.com for publishing original content (company announcements, guides, case studies) using Astro content collections with Markdown files.

## Content Model
Each post has:
- `title` (string, required)
- `date` (date, required)
- `excerpt` (string, required — shown in card previews)
- `image` (string, optional — path to featured image in `/public/images/news/`)
- `tags` (string[], optional — e.g., ["announcement", "guide"])
- `body` — Markdown content

## Pages
| Route | Content | Notes |
|---|---|---|
| `/[lang]/news/` | Post list (cards, newest first) | Paginate at 10 posts. Show title, date, excerpt, optional image |
| `/[lang]/news/[slug]/` | Single post | Full article with Markdown rendering |
| `/news.rss` | RSS feed | English-only, using `@astrojs/rss` |

## Homepage Integration
Replace the current external-link news section with recent post cards (show latest 4). Move the external links (Inquirer, UDN, CNN, WordPress) to a secondary "External News" row below, or remove them entirely.

## Navigation
Add "News" as a top-level nav item between Gallery and Downloads in `navigation.json`. The label is short across all languages (News / 新聞 / Balita / ニュース / 뉴스), so overflow risk is minimal — verify at all breakpoints.

## Implementation Steps
1. Create `src/content/config.ts` with the collection schema
2. Create `src/content/news/` with 5-8 initial posts
3. Create `src/pages/[lang]/news/index.astro` (list page)
4. Create `src/pages/[lang]/news/[...slug].astro` (post page)
5. Install `@astrojs/rss` and create `src/pages/news.rss.js`
6. Add "News" to `navigation.json` (all 5 languages)
7. Update `src/pages/[lang]/index.astro` to show latest posts instead of external links
8. Add news translations to `index.json` if needed
9. Verify build (no overflow, correct URLs)
10. Generate initial content (5-8 posts, English only)

## Content Strategy (Initial Posts)
- "Welcome to the New SBDMC Website" (announcement)
- "Setting Up a Business in Subic Bay — A Step-by-Step Guide" (guide)
- "Why Locate Your Manufacturing Operations in Subic Bay Freeport" (guide/case study)
- "Recent Updates on Leasing Opportunities at SBGP" (announcement)
- "Understanding the Business Incentives at Subic Bay Freeport Zone" (guide)
