import { prisma } from "../prisma/index.js";
async function main() {
    console.log('🌱 Starting database seed...');
    console.log('Creating users...');
    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@company.com' },
            update: {},
            create: {
                email: 'admin@company.com',
                name: 'System Administrator',
                role: 'ADMIN',
                department: 'IT',
                isActive: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'sales@company.com' },
            update: {},
            create: {
                email: 'sales@company.com',
                name: 'Sales Manager',
                role: 'SALES',
                department: 'Sales',
                isActive: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'technical@company.com' },
            update: {},
            create: {
                email: 'technical@company.com',
                name: 'Technical Lead',
                role: 'TECHNICAL',
                department: 'Engineering',
                isActive: true,
            },
        }),
    ]);
    console.log(`✅ Created ${users.length} users`);
    console.log('Creating product catalog...');
    const products = await Promise.all([
        prisma.productSKU.upsert({
            where: { sku: 'SENSOR-001-IP67' },
            update: {},
            create: {
                sku: 'SENSOR-001-IP67',
                name: 'Industrial Temperature Sensor Pro',
                description: 'High-precision temperature sensor for industrial applications',
                category: 'Sensors',
                subcategory: 'Temperature',
                specifications: {
                    type: 'Thermocouple',
                    voltage: '24V DC',
                    temperature_range: '-40°C to 125°C',
                    accuracy: '±0.5°C',
                    ip_rating: 'IP67',
                    output: '4-20mA',
                    material: 'Stainless Steel 316',
                },
                basePrice: 245.00,
                currency: 'USD',
                isActive: true,
                leadTimeDays: 14,
                moq: 10,
                certifications: ['CE', 'UL', 'ATEX', 'ISO9001'],
                standards: ['IEC 61508', 'EN 60947-5-2'],
                manufacturer: 'IndustrialTech Corp',
                manufacturerPN: 'ITC-TS-001',
                tags: ['industrial', 'temperature', 'high-precision'],
            },
        }),
        prisma.productSKU.upsert({
            where: { sku: 'SENSOR-002-IP65' },
            update: {},
            create: {
                sku: 'SENSOR-002-IP65',
                name: 'Industrial Pressure Sensor Standard',
                description: 'Reliable pressure sensor for general industrial use',
                category: 'Sensors',
                subcategory: 'Pressure',
                specifications: {
                    type: 'Piezoresistive',
                    voltage: '12-36V DC',
                    pressure_range: '0-250 bar',
                    accuracy: '±0.25%',
                    ip_rating: 'IP65',
                    output: '0-10V',
                    material: 'Stainless Steel 304',
                },
                basePrice: 189.00,
                currency: 'USD',
                isActive: true,
                leadTimeDays: 10,
                moq: 20,
                certifications: ['CE', 'UL', 'ISO9001'],
                standards: ['IEC 61508'],
                manufacturer: 'IndustrialTech Corp',
                manufacturerPN: 'ITC-PS-002',
                tags: ['industrial', 'pressure', 'standard'],
            },
        }),
        prisma.productSKU.upsert({
            where: { sku: 'VALVE-003-DN50' },
            update: {},
            create: {
                sku: 'VALVE-003-DN50',
                name: 'Automated Control Valve DN50',
                description: 'Pneumatic control valve for process automation',
                category: 'Valves',
                subcategory: 'Control Valves',
                specifications: {
                    type: 'Pneumatic',
                    size: 'DN50 (2 inch)',
                    pressure_rating: 'PN16',
                    temperature_range: '-10°C to 200°C',
                    material_body: 'Carbon Steel',
                    material_trim: 'Stainless Steel 316',
                    actuator: 'Pneumatic Spring Return',
                },
                basePrice: 875.00,
                currency: 'USD',
                isActive: true,
                leadTimeDays: 21,
                moq: 5,
                certifications: ['CE', 'API 609', 'ISO9001'],
                standards: ['API 609', 'EN 12266'],
                manufacturer: 'ValveTech Industries',
                manufacturerPN: 'VTI-CV-050',
                tags: ['valve', 'automation', 'control'],
            },
        }),
        prisma.productSKU.upsert({
            where: { sku: 'PLC-004-MODULAR' },
            update: {},
            create: {
                sku: 'PLC-004-MODULAR',
                name: 'Industrial PLC Controller Modular System',
                description: 'Programmable Logic Controller with modular I/O',
                category: 'Controllers',
                subcategory: 'PLCs',
                specifications: {
                    type: 'Modular PLC',
                    cpu: '32-bit ARM Cortex',
                    memory: '512MB RAM, 4GB Flash',
                    io_capacity: 'Up to 2048 I/O points',
                    communication: ['Ethernet', 'Modbus TCP', 'Profinet'],
                    programming: 'IEC 61131-3',
                    power: '24V DC',
                    operating_temp: '-20°C to 60°C',
                },
                basePrice: 1850.00,
                currency: 'USD',
                isActive: true,
                leadTimeDays: 28,
                moq: 1,
                certifications: ['CE', 'UL', 'cULus', 'ISO9001'],
                standards: ['IEC 61131-3', 'IEC 61508'],
                manufacturer: 'AutoControl Systems',
                manufacturerPN: 'ACS-PLC-M100',
                tags: ['plc', 'controller', 'automation', 'modular'],
            },
        }),
        prisma.productSKU.upsert({
            where: { sku: 'CABLE-005-FLEX' },
            update: {},
            create: {
                sku: 'CABLE-005-FLEX',
                name: 'Industrial Flex Cable 4x1.5mm²',
                description: 'Flexible industrial cable for moving applications',
                category: 'Cables',
                subcategory: 'Power Cables',
                specifications: {
                    type: 'Flexible',
                    cores: 4,
                    cross_section: '1.5mm²',
                    voltage_rating: '600V',
                    temperature_range: '-40°C to 80°C',
                    outer_diameter: '9.5mm',
                    material_insulation: 'PVC',
                    material_sheath: 'PVC',
                },
                basePrice: 4.50,
                currency: 'USD',
                isActive: true,
                leadTimeDays: 7,
                moq: 100,
                certifications: ['CE', 'UL', 'RoHS'],
                standards: ['IEC 60227', 'VDE 0281'],
                manufacturer: 'CablePro International',
                manufacturerPN: 'CPI-FC-415',
                tags: ['cable', 'flexible', 'power'],
            },
        }),
    ]);
    console.log(`✅ Created ${products.length} products`);
    console.log('Creating pricing tiers...');
    const pricingTiers = await Promise.all([
        prisma.pricingTier.create({
            data: {
                skuId: products[0].id,
                minQuantity: 10,
                maxQuantity: 49,
                unitPrice: 245.00,
                discount: 0,
            },
        }),
        prisma.pricingTier.create({
            data: {
                skuId: products[0].id,
                minQuantity: 50,
                maxQuantity: 99,
                unitPrice: 220.50,
                discount: 10,
            },
        }),
        prisma.pricingTier.create({
            data: {
                skuId: products[0].id,
                minQuantity: 100,
                maxQuantity: null,
                unitPrice: 196.00,
                discount: 20,
            },
        }),
        prisma.pricingTier.create({
            data: {
                skuId: products[1].id,
                minQuantity: 20,
                maxQuantity: 99,
                unitPrice: 189.00,
                discount: 0,
            },
        }),
        prisma.pricingTier.create({
            data: {
                skuId: products[1].id,
                minQuantity: 100,
                maxQuantity: null,
                unitPrice: 170.10,
                discount: 10,
            },
        }),
    ]);
    console.log(`✅ Created ${pricingTiers.length} pricing tiers`);
    console.log('Creating sample RFP...');
    const sampleRFP = await prisma.rFP.create({
        data: {
            rfpNumber: 'RFP-2024-DEMO-001',
            title: 'Industrial Automation System Upgrade',
            description: 'Procurement of sensors, controllers, and related equipment',
            issuer: 'ACME Manufacturing Corp',
            industry: 'Manufacturing',
            source: 'UPLOAD',
            submissionDeadline: new Date('2025-02-28T23:59:59Z'),
            clarificationDeadline: new Date('2025-02-14T23:59:59Z'),
            priority: 'HIGH',
            status: 'NEW',
            estimatedValue: 150000,
            currency: 'USD',
            region: 'North America',
            tags: ['automation', 'sensors', 'controls', 'manufacturing'],
        },
    });
    console.log(`✅ Created sample RFP: ${sampleRFP.rfpNumber}`);
    console.log('');
    console.log('🎉 Database seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Pricing Tiers: ${pricingTiers.length}`);
    console.log(`   Sample RFPs: 1`);
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@company.com');
    console.log('   Sales: sales@company.com');
    console.log('   Technical: technical@company.com');
    console.log('');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map