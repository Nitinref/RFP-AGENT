import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export async function geminiChunk(text) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });
    const prompt = `
You are an expert RFP analyst.

Split the following RFP text into meaningful chunks.

Rules:
- One chunk = one requirement or section
- Do NOT break sentences
- Category must be one of: TECHNICAL, COMMERCIAL, LEGAL, OTHER
- Return ONLY valid JSON (no markdown)

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
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error("Gemini did not return array");
    }
    return parsed.map((c) => ({
        title: String(c.title),
        category: c.category,
        content: String(c.content),
    }));
}
//# sourceMappingURL=GeminiChunkingService.js.map