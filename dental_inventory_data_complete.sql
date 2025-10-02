-- Complete Sample Data for All Dental Inventory Items

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Consumables & Disposables', 'Single-use items and disposable supplies'),
('Clinical Instruments', 'Reusable dental instruments and tools'),
('Medications & Anesthetics', 'Pharmaceutical products and anesthetics'),
('Prosthodontics', 'Prosthetic dental materials and supplies'),
('Orthodontics', 'Orthodontic materials and appliances'),
('Patient Comfort & Office', 'Patient comfort items and office supplies'),
('Capital Equipment', 'Major equipment and machinery'),
('Sterilization & Infection Control', 'Sterilization and infection control supplies'),
('Laboratory Equipment', 'Dental laboratory equipment and materials'),
('Emergency & First Aid', 'Emergency medical supplies'),
('General Office Supplies', 'Administrative and office supplies'),
('Administrative & Business Essentials', 'Business and administrative materials'),
('Diagnostic & Imaging', 'Diagnostic and imaging supplies'),
('Endodontic', 'Root canal and endodontic materials');

-- Insert suppliers
INSERT INTO suppliers (name, email, phone) VALUES
('Dental Supply Co', 'orders@dentalsupply.com', '555-0001'),
('MedEquip Inc', 'sales@medequip.com', '555-0002'),
('ProDental', 'info@prodental.com', '555-0003'),
('Patterson Dental', 'orders@patterson.com', '555-0004'),
('Henry Schein', 'sales@henryschein.com', '555-0005'),
('Benco Dental', 'orders@benco.com', '555-0006');

-- Insert ALL products from your comprehensive list
INSERT INTO products (name, category_id, supplier_id, unit_cost, reorder_frequency) VALUES
-- Weekly Items (High Priority)
('Gloves (various sizes)', 1, 1, 25.99, 'Weekly'),
('Masks (procedural)', 1, 1, 15.50, 'Weekly'),
('Syringe, Local Anesthetic, 2% Lidocaine', 3, 2, 45.00, 'Weekly'),
('Dental Dam', 1, 1, 12.75, 'Weekly'),
('Resin Composite Kit', 1, 1, 89.99, 'Weekly'),
('Burs (High-Speed)', 2, 1, 2.50, 'Weekly'),
('Burs (Low-Speed)', 2, 1, 2.25, 'Weekly'),
('Gauze', 1, 1, 18.50, 'Weekly'),
('Patient Bibs', 1, 1, 14.99, 'Weekly'),
('Anesthetics (various)', 3, 2, 35.00, 'Weekly'),
('Dental Floss & Threaders', 1, 1, 8.99, 'Weekly'),
('Paper towels', 1, 1, 12.50, 'Weekly'),
('Gauze pads', 1, 1, 18.50, 'Weekly'),
('Nitrous Oxide', 3, 2, 125.00, 'Weekly'),
('Saliva Ejectors', 1, 1, 0.15, 'Weekly'),
('Disinfectant Wipes', 8, 1, 8.99, 'Weekly'),
('PPE (Personal Protective Equipment)', 8, 1, 15.99, 'Weekly'),
('Saliva Ejector Tips', 1, 1, 0.12, 'Weekly'),
('Air/Water Syringe Tips', 1, 1, 0.10, 'Weekly'),
('Surgical Aspirator Tips', 1, 2, 0.25, 'Weekly'),
('Tray Covers', 1, 1, 12.99, 'Weekly'),
('Headrest Covers', 1, 1, 11.99, 'Weekly'),
('Cups (patient)', 1, 1, 0.25, 'Weekly'),
('Patient Bib Clips', 6, 1, 0.50, 'Weekly'),
('Syringes (disposable)', 1, 1, 0.35, 'Weekly'),
('Needles (disposable)', 1, 2, 0.45, 'Weekly'),
('Disinfectant Solution', 8, 1, 25.00, 'Weekly'),

-- Monthly Items (Medium Priority)
('Cotton Rolls', 1, 1, 8.99, 'Monthly'),
('Gauze Sponges (various sizes)', 1, 1, 18.50, 'Monthly'),
('Prophy Paste', 1, 1, 22.99, 'Monthly'),
('Alginate Impression Material', 1, 2, 35.00, 'Monthly'),
('Cements & Bonding Agents', 1, 1, 65.99, 'Monthly'),
('Patient Bibs', 1, 1, 14.99, 'Monthly'),
('Amalgam', 1, 1, 85.00, 'Monthly'),
('Impression Trays', 1, 2, 4.50, 'Monthly'),
('Prophy Angles', 1, 1, 0.75, 'Monthly'),
('Dental Adhesives', 1, 1, 45.99, 'Monthly'),
('Patient Goody Bags', 6, 1, 2.50, 'Monthly'),
('Cotton Swabs', 1, 1, 5.99, 'Monthly'),
('Articulating Paper', 1, 1, 12.50, 'Monthly'),
('Patient Handheld Mirrors', 2, 1, 3.50, 'Monthly'),
('Surgical Blades', 2, 2, 1.25, 'Monthly'),
('Sterilization Pouches', 8, 1, 25.99, 'Monthly'),
('Autoclave Solution', 8, 1, 35.00, 'Monthly'),
('Handpiece Lubricants', 1, 1, 18.50, 'Monthly'),
('Suction Traps', 1, 1, 2.25, 'Monthly'),
('Microbrushes', 1, 1, 15.99, 'Monthly'),
('Fluoride Varnish', 1, 1, 1.25, 'Monthly'),
('Adhesives (Prosthodontics)', 4, 2, 25.00, 'Monthly'),
('Denture Brushes', 4, 1, 3.50, 'Monthly'),
('Elastic Bands', 5, 2, 8.99, 'Monthly'),
('Orthodontic Wax', 5, 2, 12.50, 'Monthly'),
('Printer Paper', 11, 1, 45.00, 'Monthly'),
('Cleaning Supplies', 11, 1, 35.00, 'Monthly'),
('Printer Ink/Toner', 11, 1, 85.00, 'Monthly'),
('Appointment Cards', 12, 1, 25.00, 'Monthly'),
('Patient Handheld Mirrors', 6, 1, 3.50, 'Monthly'),
('Alloys', 4, 2, 125.00, 'Monthly'),
('Ceramics', 4, 2, 95.00, 'Monthly'),
('Adhesive (Orthodontics)', 5, 2, 35.00, 'Monthly'),
('X-Ray Film/Plates', 13, 2, 65.00, 'Monthly'),
('Dental Burs', 2, 1, 2.50, 'Monthly'),
('Scalpels', 2, 2, 1.25, 'Monthly'),
('Prophylaxis Paste', 1, 1, 22.99, 'Monthly'),
('Dental Cement', 1, 1, 65.99, 'Monthly'),
('Bleaching Trays', 4, 2, 8.50, 'Monthly'),
('Teeth Whitening Gels', 4, 2, 45.00, 'Monthly'),
('Impression Materials', 4, 2, 75.00, 'Monthly'),
('Crown & Bridge Materials', 4, 2, 125.00, 'Monthly'),
('Retraction Cord', 1, 1, 25.00, 'Monthly'),
('Gingival Retraction', 1, 1, 35.00, 'Monthly'),
('Distilled Water', 8, 1, 8.50, 'Monthly'),

-- Quarterly Items (Low Priority)
('Periodontal Probes', 2, 1, 45.00, 'Quarterly'),
('Scalers (various types)', 2, 1, 55.00, 'Quarterly'),
('Forceps (various types)', 2, 1, 125.00, 'Quarterly'),
('Patient Handheld Mirrors', 6, 1, 3.50, 'Quarterly'),
('Retainers & Retainer Cases', 5, 2, 25.00, 'Quarterly'),
('Dentures & Adhesives', 4, 2, 150.00, 'Quarterly'),
('Surgical Scissors', 2, 1, 75.00, 'Quarterly'),
('Patient Goody Bags', 6, 1, 2.50, 'Quarterly'),
('Dental Mirrors', 2, 1, 15.00, 'Quarterly'),
('Sickle Probes (Dental Explorer)', 2, 1, 25.00, 'Quarterly'),
('Curettes', 2, 1, 45.00, 'Quarterly'),
('Pliers', 2, 1, 35.00, 'Quarterly'),
('Excavators', 2, 1, 30.00, 'Quarterly'),
('Chisels', 2, 1, 40.00, 'Quarterly'),
('Spore Testing Kits', 8, 2, 45.00, 'Quarterly'),
('Gypsum', 9, 2, 35.00, 'Quarterly'),
('Dental Stone', 9, 2, 40.00, 'Quarterly'),
('Waxes', 9, 1, 25.00, 'Quarterly'),
('First Aid Kits', 10, 2, 85.00, 'Quarterly'),
('Emergency Medications', 10, 2, 125.00, 'Quarterly'),
('Dentures', 4, 2, 150.00, 'Quarterly'),
('Retainers', 5, 2, 25.00, 'Quarterly'),
('Brackets & Chains', 5, 2, 65.00, 'Quarterly'),
('Office Pens', 11, 1, 15.00, 'Quarterly'),
('Paper Clips', 11, 1, 8.50, 'Quarterly'),
('Business Cards', 12, 1, 45.00, 'Quarterly'),
('Patient Education Materials', 12, 1, 35.00, 'Quarterly'),
('Marketing Brochures', 12, 1, 25.00, 'Quarterly'),
('Crown & Bridge Removers', 2, 2, 125.00, 'Quarterly'),
('Endodontic Files', 2, 2, 3.50, 'Quarterly'),
('Ultrasonic Scaler Tips', 2, 2, 25.00, 'Quarterly'),
('Mixing Bowls', 9, 2, 15.00, 'Quarterly'),
('Wax Tools', 9, 2, 35.00, 'Quarterly'),
('Amalgam Carriers', 2, 2, 25.00, 'Quarterly'),
('Endodontic Instruments', 2, 2, 85.00, 'Quarterly'),
('Implant Kits', 2, 2, 450.00, 'Quarterly'),
('Retractors', 2, 2, 45.00, 'Quarterly'),
('Molds', 4, 2, 65.00, 'Quarterly'),
('Wires (Orthodontics)', 5, 2, 35.00, 'Quarterly'),
('Cheek Retractors', 5, 2, 25.00, 'Quarterly'),
('Face Masks (Orthodontics)', 5, 2, 15.00, 'Quarterly'),
('Film Holders', 13, 2, 45.00, 'Quarterly'),
('Developing Chemicals', 13, 2, 85.00, 'Quarterly'),
('Cotton Pliers', 2, 1, 25.00, 'Quarterly'),
('Waiting Room Magazines', 6, 1, 125.00, 'Quarterly'),
('First Aid Supplies', 10, 2, 65.00, 'Quarterly'),
('Medical Gauze', 10, 2, 25.00, 'Quarterly'),
('IV Supplies', 10, 2, 125.00, 'Quarterly'),
('Suction Hoses', 1, 1, 45.00, 'Quarterly'),
('Endodontic Files', 14, 2, 3.50, 'Quarterly'),
('Obturation Materials', 14, 2, 85.00, 'Quarterly'),
('Gutta-Percha Points', 14, 2, 25.00, 'Quarterly'),
('Paper Points', 14, 2, 18.50, 'Quarterly'),
('Dental Spatulas', 2, 1, 15.00, 'Quarterly'),
('Amalgam Pluggers', 2, 1, 25.00, 'Quarterly'),
('Amalgam Condensers', 2, 1, 25.00, 'Quarterly'),
('Hemostat', 2, 1, 35.00, 'Quarterly'),
('Mouth Prop', 2, 1, 12.50, 'Quarterly'),

-- One-Time Items (Capital Equipment)
('Sterilizer (Autoclave)', 7, 2, 15000.00, 'One-Time'),
('Dental Chair Unit', 7, 2, 25000.00, 'One-Time'),
('X-Ray Imaging Equipment', 7, 2, 45000.00, 'One-Time'),
('Dental Microscope', 7, 2, 35000.00, 'One-Time'),
('Reception Desk & Chairs', 6, 1, 2500.00, 'One-Time'),
('Computer/Monitor for Operatory', 6, 1, 1500.00, 'One-Time'),
('Lab Handpieces', 9, 2, 2500.00, 'One-Time'),
('Model Trimmers', 9, 2, 1800.00, 'One-Time'),
('Polishing Equipment', 9, 2, 3500.00, 'One-Time'),
('AED (Automated External Defibrillator)', 10, 2, 2500.00, 'One-Time'),
('Emergency Oxygen Supply', 10, 2, 850.00, 'One-Time'),
('Dental Drills', 7, 2, 8500.00, 'One-Time'),
('Light Curing Units', 7, 2, 1250.00, 'One-Time'),
('Patient Chairs', 7, 2, 3500.00, 'One-Time'),
('Sterilization Unit', 7, 2, 12000.00, 'One-Time'),
('Digital Sensors', 7, 2, 8500.00, 'One-Time'),
('CBCT Machines', 7, 2, 125000.00, 'One-Time'),
('Articulators', 4, 2, 850.00, 'One-Time'),
('Flasks', 4, 2, 125.00, 'One-Time'),
('Staplers', 11, 1, 25.00, 'One-Time'),
('Stone Model Trimmers', 9, 2, 2500.00, 'One-Time'),
('Intraoral Cameras', 13, 2, 8500.00, 'One-Time'),
('Radiography Systems', 7, 2, 65000.00, 'One-Time'),
('Dental Drills (Handpieces)', 7, 2, 2500.00, 'One-Time'),
('Ultrasonic Cleaners', 8, 2, 1250.00, 'One-Time'),
('Dental Lab Benches', 7, 2, 3500.00, 'One-Time'),
('Model Trimmers', 7, 2, 1800.00, 'One-Time'),
('Laboratory Handpieces', 7, 2, 2500.00, 'One-Time'),
('Patient Educational Software', 12, 1, 850.00, 'One-Time');

-- Insert realistic inventory data for ALL products
INSERT INTO inventory (product_id, current_stock, min_stock, max_stock) VALUES
-- Weekly items (higher stock levels)
(1, 45, 15, 50),    -- Gloves - Low stock
(2, 18, 5, 20),     -- Masks
(3, 3, 2, 5),       -- Lidocaine - Low stock
(4, 8, 3, 10),      -- Dental Dam
(5, 4, 2, 5),       -- Composite Kit - Low stock
(6, 75, 30, 100),   -- High-Speed Burs
(7, 40, 15, 50),    -- Low-Speed Burs
(8, 15, 5, 20),     -- Gauze
(9, 12, 5, 15),     -- Patient Bibs
(10, 8, 3, 10),     -- Anesthetics
(11, 25, 10, 30),   -- Dental Floss
(12, 10, 5, 15),    -- Paper towels
(13, 18, 5, 20),    -- Gauze pads
(14, 1, 1, 2),      -- Nitrous Oxide - Low stock
(15, 400, 150, 500), -- Saliva Ejectors
(16, 12, 5, 15),    -- Disinfectant Wipes
(17, 80, 30, 100),  -- PPE
(18, 450, 150, 500), -- Saliva Ejector Tips
(19, 480, 150, 500), -- Air/Water Tips
(20, 180, 50, 200),  -- Surgical Tips
(21, 8, 3, 10),     -- Tray Covers
(22, 8, 3, 10),     -- Headrest Covers
(23, 8, 3, 10),     -- Patient Cups
(24, 8, 3, 10),     -- Bib Clips
(25, 450, 150, 500), -- Disposable Syringes
(26, 480, 150, 500), -- Disposable Needles
(27, 4, 2, 5),      -- Disinfectant Solution - Low stock

-- Monthly items (medium stock levels)
(28, 25, 10, 30),   -- Cotton Rolls
(29, 18, 5, 20),    -- Gauze Sponges
(30, 8, 3, 10),     -- Prophy Paste
(31, 4, 2, 5),      -- Alginate - Low stock
(32, 3, 1, 4),      -- Cements - Low stock
(33, 12, 5, 15),    -- Patient Bibs
(34, 4, 2, 5),      -- Amalgam
(35, 12, 5, 15),    -- Impression Trays
(36, 400, 100, 500), -- Prophy Angles
(37, 8, 3, 10),     -- Dental Adhesives
(38, 400, 150, 500), -- Patient Goody Bags
(39, 8, 3, 10),     -- Cotton Swabs
(40, 8, 3, 10),     -- Articulating Paper
(41, 15, 5, 20),    -- Patient Mirrors
(42, 8, 3, 10),     -- Surgical Blades
(43, 8, 3, 10),     -- Sterilization Pouches
(44, 4, 2, 5),      -- Autoclave Solution - Low stock
(45, 4, 2, 5),      -- Handpiece Lubricants
(46, 80, 30, 100),  -- Suction Traps
(47, 18, 5, 20),    -- Microbrushes
(48, 80, 30, 100),  -- Fluoride Varnish
(49, 4, 2, 5),      -- Prostho Adhesives
(50, 15, 5, 20),    -- Denture Brushes
(51, 80, 30, 100),  -- Elastic Bands
(52, 40, 10, 50),   -- Orthodontic Wax
(53, 4, 2, 5),      -- Printer Paper - Low stock
(54, 4, 2, 5),      -- Cleaning Supplies
(55, 1, 1, 2),      -- Printer Ink - Low stock
(56, 4, 2, 5),      -- Appointment Cards
(57, 15, 5, 20),    -- Patient Mirrors
(58, 4, 2, 5),      -- Alloys
(59, 4, 2, 5),      -- Ceramics
(60, 4, 2, 5),      -- Ortho Adhesive
(61, 4, 2, 5),      -- X-Ray Film
(62, 40, 15, 50),   -- Dental Burs
(63, 8, 3, 10),     -- Scalpels
(64, 8, 3, 10),     -- Prophylaxis Paste
(65, 3, 1, 4),      -- Dental Cement - Low stock
(66, 40, 15, 50),   -- Bleaching Trays
(67, 8, 3, 10),     -- Whitening Gels
(68, 4, 2, 5),      -- Impression Materials
(69, 4, 2, 5),      -- Crown Materials
(70, 4, 2, 5),      -- Retraction Cord
(71, 4, 2, 5),      -- Gingival Retraction
(72, 8, 3, 10),     -- Distilled Water

-- Quarterly items (lower stock levels)
(73, 8, 3, 10),     -- Periodontal Probes
(74, 7, 3, 10),     -- Scalers
(75, 4, 1, 5),      -- Forceps
(76, 8, 3, 10),     -- Patient Mirrors
(77, 15, 5, 20),    -- Retainers & Cases
(78, 8, 3, 10),     -- Dentures & Adhesives
(79, 4, 1, 5),      -- Surgical Scissors
(80, 150, 50, 200), -- Patient Goody Bags
(81, 12, 5, 15),    -- Dental Mirrors
(82, 8, 3, 10),     -- Sickle Probes
(83, 8, 3, 10),     -- Curettes
(84, 8, 3, 10),     -- Pliers
(85, 8, 3, 10),     -- Excavators
(86, 4, 1, 5),      -- Chisels
(87, 4, 1, 5),      -- Spore Testing Kits
(88, 4, 2, 5),      -- Gypsum
(89, 4, 2, 5),      -- Dental Stone
(90, 8, 3, 10),     -- Waxes
(91, 1, 1, 2),      -- First Aid Kits - Low stock
(92, 1, 0, 1),      -- Emergency Medications - Low stock
(93, 8, 3, 10),     -- Dentures
(94, 15, 5, 20),    -- Retainers
(95, 8, 3, 10),     -- Brackets & Chains
(96, 40, 15, 50),   -- Office Pens
(97, 8, 3, 10),     -- Paper Clips
(98, 4, 2, 5),      -- Business Cards
(99, 8, 3, 10),     -- Patient Education
(100, 8, 3, 10),    -- Marketing Brochures
(101, 4, 1, 5),     -- Crown Removers
(102, 75, 30, 100), -- Endodontic Files
(103, 4, 1, 5),     -- Ultrasonic Tips
(104, 4, 1, 5),     -- Mixing Bowls
(105, 4, 2, 5),     -- Wax Tools
(106, 4, 1, 5),     -- Amalgam Carriers
(107, 8, 3, 10),    -- Endodontic Instruments
(108, 4, 1, 5),     -- Implant Kits
(109, 8, 3, 10),    -- Retractors
(110, 8, 3, 10),    -- Molds
(111, 8, 3, 10),    -- Ortho Wires
(112, 8, 3, 10),    -- Cheek Retractors
(113, 4, 1, 5),     -- Face Masks
(114, 4, 1, 5),     -- Film Holders
(115, 1, 1, 2),     -- Developing Chemicals - Low stock
(116, 8, 3, 10),    -- Cotton Pliers
(117, 8, 3, 10),    -- Waiting Room Magazines
(118, 1, 1, 2),     -- First Aid Supplies - Low stock
(119, 8, 3, 10),    -- Medical Gauze
(120, 4, 1, 5),     -- IV Supplies
(121, 4, 2, 5),     -- Suction Hoses
(122, 75, 30, 100), -- Endodontic Files
(123, 8, 3, 10),    -- Obturation Materials
(124, 4, 2, 5),     -- Gutta-Percha Points
(125, 4, 2, 5),     -- Paper Points
(126, 8, 3, 10),    -- Dental Spatulas
(127, 4, 1, 5),     -- Amalgam Pluggers
(128, 4, 1, 5),     -- Amalgam Condensers
(129, 4, 1, 5),     -- Hemostat
(130, 4, 1, 5),     -- Mouth Prop

-- One-Time items (Capital Equipment - mostly 1 unit)
(131, 1, 0, 1),     -- Sterilizer
(132, 1, 0, 1),     -- Dental Chair
(133, 1, 0, 1),     -- X-Ray Equipment
(134, 1, 0, 1),     -- Dental Microscope
(135, 1, 0, 1),     -- Reception Desk
(136, 1, 0, 1),     -- Computer/Monitor
(137, 1, 0, 1),     -- Lab Handpieces
(138, 1, 0, 1),     -- Model Trimmers
(139, 1, 0, 1),     -- Polishing Equipment
(140, 1, 0, 1),     -- AED
(141, 1, 0, 1),     -- Emergency Oxygen
(142, 1, 0, 1),     -- Dental Drills
(143, 1, 0, 1),     -- Light Curing Units
(144, 1, 0, 1),     -- Patient Chairs
(145, 1, 0, 1),     -- Sterilization Unit
(146, 2, 0, 2),     -- Digital Sensors
(147, 1, 0, 1),     -- CBCT Machines
(148, 4, 1, 5),     -- Articulators
(149, 4, 1, 5),     -- Flasks
(150, 4, 1, 5),     -- Staplers
(151, 1, 0, 1),     -- Stone Model Trimmers
(152, 1, 0, 1),     -- Intraoral Cameras
(153, 1, 0, 1),     -- Radiography Systems
(154, 1, 0, 1),     -- Dental Handpieces
(155, 1, 0, 1),     -- Ultrasonic Cleaners
(156, 1, 0, 1),     -- Lab Benches
(157, 1, 0, 1),     -- Model Trimmers
(158, 1, 0, 1),     -- Laboratory Handpieces
(159, 1, 0, 1);     -- Patient Educational Software

-- Insert some sample stock movements (recent activity)
INSERT INTO stock_movements (product_id, quantity, movement_type, notes) VALUES
(1, -5, 'OUT', 'Used during morning procedures'),
(3, -1, 'OUT', 'Local anesthesia for filling'),
(5, -1, 'OUT', 'Composite restoration'),
(6, -10, 'OUT', 'Routine drilling procedures'),
(15, -50, 'OUT', 'Daily patient procedures'),
(25, -25, 'OUT', 'Injection procedures'),
(30, -2, 'OUT', 'Prophylaxis cleaning'),
(31, 5, 'IN', 'New shipment received'),
(44, 3, 'IN', 'Autoclave solution restocked'),
(53, 5, 'IN', 'Office supplies delivery'),
(91, 1, 'IN', 'First aid kit replacement'),
(115, 1, 'IN', 'Developing chemicals restocked');

-- Insert sample users
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@dentalclinic.com', 'hashed_password_here', 'admin'),
('staff1', 'staff@dentalclinic.com', 'hashed_password_here', 'staff'),
('hygienist', 'hygienist@dentalclinic.com', 'hashed_password_here', 'staff');