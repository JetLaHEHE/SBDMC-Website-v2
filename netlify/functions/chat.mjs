import knowledge from "../../src/data/chat-knowledge.json" with { type: "json" };
import translations from "../../src/data/chat-translations.json" with { type: "json" };

const SUPPORTED_LANGUAGES = ["en", "tl", "zh", "ko", "ja"];
const LANGUAGE_NAMES = { en: "English", tl: "Tagalog", zh: "Chinese", ko: "Korean", ja: "Japanese" };

function normalizeLanguage(lang) {
  if (!lang) return "en";
  const prefix = lang.slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(prefix) ? prefix : "en";
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.URL || "https://sbdmc.netlify.app";

function buildSystemPrompt(pageUrl, language) {
  let contextNote = "";
  if (pageUrl && knowledge.pages) {
    const match = Object.entries(knowledge.pages).find(([, path]) => path && pageUrl.includes(path));
    if (match) {
      const [pageKey] = match;
      contextNote = `\nThe user is currently on the "${pageKey}" page of the SBDMC website.`;
    }
  }
  const lang = normalizeLanguage(language);
  const langName = LANGUAGE_NAMES[lang] || "English";
  const langInstruction = lang === "en" ? "" : `\nIMPORTANT: The user wrote in ${langName}. You MUST respond in ${langName}. Translate your answer from the English knowledge base into ${langName}.`;
  return `You are the SBDMC assistant for Subic Bay Gateway Park.
Answer questions ONLY using the knowledge provided below. If you don't know the answer, say "I'm not sure — please contact our team at inquiry@sbdmc.com or visit sbdmcinc.freshdesk.com/support/home."

Knowledge base:
${JSON.stringify(knowledge, null, 2)}${contextNote}${langInstruction}`;
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
