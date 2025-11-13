# Database Schema & OpenAPI Specification

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

### Database Indexes for Performance
```sql
-- Product indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_name ON products(name);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- Stock movements indexes
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_movements_date ON stock_movements(created_at);
CREATE INDEX idx_movements_user ON stock_movements(created_by);

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### Sample Data Inserts
```sql
-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Restorative Materials', 'Materials used for dental restorations'),
('Preventive Care', 'Products for preventive dental care'),
('Surgical Instruments', 'Tools and instruments for dental surgery'),
('Orthodontic Supplies', 'Materials for orthodontic treatments'),
('Endodontic Materials', 'Root canal and endodontic supplies');

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Dental Supply Co.', 'John Smith', 'contact@dentalsupply.com', '+1-555-0123', '123 Supply Street, City, State 12345'),
('MedDent Solutions', 'Jane Doe', 'info@meddsolutions.com', '+1-555-0456', '456 Medical Ave, City, State 67890'),
('ProDental Inc.', 'Bob Johnson', 'sales@prodental.com', '+1-555-0789', '789 Dental Plaza, City, State 13579');

-- Insert sample users
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@dentalclinic.com', '$2b$12$hashedpassword1', 'admin'),
('staff1', 'staff1@dentalclinic.com', '$2b$12$hashedpassword2', 'staff'),
('staff2', 'staff2@dentalclinic.com', '$2b$12$hashedpassword3', 'staff');

-- Insert sample products
INSERT INTO products (name, description, sku, category_id, supplier_id, unit_cost, selling_price, reorder_level) VALUES
('Dental Composite Resin', 'High-quality composite resin for dental restorations', 'DCR-001', 1, 1, 45.99, 65.99, 10),
('Fluoride Varnish', 'Professional fluoride varnish for cavity prevention', 'FV-002', 2, 2, 25.50, 40.00, 15),
('Surgical Scaler', 'Precision surgical scaler for dental procedures', 'SS-003', 3, 3, 125.00, 180.00, 5);

-- Insert sample inventory
INSERT INTO inventory (product_id, quantity, location) VALUES
(1, 25, 'Storage Room A'),
(2, 40, 'Storage Room A'),
(3, 8, 'Surgical Suite');

-- Insert sample stock movements
INSERT INTO stock_movements (product_id, quantity, movement_type, notes, created_by) VALUES
(1, 50, 'purchase', 'Initial stock purchase', 1),
(1, 25, 'sale', 'Used for patient treatments', 2),
(2, 60, 'purchase', 'Monthly restock', 1),
(2, 20, 'sale', 'Preventive care treatments', 2),
(3, 10, 'purchase', 'New surgical instruments', 1),
(3, 2, 'sale', 'Surgical procedures', 3);
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
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.dentalinventory.com/api
    description: Production server

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from login endpoint

  schemas:
    # Base Response Schemas
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        message:
          type: string
          example: "Operation completed successfully"
        data:
          type: object
        timestamp:
          type: string
          format: date-time

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: "Error description"
        statusCode:
          type: integer
          example: 400
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              message:
                type: string
        timestamp:
          type: string
          format: date-time

    # Authentication Schemas
    LoginRequest:
      type: object
      required:
        - username
        - password
      properties:
        username:
          type: string
          example: "admin"
        password:
          type: string
          format: password
          example: "password123"

    AuthResponse:
      allOf:
        - $ref: '#/components/schemas/SuccessResponse'
        - type: object
          properties:
            data:
              type: object
              properties:
                token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                user:
                  $ref: '#/components/schemas/User'

    # User Schema
    User:
      type: object
      properties:
        id:
          type: integer
          example: 1
        username:
          type: string
          example: "john_doe"
        email:
          type: string
          format: email
          example: "john@example.com"
        role:
          type: string
          enum: [admin, staff]
          example: "staff"
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    # Product Schemas
    Product:
      type: object
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: "Dental Composite Resin"
        description:
          type: string
          example: "High-quality composite resin for dental restorations"
        sku:
          type: string
          example: "DCR-001"
        category_id:
          type: integer
          example: 1
        supplier_id:
          type: integer
          example: 1
        unit_cost:
          type: number
          format: decimal
          example: 45.99
        selling_price:
          type: number
          format: decimal
          example: 65.99
        reorder_level:
          type: integer
          example: 10
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    ProductRequest:
      type: object
      required:
        - name
        - sku
        - category_id
        - supplier_id
        - unit_cost
        - selling_price
        - reorder_level
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 255
        description:
          type: string
          maxLength: 1000
        sku:
          type: string
          minLength: 3
          maxLength: 50
        category_id:
          type: integer
          minimum: 1
        supplier_id:
          type: integer
          minimum: 1
        unit_cost:
          type: number
          format: decimal
          minimum: 0.01
        selling_price:
          type: number
          format: decimal
          minimum: 0.01
        reorder_level:
          type: integer
          minimum: 0

    # Inventory Schemas
    Inventory:
      type: object
      properties:
        id:
          type: integer
          example: 1
        product_id:
          type: integer
          example: 1
        quantity:
          type: integer
          example: 50
        location:
          type: string
          example: "Storage Room A"
        last_updated:
          type: string
          format: date-time
        product_name:
          type: string
          example: "Dental Composite Resin"
        category_name:
          type: string
          example: "Restorative Materials"
        reorder_level:
          type: integer
          example: 10
        is_low_stock:
          type: boolean
          example: false

    # Stock Movement Schemas
    StockMovement:
      type: object
      properties:
        id:
          type: integer
          example: 1
        product_id:
          type: integer
          example: 1
        quantity:
          type: integer
          example: 10
        movement_type:
          type: string
          enum: [purchase, sale, adjustment, damaged, expired, return]
          example: "purchase"
        notes:
          type: string
          example: "Weekly restocking"
        created_by:
          type: integer
          example: 1
        created_at:
          type: string
          format: date-time
        product_name:
          type: string
          example: "Dental Composite Resin"
        user_name:
          type: string
          example: "john_doe"

    StockMovementRequest:
      type: object
      required:
        - product_id
        - quantity
        - movement_type
        - notes
      properties:
        product_id:
          type: integer
          minimum: 1
        quantity:
          type: integer
          minimum: 1
        movement_type:
          type: string
          enum: [purchase, sale, adjustment, damaged, expired, return]
        notes:
          type: string
          minLength: 1
          maxLength: 500

security:
  - bearerAuth: []

paths:
  # Authentication Endpoints
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      description: Authenticate user and return JWT token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # Product Endpoints
  /products:
    get:
      tags: [Products]
      summary: List all products with filters
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 50
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
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/SuccessResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          products:
                            type: array
                            items:
                              $ref: '#/components/schemas/Product'
                          pagination:
                            type: object

    post:
      tags: [Products]
      summary: Create new product
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductRequest'
      responses:
        '201':
          description: Product created successfully
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/SuccessResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/Product'

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Products
    description: Product management operations
  - name: Inventory
    description: Inventory tracking and management
  - name: Stock Movements
    description: Stock movement recording and analytics
  - name: Categories
    description: Product category management
  - name: Suppliers
    description: Supplier management operations
  - name: Reports
    description: Analytics and reporting
```

## Database Relationships

### Entity Relationship Diagram (ERD)
```
Users (1) ----< (M) Stock_Movements
Categories (1) ----< (M) Products
Suppliers (1) ----< (M) Products
Products (1) ----< (M) Inventory
Products (1) ----< (M) Stock_Movements
```

### Foreign Key Constraints
- `products.category_id` → `categories.id`
- `products.supplier_id` → `suppliers.id`
- `inventory.product_id` → `products.id`
- `stock_movements.product_id` → `products.id`
- `stock_movements.created_by` → `users.id`

### Data Integrity Rules
- **Cascade Delete:** Not enabled to prevent accidental data loss
- **Referential Integrity:** All foreign keys must reference valid records
- **Unique Constraints:** SKU, username, email must be unique
- **Check Constraints:** Quantities and prices must be non-negative