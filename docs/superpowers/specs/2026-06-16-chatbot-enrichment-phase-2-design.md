# Chatbot Enrichment Phase 2 Design

> **Goal:** Expand the AI chatbot knowledge base for more comprehensive answers, and improve error handling/reliability for a smoother user experience.

## Spec Overview

Two independent improvements:
1. **Knowledge base expansion** — restructure and enrich `chat-knowledge.json` with categorized FAQs, infrastructure specs, rate ranges, procedures, park life, and regulations.
2. **Error handling & reliability** — enable input during API calls, add retry on failure, implement timeout, differentiate error types.

---

## Part 1: Knowledge Base Expansion

### Current State

The knowledge base at `src/data/chat-knowledge.json` is thin — 7 shallow FAQs, 6 incentive bullets, 3 service descriptions, and single-paragraph entries for leasing, registration, gate hours, locators, workforce, and map routes. The bot runs out of useful answers quickly.

### Target Structure

Restructure into categorized sections that mirror how real inquiries arrive:

**FAQs** — grouped by topic, expanded from 7 to ~25 entries:
- `leasing`: lease terms, unit sizes, rates, renewal, sub-leasing policy
- `registration`: steps, timeline, documents required, fees
- `operations`: gate hours, RFID process, visitor policy, truck entry rules, construction permits
- `living`: nearby housing, transport, banking, clinics, canteens, schools

**New sections:**

| Section | Content |
|---------|---------|
| `infrastructure` | Power (substation capacity, rate/kWh, provider), water (capacity, rate, provider), internet (available ISPs, speeds), road specs, drainage |
| `rates` | Lease rate ranges per sqm (warehouse vs office), utility estimate ranges, common fee types |
| `procedures` | RFID step-by-step, business registration detailed, construction/renovation permit, import/export guidelines |
| `locators` | Enriched profiles: industry, nationality, sqm occupied for Wistron, Taian, Taiwan Hitachi, TECO, Tong Lung |
| `parkLife` | Nearby amenities: clinics/hospitals, banks/ATMs, canteens, grocery stores, gyms, transport options, hotels |
| `regulations` | Environmental compliance, waste management, safety requirements, visitor/vehicle policies |

### Files to Modify

- **`src/data/chat-knowledge.json`** — rewrite structure, add all new content
- **`netlify/functions/chat.mjs`** — update `buildSystemPrompt()` to handle new structure (optional, mainly needed if paths change)

---

## Part 2: Error Handling & Reliability

### Current Problems

1. **Input disabled during API calls** — `sendBtn.disabled = true` at line 350, re-enabled at 412. Users can't type their next question while waiting.
2. **No retry** — if the API fails, the user must re-type their question from scratch.
3. **Vague errors** — "I'm a bit busy, please try again later" for all server errors, no distinction between network vs API vs timeout.
4. **No timeout** — the serverless function has no timeout limit; a slow API call can hang forever.
5. **Auto-contact on uncertainty** — already implemented (lines 396-398), but could be smarter.

### Proposed Changes

**In `src/components/Chatbot.astro`:**

1. **Enable input during API calls** — remove `sendBtn.disabled = true/false` around `sendMessage()`. Instead, track a `pending` flag to prevent duplicate sends but keep the input enabled.

2. **Retry button** — when a message fails (server error, network error, or timeout), show a small "↻ Retry" button next to or below the error bubble. Clicking it re-sends the last user message.

3. **Error display** — show different messages based on error:
   - Network error: "Connection lost. Check your internet and try again."
   - Server error (502): "The assistant is busy. Try again in a moment."
   - Timeout: "The assistant took too long. Tap retry to try again."

4. **Reset contact form trigger** — instead of auto-showing contact form on the first "I don't know," track consecutive failures. Show contact form only after 2+ consecutive failures in a row.

**In `netlify/functions/chat.mjs`:**

5. **Timeout** — use `AbortController` with a 25-second timeout on the OpenRouter fetch call.

6. **Error response structure** — return structured JSON to help the UI distinguish error types:
   ```json
   { "error": "timeout", "message": "Request timed out" }
   { "error": "api_error", "message": "..." }
   ```

### Files to Modify

- **`src/components/Chatbot.astro`** — input state management, retry button, error display, failure tracking
- **`netlify/functions/chat.mjs`** — AbortController timeout, structured error responses

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/data/chat-knowledge.json` | Modify | Restructure + expand content |
| `netlify/functions/chat.mjs` | Modify | Add timeout, structured error responses |
| `src/components/Chatbot.astro` | Modify | Input always enabled, retry button, better error display |

## Non-Goals

- No new UI components or dependencies
- No changes to the chatbot panel layout or styling
- No changes to the contact form or language system
- No analytics or feedback tracking
