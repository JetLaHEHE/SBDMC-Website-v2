# Chatbot Enrichment — Design Spec

**Goal:** Upgrade SBDMC's AI chatbot from single-turn Q&A to a conversational, proactive, mobile-friendly assistant with a richer knowledge base.

**Features:**

### 1. Full Conversation Context (Item 2)

**Problem:** Currently only the last user message + current page are sent. The bot can't reference previous turns.

**Solution:** Send the full message history array (up to last 20 messages) to the OpenRouter API on every request. The system prompt instructs the model to use the history for context. UI shows the full back-and-forth scrollable chat.

- `chatHistory[]` → stored in `localStorage` key `sbdmc-chat-msgs`
- On send: append user message to array → POST with `messages: [systemPrompt, ...history]` → append assistant reply
- Max 20 messages to stay within token limits
- System prompt updated to say: *"You have access to the full conversation history above. Use it to maintain continuity."*

### 2. Expand Knowledge Base (Item 3)

**Problem:** Only 7 FAQ entries covering 3-4 pages. Site has 22 pages with rich content.

**Solution:** Expand `chat-knowledge.json` to ~50+ entries covering ALL pages with deeper content. Include structured sections: about, incentives, services, lease, rfid, forms, handy-guide, map, privacy, terms, contact, locators, jobs.

- Each entry: `{ title, category, content, keywords[] }`
- Categories: `about`, `incentives`, `services`, `lease`, `rfid`, `forms`, `guide`, `general`
- Knowledge injected into system prompt (same approach, just more data)

### 3. Proactive Page-Specific Chips (Item 4)

**Problem:** Chips are static and always the same. They should change based on what page the user is on.

**Solution:** Map each page path to a set of suggested questions. Load the appropriate set based on the current page.

- Map defined in `chat-knowledge.json` under `pageChips` key
- Each page gets 3-4 relevant questions
- If no mapping exists, fall back to default general questions
- UI: `updateSuggestedQuestions()` function reads pageChips[pageSlug] on mount

### 4. Mobile UX Improvements (Item 8)

**Problem:** Chat panel is cramped on mobile; close button and form fields overlap on small screens.

**Solution:**
- Full-screen overlay on mobile (`<768px`): width 100%, height 100dvh, no border-radius
- Larger touch targets: buttons min 44px height, 48px for the chat toggle
- Bottom-sheet style input area: fixed at bottom, no squish
- Reduce padding/margins on small screens
- Prevent body scroll when chat is open (already implemented via `overflow: hidden`)
- Increase font size for readability on small screens

---

**Files to modify:**
- `src/components/Chatbot.astro` — all 4 features
- `netlify/functions/chat.mjs` — full context (history array)
- `src/data/chat-knowledge.json` — expanded knowledge + page chips
