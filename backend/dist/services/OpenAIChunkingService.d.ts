export type Chunk = {
    title: string;
    category: "TECHNICAL" | "COMMERCIAL" | "LEGAL" | "OTHER";
    content: string;
};
export declare function openaiChunk(text: string): Promise<Chunk[]>;
