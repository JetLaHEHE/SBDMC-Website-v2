# Layout Overlay Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 layout overlap issues where fixed-position elements conflict across screen sizes.

**Architecture:** Each fix is an independent CSS/class change in a single component or page file. No shared state changes. Can be implemented in any order.

**Tech Stack:** Astro, Tailwind CSS v4

**Files to modify:**
- `src/components/BackToTop.astro:9`
- `src/components/Chatbot.astro:16`
- `src/components/Header.astro:111`
- `src/pages/[lang]/map.astro:30`
- 21 subpage hero sections in `src/pages/[lang]/`

---

### Task 1: BackToTop reposition (left side)

**Files:**
- Modify: `src/components/BackToTop.astro:9`

- [ ] **Step 1: Change BackToTop positioning class**

Change line 9 from:
```
class="fixed max-md:bottom-8 max-md:left-8 md:bottom-8 md:right-36 z-50 ..."
```
to:
```
class="fixed max-md:bottom-8 max-md:left-8 md:bottom-8 md:left-8 z-50 ..."
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 2: Map iframe absolute positioning fix

**Files:**
- Modify: `src/pages/[lang]/map.astro:30`

- [ ] **Step 1: Add relative positioning to map container**

Change line 30 from:
```
<div class="aspect-[16/9] w-full overflow-hidden shadow-lg">
```
to:
```
<div class="relative aspect-[16/9] w-full overflow-hidden shadow-lg">
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 3: Chatbot panel z-index bump

**Files:**
- Modify: `src/components/Chatbot.astro:16`

- [ ] **Step 1: Change chatbot panel z-index**

In the chatbot panel `<div>`, change `z-50` to `z-[70]` on line 16.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 4: Mobile menu backdrop z-index increase

**Files:**
- Modify: `src/components/Header.astro:111`

- [ ] **Step 1: Change backdrop z-index in JS**

Change line 111 from `z-index:49` to `z-index:80` in the backdrop style string.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

---

### Task 5: Subpage header-to-hero clearance

**Files:**
- Modify: 21 subpage hero sections in `src/pages/[lang]/`

For each file, change `py-24` to `pt-28 pb-24` on the hero `<section>` element.

**Files to modify:**

`src/pages/[lang]/about-sbdmc.astro`, `about-sbma.astro`, `business-incentives.astro`, `business-services.astro`, `contact.astro`, `description.astro`, `faq.astro`, `for-lease.astro`, `forms.astro`, `gallery.astro`, `government-links.astro`, `handy-guide.astro`, `job-opportunities.astro`, `locators.astro`, `map.astro`, `other-reasons.astro`, `privacy.astro`, `rental-information.astro`, `rfid.astro`, `terms.astro`, `404.astro`

- [ ] **Step 1: Find all `py-24` on hero sections**

Run grep to identify all occurrences in page files. Verify each is on a hero `<section>` tag.

- [ ] **Step 2: Apply `py-24` to `pt-28 pb-24` change on all subpage hero sections**

For each file, replace `py-24` with `pt-28 pb-24` only on the hero section line.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.
