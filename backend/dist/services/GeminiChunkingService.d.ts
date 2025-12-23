export declare function geminiChunk(text: string): Promise<{
    title: string;
    category: "TECHNICAL" | "COMMERCIAL" | "LEGAL" | "OTHER";
    content: string;
}[]>;
