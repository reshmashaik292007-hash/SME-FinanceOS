import Anthropic from "@anthropic-ai/sdk";

let client = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function callClaude({ systemPrompt, userPrompt }) {
  const c = getClient();
  if (!c) return null;

  try {
    const msg = await c.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });
    const text = msg.content[0]?.text ?? "";
    // Try parse JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return text;
  } catch (err) {
    console.error("Claude API error:", err?.message);
    return null;
  }
}
