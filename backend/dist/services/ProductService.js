import { prisma } from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
export class ProductService {
    async createProduct(data) {
        logger.info('Creating product', { sku: data.sku });
        const existing = await prisma.productSKU.findUnique({
            where: { sku: data.sku },
        });
        if (existing) {
            throw new Error(`Product with SKU ${data.sku} already exists`);
        }
        return prisma.productSKU.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }
    async getProductBySKU(sku) {
        const product = await prisma.productSKU.findUnique({
            where: { sku },
            include: { pricingTiers: true },
        });
        if (!product) {
            throw new NotFoundError('Product');
        }
        return product;
    }
    async listProducts(filters) {
        const where = {};
        if (filters?.category)
            where.category = filters.category;
        if (filters?.isActive !== undefined)
            where.isActive = filters.isActive;
        const [products, total] = await Promise.all([
            prisma.productSKU.findMany({
                where,
                take: filters?.limit || 50,
                skip: filters?.offset || 0,
                include: { pricingTiers: true },
            }),
            prisma.productSKU.count({ where }),
        ]);
        return { products, total };
    }
    async updateProduct(sku, data) {
        return prisma.productSKU.update({
            where: { sku },
            data,
        });
    }
    async deleteProduct(sku) {
        await prisma.productSKU.delete({
            where: { sku },
        });
        logger.info('Product deleted', { sku });
    }
    async addPricingTier(skuId, tier) {
        return prisma.pricingTier.create({
            data: {
                skuId,
                ...tier,
            },
        });
    }
    async searchProducts(query) {
        return prisma.productSKU.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                ],
                isActive: true,
            },
            take: 20,
        });
    }
}
export default new ProductService();
//# sourceMappingURL=ProductService.js.map