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

  try {
    const body = JSON.parse(event.body);
    const { type, name, email, message, company, phone, unit, position, coverLetter, pageUrl, language } = body;

    const validTypes = ["general", "leasing_inquiry", "job_application", "newsletter"];
    const submissionType = validTypes.includes(type) ? type : "general";

    if (submissionType === "newsletter") {
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email is required" }) };
      }
    } else {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Name is required" }) };
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email is required" }) };
      }
    }

    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

    if (webhookUrl) {
      const payload = {
        type: submissionType,
        name: name?.trim() || "",
        email: email?.trim() || "",
        company: company?.trim() || "",
        phone: phone?.trim() || "",
        unit: unit?.trim() || "",
        position: position?.trim() || "",
        coverLetter: coverLetter?.trim() || "",
        message: message?.trim() || "",
        pageUrl: pageUrl || "",
        language: language || "en",
        timestamp: new Date().toISOString(),
      };
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error("Contact function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Something went wrong. Please try again." }) };
  }
}
