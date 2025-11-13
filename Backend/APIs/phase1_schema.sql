-- Simple database initialization for Phase 1 compliance
-- This creates the exact schema as specified in your requirements

-- Create database (run this manually if needed)
-- CREATE DATABASE dental_inventory;
-- USE dental_inventory;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table with exact schema requirements
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    supplier_id INT,
    unit_cost DECIMAL(8,2) DEFAULT 0.00,
    reorder_frequency ENUM('Weekly', 'Monthly', 'Quarterly', 'One-Time') DEFAULT 'Monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Inventory table with exact schema requirements
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    max_stock INT NOT NULL DEFAULT 100,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock movements table with simplified schema (IN/OUT only)
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL,
    movement_type ENUM('IN', 'OUT') NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic categories for dental practice
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Consumables & Disposables', 'Single-use items and disposable supplies'),
(2, 'Clinical Instruments', 'Reusable dental instruments and tools'),
(3, 'Medications & Anesthetics', 'Pharmaceutical products and anesthetics'),
(4, 'Prosthodontics', 'Prosthetic dental materials and supplies'),
(5, 'Orthodontics', 'Orthodontic materials and appliances');

-- Insert basic suppliers
INSERT IGNORE INTO suppliers (id, name, email, phone) VALUES
(1, 'Dental Supply Co', 'orders@dentalsupply.com', '555-0001'),
(2, 'MedEquip Inc', 'sales@medequip.com', '555-0002'),
(3, 'ProDental', 'info@prodental.com', '555-0003');

-- Insert sample products
INSERT IGNORE INTO products (id, name, category_id, supplier_id, unit_cost, reorder_frequency) VALUES
(1, 'Disposable Gloves (Box)', 1, 1, 25.99, 'Weekly'),
(2, 'Surgical Masks (Box)', 1, 1, 15.50, 'Weekly'),
(3, 'Local Anesthetic 2% Lidocaine', 3, 2, 45.00, 'Monthly'),
(4, 'Dental Burs (High-Speed)', 2, 1, 2.50, 'Monthly'),
(5, 'Impression Material', 4, 2, 75.00, 'Quarterly'),
(6, 'Orthodontic Brackets', 5, 3, 125.00, 'Quarterly'),
(7, 'Dental Chair Unit', 2, 2, 25000.00, 'One-Time'),
(8, 'Cotton Rolls', 1, 1, 8.99, 'Weekly'),
(9, 'Composite Filling Material', 1, 1, 89.99, 'Monthly'),
(10, 'Periodontal Probe', 2, 1, 45.00, 'Quarterly');

-- Insert inventory records
INSERT IGNORE INTO inventory (product_id, current_stock, min_stock, max_stock) VALUES
(1, 15, 20, 50),  -- Low stock - needs reorder
(2, 25, 10, 30),
(3, 8, 5, 15),
(4, 45, 30, 100),
(5, 5, 3, 10),
(6, 12, 8, 25),
(7, 1, 0, 1),
(8, 8, 15, 40),   -- Low stock - needs reorder  
(9, 6, 5, 12),
(10, 3, 2, 8);

-- Insert sample stock movements
INSERT IGNORE INTO stock_movements (product_id, quantity, movement_type, notes) VALUES
(1, -5, 'OUT', 'Used during morning procedures'),
(2, 10, 'IN', 'New shipment received'),
(3, -2, 'OUT', 'Emergency procedure'),
(4, -10, 'OUT', 'Routine dental work'),
(8, -7, 'OUT', 'Daily procedures'),
(9, 5, 'IN', 'Restocked composite material');

-- Insert sample users (passwords are hashed for 'password123')
INSERT IGNORE INTO users (username, email, password, role) VALUES
('admin', 'admin@dentalclinic.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewA5pUWjlJKJhHGu', 'admin'),
('staff1', 'staff@dentalclinic.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewA5pUWjlJKJhHGu', 'staff');

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_frequency ON products(reorder_frequency);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(movement_type);

-- Create view for low stock items
CREATE OR REPLACE VIEW low_stock_view AS
SELECT 
    p.id,
    p.name,
    c.name as category,
    i.current_stock,
    i.min_stock,
    s.name as supplier,
    p.unit_cost
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE i.current_stock <= i.min_stock;