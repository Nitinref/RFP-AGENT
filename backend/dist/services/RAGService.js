import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export class RAGService {
    async embed(text) {
        const res = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        const embedding = res.data[0].embedding;
        console.log("🔢 Embedding size:", embedding.length); // should be 1536
        return embedding;
    }
    async upsertRFPChunk({ id, vector, payload, }) {
        try {
            await qdrant.upsert('rfp_chunks', {
                wait: true, // 🔥 VERY IMPORTANT
                points: [
                    {
                        id,
                        vector,
                        payload,
                    },
                ],
            });
            console.log('✅ Qdrant upsert success:', id);
        }
        catch (error) {
            console.error('❌ Qdrant upsert failed:', error);
            throw error;
        }
    }
    async searchRFPChunks(rfpId, query, limit = 8) {
        const vector = await this.embed(query);
        const result = await qdrant.search('rfp_chunks', {
            vector,
            limit,
            filter: {
                must: [{ key: 'rfpId', match: { value: rfpId } }],
            },
        });
        return result
            .map(r => String(r.id)) // 🔥 FORCE string
            .filter(Boolean);
    }
}
export const ragService = new RAGService();
//# sourceMappingURL=RAGService.js.map