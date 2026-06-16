# Conversion Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce friction on key conversion paths — leasing inquiries, job applications, contact form, and newsletter signup — with inline forms and AJAX submission.

**Architecture:** Enhance the existing `/api/contact` Netlify function to accept a `type` field for routing different submission types. Convert the contact page from native Netlify Forms to AJAX. Add inline forms on for-lease and job pages. Add newsletter signup in the footer. All forms POST to the same function with different `type` values.

**Tech Stack:** Astro, Tailwind CSS v4, Netlify Functions, Google Sheets webhook

---

### Task 1: Enhance Contact Netlify Function

**Files:**
- Modify: `netlify/functions/contact.mjs` (all)

- [ ] **Step 1: Rewrite contact.mjs with type-aware validation**

```javascript
export async function handler(event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { type, name, email, message, company, phone, unit, position, coverLetter, pageUrl, language } = body;

    const validTypes = ["general", "leasing_inquiry", "job_application", "newsletter"];
    const submissionType = validTypes.includes(type) ? type : "general";

    if (submissionType === "newsletter") {
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email is required" }) };
      }
    } else {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Name is required" }) };
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email is required" }) };
      }
    }

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

    if (webhookUrl) {
      const payload = {
        type: submissionType,
        name: name?.trim() || "",
        email: email?.trim() || "",
        company: company?.trim() || "",
        phone: phone?.trim() || "",
        unit: unit?.trim() || "",
        position: position?.trim() || "",
        coverLetter: coverLetter?.trim() || "",
        message: message?.trim() || "",
        pageUrl: pageUrl || "",
        language: language || "en",
        timestamp: new Date().toISOString(),
      };
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error("Contact function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Something went wrong. Please try again." }) };
  }
}
```

- [ ] **Step 2: Verify the file reads correctly**

Run: `node -e "const m = require('fs').readFileSync('netlify/functions/contact.mjs','utf8'); console.log(m.includes('validTypes') ? 'OK' : 'FAIL')"`
Expected: OK

---

### Task 2: Add Translation Keys

**Files:**
- Modify: `src/data/translations/contact.json`
- Modify: `src/data/translations/for-lease.json`
- Modify: `src/data/translations/jobs.json`
- Modify: `src/data/translations/footer.json`

- [ ] **Step 1: Add success/error keys to contact.json**

Add these keys to each language block (en, zh, tl, ja, ko):
```
"sendSuccess": "Your message has been sent. We'll get back to you soon.",
"sendError": "Something went wrong. Please try again or email us at inquiry@sbdmc.com.",
"sending": "Sending..."
```

- [ ] **Step 2: Add inquiry form keys to for-lease.json**

Add to each language block:
```
"inquiryFormTitle": "Quick Inquiry",
"inquiryNameLabel": "Full Name",
"inquiryEmailLabel": "Email Address",
"inquiryPhoneLabel": "Phone (optional)",
"inquiryCompanyLabel": "Company (optional)",
"inquirySubmit": "Send Inquiry",
"inquirySuccess": "Your inquiry has been sent. We'll get back to you soon.",
"inquiryError": "Something went wrong. Please try again."
```

- [ ] **Step 3: Add application form keys to jobs.json**

Add to each language block:
```
"applicationFormTitle": "Apply for this Position",
"applicationNameLabel": "Full Name",
"applicationEmailLabel": "Email Address",
"applicationPhoneLabel": "Phone (optional)",
"applicationCoverLabel": "Cover Letter",
"applicationSubmit": "Submit Application",
"applicationSuccess": "Your application has been submitted. We'll be in touch.",
"applicationError": "Something went wrong. Please try again or email your resume to inquiry@sbdmc.com."
```

- [ ] **Step 4: Add newsletter keys to footer.json**

Add to each language block:
```
"newsletterTitle": "Stay Updated",
"newsletterPlaceholder": "Enter your email",
"newsletterButton": "Subscribe",
"newsletterSuccess": "Subscribed! Thank you.",
"newsletterError": "Please enter a valid email."
```

- [ ] **Step 5: Apply all translations**

Edit each file's 5 language blocks with the new keys. Verify the JSON is valid.

---

### Task 3: Contact Page AJAX Submission

**Files:**
- Modify: `src/pages/[lang]/contact.astro`

- [ ] **Step 1: Replace the form with AJAX version**

Remove the `netlify` attribute and `input[type=hidden][name=form-name]`. Add `id="contact-form"` to the form and a `<div id="form-feedback">` after the button. Add a `<script>` block at the bottom of the section that:
- Listens to `submit` on the form
- Prevents default
- Sets button text to `{ct.sending}`, disables button
- Collects `name`, `email`, `company`, `message` from form fields
- POSTs to `/api/contact` with JSON body including `type: "general"`, `pageUrl`, `language`
- On success: shows green message `{ct.sendSuccess}`, resets form after 3s
- On error: shows red message `{ct.sendError}`
- Re-enables button and restores text

- [ ] **Step 2: Add data-cta attribute**

Add `data-cta="contact_form_submit"` to the submit button.

---

### Task 4: For Lease Inline Inquiry Form

**Files:**
- Modify: `src/pages/[lang]/for-lease.astro`

- [ ] **Step 1: Replace the text link with inquiry toggle + inline form**

In the lease card (line 45), replace `<a href={langPrefix + "/contact"}>` with:
```astro
<div>
  <button class="text-sm font-semibold text-primary-500 hover:text-primary-600 cursor-pointer" data-inquiry-toggle={i}>
    {tx.inquireNow} &rarr;
  </button>
  <div id={`inquiry-form-${i}`} class="mt-4 hidden space-y-3 border-t border-gray-200 pt-4">
    <p class="text-sm font-semibold text-primary-500">{tx.inquiryFormTitle}</p>
    <input type="text" placeholder={tx.inquiryNameLabel} required class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-inquiry-name />
    <input type="email" placeholder={tx.inquiryEmailLabel} required class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-inquiry-email />
    <input type="tel" placeholder={tx.inquiryPhoneLabel} class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-inquiry-phone />
    <input type="text" placeholder={tx.inquiryCompanyLabel} class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-inquiry-company />
    <button class="btn-primary w-full justify-center text-sm" data-cta="leasing_inquiry_submit" data-inquiry-submit>{tx.inquirySubmit}</button>
    <p class="hidden text-sm" data-inquiry-feedback></p>
  </div>
</div>
```

- [ ] **Step 2: Add script for inquiry form toggling and submission**

Add `<script>` block that:
- Listens for click on `[data-inquiry-toggle]`
- Toggles the corresponding `#inquiry-form-N` visibility
- On `[data-inquiry-submit]` click: collects fields, POSTs to `/api/contact` with `type: "leasing_inquiry"` and `unit` set to the lease title, shows success/error feedback

---

### Task 5: Job Opportunities Inline Application Form

**Files:**
- Modify: `src/pages/[lang]/job-opportunities.astro`

- [ ] **Step 1: Replace the "Apply Now" link with toggle + inline form**

Replace the `<a href={langPrefix + "/contact"}>` (line 44) with:
```astro
<div>
  <button class="btn-primary shrink-0 text-center text-sm cursor-pointer" data-apply-toggle>
    {jt.applyNow}
  </button>
  <div class="mt-4 hidden space-y-3 border-t border-gray-200 pt-4" data-apply-form>
    <p class="text-sm font-semibold text-primary-500">{jt.applicationFormTitle}</p>
    <input type="text" placeholder={jt.applicationNameLabel} required class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-apply-name />
    <input type="email" placeholder={jt.applicationEmailLabel} required class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-apply-email />
    <input type="tel" placeholder={jt.applicationPhoneLabel} class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-apply-phone />
    <textarea placeholder={jt.applicationCoverLabel} rows="4" required class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" data-apply-cover></textarea>
    <button class="btn-primary w-full justify-center text-sm" data-cta="job_application_submit" data-apply-submit>{jt.applicationSubmit}</button>
    <p class="hidden text-sm" data-apply-feedback></p>
  </div>
</div>
```

- [ ] **Step 2: Add script for application form**

Also replace the `mailto:` CTA section at the bottom with a more visible form link approach. Add `<script>` that:
- Toggles the apply form on button click
- On submit: POSTs to `/api/contact` with `type: "job_application"`, `position` set to the job title
- Shows success/error

---

### Task 6: Footer Newsletter Signup

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Add newsletter section to footer**

Before the legal/facebook line in the bottom bar (around line 68), add:
```astro
<div class="border-t border-white/10">
  <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <span class="text-sm font-semibold text-gray-300">{ft.newsletterTitle}</span>
      <div class="flex w-full max-w-sm gap-2">
        <input type="email" placeholder={ft.newsletterPlaceholder} required class="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400" data-newsletter-email />
        <button class="btn-primary shrink-0 px-4 py-2 text-sm" data-cta="newsletter_subscribe" data-newsletter-submit>{ft.newsletterButton}</button>
      </div>
      <p class="hidden text-sm" data-newsletter-feedback></p>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add script for newsletter submission**

Add `<script>` that:
- On newsletter submit button click: gets email, POSTs to `/api/contact` with `type: "newsletter"`
- Shows success/error feedback inline

---

### Task 7: Build Verification

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: 110 pages, 0 errors

- [ ] **Step 2: Verify no server errors**

Check the output for any "error" or "fail" messages.
Expected: clean build

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: improve conversion paths with inline forms and AJAX submission"
```
