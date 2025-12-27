import { qdrant } from "../vector/qdrantClient.js";
import { v4 as uuid } from "uuid";
// TEMP embedding function (abhi dummy)
function fakeEmbedding(text) {
    return Array(768).fill(0).map(() => Math.random());
}
export class ProductIngestionService {
    async ingestProducts() {
        const products = [
            {
                sku: "VALVE-DN50",
                description: "Automated control valve DN50, SS304, PN16",
            },
            {
                sku: "TEMP-SENSOR-PRO",
                description: "Industrial temperature sensor -40 to 200C",
            },
            {
                sku: "PRESSURE-SENSOR-STD",
                description: "Industrial pressure sensor 0–10 bar",
            },
        ];
        for (const product of products) {
            const vector = fakeEmbedding(product.description);
            await qdrant.upsert("product_catalog", {
                points: [
                    {
                        id: uuid(),
                        vector,
                        payload: product,
                    },
                ],
            });
            console.log(`✅ Product indexed: ${product.sku}`);
        }
    }
}
//# sourceMappingURL=ProductIngestionService.js.map