# Request/Response Schemas & Error Handling

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

// Register Request
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "staff"
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

// Product List Response
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Dental Composite Resin",
        "sku": "DCR-001",
        "category_name": "Restorative Materials",
        "supplier_name": "Dental Supply Co.",
        "unit_cost": 45.99,
        "selling_price": 65.99,
        "reorder_level": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "pages": 1
    }
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

// Low Stock Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Dental Composite Resin",
      "quantity": 5,
      "reorder_level": 10,
      "category_name": "Restorative Materials",
      "supplier_name": "Dental Supply Co."
    }
  ]
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

// Movement History Response
{
  "success": true,
  "data": {
    "movements": [
      {
        "id": 1,
        "product_name": "Dental Composite Resin",
        "quantity": 25,
        "movement_type": "sale",
        "notes": "Sold to patient #12345",
        "user_name": "admin",
        "created_at": "2025-09-18T10:30:00.000Z",
        "total_value": 1149.75
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1
    }
  }
}
```

### Category & Supplier Request/Response
```json
// Category Request
{
  "name": "Restorative Materials",
  "description": "Materials used for dental restorations"
}

// Category Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Restorative Materials",
    "description": "Materials used for dental restorations",
    "product_count": 15,
    "created_at": "2025-09-18T10:30:00.000Z"
  }
}

// Supplier Request
{
  "name": "Dental Supply Co.",
  "contact_person": "John Smith",
  "email": "contact@dentalsupply.com",
  "phone": "+1-555-0123",
  "address": "123 Supply Street, City, State 12345"
}

// Supplier Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dental Supply Co.",
    "contact_person": "John Smith",
    "email": "contact@dentalsupply.com",
    "phone": "+1-555-0123",
    "address": "123 Supply Street, City, State 12345",
    "product_count": 25,
    "created_at": "2025-09-18T10:30:00.000Z"
  }
}
```

### Reports & Analytics Response
```json
// Usage Analytics Response
{
  "success": true,
  "data": {
    "period": "last_30_days",
    "most_used_products": [
      {
        "product_name": "Dental Composite Resin",
        "usage_count": 15,
        "total_quantity": 375
      }
    ],
    "movement_trends": [
      {
        "date": "2025-09-18",
        "movements_count": 8,
        "total_value": 2250.50
      }
    ],
    "cost_analysis": {
      "total_purchases": 15000.00,
      "total_sales": 22500.00,
      "net_movement_value": 7500.00
    }
  }
}

// Dashboard Stats Response
{
  "success": true,
  "data": {
    "total_products": 150,
    "total_inventory_value": 15750.50,
    "low_stock_items": 12,
    "recent_movements": 25,
    "categories_count": 8,
    "suppliers_count": 5
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

#### Success Codes
- **200 OK** - Request successful, data retrieved/updated
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no content to return

#### Client Error Codes
- **400 Bad Request** - Invalid request data or validation errors
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Insufficient permissions for the requested operation
- **404 Not Found** - Requested resource does not exist
- **409 Conflict** - Resource conflict (e.g., duplicate entries)

#### Server Error Codes
- **500 Internal Server Error** - Unexpected server error
- **503 Service Unavailable** - Service temporarily unavailable

### Error Examples

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "sku",
      "message": "SKU must be unique"
    },
    {
      "field": "unit_cost",
      "message": "Unit cost must be a positive number"
    }
  ],
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401,
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required.",
  "statusCode": 403,
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "message": "Product not found",
  "statusCode": 404,
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

#### Conflict Error (409)
```json
{
  "success": false,
  "message": "Username already exists",
  "statusCode": 409,
  "timestamp": "2025-09-18T10:30:00.000Z"
}
```

## Data Validation Rules

### Common Validation Patterns
```javascript
// Username validation
{
  "field": "username",
  "rules": {
    "required": true,
    "minLength": 3,
    "maxLength": 50,
    "pattern": "^[a-zA-Z0-9_]+$"
  }
}

// Email validation
{
  "field": "email",
  "rules": {
    "required": true,
    "format": "email",
    "unique": true
  }
}

// Price validation
{
  "field": "unit_cost",
  "rules": {
    "required": true,
    "type": "decimal",
    "minimum": 0.01,
    "precision": 2
  }
}

// Enum validation
{
  "field": "movement_type",
  "rules": {
    "required": true,
    "enum": ["purchase", "sale", "adjustment", "damaged", "expired", "return"]
  }
}
```

### Field-Specific Validation
- **SKU:** Must be unique across all products
- **Email:** Must be valid email format and unique
- **Phone:** Must match international phone number pattern
- **Quantity:** Must be positive integer for stock movements
- **Dates:** Must be valid ISO 8601 date format
- **IDs:** Must reference existing records (foreign key validation)