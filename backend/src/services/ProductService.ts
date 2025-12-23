import {prisma} from "../prisma/index.js";
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';

export class ProductService {
  async createProduct(data: {
    sku: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    specifications: Record<string, any>;
    datasheet?: string;
    certifications?: string[];
    standards?: string[];
    basePrice: number;
    currency?: string;
    manufacturer?: string;
    manufacturerPN?: string;
    leadTimeDays?: number;
    moq?: number;
  }) {
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

  async getProductBySKU(sku: string) {
    const product = await prisma.productSKU.findUnique({
      where: { sku },
      include: { pricingTiers: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    return product;
  }

  async listProducts(filters?: {
    category?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

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

  async updateProduct(sku: string, data: Partial<any>) {
    return prisma.productSKU.update({
      where: { sku },
      data,
    });
  }

  async deleteProduct(sku: string) {
    await prisma.productSKU.delete({
      where: { sku },
    });

    logger.info('Product deleted', { sku });
  }

  async addPricingTier(skuId: string, tier: {
    minQuantity: number;
    maxQuantity?: number;
    unitPrice: number;
    discount?: number;
  }) {
    return prisma.pricingTier.create({
      data: {
        skuId,
        ...tier,
      },
    });
  }

  async searchProducts(query: string) {
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

