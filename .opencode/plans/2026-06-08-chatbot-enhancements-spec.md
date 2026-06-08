# Chatbot Enhancements Design

> **Status:** Design spec
> **Goal:** Add 7 features to the existing SBDMC chatbot to make it more helpful and engaging

## Architecture

All features are frontend-only additions to `src/components/Chatbot.astro` except page-aware context, which also modifies `netlify/functions/chat.mjs`. No new files needed. The component script block grows from ~100 to ~260 lines. Chat history and feedback use `localStorage` (no server-side storage).

## Features

### 1. Suggested Questions

4-5 clickable chip buttons shown below the greeting message. Each chip displays a common question; clicking it fills the input and triggers `sendMessage()` automatically.

**Questions:**
- "What are your rates?"
- "How do I register?"
- "What are the gate hours?"
- "What leasing incentives are available?"
- "Map and directions?"

**Implementation:** Static array in the `<script>` block. Chips rendered via `insertAdjacentHTML` after the greeting. Each chip gets a click handler that calls `sendMessage()` with that text.

### 2. Page-Aware Context

**Frontend:** Read `window.location.pathname` and include `pageUrl` in the POST body alongside `message`.

**API (`chat.mjs`):** Accept `pageUrl`, match against `knowledge.pages`. If matched, prepend context to the system prompt:
```
The user is currently on the "<label>" page.
Context: <description>
```

No match → no change in behavior.

### 3. Markdown Rendering

Simple inline renderer in JavaScript. No external dependencies.

**Pattern replacements (applied in order):**
1. Escape HTML entities first (`escapeHtml` on the raw reply)
2. `**text**` → `<strong>text</strong>`
3. `*text*` → `<em>text</em>`
4. `` `code` `` → `<code>code</code>`
5. `[text](url)` → `<a href="url" target="_blank" rel="noopener noreferrer">text</a>`
6. Lines starting with `- ` → wrap in `<li>`, consecutive items grouped in `<ul>`
7. `\n\n` → `</p><p>`, single `\n` → `<br>`
8. Wrap in `<p>` tags

Applied only to bot replies (user messages remain plain escaped text).

### 4. Chat History (localStorage)

**Structure (stored per key `sbdmc-chat-history`):**
```json
[
  { "role": "bot", "text": "Hi! I'm the SBDMC assistant...", "time": "2:34 PM" },
  { "role": "user", "text": "What are your rates?", "time": "2:35 PM" },
  { "role": "bot", "text": "Our current rates...", "time": "2:36 PM", "feedback": null }
]
```

**Behavior:**
- On each message add, serialize the full array to localStorage
- On page load, check localStorage → if data exists, restore and render (use greeting as fallback if empty)
- On clear, remove the key

### 5. Message Timestamps

`new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })` captured when each message is created. Displayed as 10px gray text below each message bubble (right-aligned for user, left-aligned for bot).

### 6. Clear Chat Button

Trash icon (🗑️) in the panel header, next to the status text. On click:
- Clear all messages from UI
- Remove `sbdmc-chat-history` from localStorage
- Re-render the greeting message
- Reset `msgCounter`

### 7. Feedback (Thumbs Up/Down)

👍/👎 buttons on each bot reply (not on user messages, not on the greeting). Stored in the chat history object under `feedback` (`"up"`, `"down"`, or `null`).

**Behavior:**
- Unselected feedback shows both buttons at 50% opacity
- Clicking one sets it to full opacity, stores in localStorage
- Clicking the same one toggles it off (back to null)
- Feedback is read-only after page reload (stored in history)

## Files Affected

| File | Change |
|------|--------|
| `src/components/Chatbot.astro` | All 7 features — script block grows from ~100 to ~260 lines |
| `netlify/functions/chat.mjs` | Accept `pageUrl`, inject page context into system prompt |

## Error Handling

- **localStorage unavailable** (private browsing, quota): Wrap all `getItem`/`setItem`/`removeItem` calls in try-catch. Features degrade gracefully — messages work, history just won't persist.
- **Suggested questions with API down**: Questions are shown regardless; clicking sends the message, error handling is unchanged.
- **Markdown edge cases**: Malformed `**text` (no closing) renders as-is. Nested patterns (bold inside link) not supported — keeps renderer simple and safe.
