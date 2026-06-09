# Chatbot Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade SBDMC's chatbot with conversation context, expanded knowledge, proactive chips, and mobile UX.

**Architecture:** Client-side Chatbot.astro (React-like pattern via Astro script island) + Netlify Function (chat.mjs) for OpenRouter API. Knowledge and page-chip data live in JSON data files.

**Tech Stack:** Astro 6, OpenRouter API (Gemma 4 31B), Netlify Functions

---

### Task 1: Expand Knowledge Base

**Files:**
- Modify: `src/data/chat-knowledge.json`

- [ ] **Write detailed expanded knowledge base**

Add ~50+ entries covering all 22 pages. Each entry has: `{ title, category, content, keywords[] }`.

Categories: `about`, `incentives`, `services`, `lease`, `rfid`, `forms`, `guide`, `general`.

Keep the existing `pageChips` structure and add per-page chip arrays. The `pageChips` key maps URL slugs to suggested questions:

```json
{
  "pageChips": {
    "about-sbdmc": [
      "What is the history of SBDMC?",
      "Who are the partners behind SBDMC?",
      "What is the mission and vision of SBDMC?",
      "Is SBDMC ISO certified?"
    ],
    "for-lease": [
      "What spaces are available for lease?",
      "What are the lease rates?",
      "What sizes are the warehouse units?",
      "How do I inquire about leasing?"
    ],
    ...
  },
  "entries": [
    { "title": "SBDMC Company Overview", "category": "about", "content": "SBDMC, Inc. (Subic Bay Development & Management Corporation) was established in 1994...", "keywords": ["sbdmc", "company", "overview", "about", "subic bay"] },
    ...
  ]
}
```

Include entries for:
- About SBDMC (history, mission, vision, ISO cert)
- About SBMA
- Park description (45 hectares, location)
- Business incentives (tax exemptions, duty-free)
- Business services (permits, utilities, support)
- For lease (warehouse sizes, lot sizes, rates)
- Rental information (rates, terms)
- RFID (application, fees, requirements, do's/don'ts)
- Forms (downloadable forms list)
- Handy guide (relocation, permits, registration)
- FAQ (common questions)
- Map (location, directions)
- Privacy policy
- Terms of service
- Contact (address, phone, email, hours)
- Locators (who's in the park)
- Job opportunities
- Gallery
- Government links
- Other reasons (advantages of SBGP)

- [ ] **Commit knowledge expansion**

---

### Task 2: Full Conversation Context

**Files:**
- Modify: `netlify/functions/chat.mjs`
- Modify: `src/components/Chatbot.astro`

- [ ] **Update Netlify Function to accept conversation history**

Current `chat.mjs` reads `{ message, page }`. Update to read `{ messages }` (array of `{ role, content }`) plus `page`. Inject the system prompt as first message, then append the user's message history array:

```js
// chat.mjs
const { messages, page } = await event.body.json();

const systemPrompt = {
  role: "system",
  content: buildKnowledgePrompt(page)
};

const openRouterMessages = [
  systemPrompt,
  ...messages.slice(-19) // max 19 history + system = 20
];
```

- [ ] **Update Chatbot.astro to send full message history**

Change the `sendMessage` function to maintain a `chatHistory` array in the Astro component script and send it with each request:

```js
// In the script section of Chatbot.astro
let chatHistory = [];
let currentPage = window.location.pathname;

async function sendMessage(text) {
  chatHistory.push({ role: "user", content: text });
  
  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: chatHistory, page: currentPage })
  });
  
  const data = await res.json();
  chatHistory.push({ role: "assistant", content: data.reply });
}
```

Also update localStorage persistence to store the full history array:

```js
// Save
localStorage.setItem("sbdmc-chat-msgs", JSON.stringify(chatHistory));

// Load on init
const saved = localStorage.getItem("sbdmc-chat-msgs");
chatHistory = saved ? JSON.parse(saved) : [];
```

- [ ] **Update system prompt in chat.mjs to reference history**

Add to the system prompt:
```
You have access to the full conversation history above. Maintain continuity with previous messages.
```

- [ ] **Clear history button**

Update the existing "clear chat" button to clear `chatHistory` + localStorage:

```js
function clearChat() {
  chatHistory = [];
  localStorage.removeItem("sbdmc-chat-msgs");
  updateUI();
}
```

- [ ] **Commit conversation context changes**

---

### Task 3: Proactive Page-Specific Chips

**Files:**
- Modify: `src/components/Chatbot.astro`
- Depends on: Task 1 (pageChips data)

- [ ] **Update suggested questions logic**

Read page-specific chips from knowledge data. Update the `updateSuggestedQuestions()` function:

```js
function updateSuggestedQuestions() {
  const path = window.location.pathname;
  // Extract slug from paths like /en/for-lease/ or /zh/about-sbdmc/
  const slug = path.replace(/^\/(en|zh|tl|ja|ko)\//, "").replace(/\/$/, "");
  const chips = knowledgeData.pageChips[slug] || knowledgeData.pageChips["default"];
  suggestedQuestions = chips.slice(0, 4);
  renderSuggestedQuestions();
}
```

Include a `"default"` entry in pageChips for pages without specific chips.

- [ ] **Commit page-specific chips**

---

### Task 4: Mobile UX Improvements

**Files:**
- Modify: `src/components/Chatbot.astro`

- [ ] **Add full-screen mobile styling**

Add these styles (or modify existing inline styles):

```css
/* Mobile: full screen overlay */
@media (max-width: 767px) {
  #chatbot-panel {
    width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: 0 !important;
  }
  
  #chatbot-toggle {
    width: 48px;
    height: 48px;
    bottom: 16px;
    right: 16px;
  }
  
  .chatbot-input-area {
    position: sticky;
    bottom: 0;
    padding: 12px;
  }
  
  .chatbot-input-area textarea,
  .chatbot-input-area button {
    min-height: 44px;
  }
  
  .chatbot-messages {
    padding: 12px;
    font-size: 15px;
  }
}
```

- [ ] **Ensure body scroll prevention works on mobile**

Verify the `overflow: hidden` on body when chat is open works on mobile browsers (some need `touch-action: none` and `position: fixed` on body).

```js
function preventBodyScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
}

function allowBodyScroll() {
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
}
```

- [ ] **Commit mobile UX changes**

---

### Task 5: Build Verification

- [ ] **Build and verify**

Run: `npm run build`

Expected: 110 pages (22×5), Pagefind indexing 5 languages, no errors.

Check rendered HTML for chat panel mobile styles.

- [ ] **Deploy to Netlify**

Run: `npx netlify deploy --prod --dir=dist`

- [ ] **Commit remaining changes**

```bash
git add -A
git commit -m "feat(chat): enrich chatbot with full context, expanded knowledge, page chips, mobile UX"
```
