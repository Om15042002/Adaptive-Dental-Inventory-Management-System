const request = require('supertest');
const app = require('../src/app');

describe('Phase 1 API Compliance Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Login to get auth token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'password123'
            });
        
        if (loginResponse.status === 200) {
            authToken = loginResponse.body.data.token;
        }
    });

    describe('Health Check', () => {
        test('GET /health should return service status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Authentication Endpoints', () => {
        test('POST /api/auth/login should authenticate user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'password123'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });
    });

    describe('Product Endpoints', () => {
        test('GET /api/products should return products list', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.products)).toBe(true);
        });

        test('GET /api/products/frequency/Weekly should return weekly products', async () => {
            const response = await request(app)
                .get('/api/products/frequency/Weekly')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/products/frequency/Monthly should return monthly products', async () => {
            const response = await request(app)
                .get('/api/products/frequency/Monthly')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/products/frequency/Quarterly should return quarterly products', async () => {
            const response = await request(app)
                .get('/api/products/frequency/Quarterly')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/products/frequency/One-Time should return one-time products', async () => {
            const response = await request(app)
                .get('/api/products/frequency/One-Time')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Inventory Endpoints', () => {
        test('GET /api/inventory should return inventory list', async () => {
            const response = await request(app)
                .get('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/inventory/by-frequency/Weekly should return weekly inventory', async () => {
            const response = await request(app)
                .get('/api/inventory/by-frequency/Weekly')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/inventory/low-stock should return low stock items', async () => {
            const response = await request(app)
                .get('/api/inventory/low-stock')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Stock Movement Endpoints', () => {
        test('GET /api/stock-movements should return movements list', async () => {
            const response = await request(app)
                .get('/api/stock-movements')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/stock-movements should create new movement', async () => {
            const response = await request(app)
                .post('/api/stock-movements')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    product_id: 1,
                    quantity: -5,
                    movement_type: 'OUT',
                    notes: 'Test movement'
                });
            
            // May fail if no test data, but should not return 500
            expect(response.status).not.toBe(500);
        });
    });

    describe('Categories and Suppliers', () => {
        test('GET /api/categories should return categories', async () => {
            const response = await request(app)
                .get('/api/categories')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('GET /api/suppliers should return suppliers', async () => {
            const response = await request(app)
                .get('/api/suppliers')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Schema Compliance', () => {
        test('Product data should match schema requirements', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${authToken}`);
            
            if (response.body.data.products.length > 0) {
                const product = response.body.data.products[0];
                expect(product).toHaveProperty('id');
                expect(product).toHaveProperty('name');
                expect(product).toHaveProperty('category_id');
                expect(product).toHaveProperty('supplier_id');
                expect(product).toHaveProperty('unit_cost');
                expect(product).toHaveProperty('reorder_frequency');
                expect(['Weekly', 'Monthly', 'Quarterly', 'One-Time']).toContain(product.reorder_frequency);
            }
        });

        test('Inventory data should match schema requirements', async () => {
            const response = await request(app)
                .get('/api/inventory')
                .set('Authorization', `Bearer ${authToken}`);
            
            if (response.body.data.inventory.length > 0) {
                const inventory = response.body.data.inventory[0];
                expect(inventory).toHaveProperty('id');
                expect(inventory).toHaveProperty('product_id');
                expect(inventory).toHaveProperty('current_stock');
                expect(inventory).toHaveProperty('min_stock');
                expect(inventory).toHaveProperty('max_stock');
                expect(inventory).toHaveProperty('last_updated');
            }
        });

        test('Stock movement data should match schema requirements', async () => {
            const response = await request(app)
                .get('/api/stock-movements')
                .set('Authorization', `Bearer ${authToken}`);
            
            if (response.body.data.movements.length > 0) {
                const movement = response.body.data.movements[0];
                expect(movement).toHaveProperty('id');
                expect(movement).toHaveProperty('product_id');
                expect(movement).toHaveProperty('quantity');
                expect(movement).toHaveProperty('movement_type');
                expect(['IN', 'OUT']).toContain(movement.movement_type);
                expect(movement).toHaveProperty('created_at');
            }
        });
    });
});