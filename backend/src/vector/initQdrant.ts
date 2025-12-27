import { qdrant } from "./qdrantClient.js";

export async function initQdrant() {
  // PRODUCT CATALOG
  await qdrant.createCollection("product_catalog", {
    vectors: {
      size: 768,      // Gemini / OpenAI embedding size
      distance: "Cosine",
    },
  }).catch(() => {});

  // RFP CHUNKS
  await qdrant.createCollection("rfp_chunks", {
    vectors: {
      size: 1536,
      distance: "Cosine",
    },
  }).catch(() => {});

  console.log("✅ Qdrant collections ready");
}
