# AI Chatbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI chatbot to the SBDMC website that answers visitor questions using site content via OpenRouter's free API.

**Architecture:** A floating chat button at bottom-right opens a slide-up chat panel. User questions go through a Netlify Function which calls OpenRouter with site content as context, then returns the answer.

**Tech Stack:** Astro + Tailwind CSS, Netlify Functions (Node.js), OpenRouter API, vanilla JS

---

### Task 1: Create the knowledge base JSON

**Files:**
- Create: `src/data/chat-knowledge.json`

- [ ] **Step 1: Write the knowledge base file**

Write `src/data/chat-knowledge.json` with structured content extracted from existing site data:

```json
{
  "siteName": "SBDMC, Inc. - Subic Bay Gateway Park",
  "about": "Subic Bay Gateway Park (SBGP) is a 45-hectare industrial park in the Subic Bay Freeport Zone, Philippines. Developed and operated by SBDMC, Inc. Designed for light manufacturing, logistics, warehousing, and BPO operations.",
  "contact": {
    "address": "Argonaut Highway cor. Rizal Highway, Subic Bay Gateway Park, Subic Bay Freeport Zone, 2222",
    "phone": "(047) 252-3456",
    "email": "inquiry@sbdmc.com",
    "hours": "Monday - Friday: 9:00 AM - 4:00 PM",
    "helpdesk": "https://sbdmcinc.freshdesk.com/support/home"
  },
  "faqs": [
    { "q": "What types of businesses can locate in SBGP?", "a": "Light manufacturing, logistics and warehousing, BPO, commercial establishments, and service-oriented businesses." },
    { "q": "What are the tax incentives available?", "a": "Income tax holidays (up to 6 years), reduced 5% tax on gross income after holiday, duty-free importation, exemption from local government taxes, up to 100% foreign ownership." },
    { "q": "Can foreign companies locate in SBGP?", "a": "Yes, foreign companies may enjoy up to 100% foreign ownership under Subic Bay Freeport Zone incentives." },
    { "q": "How do I apply for a lease?", "a": "Contact through the website contact page or visit the office at Argonaut Highway cor. Rizal Highway, Subic Bay Gateway Park. Call (047) 252-3456." },
    { "q": "What infrastructure is available?", "a": "Reliable power, adequate water, high-speed fiber optic internet, well-maintained roads, 24/7 security, drainage, and waste management." }
  ],
  "incentives": [
    "Income tax holiday (up to 6 years)",
    "5% tax on gross income after holiday",
    "Duty-free importation of capital equipment and raw materials",
    "Exemption from local government taxes",
    "Up to 100% foreign ownership allowed",
    "Streamlined registration processes"
  ],
  "services": [
    "Rental Information - available spaces for lease within the park",
    "Business Services - comprehensive support for business operations",
    "RFID Access - guidelines, requirements, and forms for access passes"
  ],
  "pages": {
    "aboutSbdmc": "/about-sbdmc",
    "aboutSbma": "/about-sbma",
    "description": "/description",
    "locators": "/locators",
    "businessIncentives": "/business-incentives",
    "otherReasons": "/other-reasons",
    "faq": "/faq",
    "governmentLinks": "/government-links",
    "forLease": "/for-lease",
    "rentalInformation": "/rental-information",
    "businessServices": "/business-services",
    "rfid": "/rfid",
    "jobOpportunities": "/job-opportunities",
    "gallery": "/gallery",
    "forms": "/forms",
    "contact": "/contact"
  },
  "lastUpdated": "2026-06-08"
}
```

- [ ] **Step 2: Verify the file is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/chat-knowledge.json','utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add src/data/chat-knowledge.json
git commit -m "feat: add knowledge base for AI chatbot"
```

---

### Task 2: Create the Netlify Function

**Files:**
- Create: `netlify/functions/chat.mjs`

- [ ] **Step 1: Create the function directory**

```bash
New-Item -ItemType Directory -Path "netlify/functions" -Force
```

- [ ] **Step 2: Write the Netlify Function**

Write `netlify/functions/chat.mjs`:

```javascript
import knowledge from "../../src/data/chat-knowledge.json" with { type: "json" };

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.URL || "https://sbdmc.netlify.app";

const SYSTEM_PROMPT = `You are the SBDMC assistant for Subic Bay Gateway Park.
Answer questions ONLY using the knowledge provided below. If you don't know the answer, say "I'm not sure — please contact our team at inquiry@sbdmc.com or visit sbdmcinc.freshdesk.com/support/home."

Knowledge base:
${JSON.stringify(knowledge, null, 2)}`;

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

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Chat is currently unavailable" }) };
  }

  try {
    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is required" }) };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "SBDMC Chatbot",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "I'm a bit busy, please try again later" }) };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that, please rephrase.";

    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (error) {
    console.error("Chat function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Something went wrong. Please try again." }) };
  }
}
```

- [ ] **Step 3: Verify the function directory exists**

Run: `Get-ChildItem netlify/functions/chat.mjs`
Expected: File listed

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/chat.mjs
git commit -m "feat: add Netlify Function for AI chatbot"
```

---

### Task 3: Create the Chatbot component

**Files:**
- Create: `src/components/Chatbot.astro`

- [ ] **Step 1: Write the Chatbot component**

Write `src/components/Chatbot.astro`:

```astro
<div id="chatbot">
  <button id="chatbot-toggle" class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 hover:scale-105 active:scale-95" aria-label="Open chat">
    <svg id="chatbot-icon" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    <svg id="chatbot-close-icon" class="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>

  <div id="chatbot-panel" class="fixed bottom-24 right-6 z-50 hidden w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-2xl flex-col overflow-hidden" style="max-height: 520px;">
    <div class="flex items-center gap-3 bg-primary-500 px-4 py-3 text-white">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">S</div>
      <div>
        <div class="text-sm font-semibold">SBDMC Assistant</div>
        <div class="text-xs text-white/70">How can I help you?</div>
      </div>
    </div>

    <div id="chatbot-messages" class="flex-1 space-y-3 overflow-y-auto px-4 py-4" style="min-height: 300px;">
      <div class="flex items-start gap-2">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div>
        <div class="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
          Hi! I'm the SBDMC assistant. I can answer questions about leasing, incentives, services, and more. How can I help you today?
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 px-4 py-3">
      <div class="flex items-center gap-2">
        <input
          id="chatbot-input"
          type="text"
          placeholder="Type your question..."
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button id="chatbot-send" class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white transition-all hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  </div>
</div>

<script is:inline>
(function () {
  const toggle = document.getElementById("chatbot-toggle");
  const panel = document.getElementById("chatbot-panel");
  const icon = document.getElementById("chatbot-icon");
  const closeIcon = document.getElementById("chatbot-close-icon");
  const messages = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");

  if (!toggle || !panel) return;

  let isOpen = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("hidden", !isOpen);
    panel.classList.toggle("flex", isOpen);
    icon.classList.toggle("hidden", isOpen);
    closeIcon.classList.toggle("hidden", !isOpen);
    if (isOpen) {
      setTimeout(() => input?.focus(), 100);
    }
  }

  toggle.addEventListener("click", togglePanel);

  async function sendMessage() {
    const text = input?.value.trim();
    if (!text) return;

    input.value = "";
    sendBtn.disabled = true;

    messages.insertAdjacentHTML("beforeend", `<div class="flex items-start justify-end gap-2"><div class="max-w-[80%] rounded-lg bg-primary-500 px-3 py-2 text-sm text-white">${escapeHtml(text)}</div></div>`);
    messages.scrollTop = messages.scrollHeight;

    const loadingId = "chatbot-loading";
    messages.insertAdjacentHTML("beforeend", `<div id="${loadingId}" class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500"><span class="inline-flex gap-1"><span class="animate-bounce" style="animation-delay:0ms">.</span><span class="animate-bounce" style="animation-delay:150ms">.</span><span class="animate-bounce" style="animation-delay:300ms">.</span></span></div></div>`);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      document.getElementById(loadingId)?.remove();

      if (data.reply) {
        messages.insertAdjacentHTML("beforeend", `<div class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">${escapeHtml(data.reply)}</div></div>`);
      } else {
        messages.insertAdjacentHTML("beforeend", `<div class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="max-w-[80%] rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">${escapeHtml(data.error || "Something went wrong. Please try again.")}</div></div>`);
      }
    } catch {
      document.getElementById(loadingId)?.remove();
      messages.insertAdjacentHTML("beforeend", `<div class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="max-w-[80%] rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Network error. Please check your connection and try again.</div></div>`);
    }

    messages.scrollTop = messages.scrollHeight;
    sendBtn.disabled = false;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  sendBtn?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  function handleClickOutside(e) {
    if (isOpen && !panel.contains(e.target) && !toggle.contains(e.target)) {
      togglePanel();
    }
  }
  document.addEventListener("click", handleClickOutside);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) togglePanel();
  });
})();
</script>
```

- [ ] **Step 2: Verify the file exists**

Run: `Get-ChildItem src/components/Chatbot.astro`
Expected: File listed

- [ ] **Step 3: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: add AI chatbot widget component"
```

---

### Task 4: Integrate chatbot into Layout

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Import and add Chatbot component**

In `src/layouts/Layout.astro`, add the import after the existing `import Search from "../components/Search.astro";` line (line 8):

```astro
import Chatbot from "../components/Chatbot.astro";
```

Then add `<Chatbot />` after `<Search />` (line 99):

```astro
    <Search />
    <Chatbot />
```

- [ ] **Step 2: Verify the layout builds**

Run: `npx astro build 2>&1 | Select-String -NotMatch "\[vite\]"` (allow a few seconds)
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: integrate AI chatbot into site layout"
```

---

### Task 5: Configure environment and deploy setup

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Write the env example file**

Write `.env.example`:

```
# OpenRouter API key for the AI chatbot
# Get your key at https://openrouter.ai/keys
# Set this as a Netlify environment variable named OPENROUTER_API_KEY
OPENROUTER_API_KEY=
```

- [ ] **Step 2: Verify file exists**

Run: `Get-ChildItem .env.example`
Expected: File listed

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add env example for chatbot API key"
```

---

### Task 6: Verify build succeeds

**Files:** (no changes)

- [ ] **Step 1: Run a full build**

```bash
npx astro build 2>&1
```

Expected: Build succeeds with no errors, `dist/` directory created

- [ ] **Step 2: Verify the Netlify Function is included in output**

Run: `Get-ChildItem netlify/functions/chat.mjs`
Expected: File exists (Netlify Functions are deployed separately from astro build)
