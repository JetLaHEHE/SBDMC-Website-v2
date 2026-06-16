# Conversion Improvements Design

## Overview

Improve the SBDMC website's primary conversion paths — leasing inquiries, job applications, contact form submissions, and newsletter signups — by reducing friction and adding inline interaction.

## Problem

1. **Contact page** uses native Netlify Forms with redirect behavior (no inline success/error feedback, jarring UX)
2. **For Lease page** redirects to `/contact` for every inquiry — potential locators must leave the page
3. **Job Opportunities** uses a `mailto:` link — fails silently if no email client is configured
4. **Newsletter** — no signup mechanism anywhere on the site
5. **Conversion tracking** — no mechanism to measure which CTAs drive submissions

## Design

### 1. Contact page — AJAX submission with inline feedback

Replace native Netlify Forms submission with an AJAX POST to `/api/contact`. On submit:
- Button shows "Sending..."
- On success: green inline message "Your message has been sent. We'll get back to you soon." Form clears after 3s.
- On error: red inline message "Something went wrong. Please try again or email us at inquiry@sbdmc.com."
- Form validation: Name (required), Email (valid format), Company (optional), Message (required)

Translation keys added for success/error messages in all 5 languages.

### 2. For Lease — inline inquiry form on each listing

Each lease card currently has a text "Inquire Now →" link to `/contact`. Replace with a "Quick Inquiry" button that, on click, reveals an inline form below the card. Form fields:
- Name (required)
- Email (required)
- Phone (optional)
- Company (optional)
- Unit (hidden, pre-filled from the listing name)
- Message (optional, pre-filled with "I'm interested in leasing [Unit Name].")

Submit to `/api/contact` with `type: "leasing_inquiry"`. Shows inline success/error feedback. Collapses the form on success.

### 3. Job Opportunities — inline application form

Replace the `mailto:` link with a button that reveals an inline form. Form fields:
- Name (required)
- Email (required)
- Phone (optional)
- Position (hidden, pre-filled from the job title)
- Cover Letter (textarea, required)

Submit to `/api/contact` with `type: "job_application"`. Inline success/error.

### 4. Newsletter signup — footer

Add an email input + "Subscribe" button to the footer. Submit to `/api/contact` with `type: "newsletter"`. Inline success/error. Translation keys for 5 languages.

### 5. Backend — enhanced contact function

Modify `netlify/functions/contact.mjs`:
- Accept `type` field: `general`, `leasing_inquiry`, `job_application`, `newsletter`
- Accept additional fields based on type (phone, unit, position, coverLetter)
- For `newsletter` type: only email is required
- Forward all fields + type to the webhook
- Existing validation + error handling preserved
- Email is now optional for newsletter type (it's the only field)

### 6. Conversion tracking

Add `data-cta` attribute to all form submit buttons mapping to a descriptive event name (e.g., `contact_form_submit`, `leasing_inquiry_submit`, `job_application_submit`, `newsletter_subscribe`).

## Files Modified

| File | Change |
|------|--------|
| `src/pages/[lang]/contact.astro` | Replace Netlify Forms with AJAX submission, add inline success/error |
| `src/pages/[lang]/for-lease.astro` | Add inline inquiry form per listing |
| `src/pages/[lang]/job-opportunities.astro` | Add inline application form |
| `src/components/Footer.astro` | Add newsletter signup input + button |
| `netlify/functions/contact.mjs` | Accept `type` field + additional fields |
| `src/data/translations/contact.json` | Add success/error/inquiry form translation keys |
| `src/data/translations/for-lease.json` | Add inquiry form translation keys |
| `src/data/translations/jobs.json` | Add application form translation keys |
| `src/data/translations/footer.json` | Add newsletter translation keys |

## Not in Scope

- GA4 event tracking implementation (data attributes added but no analytics code)
- File upload for job applications (email attachment via mailto retained as secondary option)
- Multi-step or advanced lead qualification flows
- Dashboard or admin notification for conversions
