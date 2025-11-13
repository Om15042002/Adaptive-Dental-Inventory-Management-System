# API Endpoints & Authentication

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
- **hygienist**: Access to inventory operations, limited user profile access

### Security Requirements
- **Input Validation:** All inputs validated and sanitized
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Password Security:** bcrypt hashing with salt rounds
- **CORS Protection:** Configured for secure cross-origin requests

### Role-Based Access Control

#### Admin Role (`admin`)
- **Full API Access:** All endpoints
- **User Management:** Create, read, update, delete users
- **System Configuration:** Modify system settings
- **Reports:** Access to all analytics and reports

#### Staff Role (`staff`)
- **Limited Access:** Inventory operations only
- **Profile Management:** Own profile only
- **Data Operations:** Create, read, update inventory/products
- **Reports:** Read-only access to reports

### Protected Endpoints

#### Admin Only
- `POST /api/auth/register` - Create new users
- `GET /api/users` - List all users
- `PUT /api/users/{id}` - Update user information
- `DELETE /api/users/{id}` - Delete users

#### Authenticated Users (Admin + Staff)
- All other endpoints require valid JWT token
- Profile endpoints allow users to manage their own data

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

### Stock Movement Tracking
```javascript
// Record stock movement
const movement = await fetch('/api/stock-movements', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    product_id: 1,
    quantity: 25,
    movement_type: 'sale',
    notes: 'Sold to patient #12345'
  })
});

// Get movement analytics
const analytics = await fetch('/api/stock-movements/analytics?period=last_30_days', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Input Validation Rules

### Authentication
- **Username:** 3-50 characters, alphanumeric and underscore
- **Email:** Valid email format, unique in system
- **Password:** Minimum 6 characters, contain letters and numbers

### Products
- **SKU:** 3-50 characters, unique in system
- **Price:** Positive decimal values only
- **Reorder Level:** Non-negative integers

### Stock Movements
- **Quantity:** Positive integers for all movement types
- **Movement Type:** Must be one of predefined enum values
- **Notes:** Required, 1-500 characters

### Rate Limiting
- **General Endpoints:** 100 requests per 15 minutes per IP
- **Authentication:** 5 login attempts per 15 minutes per IP
- **Bulk Operations:** 10 requests per minute per user

### Data Sanitization
- **HTML Escape:** All text inputs sanitized for XSS prevention
- **SQL Injection:** Parameterized queries used throughout
- **File Uploads:** Not supported in Phase 1 (future feature)