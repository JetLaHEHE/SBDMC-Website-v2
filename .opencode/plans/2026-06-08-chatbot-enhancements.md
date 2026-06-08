# Chatbot Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 features to the SBDMC chatbot: page-aware context, suggested questions, markdown rendering, chat history, timestamps, clear chat, and feedback thumbs.

**Architecture:** All frontend features in `src/components/Chatbot.astro` script block (~100→260 lines). One API change in `netlify/functions/chat.mjs` to accept `pageUrl` and inject page context. No new files, no external dependencies.

**Tech Stack:** Astro + Tailwind (frontend), Netlify Functions (API), OpenRouter (LLM), localStorage (persistence)

**Build verification:** `npm run build` — Astro static site generation. No test framework, so verify by building and checking output.

---

### Task 1: Page-Aware Context (API)

**Files:**
- Modify: `netlify/functions/chat.mjs`
- No frontend changes yet

This task adds page-awareness to the API function only. The frontend will send `pageUrl` in a later task.

- [ ] **Step 1: Read the current `chat.mjs`**

Read `netlify/functions/chat.mjs` to understand current implementation.

- [ ] **Step 2: Modify `chat.mjs` to accept `pageUrl`**

Change the handler to extract `pageUrl` from the request body. When present and matching a known page, inject context into the system prompt.

Paste the full updated file content:

```javascript
import knowledge from "../../src/data/chat-knowledge.json" with { type: "json" };

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.URL || "https://sbdmc.netlify.app";

function buildSystemPrompt(pageUrl) {
  let contextNote = "";
  if (pageUrl && knowledge.pages) {
    const match = Object.entries(knowledge.pages).find(([key]) => pageUrl.includes(key) || key.includes(pageUrl.replace(/\/$/, "")));
    if (match) {
      const [key, label] = match;
      contextNote = `\nThe user is currently on the "${label}" page of the SBDMC website.`;
    }
  }
  return `You are the SBDMC assistant for Subic Bay Gateway Park.
Answer questions ONLY using the knowledge provided below. If you don't know the answer, say "I'm not sure — please contact our team at inquiry@sbdmc.com or visit sbdmcinc.freshdesk.com/support/home."

Knowledge base:
${JSON.stringify(knowledge, null, 2)}${contextNote}`;
}

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
    const { message, pageUrl } = JSON.parse(event.body);
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is required" }) };
    }

    const SYSTEM_PROMPT = buildSystemPrompt(pageUrl);

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

- [ ] **Step 3: Verify the file parses**

Run: `node -c "C:\Users\jetag\Desktop\code\websites\sbdmc-v2\netlify\functions\chat.mjs"`
Expected: no errors (Node may warn about JSON import syntax but the file should parse clean)

- [ ] **Step 4: Build to confirm no breakage**

Run: `npm run build` (in project dir)
Expected: Build succeeds (22 pages)

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/chat.mjs
git commit -m "feat: add page-aware context support to chat API"
```

---

### Task 2: Chat History + Timestamps (Frontend)

**Files:**
- Modify: `src/components/Chatbot.astro`

This task adds localStorage persistence and timestamps. These are tightly coupled — the history model stores timestamps as part of each message entry.

- [ ] **Step 1: Read current Chatbot.astro**

Read `src/components/Chatbot.astro` to understand the current script.

- [ ] **Step 2: Update Chatbot.astro with history + timestamps**

Replace the entire `<script is:inline>` block. Keep the HTML template unchanged (except no changes needed yet).

The key changes:
1. Add a `messages` array that tracks `{ role, text, time }` objects
2. On init, check localStorage for saved history
3. On each message add, push to array, save to localStorage, include timestamp
4. Use the `renderMessages()` function to render from the array

Paste the full updated file content:

```astro
<div id="chatbot">
  <button id="chatbot-toggle" class="fixed bottom-6 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 hover:scale-105 active:scale-95" aria-label="Open chat" aria-expanded="false">
    <svg id="chatbot-icon" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    <svg id="chatbot-close-icon" class="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>

  <div id="chatbot-panel" class="fixed bottom-24 right-20 z-50 hidden w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-2xl flex-col overflow-hidden" style="max-height: 520px;" role="dialog" aria-modal="true" aria-label="SBDMC Assistant chat">
    <div class="flex items-center gap-3 bg-primary-500 px-4 py-3 text-white">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">S</div>
      <div>
        <div class="text-sm font-semibold">SBDMC Assistant</div>
        <div class="text-xs text-white/70">How can I help you?</div>
      </div>
      <button id="chatbot-clear" class="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm transition-all hover:bg-white/20 hidden" aria-label="Clear chat" title="Clear chat">🗑️</button>
    </div>

    <div id="chatbot-messages" class="flex-1 space-y-3 overflow-y-auto px-4 py-4" style="min-height: 300px;" aria-live="polite" aria-relevant="additions">
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
  const messagesEl = document.getElementById("chatbot-messages");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const clearBtn = document.getElementById("chatbot-clear");

  if (!toggle || !panel || !messagesEl || !input || !sendBtn || !icon || !closeIcon || !clearBtn) return;

  let isOpen = false;
  let msgCounter = 0;
  let messages = [];
  const STORAGE_KEY = "sbdmc-chat-history";

  function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }

  function saveToStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderTimestamp(time) {
    return `<div class="text-[10px] text-gray-400 mt-0.5">${escapeHtml(time)}</div>`;
  }

  function buildBotBubble(text, time, feedbackState) {
    let html = `<div class="flex items-start gap-2">`;
    html += `<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div>`;
    html += `<div>`;
    html += `<div class="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">${escapeHtml(text)}</div>`;
    html += renderTimestamp(time);
    html += `<div class="flex gap-1 mt-1 text-base" data-msg-index="${msgCounter}">`;
    const upActive = feedbackState === "up" ? "" : "opacity-40";
    const downActive = feedbackState === "down" ? "" : "opacity-40";
    html += `<button class="feedback-btn feedback-up ${upActive} hover:opacity-100 transition-opacity" data-msg-index="${msgCounter}" aria-label="Thumbs up">👍</button>`;
    html += `<button class="feedback-btn feedback-down ${downActive} hover:opacity-100 transition-opacity" data-msg-index="${msgCounter}" aria-label="Thumbs down">👎</button>`;
    html += `</div>`;
    html += `</div></div>`;
    return html;
  }

  function buildUserBubble(text, time) {
    return `<div class="flex items-start justify-end gap-2"><div class="text-right"><div class="max-w-[80%] rounded-lg bg-primary-500 px-3 py-2 text-sm text-white">${escapeHtml(text)}</div>${renderTimestamp(time)}</div></div>`;
  }

  function renderMessages() {
    messagesEl.innerHTML = "";
    msgCounter = 0;
    let hasHistory = false;
    for (const msg of messages) {
      if (msg.role === "user") {
        messagesEl.insertAdjacentHTML("beforeend", buildUserBubble(msg.text, msg.time));
      } else {
        messagesEl.insertAdjacentHTML("beforeend", buildBotBubble(msg.text, msg.time, msg.feedback || null));
        msgCounter++;
      }
      hasHistory = true;
    }
    if (!hasHistory) {
      const greetingTime = getTimestamp();
      const initialMsg = { role: "bot", text: "Hi! I'm the SBDMC assistant. I can answer questions about leasing, incentives, services, and more. How can I help you today?", time: greetingTime, feedback: null };
      messages.push(initialMsg);
      msgCounter = 1;
      messagesEl.innerHTML = buildBotBubble(initialMsg.text, initialMsg.time, null);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
    clearBtn.classList.toggle("hidden", messages.length <= 1);
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("hidden", !isOpen);
    panel.classList.toggle("flex", isOpen);
    icon.classList.toggle("hidden", isOpen);
    closeIcon.classList.toggle("hidden", !isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close chat" : "Open chat");
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => input?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      toggle.focus();
    }
  }

  toggle.addEventListener("click", togglePanel);

  async function sendMessage(overrideText) {
    if (sendBtn.disabled) return;
    const text = (overrideText || input?.value || "").trim();
    if (!text) return;

    input.value = "";
    sendBtn.disabled = true;

    const userTime = getTimestamp();
    messages.push({ role: "user", text, time: userTime });
    saveToStorage();
    messagesEl.insertAdjacentHTML("beforeend", buildUserBubble(text, userTime));
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const loadingId = "chatbot-loading-" + (++msgCounter);
    messagesEl.insertAdjacentHTML("beforeend", `<div id="${loadingId}" class="flex items-start gap-2"><div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">S</div><div class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500"><span class="inline-flex gap-1"><span class="animate-bounce" style="animation-delay:0ms">.</span><span class="animate-bounce" style="animation-delay:150ms">.</span><span class="animate-bounce" style="animation-delay:300ms">.</span></span></div></div>`);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, pageUrl: window.location.pathname }),
      });

      document.getElementById(loadingId)?.remove();

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      const botTime = getTimestamp();
      let replyText;
      if (data && data.reply) {
        replyText = data.reply;
      } else if (data && data.error) {
        replyText = data.error;
      } else {
        replyText = "I'm a bit busy, please try again later.";
      }

      messages.push({ role: "bot", text: replyText, time: botTime, feedback: null });
      saveToStorage();
      messagesEl.insertAdjacentHTML("beforeend", buildBotBubble(replyText, botTime, null));
      msgCounter++;
      clearBtn.classList.remove("hidden");
    } catch {
      document.getElementById(loadingId)?.remove();
      const errTime = getTimestamp();
      const errText = "Network error. Please check your connection and try again.";
      messages.push({ role: "bot", text: errText, time: errTime, feedback: null });
      saveToStorage();
      messagesEl.insertAdjacentHTML("beforeend", buildBotBubble(errText, errTime, null));
      msgCounter++;
      clearBtn.classList.remove("hidden");
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener("click", () => sendMessage());
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !sendBtn.disabled) sendMessage();
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

  // Restore history on load
  const saved = loadFromStorage();
  if (saved) {
    messages = saved;
  }
  renderMessages();
})();
</script>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: add chat history persistence and timestamps"
```

---

### Task 3: Markdown Rendering (Frontend)

**Files:**
- Modify: `src/components/Chatbot.astro` (script block only)

- [ ] **Step 1: Add `renderMarkdown` function**

After the `escapeHtml` function in the script block, add:

```javascript
function renderMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  const lines = html.split("\n");
  let result = [];
  let inList = false;
  for (const line of lines) {
    if (line.match(/^[-*]\s/)) {
      if (!inList) { result.push("<ul>"); inList = true; }
      result.push("<li>" + line.replace(/^[-*]\s/, "") + "</li>");
    } else {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(line);
    }
  }
  if (inList) result.push("</ul>");
  html = result.join("\n");
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br>");
  return "<p>" + html + "</p>";
}
```

- [ ] **Step 2: Use `renderMarkdown` in bot bubbles**

In the `buildBotBubble` function, change the bot text line from:
```javascript
html += `<div class="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">${escapeHtml(text)}</div>`;
```
to:
```javascript
html += `<div class="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">${renderMarkdown(text)}</div>`;
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: add markdown rendering for bot replies"
```

---

### Task 4: Suggested Questions (Frontend)

**Files:**
- Modify: `src/components/Chatbot.astro` (script block only)

- [ ] **Step 1: Add suggested questions array and rendering**

After the `renderMarkdown` function, add:

```javascript
const SUGGESTED_QUESTIONS = [
  "What are your rates?",
  "How do I register?",
  "What are the gate hours?",
  "What leasing incentives are available?",
  "Map and directions",
];

function renderSuggestedQuestions() {
  const chipsHtml = SUGGESTED_QUESTIONS.map((q, i) =>
    `<button class="suggested-chip bg-blue-50 text-primary-600 border border-blue-200 rounded-full px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-100 transition-colors" data-index="${i}">${escapeHtml(q)}</button>`
  ).join("");
  return `<div id="suggested-questions" class="flex flex-wrap gap-2 ml-9 mb-2">${chipsHtml}</div>`;
}
```

- [ ] **Step 2: Render suggested questions after greeting, add click handler**

In the `renderMessages` function, when `messages` is empty (greeting only case), after inserting the greeting bubble, also insert suggested questions:

In the `if (!hasHistory)` block, change:
```javascript
messagesEl.innerHTML = buildBotBubble(initialMsg.text, initialMsg.time, null);
```
to:
```javascript
messagesEl.innerHTML = buildBotBubble(initialMsg.text, initialMsg.time, null) + renderSuggestedQuestions();
```

Add a delegated click handler after the other event listeners:

```javascript
messagesEl.addEventListener("click", function (e) {
  const chip = e.target.closest(".suggested-chip");
  if (chip) {
    const index = parseInt(chip.dataset.index);
    const question = SUGGESTED_QUESTIONS[index];
    if (question) sendMessage(question);
  }
});
```

The `sendMessage` function already accepts an optional `overrideText` parameter from Task 2, so this will work.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: add suggested question chips"
```

---

### Task 5: Clear Chat Button + Feedback Thumbs (Frontend)

**Files:**
- Modify: `src/components/Chatbot.astro` (script block + HTML)

- [ ] **Step 1: Add clear chat handler**

The clear button (`#chatbot-clear`) already exists in the HTML from Task 2. Add its click handler:

```javascript
clearBtn.addEventListener("click", function () {
  messages = [];
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  msgCounter = 0;
  renderMessages();
});
```

- [ ] **Step 2: Add feedback click handler**

Add a delegated click handler for feedback buttons:

```javascript
messagesEl.addEventListener("click", function (e) {
  const chip = e.target.closest(".suggested-chip");
  if (chip) {
    const index = parseInt(chip.dataset.index);
    const question = SUGGESTED_QUESTIONS[index];
    if (question) sendMessage(question);
    return;
  }

  const fbBtn = e.target.closest(".feedback-btn");
  if (!fbBtn) return;
  const index = parseInt(fbBtn.dataset.msgIndex);
  const msg = messages.filter(m => m.role === "bot")[index];
  if (!msg) return;
  const isUp = fbBtn.classList.contains("feedback-up");
  if (msg.feedback === (isUp ? "up" : "down")) {
    msg.feedback = null;
  } else {
    msg.feedback = isUp ? "up" : "down";
  }
  saveToStorage();
  renderMessages();
});
```

Note: Since both `.suggested-chip` and `.feedback-btn` use the same `messagesEl` click handler, they should be combined into one handler. The `sendMessage` call from Task 4 should also be included in the same handler.

Remove the standalone suggested-questions handler from Task 4 and consolidate:

```javascript
messagesEl.addEventListener("click", function (e) {
  const chip = e.target.closest(".suggested-chip");
  if (chip) {
    const index = parseInt(chip.dataset.index);
    const question = SUGGESTED_QUESTIONS[index];
    if (question) sendMessage(question);
    return;
  }

  const fbBtn = e.target.closest(".feedback-btn");
  if (!fbBtn) return;
  const index = parseInt(fbBtn.dataset.msgIndex);
  const botMessages = messages.filter(m => m.role === "bot");
  const msg = botMessages[index];
  if (!msg) return;
  const isUp = fbBtn.classList.contains("feedback-up");
  msg.feedback = (msg.feedback === (isUp ? "up" : "down")) ? null : (isUp ? "up" : "down");
  saveToStorage();
  renderMessages();
});
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Chatbot.astro
git commit -m "feat: add clear chat and feedback thumbs"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds, 22 pages

- [ ] **Step 2: Run full final review**

Read `src/components/Chatbot.astro` and `netlify/functions/chat.mjs` to verify all features are present and consistent.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup after chatbot enhancements"
```
