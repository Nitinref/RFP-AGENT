export declare class RAGService {
    embed(text: string): Promise<number[]>;
    upsertRFPChunk({ id, vector, payload, }: {
        id: string;
        vector: number[];
        payload: {
            rfpId: string;
            sectionType: string;
            chunkIndex: number;
        };
    }): Promise<void>;
    searchRFPChunks(rfpId: string, query: string, limit?: number): Promise<string[]>;
}
export declare const ragService: RAGService;
