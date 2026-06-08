# Accessibility Overhaul — SBDMC v2

## Approach
Layer-based: Foundations → Components → Modals & Dialogs

### Layer 1 — Foundations (global.css + Layout.astro + all pages)

| File | Change | a11y Benefit |
|---|---|---|
| `src/styles/global.css` | Added `:focus-visible` global ring style | Keyboard users see focus indicator |
| `src/styles/global.css` | Added `@media (prefers-reduced-motion: reduce)` block — kills AOS + CSS animations | Vestibular disorder users can disable motion |
| `src/layouts/Layout.astro` | Skip link: `<a href="#main-content">` at top of `<body>`, `id="main-content"` on `<main>` | Keyboard/screen reader users skip nav |
| All 22 page files | `aria-label` on all 66 `<section>` elements | Screen reader users distinguish landmarks |
| All SVG-containing files | `aria-hidden="true"` on ~113 decorative SVGs | Screen readers skip decorative icons |

### Layer 2 — Component Interactions

| Component | Changes | a11y Benefit |
|---|---|---|
| `Header.astro` | `group-focus-within:` on desktop dropdown, `aria-expanded`/`aria-controls` on mobile toggle, Escape to close mobile menu | Keyboard users access dropdown submenus, screen readers know menu state |
| `faq.astro` | `aria-expanded` + `aria-controls` on toggle buttons, `role="region"` + `aria-labelledby` on answer panels | Screen readers know which FAQ is open |
| `gallery.astro` | `alt=""` on thumbnails (decorative in grid context) | Avoid repetitive alt text |
| `Chatbot.astro` | `aria-label` on contact name/email/message fields, `aria-live="polite"` on status div | Screen readers identify form fields, hear status updates |
| `CookieConsent.astro` | `role="dialog" aria-modal="true" aria-label="Cookie consent" aria-describedby`, focus first button on show, Escape to dismiss | Screen readers identify cookie banner as dialog |

### Layer 3 — Focus Traps (all modals/dialogs)

| Component | Focus Trap | Focus Return |
|---|---|---|
| `Search.astro` | Tab cycles close button + pagefind input | Returns to search toggle button |
| `gallery.astro` (lightbox) | Tab cycles close/prev/next buttons | Returns to triggering thumbnail |
| `Chatbot.astro` | Tab cycles all focusable panel elements | Returns to chatbot toggle button |
| `CookieConsent.astro` | Tab cycles accept/decline buttons | Banner closes, focus to body |

## Verification
- Build passes (22 pages, ~2s)
- 3 `role="dialog"` elements in index.html (search, chatbot, cookie consent)
- 22+ unique `aria-label` values across index page
- Skip link in layout
- `role="dialog"` on search modal and gallery lightbox
- `focus-within` on header dropdown
- `aria-expanded` on FAQ buttons
