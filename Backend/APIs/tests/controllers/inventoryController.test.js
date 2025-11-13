const request = require('supertest');
const app = require('../../src/app');
const Inventory = require('../../src/models/Inventory');

describe('Inventory Controller', () => {
    beforeEach(async () => {
        await Inventory.deleteMany({});
    });

    it('should list all inventory items', async () => {
        const response = await request(app).get('/api/inventory');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a specific inventory item', async () => {
        const inventoryItem = await Inventory.create({ name: 'Toothbrush', quantity: 100 });
        const response = await request(app).get(`/api/inventory/${inventoryItem._id}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Toothbrush');
    });

    it('should update stock levels', async () => {
        const inventoryItem = await Inventory.create({ name: 'Toothpaste', quantity: 50 });
        const response = await request(app)
            .put(`/api/inventory/${inventoryItem._id}`)
            .send({ quantity: 75 });
        expect(response.status).toBe(200);
        expect(response.body.quantity).toBe(75);
    });

    it('should retrieve low-stock items', async () => {
        await Inventory.create({ name: 'Floss', quantity: 5 });
        await Inventory.create({ name: 'Mouthwash', quantity: 20 });
        const response = await request(app).get('/api/inventory/low-stock');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe('Floss');
    });
});