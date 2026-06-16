# Knowledge Base Enrichment Phase 3 Design

**Goal:** Add all missing site content to the chatbot knowledge base so it can answer questions about company history, advantages, incentives, lease options, business services, and RFID details.

**Content additions to `src/data/chat-knowledge.json`:**
- `aboutDetails` — SBDMC history (est. 1994, SBMA+UDC Taiwan joint venture), mission, vision
- `advantages` — 6 more advantages from other-reasons.json
- `incentivesDetailed` — structured tax, customs/trade, and investment incentives with specific numbers (4-6yr holiday, 5% rate, 100% foreign ownership, free repatriation, flexible foreign national rules)
- `leaseOptions` — 4 lease types (warehouse 500-5K sqm, manufacturing custom, office flex, land) and how-to-lease steps
- `businessServices` — 6 services (registration assistance, utility connection, security, maintenance, e-billing, helpdesk)
- `rfid` — fees (PHP 1K/300), 1yr validity, PHP 300 replacement fee, PHP 15K damage penalty, requirements by category, dos/donts, usage guidelines

**Architecture:** Single-file change. `chat.mjs` already passes the full JSON to the AI via `JSON.stringify(knowledge)`, so new structure keys are automatically available.
