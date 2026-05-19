import type { MemoryStory } from "./types";

const SYSTEM = `You read receipt photos and turn them into warm, specific one-line memories.
Return ONLY valid JSON with these keys:
- merchant (string)
- amount (string, include currency symbol if visible)
- date (string, human-readable)
- category (string, 2-4 words, e.g. "Food & friends")
- emoji (single emoji that fits the vibe)
- storyLine (one sentence, past tense, personal journal tone — not corporate, not generic)`;

export async function storyFromReceipt(
  imageBase64: string,
  mimeType: string,
): Promise<MemoryStory> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Read this receipt and write the memory JSON.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content) as MemoryStory;
  return {
    merchant: String(parsed.merchant ?? "Unknown"),
    amount: String(parsed.amount ?? "—"),
    date: String(parsed.date ?? "Recently"),
    category: String(parsed.category ?? "Life"),
    emoji: String(parsed.emoji ?? "🧾").slice(0, 8),
    storyLine: String(parsed.storyLine ?? "A small moment, remembered."),
  };
}
