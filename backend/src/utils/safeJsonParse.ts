export function safeJsonParse(raw: string) {
  if (!raw) return null;

  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
}
