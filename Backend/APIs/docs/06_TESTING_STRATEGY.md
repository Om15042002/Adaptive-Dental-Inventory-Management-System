# Testing Strategy & Implementation Guide

## Testing Strategy

### Testing Framework & Tools
- **Unit Testing:** Jest with coverage reporting
- **Integration Testing:** Supertest for API endpoint testing
- **Database Testing:** In-memory SQLite for isolated tests
- **Mocking:** Jest mocks for external dependencies
- **Coverage Target:** 80% minimum for all modules

### Test Structure
```
tests/
├── unit/
│   ├── models/
│   │   ├── User.test.js
│   │   ├── Product.test.js
│   │   ├── Inventory.test.js
│   │   └── StockMovement.test.js
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── productController.test.js
│   │   ├── inventoryController.test.js
│   │   └── stockMovementController.test.js
│   └── middleware/
│       ├── auth.test.js
│       └── validation.test.js
├── integration/
│   ├── auth.integration.test.js
│   ├── products.integration.test.js
│   ├── inventory.integration.test.js
│   └── stockMovements.integration.test.js
└── setup/
    ├── testDb.js
    ├── testHelpers.js
    └── mockData.js
```

### Unit Testing Examples

#### Product Controller Test
```javascript
// tests/unit/controllers/productController.test.js
const productController = require('../../../src/controllers/productController');
const Product = require('../../../src/models/Product');
const { formatResponse } = require('../../../src/utils/helpers');

// Mock dependencies
jest.mock('../../../src/models/Product');
jest.mock('../../../src/utils/helpers');

describe('ProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { userId: 1, role: 'staff' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    test('should create new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        category_id: 1,
        supplier_id: 1,
        unit_cost: 10.00,
        selling_price: 15.00,
        reorder_level: 5
      };

      req.body = productData;

      const mockProduct = { id: 1, ...productData };
      Product.create.mockResolvedValue(mockProduct);
      formatResponse.mockReturnValue({
        success: true,
        data: mockProduct,
        message: 'Product created successfully'
      });

      await productController.createProduct(req, res);

      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle validation errors', async () => {
      req.body = { name: 'Test' }; // Missing required fields

      Product.create.mockRejectedValue(new Error('Validation failed'));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAllProducts', () => {
    test('should retrieve products with pagination', async () => {
      req.query = { page: 1, limit: 10 };

      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ];

      Product.findAll.mockResolvedValue(mockProducts);

      await productController.getAllProducts(req, res);

      expect(Product.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filters: {}
      });
      expect(res.json).toHaveBeenCalled();
    });
  });
});
```

#### Authentication Middleware Test
```javascript
// tests/unit/middleware/auth.test.js
const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('../../../src/middleware/auth');
const User = require('../../../src/models/User');

jest.mock('jsonwebtoken');
jest.mock('../../../src/models/User');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    test('should authenticate valid JWT token', async () => {
      const token = 'valid-jwt-token';
      const decoded = { userId: 1, username: 'testuser' };
      const user = { id: 1, username: 'testuser', role: 'staff' };

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(decoded);
      User.findById.mockResolvedValue(user);

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });

    test('should reject invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    test('should allow admin access', () => {
      req.user = { role: 'admin' };

      const middleware = authorize(['admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should deny staff access to admin-only resource', () => {
      req.user = { role: 'staff' };

      const middleware = authorize(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Testing Examples

#### Products API Integration Test
```javascript
// tests/integration/products.integration.test.js
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/database');
const { setupTestDb, cleanupTestDb, createTestUser } = require('../setup/testHelpers');

describe('Products API Integration', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await setupTestDb();
    testUser = await createTestUser({ role: 'staff' });
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.username,
        password: 'testpassword'
      });
    
    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  describe('POST /api/products', () => {
    test('should create new product with valid data', async () => {
      const productData = {
        name: 'Integration Test Product',
        sku: 'ITP-001',
        category_id: 1,
        supplier_id: 1,
        unit_cost: 25.99,
        selling_price: 39.99,
        reorder_level: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.sku).toBe(productData.sku);
    });

    test('should reject duplicate SKU', async () => {
      const productData = {
        name: 'Duplicate SKU Product',
        sku: 'ITP-001', // Same SKU as above
        category_id: 1,
        supplier_id: 1,
        unit_cost: 15.99,
        selling_price: 24.99,
        reorder_level: 5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('SKU already exists');
    });
  });

  describe('GET /api/products', () => {
    test('should retrieve products with filters', async () => {
      const response = await request(app)
        .get('/api/products?category_id=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });
  });
});
```

### Test Database Setup

#### Test Helpers
```javascript
// tests/setup/testHelpers.js
const db = require('../../src/config/database');
const bcrypt = require('bcryptjs');

async function setupTestDb() {
  // Create test tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS test_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff') DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS test_categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT
    )
  `);

  // Insert test data
  await db.execute(`
    INSERT INTO test_categories (name, description) VALUES
    ('Test Category', 'Test category description'),
    ('Test Category 2', 'Another test category')
  `);
}

async function cleanupTestDb() {
  await db.execute('DROP TABLE IF EXISTS test_users');
  await db.execute('DROP TABLE IF EXISTS test_categories');
  await db.execute('DROP TABLE IF EXISTS test_products');
  await db.execute('DROP TABLE IF EXISTS test_inventory');
  await db.execute('DROP TABLE IF EXISTS test_stock_movements');
}

async function createTestUser(userData = {}) {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword',
    role: 'staff'
  };

  const user = { ...defaultUser, ...userData };
  const passwordHash = await bcrypt.hash(user.password, 12);

  const [result] = await db.execute(`
    INSERT INTO test_users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `, [user.username, user.email, passwordHash, user.role]);

  return { ...user, id: result.insertId };
}

module.exports = {
  setupTestDb,
  cleanupTestDb,
  createTestUser
};
```

### Mock Data
```javascript
// tests/setup/mockData.js
const mockProducts = [
  {
    id: 1,
    name: 'Mock Product 1',
    sku: 'MOCK-001',
    category_id: 1,
    supplier_id: 1,
    unit_cost: 10.00,
    selling_price: 15.00,
    reorder_level: 5
  },
  {
    id: 2,
    name: 'Mock Product 2',
    sku: 'MOCK-002',
    category_id: 2,
    supplier_id: 2,
    unit_cost: 20.00,
    selling_price: 30.00,
    reorder_level: 10
  }
];

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'staff1',
    email: 'staff1@test.com',
    role: 'staff'
  }
];

const mockInventory = [
  {
    id: 1,
    product_id: 1,
    quantity: 25,
    location: 'Storage A'
  },
  {
    id: 2,
    product_id: 2,
    quantity: 50,
    location: 'Storage B'
  }
];

module.exports = {
  mockProducts,
  mockUsers,
  mockInventory
};
```

## Test Execution Commands

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:ci": "jest --coverage --watchAll=false"
  }
}
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ]
};
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/stock-movements"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            product_id: 1
            quantity: 5
            movement_type: "sale"
            notes: "Load test movement"
```

### Testing Best Practices
1. **Isolated Tests:** Each test should be independent
2. **Mock External Dependencies:** Database, external APIs
3. **Test Data Management:** Use factories for consistent test data
4. **Error Scenarios:** Test both success and failure cases
5. **Performance Assertions:** Include response time validations
6. **Security Testing:** Test authentication and authorization
7. **Data Cleanup:** Ensure tests don't affect each other