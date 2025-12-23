import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
export class RAGService {

  async embed(text: string): Promise<number[]> {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return res.data[0].embedding;
  }

  async upsertRFPChunk({ id, vector, payload }: {
    id: string;
    vector: number[];
    payload: {
      rfpId: string;
      sectionType: string;
      chunkIndex: number;
    };
  }) {
    await qdrant.upsert('rfp_chunks', {
      points: [{ id, vector, payload }],
    });
  }

  async searchRFPChunks(rfpId: string, query: string, limit = 8) {
    const vector = await this.embed(query);

    const result = await qdrant.search('rfp_chunks', {
      vector,
      limit,
      filter: {
        must: [{ key: 'rfpId', match: { value: rfpId } }],
      },
    });

    return result.map(r => r.id as string);
  }
}

export const ragService = new RAGService();
