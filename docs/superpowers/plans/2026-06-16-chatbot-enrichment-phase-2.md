# Chatbot Enrichment Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand chatbot knowledge base and improve error handling/reliability.

**Architecture:** Three independent changes — (1) restructure and expand `chat-knowledge.json` with categorized FAQs and new sections, (2) add AbortController timeout and structured error responses in `netlify/functions/chat.mjs`, (3) add retry button, always-enabled input, and better error display in `src/components/Chatbot.astro`.

**Tech Stack:** Astro, Tailwind CSS v4, OpenRouter API, Netlify Functions

---

### Task 1: Expand chatbot knowledge base

**Files:**
- Modify: `src/data/chat-knowledge.json`
- Modify: `netlify/functions/chat.mjs`

- [ ] **Step 1: Restructure knowledge base**

Replace the current `chat-knowledge.json` with an expanded version:

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
  "faqs": {
    "leasing": [
      { "q": "What types of businesses can locate in SBGP?", "a": "Light manufacturing, logistics and warehousing, BPO, commercial establishments, and service-oriented businesses." },
      { "q": "What are the minimum and maximum lease terms?", "a": "Minimum lease term is 1 year. Longer terms are negotiable depending on the investment scale and building improvements." },
      { "q": "What unit sizes are available?", "a": "Warehouse spaces range from 200 sqm to 5,000 sqm. Office spaces range from 50 sqm to 1,000 sqm. Custom configurations may be arranged." },
      { "q": "What are the current lease rates?", "a": "Rates vary by location, unit type, and lease duration. Contact inquiry@sbdmc.com or call (047) 252-3456 for current rate sheet." },
      { "q": "Can I sub-lease my space?", "a": "Sub-leasing requires prior written approval from SBDMC, Inc. The original lessee remains responsible for all lease obligations." },
      { "q": "How do I apply for a lease?", "a": "Contact through the website contact page or visit the office at Argonaut Highway cor. Rizal Highway, Subic Bay Gateway Park. Call (047) 252-3456." }
    ],
    "registration": [
      { "q": "How long does the business registration process take?", "a": "Typically 2 to 4 weeks from lease application to full operation, depending on the complexity of the business." },
      { "q": "What are the steps to register a business in SBGP?", "a": "1) Submit lease application with business profile. 2) Sign lease contract. 3) Register with SBMA (Subic Bay Metropolitan Authority). 4) Obtain business permit and tax identification. 5) Set up utilities." },
      { "q": "What documents are required for registration?", "a": "Business profile/company background, SEC or DTI registration, financial statements, business plan, list of directors/shareholders, and valid government IDs." },
      { "q": "Are there registration fees?", "a": "Yes, there are SBMA registration fees and local permit fees. Amounts vary by business type and scale. Contact inquiry@sbdmc.com for a detailed breakdown." }
    ],
    "operations": [
      { "q": "What are the gate hours?", "a": "Main gate operates 24/7. Visitor passes require a valid ID at the guardhouse. Truck entry is allowed during business hours (6 AM to 6 PM) with prior coordination." },
      { "q": "How do I get an RFID access pass?", "a": "Submit an RFID application form (available at the guardhouse or via the website), provide valid ID and vehicle documents, pay the applicable fee, and attend a brief orientation. Processing takes 1-3 business days." },
      { "q": "What is the visitor policy?", "a": "Visitors must present a valid government-issued ID at the main gate, register with the guardhouse, and be endorsed by the locator company they are visiting. Visitor passes are valid for the day of issue." },
      { "q": "What are the truck entry rules?", "a": "Truck entry is allowed Monday to Saturday, 6 AM to 6 PM. Trucks must register in advance with the locator company. Oversized or hazardous cargo requires special permits." },
      { "q": "Do I need a permit for construction or renovations?", "a": "Yes. Construction and renovation plans must be submitted to SBDMC for review and approval. A building permit from SBMA is also required. Allow 2-4 weeks for permit processing." }
    ],
    "living": [
      { "q": "Is there housing near the park?", "a": "Yes. Nearby options include Subic Bay Town Center, Olongapo City (15 minutes away), and various subdivisions in Barrio Barretto and Baloy Beach area. Hotels and serviced apartments are also available for short-term stays." },
      { "q": "What transportation options are available?", "a": "Public jeepneys and tricycles operate between the park and Olongapo City. Shuttle services can be arranged for employees. Taxis and ride-hailing services (Grab) are available in the area." },
      { "q": "Are there banks and ATMs nearby?", "a": "Yes. Banks with ATMs are located within the Subic Bay Freeport Zone, including BDO, Metrobank, BPI, and Landbank. Some are within a 5-minute drive from the park." },
      { "q": "Is there a clinic or medical facility?", "a": "A medical clinic is located within the Subic Bay Freeport Zone. Olongapo City has several hospitals and medical centers, including James L. Gordon Memorial Hospital and St. Joseph's Hospital, about 15 minutes away." },
      { "q": "Are there canteens or food options in the park?", "a": "Yes, there are canteens and food stalls within the park serving breakfast and lunch. Several restaurants and fast-food chains are available in Subic Bay Freeport Zone, a short drive from the park." }
    ]
  },
  "incentives": [
    "Income tax holiday — up to 6 years depending on investment level and location",
    "5% tax on gross income in lieu of all national and local taxes (after holiday period)",
    "Duty-free importation of capital equipment, machinery, and raw materials",
    "Exemption from local government taxes and licenses",
    "Up to 100% foreign ownership allowed for registered enterprises",
    "Simplified customs procedures through the Subic Bay Freeport zone customs office"
  ],
  "infrastructure": {
    "power": "Reliable 24/7 power supply with an on-site substation. Provider: Subic EnerZone. Backup generators available for critical operations. Rates are competitive with the national grid.",
    "water": "Adequate water supply from Subic Water. Water treatment facility on-site. Capacity sufficient for industrial and commercial use.",
    "internet": "High-speed fiber optic internet available through multiple providers including PLDT, Globe, and Converge. Speeds up to 1 Gbps can be arranged.",
    "roads": "Well-maintained paved roads within the park. Direct access to Argonaut Highway and Rizal Highway. Connecting to the Subic Bay Freeport Zone expressway network.",
    "drainage": "Modern drainage and flood control systems in place. Regular maintenance by the park management."
  },
  "rates": {
    "leaseRanges": "Warehouse: approximately PHP 150-300 per sqm/month. Office: approximately PHP 300-500 per sqm/month. Rates vary by location, condition, and lease duration.",
    "commonFees": "Common area maintenance (CAM) fees apply. Utility deposits required. SBMA registration and permit fees are separate.",
    "note": "Contact inquiry@sbdmc.com for a customized quotation based on your requirements."
  },
  "services": [
    "Rental Information — available spaces for lease within the park",
    "Business Services — comprehensive support for business operations including registration assistance",
    "RFID Access — guidelines, requirements, and forms for access passes",
    "Security — 24/7 security patrols and monitored access points",
    "Maintenance — regular maintenance of common areas and infrastructure",
    "E-Billing — online payment and billing portal via UnionBank EIP"
  ],
  "procedures": {
    "rfidApplication": "1) Obtain RFID application form from the guardhouse or website. 2) Complete the form with employee/vehicle details. 3) Submit with valid ID and vehicle registration (OR/CR). 4) Pay processing fee. 5) Attend brief RFID orientation. 6) Receive RFID sticker (1-3 business days).",
    "businessRegistration": "1) Submit lease application and business profile to SBDMC. 2) Sign lease contract with SBDMC. 3) Register with SBMA — submit incorporating documents, business plan, and financial statements. 4) Obtain SBMA Certificate of Registration and Tax Exemption. 5) Secure business permit from SBMA. 6) Register with BIR for tax identification. 7) Set up utility connections (power, water, internet). Total: 2-4 weeks.",
    "constructionPermit": "1) Submit building plans and specifications to SBDMC for review. 2) Obtain SBDMC construction clearance. 3) Apply for building permit with SBMA. 4) Secure necessary clearances (fire, sanitation, environmental). 5) Post construction bond. 6) Begin construction with regular inspections."
  },
  "locators": [
    { "company": "Wistron Infocomm (Philippines) Corp.", "industry": "Electronics / IT Manufacturing", "nationality": "Taiwan", "description": "Major electronics manufacturer, one of the largest locators in the park." },
    { "company": "Taian Philippines Inc.", "industry": "Manufacturing", "nationality": "Taiwan", "description": "Manufacturing company serving international markets." },
    { "company": "Taiwan Hitachi, Ltd., Phils.", "industry": "Industrial Equipment", "nationality": "Taiwan / Japan", "description": "Industrial equipment and components manufacturing." },
    { "company": "TECO Electric & Machinery Philippines Inc.", "industry": "Electric Motors / Machinery", "nationality": "Taiwan", "description": "Manufacturer of electric motors and industrial machinery." },
    { "company": "Tong Lung Philippines Inc.", "industry": "Manufacturing", "nationality": "Taiwan", "description": "Manufacturing company operating in the freeport zone." }
  ],
  "parkLife": {
    "housing": "Nearby residential options include Subic Bay Town Center residences, Olongapo City apartment complexes, Barrio Barretto subdivisions, and Baloy Beach area. Hotels: Subic Park Hotel, Subic Bay Yacht Club, and Court Meridian Hotel within 10-15 minutes.",
    "transportation": "Public jeepneys and tricycles operate between SBGP and Olongapo City. Shuttle services available for locator employees. Grab ride-hailing operates in the area. Clark International Airport is 45 minutes away.",
    "banking": "BDO, Metrobank, BPI, Landbank, and Asia United Bank have branches in Subic Bay Freeport Zone. ATMs available at each branch and select locations.",
    "medical": "SBMA Medical Clinic within the freeport zone. James L. Gordon Memorial Hospital and St. Joseph's Hospital in Olongapo City (15 min). ACE Medical Center Subic in the freeport zone.",
    "dining": "Canteens within the park. Numerous restaurants in Subic Bay Freeport Zone including SM Subic food court, Harbor Point dining options, and local eateries along Rizal Highway."
  },
  "regulations": {
    "environmental": "Locators must comply with SBMA environmental regulations. Environmental Compliance Certificate (ECC) may be required depending on business type. Waste management and disposal must follow SBMA guidelines.",
    "wasteManagement": "Segregation at source required. Hazardous waste disposal must be handled by accredited contractors. Regular waste collection by park management for non-hazardous waste.",
    "safety": "Occupational safety and health standards must be observed. Regular fire safety inspections conducted. Emergency response protocols in place with park security.",
    "visitorPolicy": "All visitors must register at the main gate, present valid ID, and be endorsed by the host locator company. Visitor passes valid for one day only."
  },
  "gateHours": "Main gate operates 24/7. Visitor passes require a valid ID at the guardhouse. Truck entry is allowed during business hours (6 AM to 6 PM) with prior coordination.",
  "workforce": "Sourced from Olongapo City and nearby towns with a labor force of approximately 500,000. Technical skills are available through local vocational schools and training centers including TESDA-accredited institutions.",
  "mapRoute": "Located in the Subic Bay Freeport Zone. 15 minutes from Olongapo City, 45 minutes from Clark International Airport, and approximately 2 hours from Metro Manila via NLEX-SCTEX.",
  "lastUpdated": "2026-06-16"
}
```

Then update `buildSystemPrompt()` in `chat.mjs` to handle the new nested `faqs` structure (the system prompt already `JSON.stringify`s the entire knowledge object, so it naturally adapts — no code change needed for the structure itself).

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: 110 pages built, 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/chat-knowledge.json
git commit -m "feat: expand chatbot knowledge base with categorized FAQs and new sections"
```

---

### Task 2: Add timeout and structured error responses in chat.mjs

**Files:**
- Modify: `netlify/functions/chat.mjs`

- [ ] **Step 1: Add AbortController timeout and structured error responses**

Replace the fetch block (lines 61-78) with a timeout-enabled version, and update the error handling (lines 80-93) to return structured error types:

In the `handler` function, add the timeout and update error returns:

```javascript
const controller = new AbortController();
const TIMEOUT_MS = 25000;
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

try {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": "SBDMC Chatbot",
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter error:", response.status, errorText);
    return { statusCode: 502, headers, body: JSON.stringify({ error: "api_error", message: "The assistant is busy. Please try again in a moment." }) };
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "I couldn't process that, please rephrase.";

  return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
} catch (error) {
  clearTimeout(timeoutId);
  if (error.name === "AbortError") {
    return { statusCode: 504, headers, body: JSON.stringify({ error: "timeout", message: "The assistant took too long. Please try again." }) };
  }
  console.error("Chat function error:", error);
  return { statusCode: 500, headers, body: JSON.stringify({ error: "network", message: "Something went wrong. Please try again." }) };
}
```

The full updated `handler` function should look like:

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

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Chat is currently unavailable" }) };
  }

  try {
    const { message, pageUrl, language } = JSON.parse(event.body);
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is required" }) };
    }

    const SYSTEM_PROMPT = buildSystemPrompt(pageUrl, language);

    const controller = new AbortController();
    const TIMEOUT_MS = 25000;
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SITE_URL,
          "X-Title": "SBDMC Chatbot",
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter error:", response.status, errorText);
        return { statusCode: 502, headers, body: JSON.stringify({ error: "api_error", message: "The assistant is busy. Please try again in a moment." }) };
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I couldn't process that, please rephrase.";

      return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        return { statusCode: 504, headers, body: JSON.stringify({ error: "timeout", message: "The assistant took too long. Please try again." }) };
      }
      throw error;
    }
  } catch (error) {
    console.error("Chat function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "network", message: "Something went wrong. Please try again." }) };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/chat.mjs
git commit -m "feat: add timeout and structured error responses to chat function"
```

---

### Task 3: Improve error handling in Chatbot.astro (retry, always-on input, better errors)

**Files:**
- Modify: `src/components/Chatbot.astro`

- [ ] **Step 1: Update the `sendMessage` function**

Replace the `sendMessage` function in Chatbot.astro (starting at line 344) with an improved version that:
- Keeps the input enabled during API calls
- Shows a retry button on failed messages
- Distinguishes error types
- Tracks consecutive failures for auto-contact

```javascript
  let pending = false;
  let consecutiveFailures = 0;

  async function sendMessage(overrideText) {
    if (pending) return;
    const text = (overrideText || input?.value || "").trim();
    if (!text) return;

    input.value = "";
    pending = true;

    const userTime = getTimestamp();
    messages.push({ role: "user", text, time: userTime });
    saveToStorage();
    messagesEl.insertAdjacentHTML("beforeend", buildUserBubble(text, userTime));
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const loadingId = "chatbot-loading-" + (++msgCounter);
    messagesEl.insertAdjacentHTML("beforeend", `<div id="${loadingId}" class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500"><span class="inline-flex gap-1"><span class="animate-bounce" style="animation-delay:0ms">.</span><span class="animate-bounce" style="animation-delay:150ms">.</span><span class="animate-bounce" style="animation-delay:300ms">.</span></span></div></div>`);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    let replyText;
    let errorType = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, pageUrl: window.location.pathname, language: langCode }),
      });

      document.getElementById(loadingId)?.remove();

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      const botTime = getTimestamp();

      if (data && data.reply) {
        replyText = data.reply;
        consecutiveFailures = 0;
      } else if (data && data.error) {
        errorType = data.error;
        replyText = data.message || "I'm a bit busy, please try again later.";
        consecutiveFailures++;
      } else {
        errorType = "unknown";
        replyText = "I couldn't process that, please rephrase.";
        consecutiveFailures++;
      }

      messages.push({ role: "bot", text: replyText, time: botTime });
      saveToStorage();
      messagesEl.insertAdjacentHTML("beforeend", buildBotBubble(replyText, botTime));
      if (errorType) {
        messagesEl.insertAdjacentHTML("beforeend", `<div class="flex justify-center mt-1"><button class="chatbot-retry text-xs text-primary-500 hover:text-primary-600 underline cursor-pointer">↻ Retry</button></div>`);
      }
      messagesEl.insertAdjacentHTML("beforeend", buildContactLink());
      msgCounter++;
      clearBtn.classList.remove("hidden");
    } catch {
      document.getElementById(loadingId)?.remove();
      errorType = "network";
      consecutiveFailures++;
      const errTime = getTimestamp();
      replyText = "Connection lost. Check your internet and try again.";
      messages.push({ role: "bot", text: replyText, time: errTime });
      saveToStorage();
      messagesEl.insertAdjacentHTML("beforeend", buildBotBubble(replyText, errTime));
      messagesEl.insertAdjacentHTML("beforeend", `<div class="flex justify-center mt-1"><button class="chatbot-retry text-xs text-primary-500 hover:text-primary-600 underline cursor-pointer">↻ Retry</button></div>`);
      messagesEl.insertAdjacentHTML("beforeend", buildContactLink());
      msgCounter++;
      clearBtn.classList.remove("hidden");
    }

    pending = false;
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const lower = (replyText || "").toLowerCase();
    if (consecutiveFailures >= 2 || ((lower.includes("i don't know") || lower.includes("i'm not sure") || lower.includes("not sure") || lower.includes("don't know")) && consecutiveFailures > 0)) {
      setTimeout(() => showContactForm(), 500);
    }
  }
```

- [ ] **Step 2: Add retry event listener**

After the existing event listeners, add:

```javascript
  messagesEl.addEventListener("click", function (e) {
    if (e.target.closest(".chatbot-retry")) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
      if (lastUserMsg) sendMessage(lastUserMsg.text);
    }
  });
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: 110 pages built, 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: improve chatbot error handling with retry button and always-enabled input"
```

---

### Task 4: Final build verification and push

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: 110 pages built, 0 errors, Pagefind indexes 5 languages.

- [ ] **Step 2: Push all commits**

```bash
git push
```
