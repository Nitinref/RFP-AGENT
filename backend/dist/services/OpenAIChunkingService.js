import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export async function openaiChunk(text) {
    const prompt = `
You are an expert RFP analyst.

Split the following RFP text into meaningful chunks.

Rules:
- One chunk = one requirement or section
- Do NOT break sentences
- Category must be one of: TECHNICAL, COMMERCIAL, LEGAL, OTHER
- Return ONLY valid JSON
- NO markdown
- NO explanations

JSON format:
[
  {
    "title": "Section title",
    "category": "TECHNICAL",
    "content": "Text content"
  }
]

RFP TEXT:
${text}
`;
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
    });
    const raw = response.choices[0].message.content;
    if (!raw)
        throw new Error("OpenAI returned empty response");
    return JSON.parse(raw);
}
//# sourceMappingURL=OpenAIChunkingService.js.map