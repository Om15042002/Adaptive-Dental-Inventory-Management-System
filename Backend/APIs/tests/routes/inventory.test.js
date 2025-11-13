const request = require('supertest');
const app = require('../../src/app');
const Inventory = require('../../src/models/Inventory');

describe('Inventory Routes', () => {
    beforeAll(async () => {
        await Inventory.deleteMany(); // Clear the inventory before tests
    });

    it('should create a new inventory item', async () => {
        const res = await request(app)
            .post('/api/inventory')
            .send({
                name: 'Toothbrush',
                quantity: 100,
                reorderFrequency: 30
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Toothbrush');
    });

    it('should list all inventory items', async () => {
        const res = await request(app).get('/api/inventory');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get a specific inventory item', async () => {
        const inventoryItem = await Inventory.create({
            name: 'Toothpaste',
            quantity: 50,
            reorderFrequency: 15
        });

        const res = await request(app).get(`/api/inventory/${inventoryItem.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toBe('Toothpaste');
    });

    it('should update stock levels of an inventory item', async () => {
        const inventoryItem = await Inventory.create({
            name: 'Floss',
            quantity: 30,
            reorderFrequency: 20
        });

        const res = await request(app)
            .put(`/api/inventory/${inventoryItem.id}`)
            .send({ quantity: 40 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.quantity).toBe(40);
    });

    it('should delete an inventory item', async () => {
        const inventoryItem = await Inventory.create({
            name: 'Mouthwash',
            quantity: 20,
            reorderFrequency: 10
        });

        const res = await request(app).delete(`/api/inventory/${inventoryItem.id}`);
        expect(res.statusCode).toEqual(204);
    });

    it('should retrieve low-stock items', async () => {
        await Inventory.create({ name: 'Gauze', quantity: 5, reorderFrequency: 5 });
        const res = await request(app).get('/api/inventory/low-stock');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});