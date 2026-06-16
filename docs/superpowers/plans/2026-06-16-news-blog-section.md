# News/Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a news/blog section with Markdown content collection, list page, post page, RSS feed, nav link, and homepage integration.

**Architecture:** Astro content collection (`src/content/news/`) for posts. Two new route templates under `/[lang]/news/`. RSS feed at `/news.rss`. Homepage reads latest 4 posts inline. All content is English-only.

**Tech Stack:** Astro content collections, `@astrojs/rss`, Markdown

---

### Task 1: Content Collection + Initial Posts

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/news/welcome-to-new-website.md`
- Create: `src/content/news/setting-up-business-subic-bay.md`
- Create: `src/content/news/why-locate-in-subic-bay.md`
- Create: `src/content/news/leasing-opportunities-sbgp.md`
- Create: `src/content/news/understanding-business-incentives.md`

- [ ] **Step 1: Create content collection config**

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const newsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  news: newsCollection,
};
```

- [ ] **Step 2: Create initial post — welcome**

```md
---
title: "Welcome to the New SBDMC Website"
date: 2026-06-16
excerpt: "We are excited to launch our newly redesigned website, featuring improved navigation, multilingual support, and easier access to leasing and business information."
tags: ["announcement"]
---

We are proud to announce the launch of our redesigned website at SBDMC, Inc. This new platform is built with you in mind — offering faster access to information about leasing opportunities, business services, and the Subic Bay Gateway Park.

### What's New

- **Multilingual Support:** The site is now available in English, Chinese, Tagalog, Japanese, and Korean.
- **Interactive Chatbot:** Our AI assistant can answer your questions in real time.
- **Improved Forms:** Submit leasing inquiries, job applications, and newsletter signups directly from any page.
- **Better Navigation:** Find what you need faster with our redesigned menu and search functionality.

### Looking Ahead

We will continue to add more content, including guides on setting up your business in Subic Bay, tenant success stories, and company announcements. Stay tuned for updates.

For inquiries, please [contact us](/en/contact) or use the chatbot.
```

- [ ] **Step 3: Create post — setting up business guide**

```md
---
title: "Setting Up a Business in Subic Bay — A Step-by-Step Guide"
date: 2026-06-15
excerpt: "A practical guide for foreign investors looking to establish operations in the Subic Bay Freeport Zone, covering registration, incentives, and infrastructure."
tags: ["guide"]
---

The Subic Bay Freeport Zone offers one of the most business-friendly environments in the Philippines. This guide walks you through the key steps to establish your operations.

### Step 1: Initial Consultation

Contact SBDMC, Inc. to discuss your requirements. We will help you understand the available spaces, lease terms, and business incentives that apply to your industry.

### Step 2: Business Registration

Register your company with the Philippine Securities and Exchange Commission (SEC) and secure your registration with the Subic Bay Metropolitan Authority (SBMA).

### Step 3: Lease Agreement

Sign a lease agreement with SBDMC for warehouse or office space at Subic Bay Gateway Park. Lease terms are flexible and designed to accommodate various business sizes.

### Step 4: Permits and Licenses

Obtain the necessary permits including your business permit, environmental compliance certificate, and locator clearance from SBMA.

### Step 5: Operations Setup

Set up your facilities with support from SBDMC's business services team. We can assist with utilities, RFID access, and other operational needs.

### Step 6: Start Operations

Once all permits are secured and facilities are ready, you may begin operations. SBDMC provides ongoing support to all locators.

For personalized assistance, [contact our team](/en/contact).
```

- [ ] **Step 4: Create post — why locate in Subic Bay**

```md
---
title: "Why Locate Your Manufacturing Operations in Subic Bay Freeport"
date: 2026-06-14
excerpt: "Discover the strategic advantages of setting up manufacturing operations in the Subic Bay Freeport Zone, from tax incentives to world-class infrastructure."
tags: ["guide"]
---

The Subic Bay Freeport Zone has emerged as a premier destination for manufacturing and logistics operations in Southeast Asia. Here is why global companies choose Subic Bay.

### Strategic Location

Situated on the west coast of Luzon Island, Subic Bay offers direct access to major international shipping routes. It is approximately 80 kilometers from Manila, with well-developed road networks connecting to the capital and surrounding provinces.

### Tax and Fiscal Incentives

Locators in the Subic Bay Freeport Zone enjoy significant incentives including:

- Income tax holiday for qualified enterprises
- Duty-free importation of equipment and raw materials
- Tax and duty exemption on imported spare parts
- VAT exemption on local purchases

### World-Class Infrastructure

Subic Bay Gateway Park, developed and managed by SBDMC, features:

- Modern warehouse and office facilities
- Reliable power and water supply
- High-speed telecommunications
- 24/7 security and RFID access control

### Skilled Workforce

The Philippines offers a large, English-proficient workforce with competitive labor costs. Subic Bay's proximity to several universities ensures access to skilled talent.

[Learn more about leasing opportunities](/en/for-lease).
```

- [ ] **Step 5: Create post — leasing updates**

```md
---
title: "Recent Updates on Leasing Opportunities at SBGP"
date: 2026-06-13
excerpt: "New warehouse and office spaces are now available for lease at Subic Bay Gateway Park. Learn about current availability and competitive rates."
tags: ["announcement"]
---

We are pleased to announce the availability of new warehouse and office spaces at Subic Bay Gateway Park (SBGP). As demand for premium industrial space in the Subic Bay Freeport Zone continues to grow, SBDMC is committed to providing quality facilities for our locators.

### Current Availability

- **Warehouse Spaces:** Units ranging from 500 to 5,000 square meters
- **Office Spaces:** Fully finished offices from 50 to 500 square meters
- **Build-to-Suit:** Custom facilities designed to your specifications

### Competitive Rates

Our lease rates remain competitive within the Subic Bay Freeport Zone, with flexible terms to accommodate both short-term and long-term requirements.

### Why Lease with SBDMC?

- Prime location within the Subic Bay Freeport Zone
- Reliable infrastructure and utilities
- Professional property management
- Access to a community of international locators

[View available properties](/en/for-lease) or [contact us](/en/contact) for a personalized tour.
```

- [ ] **Step 6: Create post — business incentives guide**

```md
---
title: "Understanding the Business Incentives at Subic Bay Freeport Zone"
date: 2026-06-12
excerpt: "A comprehensive overview of the tax incentives, duty exemptions, and other benefits available to businesses locating in the Subic Bay Freeport Zone."
tags: ["guide"]
---

The Subic Bay Metropolitan Authority (SBMA) offers a range of incentives to qualified enterprises operating within the Subic Bay Freeport Zone. Understanding these incentives is key to maximizing your investment.

### Income Tax Holiday (ITH)

New qualified enterprises may enjoy a 6-year income tax holiday, extendable depending on the project's nature and investment size.

### Duty-Free Importation

Equipment, machinery, and raw materials imported into the Freeport Zone are exempt from customs duties and tariffs.

### Tax and Duty Exemption

Spare parts and materials used in the production process may be imported tax-free.

### VAT Exemption

Qualified enterprises are exempt from value-added tax on local purchases of goods and services related to their registered activities.

### Additional Incentives

- Exemption from local government taxes and fees
- Simplified import-export procedures
- Foreign investment allowances
- Employment of foreign nationals in certain positions

For a detailed assessment of incentives applicable to your business, [contact our team](/en/contact).
```

---

### Task 2: News List Page (`/[lang]/news/`)

**Files:**
- Create: `src/pages/[lang]/news/index.astro`

- [ ] **Step 1: Create the list page**

```astro
---
import Layout from "../../../layouts/Layout.astro";
import { getCollection } from "astro:content";
import { getLangPrefix, t, type LangCode } from "../../../i18n";

export interface Props {
  lang?: LangCode;
  currentPath?: string;
}

const { lang = "en" } = Astro.props as Props;
const langPrefix = getLangPrefix(lang);

import headerTranslations from "../../../data/translations/header.json";
const ht = t(headerTranslations, lang);

const posts = await getCollection("news");
posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const pageTitle = lang === "en" ? "News & Updates" : lang === "zh" ? "新聞與更新" : lang === "tl" ? "Balita at Update" : lang === "ja" ? "ニュースとお知らせ" : "뉴스 및 공지사항";
---

<Layout title={pageTitle} description="Latest news and announcements from SBDMC, Inc." lang={lang} currentPath={langPrefix + "/news"}>
  <main class="min-h-screen pt-24">
    <div class="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
      <h1 class="section-title mb-4 text-center">{pageTitle}</h1>
      <div class="space-y-8">
        {posts.map((post) => (
          <a href={langPrefix + "/news/" + post.slug} class="card block transition-all hover:shadow-md">
            <article class="p-6">
              <div class="mb-2 flex items-center gap-3 text-sm text-gray-400">
                <time datetime={post.data.date.toISOString()}>
                  {post.data.date.toLocaleDateString(lang === "en" ? "en-US" : lang === "zh" ? "zh-TW" : lang === "tl" ? "tl-PH" : lang === "ja" ? "ja-JP" : "ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                </time>
                {post.data.tags && post.data.tags.length > 0 && (
                  <span class="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700">
                    {post.data.tags[0]}
                  </span>
                )}
              </div>
              <h2 class="text-xl font-bold text-primary-500">{post.data.title}</h2>
              <p class="mt-2 text-gray-500">{post.data.excerpt}</p>
            </article>
          </a>
        ))}
      </div>
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Verify the page route**

Astro will automatically generate `/[lang]/news/` for all 5 languages because of the `[lang]` directory pattern. No additional config needed.

---

### Task 3: News Post Page (`/[lang]/news/[...slug]`)

**Files:**
- Create: `src/pages/[lang]/news/[...slug].astro`

- [ ] **Step 1: Create the post page**

```astro
---
import Layout from "../../../layouts/Layout.astro";
import { getCollection, getEntry } from "astro:content";
import { getLangPrefix, t, type LangCode } from "../../../i18n";

export interface Props {
  lang?: LangCode;
  currentPath?: string;
}

export async function getStaticPaths() {
  const posts = await getCollection("news");
  const langs = ["en", "zh", "tl", "ja", "ko"];
  return posts.flatMap((post) =>
    langs.map((lang) => ({
      params: { lang, slug: post.slug },
      props: { lang: lang as LangCode },
    }))
  );
}

const { lang = "en" } = Astro.props as Props;
const { slug } = Astro.params;
const langPrefix = getLangPrefix(lang);

const post = await getEntry("news", slug!);

if (!post) {
  return Astro.redirect("/" + (lang === "en" ? "" : lang) + "/404");
}

const { Content } = await post.render();
---

<Layout title={post.data.title + " — SBDMC, Inc."} description={post.data.excerpt} lang={lang} currentPath={langPrefix + "/news/" + post.slug}>
  <main class="min-h-screen pt-24">
    <article class="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <nav class="mb-8 text-sm text-gray-400">
        <a href={langPrefix + "/news"} class="text-primary-500 hover:text-primary-600">&larr; {lang === "en" ? "Back to News" : lang === "zh" ? "返回新聞" : lang === "tl" ? "Bumalik sa Balita" : lang === "ja" ? "ニュースに戻る" : "뉴스로 돌아가기"}</a>
      </nav>
      <header class="mb-8">
        <div class="mb-3 flex items-center gap-3 text-sm text-gray-400">
          <time datetime={post.data.date.toISOString()}>
            {post.data.date.toLocaleDateString(lang === "en" ? "en-US" : lang === "zh" ? "zh-TW" : lang === "tl" ? "tl-PH" : lang === "ja" ? "ja-JP" : "ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          {post.data.tags && post.data.tags.length > 0 && (
            <span class="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700">
              {post.data.tags[0]}
            </span>
          )}
        </div>
        <h1 class="text-3xl font-bold text-primary-500">{post.data.title}</h1>
      </header>
      <div class="prose prose-gray max-w-none">
        <Content />
      </div>
    </article>
  </main>
</Layout>
```

- [ ] **Step 2: Verify static paths**

Run: `dir src/pages\[lang]\news\...slug.astro`
Expected: File exists

---

### Task 4: RSS Feed

**Files:**
- Create: `src/pages/news.rss.js`

- [ ] **Step 1: Install @astrojs/rss**

Run: `npm install @astrojs/rss`

- [ ] **Step 2: Create RSS feed endpoint**

```js
// src/pages/news.rss.js
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("news");
  posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: "SBDMC, Inc. — News & Updates",
    description: "Latest news and announcements from SBDMC, Inc.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: "/en/news/" + post.slug + "/",
    })),
    customData: "<language>en</language>",
  });
}
```

---

### Task 5: Navigation Addition

**Files:**
- Modify: `src/data/translations/navigation.json`

- [ ] **Step 1: Add "News" to English nav (between Gallery and Downloads)**

Edit the `"en"` array in `navigation.json`. After the Gallery item (index 6, line 41 `{ "label": "Gallery", "href": "/gallery" }`), insert before Downloads (index 7):

```json
    { "label": "News", "href": "/news" },
```

- [ ] **Step 2: Add to Chinese nav**

After `相簿` /gallery, before `文件下載` /forms:

```json
    { "label": "新聞", "href": "/news" },
```

- [ ] **Step 3: Add to Tagalog nav**

After `Galeriya` /gallery, before `Mga Download` /forms:

```json
    { "label": "Balita", "href": "/news" },
```

- [ ] **Step 4: Add to Japanese nav**

After `ギャラリー` /gallery, before `ダウンロード` /forms:

```json
    { "label": "ニュース", "href": "/news" },
```

- [ ] **Step 5: Add to Korean nav**

After `갤러리` /gallery, before `자료실` /forms:

```json
    { "label": "뉴스", "href": "/news" },
```

---

### Task 6: Homepage Integration

**Files:**
- Modify: `src/pages/[lang]/index.astro`

- [ ] **Step 1: Update the news section on the homepage**

Replace the current external-link cards with the latest 4 posts from the content collection. Keep the external links as a secondary text row below.

In the frontmatter of `src/pages/[lang]/index.astro`, add the content collection import and query:

```astro
import type { LangCode } from "../../i18n";
import { getCollection } from "astro:content";
```

And after the existing imports, add:

```astro
const allPosts = await getCollection("news");
allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const recentPosts = allPosts.slice(0, 4);
```

Then replace the news section body (lines 127-135) with:

```astro
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {recentPosts.map((post, i) => (
          <a href={langPrefix + "/news/" + post.slug} class="card pt-6" data-aos="fade-up" data-aos-delay={i * 100}>
            {post.data.tags && post.data.tags.length > 0 && (
              <div class="mb-3 inline-block bg-accent-500 px-3 py-1 text-xs font-semibold text-white">{post.data.tags[0]}</div>
            )}
            <h3 class="font-bold text-primary-500">{post.data.title}</h3>
            <p class="mt-1 text-sm text-gray-500">{post.data.excerpt}</p>
          </a>
        ))}
      </div>
      <div class="mt-10 text-center">
        <a href={langPrefix + "/news"} class="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 transition-all hover:text-primary-600 hover:gap-2">
          {lang === "en" ? "View All News" : lang === "zh" ? "查看全部新聞" : lang === "tl" ? "Tingnan Lahat ng Balita" : lang === "ja" ? "すべてのニュースを見る" : "모든 뉴스 보기"} <span>&rarr;</span>
        </a>
      </div>
```

Also add a small external links row below the "View All News" link:

```astro
      <div class="mt-6 text-center text-xs text-gray-400">
        {lang === "en" ? "Also follow:" : lang === "zh" ? "也可關注：" : lang === "tl" ? "Sundan din:" : lang === "ja" ? "関連リンク：" : "다음도 확인하세요："}
        {newsItems.map((item, i) => (
          <a href={item.url} target="_blank" rel="noopener noreferrer" class="mx-1.5 text-gray-500 hover:text-primary-500">{item.category}</a>
        ))}
      </div>
```

---

### Task 7: Build Verification

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: Build succeeds, no errors. New pages appear: `/[lang]/news/` and `/[lang]/news/[slug]/` for each post.

- [ ] **Step 2: Verify nav overflow**

Check the built HTML for the nav on multiple screen sizes. No items should overflow or wrap unexpectedly.

- [ ] **Step 3: Verify RSS feed**

Check: `http://localhost:4321/news.rss` (or after deploy, `https://sbdmc.com/news.rss`)
Expected: Valid RSS XML with all 5 posts listed.

- [ ] **Step 4: Verify homepage**

The homepage news section should show 4 post cards linking to the new pages, with a "View All News" link, and the external links as a small text row below.

---

### Task 8: Commit

- [ ] **Step 1: Stage all files**

```bash
git add src/content/config.ts src/content/news/ src/pages/\[lang\]/news/ src/pages/news.rss.js src/data/translations/navigation.json src/pages/\[lang\]/index.astro package.json
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add news/blog section with content collection, RSS feed, and homepage integration"
```
