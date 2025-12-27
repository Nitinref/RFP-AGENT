import OpenAI from "openai";
import { safeJsonParse } from "../utils/safeJsonParse.js";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export async function openaiChunk(text) {
    const safeText = text.slice(0, 6000);
    const prompt = `
Split the following RFP text into structured chunks.

Rules:
- One chunk = one requirement or section
- Do NOT break sentences
- Category must be one of: TECHNICAL, COMMERCIAL, LEGAL, OTHER
- Output ONLY valid JSON array
- No markdown, no explanations

JSON format:
[
  {
    "title": "Section title",
    "category": "TECHNICAL",
    "content": "Text content"
  }
]

RFP TEXT:
${safeText}
`;
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: "You are a strict JSON generator. Output valid JSON only. No extra text.",
            },
            { role: "user", content: prompt },
        ],
    });
    const raw = response.choices[0].message.content;
    if (!raw)
        throw new Error("OpenAI returned empty response");
    const parsed = safeJsonParse(raw);
    if (!parsed || !Array.isArray(parsed)) {
        throw new Error("Invalid JSON chunk response from OpenAI");
    }
    return parsed;
}
//# sourceMappingURL=OpenAIChunkingService.js.map