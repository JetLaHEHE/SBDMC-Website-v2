# Layout Overlay Fixes — Design Spec

## Overview
Fix 5 layout overlap issues where fixed-position elements conflict across screen sizes in the SBDMC Astro + Tailwind CSS v4 website.

## Issues & Fixes

### 1. BackToTop hidden behind chatbot panel (desktop)
- **File:** `src/components/BackToTop.astro` line 9
- **Change:** `max-md:bottom-8 max-md:left-8 md:bottom-8 md:right-36` → `max-md:bottom-8 max-md:left-8 md:bottom-8 md:left-8`
- **Why:** Chatbot panel (400px wide at right-20) occupies right side. BackToTop at right-36 sits inside it.

### 2. Map iframe absolute positioning broken
- **File:** `src/pages/[lang]/map.astro` line 30
- **Change:** Add `relative` to `<div class="aspect-[16/9] w-full overflow-hidden shadow-lg">`
- **Why:** `<iframe class="absolute inset-0">` needs a positioned parent container.

### 3. CookieConsent (z-60) overlays chatbot panel (z-50)
- **File:** `src/components/Chatbot.astro` line 16
- **Change:** Chatbot panel `z-50` → `z-[70]`
- **Why:** Keeps CookieConsent at z-60. When chatbot opens fullscreen on mobile, it overlays the cookie bar.

### 4. Mobile menu backdrop doesn't block fixed elements
- **File:** `src/components/Header.astro` line 111 (JS)
- **Change:** Backdrop `z-index:49` → `z-index:80`
- **Why:** Covers Header (z-50), Chatbot (z-70), CookieConsent (z-60) during mobile menu. Search modal (z-100) remains above.

### 5. Tight header-to-hero clearance on subpages
- **Files:** All 21 subpage hero sections in `src/pages/[lang]/`
- **Change:** `py-24` → `pt-28 pb-24`
- **Why:** Fixed header (~64px) reduces effective padding from 96px to ~32px. Increase gives ~48px visible clearance.

## Files to modify
| File | Change |
|------|--------|
| `src/components/BackToTop.astro` | Position class change |
| `src/components/Chatbot.astro` | z-index change on panel |
| `src/components/Header.astro` | JS backdrop z-index |
| `src/pages/[lang]/map.astro` | Add `relative` class |
| `src/pages/[lang]/*.astro` (21 files) | `py-24` → `pt-28 pb-24` on hero sections |
