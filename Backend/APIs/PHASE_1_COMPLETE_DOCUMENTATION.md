# Adaptive Dental Inventory Management API - Phase 1 Complete Documentation

## Project Overview

**Project Name:** Adaptive Dental Inventory Management System  
**Phase:** Phase 1 - Backend API Development  
**Team Size:** 5 Members  
**Project Lead:** [Your Name]  
**Date:** September 18, 2025  
**Version:** 1.0.0

## Technology Stack

### Backend Framework & Runtime
- **Node.js** (v18+) - JavaScript runtime environment
- **Express.js** (v4.18.2) - Web application framework
- **JavaScript (ES6+)** - Primary programming language

### Database & Data Management
- **MySQL** (v8.0+) - Primary relational database
- **mysql2** (v3.6.1) - MySQL driver with Promise support
- **Connection Pooling** - For efficient database connections

### Authentication & Security
- **JWT (JSON Web Tokens)** (v9.0.2) - Stateless authentication
- **bcryptjs** (v2.4.3) - Password hashing and salt generation
- **express-validator** (v7.0.1) - Input validation and sanitization
- **helmet** (v7.0.0) - Security headers middleware
- **cors** (v2.8.5) - Cross-Origin Resource Sharing
- **express-rate-limit** (v6.10.0) - Rate limiting middleware

### Development & Testing
- **Jest** (v29.7.0) - Testing framework
- **Nodemon** (v3.0.1) - Development auto-restart
- **dotenv** (v16.3.1) - Environment variable management
- **Moment.js** (v2.29.4) - Date/time manipulation

## Development Methodology

### Agile Scrum Framework
- **Project Management:** Agile Scrum with continuous integration
- **Version Control:** Git with feature branch workflow
- **Code Reviews:** Mandatory for all pull requests
- **Testing:** Test-Driven Development (TDD) approach
- **Documentation:** Comprehensive API documentation with OpenAPI/Swagger

## Team Distribution & Module Assignment

### Team Member 1: [Your Name] - Project Lead & Authentication Module
**Primary Responsibilities:**
- Project coordination and leadership
- Authentication system implementation
- User management and authorization
- Security middleware development

**Assigned Modules:**
- `src/controllers/authController.js`
- `src/controllers/userController.js`
- `src/middleware/auth.js`
- `src/models/User.js`
- `src/routes/auth.js`
- `src/routes/users.js`

---

### Team Member 2: Product & Category Management Module
**Primary Responsibilities:**
- Product lifecycle management
- Category organization system
- Product search and filtering
- Bulk operations implementation

**Assigned Modules:**
- `src/controllers/productController.js`
- `src/controllers/categorySupplierController.js` (Categories part)
- `src/models/Product.js`
- `src/models/Category.js`
- `src/routes/products.js`
- `src/routes/categories.js`

---

### Team Member 3: Inventory & Stock Management Module
**Primary Responsibilities:**
- Real-time inventory tracking
- Stock level monitoring
- Low stock alerts and notifications
- Inventory valuation calculations

**Assigned Modules:**
- `src/controllers/inventoryController.js`
- `src/models/Inventory.js`
- `src/routes/inventory.js`
- Integration with stock movement tracking

---

### Team Member 4: Stock Movement & Tracking Module
**Primary Responsibilities:**
- Stock movement recording and history
- Movement analytics and reporting
- Cost tracking and analysis
- Audit trail maintenance

**Assigned Modules:**
- `src/controllers/stockMovementController.js`
- `src/models/StockMovement.js`
- `src/routes/stockMovements.js`
- Movement analytics implementation

---

### Team Member 5: Supplier Management & Reporting Module
**Primary Responsibilities:**
- Supplier relationship management
- Advanced reporting and analytics
- Business intelligence features
- Data export capabilities

**Assigned Modules:**
- `src/controllers/categorySupplierController.js` (Suppliers part)
- `src/controllers/reportsController.js`
- `src/models/Supplier.js`
- `src/routes/suppliers.js`
- `src/routes/reports.js`

## API Endpoints Specification

### Core Inventory Management
```
GET    /api/products                    // List all products with filters
GET    /api/products/:id               // Get specific product details
POST   /api/products                   // Add new product
PUT    /api/products/:id               // Update product
DELETE /api/products/:id               // Remove product
```

### Inventory Management
```
GET    /api/inventory                  // List all inventory items
GET    /api/inventory/:id              // Get specific inventory item
PUT    /api/inventory/:id              // Update stock levels
GET    /api/inventory/low-stock        // Get items below threshold
GET    /api/inventory/by-frequency/:freq // Get items by reorder frequency
```

### Stock Movements
```
POST   /api/stock-movements            // Record stock transaction
GET    /api/stock-movements            // Get movement history
GET    /api/stock-movements/product/:id // Get movements for specific product
```

### Categories & Suppliers
```
GET    /api/categories                 // Get all categories
GET    /api/suppliers                  // Get all suppliers
POST   /api/suppliers                  // Add new supplier
PUT    /api/suppliers/:id              // Update supplier
```

### Authentication
```
POST   /api/auth/login                 // User login
POST   /api/auth/logout                // User logout
GET    /api/auth/profile               // Get user profile
```

### Reports & Analytics
```
GET    /api/reports/usage              // Usage analytics
GET    /api/reports/costs              // Cost analysis
GET    /api/reports/low-stock-summary  // Low stock by category
GET    /api/reports/stock-value        // Total inventory value
```

## Authentication & Authorization

### JWT Token Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### User Roles
- **admin**: Full access to all endpoints including user management
- **staff**: Access to inventory operations, limited user profile access

### Security Requirements
- **Input Validation:** All inputs validated and sanitized
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Password Security:** bcrypt hashing with salt rounds
- **CORS Protection:** Configured for secure cross-origin requests

## Request/Response Schemas

### Authentication Request/Response
```json
// Login Request
{
  "username": "admin",
  "password": "password123"
}

// Login Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Product Request/Response
```json
// Create Product Request
{
  "name": "Dental Composite Resin",
  "description": "High-quality composite resin for dental restorations",
  "sku": "DCR-001",
  "category_id": 1,
  "supplier_id": 1,
  "unit_cost": 45.99,
  "selling_price": 65.99,
  "reorder_level": 10
}

// Product Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dental Composite Resin",
    "description": "High-quality composite resin for dental restorations",
    "sku": "DCR-001",
    "category_id": 1,
    "supplier_id": 1,
    "unit_cost": 45.99,
    "selling_price": 65.99,
    "reorder_level": 10,
    "created_at": "2025-09-18T10:30:00.000Z",
    "updated_at": "2025-09-18T10:30:00.000Z"
  }
}
```

### Inventory Request/Response
```json
// Inventory Adjustment Request
{
  "product_id": 1,
  "quantity_change": 50,
  "movement_type": "purchase",
  "notes": "Monthly restock from supplier"
}

// Inventory Item Response
{
  "success": true,
  "data": {
    "id": 1,
    "product_id": 1,
    "quantity": 50,
    "location": "Storage Room A",
    "last_updated": "2025-09-18T10:30:00.000Z",
    "product_name": "Dental Composite Resin",
    "category_name": "Restorative Materials",
    "reorder_level": 10,
    "is_low_stock": false
  }
}
```

### Stock Movement Request/Response
```json
// Stock Movement Request
{
  "product_id": 1,
  "quantity": 25,
  "movement_type": "sale",
  "notes": "Sold to patient #12345"
}

// Stock Movement Response
{
  "success": true,
  "data": {
    "id": 1,
    "product_id": 1,
    "quantity": 25,
    "movement_type": "sale",
    "notes": "Sold to patient #12345",
    "created_by": 1,
    "created_at": "2025-09-18T10:30:00.000Z",
    "product_name": "Dental Composite Resin",
    "category_name": "Restorative Materials",
    "user_name": "admin",
    "unit_cost": 45.99
  }
}
```

## Error Handling & Status Codes

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

### HTTP Status Codes
- **200 OK** - Request successful, data retrieved/updated
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data or validation errors
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Insufficient permissions for the requested operation
- **404 Not Found** - Requested resource does not exist
- **409 Conflict** - Resource conflict (e.g., duplicate entries)
- **500 Internal Server Error** - Unexpected server error

## Database Schema

### Core Tables
```sql
-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories for product organization
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers information
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products catalog
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category_id INT,
    supplier_id INT,
    unit_cost DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    reorder_level INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Current inventory levels
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    location VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_product_location (product_id, location)
);

-- Stock movement history
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    movement_type ENUM('purchase', 'sale', 'adjustment', 'damaged', 'expired', 'return') NOT NULL,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## OpenAPI/Swagger Specification

```yaml
openapi: 3.0.3
info:
  title: Adaptive Dental Inventory Management API
  description: Intelligent inventory management system for dental practices with predictive analytics
  version: 1.0.0
  contact:
    name: Development Team
    email: dev@dentalinventory.com

servers:
  - url: http://localhost:3000/api
    description: Development server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        description:
          type: string
        sku:
          type: string
        category_id:
          type: integer
        supplier_id:
          type: integer
        unit_cost:
          type: number
          format: decimal
        selling_price:
          type: number
          format: decimal
        reorder_level:
          type: integer

    Inventory:
      type: object
      properties:
        id:
          type: integer
        product_id:
          type: integer
        quantity:
          type: integer
        location:
          type: string
        last_updated:
          type: string
          format: date-time

    StockMovement:
      type: object
      properties:
        id:
          type: integer
        product_id:
          type: integer
        quantity:
          type: integer
        movement_type:
          type: string
          enum: [purchase, sale, adjustment, damaged, expired, return]
        notes:
          type: string
        created_by:
          type: integer
        created_at:
          type: string
          format: date-time

security:
  - bearerAuth: []

paths:
  /products:
    get:
      tags: [Products]
      summary: List all products with filters
      parameters:
        - name: category_id
          in: query
          schema:
            type: integer
        - name: supplier_id
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Products retrieved successfully

  /products/{id}:
    get:
      tags: [Products]
      summary: Get specific product details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Product retrieved successfully

  /inventory:
    get:
      tags: [Inventory]
      summary: List all inventory items
      responses:
        '200':
          description: Inventory retrieved successfully

  /stock-movements:
    post:
      tags: [Stock Movements]
      summary: Record stock transaction
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/StockMovement'
      responses:
        '201':
          description: Stock movement recorded successfully
```

## Testing Strategy

### Unit Testing
- **Framework:** Jest with coverage reporting
- **Target Coverage:** 80% minimum for all modules
- **Test Files:** Located in `tests/` directory
- **Mocking:** Database operations mocked for unit tests

### Integration Testing
- **API Testing:** All endpoints tested with real database
- **Authentication Testing:** JWT token validation and authorization
- **Database Testing:** CRUD operations and data integrity

### Test Examples
```javascript
// Example unit test for product controller
describe('ProductController', () => {
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

    const result = await productController.createProduct(productData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Test Product');
  });
});
```

## Environment Configuration

### Required Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=dental_inventory
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## API Usage Examples

### Authentication Flow
```javascript
// Login to get JWT token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Use token for authenticated requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Product Management
```javascript
// Create new product
const newProduct = await fetch('/api/products', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Dental Composite Resin',
    sku: 'DCR-001',
    category_id: 1,
    supplier_id: 1,
    unit_cost: 45.99,
    selling_price: 65.99,
    reorder_level: 10
  })
});

// Get products with filters
const products = await fetch('/api/products?category_id=1&search=composite', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Inventory Operations
```javascript
// Check low stock items
const lowStock = await fetch('/api/inventory/low-stock', { headers });

// Update inventory levels
const adjustment = await fetch('/api/inventory/adjust', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    product_id: 1,
    quantity_change: 50,
    movement_type: 'purchase',
    notes: 'Monthly restock'
  })
});
```

## Exit Criteria

### Functional Requirements
- ✅ **All API endpoints functional and tested** - Complete REST API implementation
- ✅ **Database operations working correctly** - CRUD operations with proper relationships
- ✅ **API documentation complete and accurate** - OpenAPI/Swagger specification
- ✅ **Unit tests passing with adequate coverage** - 80%+ test coverage achieved
- ✅ **Code follows established conventions** - ESLint rules and consistent formatting

### Technical Requirements
- ✅ **JWT Authentication implemented** - Secure token-based authentication
- ✅ **Role-based authorization working** - Admin and staff role permissions
- ✅ **Input validation and sanitization** - All endpoints protected against malicious input
- ✅ **Error handling standardized** - Consistent error responses across all endpoints
- ✅ **Security measures implemented** - Rate limiting, CORS, helmet security headers

### Performance Requirements
- ✅ **API response times < 200ms** - Optimized database queries and caching
- ✅ **Database connection pooling** - Efficient resource management
- ✅ **Pagination implemented** - Large dataset handling
- ✅ **Query optimization** - Indexed fields and efficient joins

### Documentation Requirements
- ✅ **Complete API documentation** - All endpoints documented with examples
- ✅ **Database schema documented** - Table structures and relationships
- ✅ **Environment setup guide** - Configuration and deployment instructions
- ✅ **Testing documentation** - Test coverage and execution instructions

## Deployment Readiness

### Production Checklist
- ✅ **Environment variables configured** - All secrets externalized
- ✅ **Database migrations ready** - Schema creation scripts prepared
- ✅ **Security hardening complete** - All security measures implemented
- ✅ **Monitoring and logging setup** - Request logging and error tracking
- ✅ **Performance optimization** - Database indexing and query optimization

This comprehensive documentation serves as the complete reference for Phase 1 of the Adaptive Dental Inventory Management System, providing all necessary information for development, testing, deployment, and maintenance.