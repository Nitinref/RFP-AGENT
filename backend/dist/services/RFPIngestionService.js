import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { prisma } from "../prisma/index.js";
const COLLECTION_NAME = "rfp_chunks";
const VECTOR_SIZE = 1536;
const qdrant = new QdrantClient({
    url: "http://localhost:6333",
});
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
/* ---------------- ENSURE COLLECTION ---------------- */
async function ensureCollection() {
    try {
        await qdrant.getCollection(COLLECTION_NAME);
        console.log("✅ Qdrant collection exists");
    }
    catch (err) {
        if (err?.status === 404) {
            console.log("⚠️ Creating Qdrant collection...");
            await qdrant.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: "Cosine",
                },
            });
            console.log("🎉 Qdrant collection created");
        }
        else {
            throw err;
        }
    }
}
/* ---------------- INGEST SERVICE ---------------- */
export const rfpIngestionService = {
    async ingestRFP(rfpId) {
        console.log("🔥 ingestRFP STARTED:", rfpId);
        await ensureCollection();
        const chunks = await prisma.rFPDocumentChunk.findMany({
            where: { rfpId },
            orderBy: { chunkIndex: "asc" },
        });
        console.log("🧩 Chunks fetched:", chunks.length);
        if (!chunks.length)
            return;
        const embeddings = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunks.map((c) => c.content),
        });
        console.log("🧠 Embeddings created");
        /* 🔥 IMPORTANT: numeric IDs + correct shape */
        const points = chunks.map((chunk, i) => ({
            id: chunk.chunkIndex + 1, // ✅ NUMBER ONLY
            vector: embeddings.data[i].embedding, // ✅ correct
            payload: {
                rfpId,
                chunkIndex: chunk.chunkIndex,
                section: chunk.section,
                sectionType: chunk.sectionType,
                text: chunk.content,
            },
        }));
        await qdrant.upsert(COLLECTION_NAME, {
            points,
        });
        console.log(`🎉 Inserted ${points.length} vectors into Qdrant`);
    },
};
//# sourceMappingURL=RFPIngestionService.js.map