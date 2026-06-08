import knowledge from "../../src/data/chat-knowledge.json" with { type: "json" };

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.URL || "https://sbdmc.netlify.app";

function buildSystemPrompt(pageUrl) {
  let contextNote = "";
  if (pageUrl && knowledge.pages) {
    const match = Object.entries(knowledge.pages).find(([, path]) => path && pageUrl.includes(path));
    if (match) {
      const [label] = match;
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
