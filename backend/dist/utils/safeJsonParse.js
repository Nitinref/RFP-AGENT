export function safeJsonParse(raw) {
    if (!raw)
        return null;
    try {
        const cleaned = raw
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleaned);
    }
    catch (err) {
        return null;
    }
}
//# sourceMappingURL=safeJsonParse.js.map