# Facebook Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add automatic Facebook Page Plugin feed to homepage showing recent posts from facebook.com/sbdmc/

**Architecture:** Single Astro component (FacebookFeed.astro) that lazy-loads Facebook SDK, renders Page Plugin embed, respects cookie consent.

**Tech Stack:** Astro 6, Tailwind CSS 4, Facebook SDK (client-side)

---

### Task 1: Create FacebookFeed.astro component

**Files:**
- Create: `src/components/FacebookFeed.astro`

- [ ] **Step 1: Write the component**

Create `src/components/FacebookFeed.astro`:
- `bg-surface py-24` section with centered layout
- "Updates" badge with accent styling
- "Latest from SBDMC" section title
- Placeholder div shown before cookie consent
- `.fb-page` Facebook Page Plugin embed div
- Facebook page link with arrow
- Client script: checks localStorage, loads SDK on consent
- Listens for window cookie-consent-accepted event

- [ ] **Step 2: Verify file exists**
  Run: `Test-Path src/components/FacebookFeed.astro`

---

### Task 2: Add responsive CSS overrides

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add Facebook embed responsive rules**

Append to end of `src/styles/global.css`:

```
.fb-page,
.fb-page > span,
.fb-page > span > iframe {
  max-width: 100% !important;
  width: 100% !important;
}
```

- [ ] **Step 2: Verify**
  Run: `Get-Content src/styles/global.css -Tail 5`

---

### Task 3: Insert component in homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Import FacebookFeed**

Add after `import sbdmcBg from "../assets/sbdmc.jpg";`:

```astro
import FacebookFeed from "../components/FacebookFeed.astro";
```

- [ ] **Step 2: Add component between news and features sections**

After `</section>` (line 128 ending news section), before features section:

```astro
  </section>

  <FacebookFeed />

  <section class="bg-surface py-24">
```

---

### Task 4: Build and verify

- [ ] **Step 1: Build the site**
  Run: `npm run build` (expected: success)

- [ ] **Step 2: Visual verification**
  Start `npm run dev`. Check:
  - Section appears between news and features on homepage
  - Placeholder shows before cookie consent
  - Facebook SDK loads on accept
  - Card styling matches site design
  - Responsive at mobile width

- [ ] **Step 3: Cookie consent flow**
  1. Clear localStorage, reload -- placeholder shows
  2. Click "Accept All" -- SDK loads, feed appears
  3. Reload -- feed loads automatically
  4. Click "Decline" -- placeholder updates with message

- [ ] **Step 4: Commit**
  ```
  git add src/components/FacebookFeed.astro src/styles/global.css src/pages/index.astro
  git commit -m "feat: add Facebook feed section to homepage"
  ```
