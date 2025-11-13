// Dummy data for development - easily replaceable with API calls

// Categories
export const categories = [
  { id: 1, name: 'Clinical Consumables', description: 'Everyday clinical supplies', itemCount: 45 },
  { id: 2, name: 'Sterilization Supplies', description: 'Sterilization and infection control', itemCount: 22 },
  { id: 3, name: 'PPE and Safety Equipment', description: 'Personal protective equipment', itemCount: 18 },
  { id: 4, name: 'Dental Burs and Tools', description: 'Cutting and shaping tools', itemCount: 35 },
  { id: 5, name: 'Impression Materials', description: 'Materials for dental impressions', itemCount: 12 },
  { id: 6, name: 'Clinical Instruments', description: 'Diagnostic and treatment instruments', itemCount: 28 },
  { id: 7, name: 'Endodontic Supplies', description: 'Root canal treatment supplies', itemCount: 15 },
  { id: 8, name: 'Orthodontic Supplies', description: 'Orthodontic treatment materials', itemCount: 20 },
  { id: 9, name: 'Restorative Materials', description: 'Filling and restoration materials', itemCount: 17 },
  { id: 10, name: 'Preventive Care Products', description: 'Preventive dental care items', itemCount: 10 },
  { id: 11, name: 'Medications and Anesthetics', description: 'Dental medications', itemCount: 8 },
  { id: 12, name: 'Radiographic Supplies', description: 'X-ray and imaging supplies', itemCount: 6 },
  { id: 13, name: 'Laboratory Materials', description: 'Dental lab materials', itemCount: 11 },
  { id: 14, name: 'Office and Administrative Supplies', description: 'Office supplies', itemCount: 12 }
];

// Suppliers
export const suppliers = [
  { 
    id: 1, 
    name: 'DentalSupply Co.', 
    contact: 'John Doe',
    email: 'john@dentalsupply.com',
    phone: '+1-555-0101',
    address: '123 Medical Plaza, New York, NY 10001',
    productsSupplied: 45,
    rating: 4.8,
    status: 'Active'
  },
  { 
    id: 2, 
    name: 'MediDent Solutions', 
    contact: 'Jane Smith',
    email: 'jane@medident.com',
    phone: '+1-555-0102',
    address: '456 Healthcare Ave, Los Angeles, CA 90001',
    productsSupplied: 38,
    rating: 4.6,
    status: 'Active'
  },
  { 
    id: 3, 
    name: 'ProDental Supplies', 
    contact: 'Mike Johnson',
    email: 'mike@prodental.com',
    phone: '+1-555-0103',
    address: '789 Dental Street, Chicago, IL 60601',
    productsSupplied: 52,
    rating: 4.9,
    status: 'Active'
  },
  { 
    id: 4, 
    name: 'QuickMed Distributors', 
    contact: 'Sarah Williams',
    email: 'sarah@quickmed.com',
    phone: '+1-555-0104',
    address: '321 Supply Road, Houston, TX 77001',
    productsSupplied: 29,
    rating: 4.5,
    status: 'Active'
  },
  { 
    id: 5, 
    name: 'Global Dental Inc.', 
    contact: 'Robert Brown',
    email: 'robert@globaldental.com',
    phone: '+1-555-0105',
    address: '654 International Blvd, Miami, FL 33101',
    productsSupplied: 41,
    rating: 4.7,
    status: 'Active'
  },
  { 
    id: 6, 
    name: 'Elite Medical Supplies', 
    contact: 'Emily Davis',
    email: 'emily@elitemedical.com',
    phone: '+1-555-0106',
    address: '987 Premium Lane, Boston, MA 02101',
    productsSupplied: 34,
    rating: 4.4,
    status: 'Inactive'
  }
];

// Products with realistic dental inventory items
export const products = [
  // Clinical Consumables
  { id: 1, name: 'Disposable Gloves (Nitrile)', sku: 'GLV-NIT-001', category_id: 1, category: 'Clinical Consumables', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 12.99, description: 'Powder-free nitrile gloves', unit_of_measure: 'Box (100)', status: 'Active' },
  { id: 2, name: 'Face Masks (Level 2)', sku: 'MSK-L2-002', category_id: 1, category: 'Clinical Consumables', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 8.50, description: 'ASTM Level 2 surgical masks', unit_of_measure: 'Box (50)', status: 'Active' },
  { id: 3, name: 'Cotton Rolls', sku: 'COT-RL-003', category_id: 1, category: 'Clinical Consumables', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 5.25, description: 'Medium size cotton rolls', unit_of_measure: 'Bag (2000)', status: 'Active' },
  { id: 4, name: 'Gauze Pads (2x2)', sku: 'GAU-2X2-004', category_id: 1, category: 'Clinical Consumables', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 6.75, description: 'Sterile gauze pads', unit_of_measure: 'Pack (200)', status: 'Active' },
  { id: 5, name: 'Disposable Bibs', sku: 'BIB-DIS-005', category_id: 1, category: 'Clinical Consumables', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 15.99, description: '3-ply patient bibs', unit_of_measure: 'Pack (500)', status: 'Active' },
  
  // Sterilization Supplies
  { id: 6, name: 'Autoclave Pouches (3.5x9)', sku: 'AUT-P35-006', category_id: 2, category: 'Sterilization Supplies', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 22.50, description: 'Self-sealing sterilization pouches', unit_of_measure: 'Box (200)', status: 'Active' },
  { id: 7, name: 'Sterilization Indicators', sku: 'STR-IND-007', category_id: 2, category: 'Sterilization Supplies', supplier_id: 4, supplier: 'QuickMed Distributors', unit_price: 18.00, description: 'Chemical indicators strips', unit_of_measure: 'Pack (100)', status: 'Active' },
  { id: 8, name: 'Enzymatic Cleaner', sku: 'ENZ-CLN-008', category_id: 2, category: 'Sterilization Supplies', supplier_id: 4, supplier: 'QuickMed Distributors', unit_price: 28.99, description: 'Instrument pre-cleaning solution', unit_of_measure: 'Bottle (1L)', status: 'Active' },
  
  // PPE
  { id: 9, name: 'Safety Glasses', sku: 'SAF-GLS-009', category_id: 3, category: 'PPE and Safety Equipment', supplier_id: 5, supplier: 'Global Dental Inc.', unit_price: 4.50, description: 'Clear protective eyewear', unit_of_measure: 'Each', status: 'Active' },
  { id: 10, name: 'Disposable Gowns', sku: 'GOW-DIS-010', category_id: 3, category: 'PPE and Safety Equipment', supplier_id: 5, supplier: 'Global Dental Inc.', unit_price: 2.75, description: 'Fluid-resistant isolation gowns', unit_of_measure: 'Each', status: 'Active' },
  
  // Dental Burs and Tools
  { id: 11, name: 'Carbide Bur FG #330', sku: 'BUR-FG330-011', category_id: 4, category: 'Dental Burs and Tools', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 3.25, description: 'Pear-shaped carbide bur', unit_of_measure: 'Each', status: 'Active' },
  { id: 12, name: 'Diamond Bur FG #801', sku: 'BUR-DIA801-012', category_id: 4, category: 'Dental Burs and Tools', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 4.50, description: 'Flame-shaped diamond bur', unit_of_measure: 'Each', status: 'Active' },
  { id: 13, name: 'Finishing Burs Set', sku: 'BUR-FIN-013', category_id: 4, category: 'Dental Burs and Tools', supplier_id: 6, supplier: 'Elite Medical Supplies', unit_price: 45.00, description: '12-piece finishing burs kit', unit_of_measure: 'Kit', status: 'Active' },
  
  // Impression Materials
  { id: 14, name: 'Alginate Impression Material', sku: 'IMP-ALG-014', category_id: 5, category: 'Impression Materials', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 32.99, description: 'Fast-set alginate powder', unit_of_measure: 'Canister (450g)', status: 'Active' },
  { id: 15, name: 'Vinyl Polysiloxane (VPS)', sku: 'IMP-VPS-015', category_id: 5, category: 'Impression Materials', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 68.50, description: 'Precision impression material', unit_of_measure: 'Cartridge (50ml)', status: 'Active' },
  
  // Clinical Instruments
  { id: 16, name: 'Dental Mirror #5', sku: 'MIR-05-016', category_id: 6, category: 'Clinical Instruments', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 12.00, description: 'Front surface mirror', unit_of_measure: 'Each', status: 'Active' },
  { id: 17, name: 'Explorer #23', sku: 'EXP-23-017', category_id: 6, category: 'Clinical Instruments', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 15.50, description: 'Shepherd hook explorer', unit_of_measure: 'Each', status: 'Active' },
  { id: 18, name: 'Cotton Pliers', sku: 'PLI-COT-018', category_id: 6, category: 'Clinical Instruments', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 18.00, description: 'Locking cotton pliers', unit_of_measure: 'Each', status: 'Active' },
  
  // Endodontic Supplies
  { id: 19, name: 'Endo Files K-Type', sku: 'END-KFL-019', category_id: 7, category: 'Endodontic Supplies', supplier_id: 3, supplier: 'ProDental Supplies', unit_price: 8.50, description: 'Stainless steel K-files assorted', unit_of_measure: 'Pack (6)', status: 'Active' },
  { id: 20, name: 'Gutta Percha Points', sku: 'END-GP-020', category_id: 7, category: 'Endodontic Supplies', supplier_id: 4, supplier: 'QuickMed Distributors', unit_price: 12.00, description: 'Standard gutta percha points', unit_of_measure: 'Box (100)', status: 'Active' },
  
  // Orthodontic Supplies
  { id: 21, name: 'Orthodontic Brackets', sku: 'ORT-BRK-021', category_id: 8, category: 'Orthodontic Supplies', supplier_id: 5, supplier: 'Global Dental Inc.', unit_price: 125.00, description: 'Metal orthodontic brackets set', unit_of_measure: 'Set (20)', status: 'Active' },
  { id: 22, name: 'Orthodontic Wire', sku: 'ORT-WIR-022', category_id: 8, category: 'Orthodontic Supplies', supplier_id: 5, supplier: 'Global Dental Inc.', unit_price: 18.50, description: 'NiTi archwire .016', unit_of_measure: 'Each', status: 'Active' },
  
  // Restorative Materials
  { id: 23, name: 'Composite Resin A2', sku: 'RES-CMP-023', category_id: 9, category: 'Restorative Materials', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 45.00, description: 'Light-cure composite shade A2', unit_of_measure: 'Syringe (4g)', status: 'Active' },
  { id: 24, name: 'Glass Ionomer Cement', sku: 'RES-GIC-024', category_id: 9, category: 'Restorative Materials', supplier_id: 2, supplier: 'MediDent Solutions', unit_price: 38.50, description: 'Self-cure GIC powder/liquid', unit_of_measure: 'Kit', status: 'Active' },
  { id: 25, name: 'Dental Bonding Agent', sku: 'RES-BND-025', category_id: 9, category: 'Restorative Materials', supplier_id: 6, supplier: 'Elite Medical Supplies', unit_price: 55.00, description: 'Universal adhesive system', unit_of_measure: 'Bottle (5ml)', status: 'Active' },
  
  // Preventive Care
  { id: 26, name: 'Fluoride Varnish', sku: 'PRV-FLV-026', category_id: 10, category: 'Preventive Care Products', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 28.00, description: '5% sodium fluoride varnish', unit_of_measure: 'Tube (10ml)', status: 'Active' },
  { id: 27, name: 'Prophy Paste', sku: 'PRV-PPP-027', category_id: 10, category: 'Preventive Care Products', supplier_id: 1, supplier: 'DentalSupply Co.', unit_price: 12.50, description: 'Medium grit prophy paste', unit_of_measure: 'Cup (200g)', status: 'Active' },
  
  // Medications
  { id: 28, name: 'Lidocaine 2% with Epi', sku: 'MED-LID-028', category_id: 11, category: 'Medications and Anesthetics', supplier_id: 4, supplier: 'QuickMed Distributors', unit_price: 8.50, description: 'Local anesthetic carpules', unit_of_measure: 'Box (50)', status: 'Active' },
  { id: 29, name: 'Articaine 4%', sku: 'MED-ART-029', category_id: 11, category: 'Medications and Anesthetics', supplier_id: 4, supplier: 'QuickMed Distributors', unit_price: 11.00, description: 'Local anesthetic carpules', unit_of_measure: 'Box (50)', status: 'Active' },
  
  // Radiographic Supplies
  { id: 30, name: 'Digital Sensor Sleeves', sku: 'RAD-SLV-030', category_id: 12, category: 'Radiographic Supplies', supplier_id: 5, supplier: 'Global Dental Inc.', unit_price: 15.00, description: 'Disposable sensor barriers', unit_of_measure: 'Box (500)', status: 'Active' },
];

// Inventory data
export const inventory = products.map((product, index) => {
  const baseQuantity = Math.floor(Math.random() * 200) + 50;
  const reorderPoint = Math.floor(baseQuantity * 0.3);
  const maxStockLevel = Math.floor(baseQuantity * 2);
  
  return {
    id: product.id,
    product_id: product.id,
    product_name: product.name,
    sku: product.sku,
    category: product.category,
    supplier: product.supplier,
    quantity: baseQuantity,
    reorder_point: reorderPoint,
    max_stock_level: maxStockLevel,
    unit_price: product.unit_price,
    unit_of_measure: product.unit_of_measure,
    storage_area: ['Clinical Area', 'Sterilization Room', 'Storage Room', 'Office'][index % 4],
    frequency_of_use: ['Daily', 'Weekly', 'Monthly', 'Quarterly'][index % 4],
    expiry_date: index % 5 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                  index % 3 === 0 ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    last_restocked: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: baseQuantity > reorderPoint ? 'In Stock' : baseQuantity > 0 ? 'Low Stock' : 'Out of Stock'
  };
});

// Stock Movements
export const stockMovements = [
  { id: 1, product_id: 1, product_name: 'Disposable Gloves (Nitrile)', type: 'IN', quantity: 100, date: '2025-10-08', reference: 'PO-2025-001', notes: 'Monthly stock replenishment' },
  { id: 2, product_id: 2, product_name: 'Face Masks (Level 2)', type: 'IN', quantity: 200, date: '2025-10-08', reference: 'PO-2025-002', notes: 'Bulk order' },
  { id: 3, product_id: 1, product_name: 'Disposable Gloves (Nitrile)', type: 'OUT', quantity: 25, date: '2025-10-07', reference: 'USE-2025-001', notes: 'Daily usage' },
  { id: 4, product_id: 3, product_name: 'Cotton Rolls', type: 'OUT', quantity: 50, date: '2025-10-07', reference: 'USE-2025-002', notes: 'Clinical procedures' },
  { id: 5, product_id: 23, product_name: 'Composite Resin A2', type: 'IN', quantity: 10, date: '2025-10-06', reference: 'PO-2025-003', notes: 'Restorative supplies' },
  { id: 6, product_id: 28, product_name: 'Lidocaine 2% with Epi', type: 'OUT', quantity: 15, date: '2025-10-06', reference: 'USE-2025-003', notes: 'Surgical procedures' },
  { id: 7, product_id: 11, product_name: 'Carbide Bur FG #330', type: 'ADJUST', quantity: -5, date: '2025-10-05', reference: 'ADJ-2025-001', notes: 'Damaged items removed' },
  { id: 8, product_id: 6, product_name: 'Autoclave Pouches (3.5x9)', type: 'IN', quantity: 150, date: '2025-10-05', reference: 'PO-2025-004', notes: 'Sterilization supplies' },
  { id: 9, product_id: 14, product_name: 'Alginate Impression Material', type: 'OUT', quantity: 8, date: '2025-10-04', reference: 'USE-2025-004', notes: 'Impression procedures' },
  { id: 10, product_id: 26, product_name: 'Fluoride Varnish', type: 'OUT', quantity: 12, date: '2025-10-04', reference: 'USE-2025-005', notes: 'Preventive treatments' },
];

// Dashboard Statistics
export const dashboardStats = {
  totalItems: inventory.length,
  totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
  lowStockItems: inventory.filter(item => item.status === 'Low Stock').length,
  outOfStockItems: inventory.filter(item => item.status === 'Out of Stock').length,
  expiringSoon: inventory.filter(item => {
    if (!item.expiry_date) return false;
    const daysUntilExpiry = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length,
  recentMovements: stockMovements.slice(0, 5)
};

// Usage data for charts
export const usageData = [
  { month: 'Apr', usage: 45000 },
  { month: 'May', usage: 52000 },
  { month: 'Jun', usage: 48000 },
  { month: 'Jul', usage: 61000 },
  { month: 'Aug', usage: 55000 },
  { month: 'Sep', usage: 67000 },
  { month: 'Oct', usage: 58000 },
];

// Category distribution for pie chart
export const categoryDistribution = categories.map(cat => ({
  name: cat.name,
  value: cat.itemCount,
  color: `hsl(${Math.random() * 360}, 70%, 60%)`
}));

// Reports data
export const reportsData = {
  usageReport: inventory.map(item => ({
    product: item.product_name,
    category: item.category,
    frequency: item.frequency_of_use,
    avgMonthlyUsage: Math.floor(Math.random() * 100) + 10,
    cost: (Math.floor(Math.random() * 100) + 10) * item.unit_price
  })),
  costAnalysis: {
    totalCost: inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    costByCategory: categories.map(cat => ({
      category: cat.name,
      cost: Math.floor(Math.random() * 5000) + 1000
    })),
    costTrend: usageData.map(d => ({
      month: d.month,
      cost: d.usage * 0.85
    }))
  },
  stockValue: {
    total: inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    bySupplier: suppliers.filter(s => s.status === 'Active').map(sup => ({
      supplier: sup.name,
      value: Math.floor(Math.random() * 15000) + 5000
    }))
  }
};

// Notifications/Alerts
export const notifications = [
  { id: 1, type: 'warning', message: 'Disposable Gloves (Nitrile) - Low stock (Below reorder point)', date: '2025-10-09', read: false },
  { id: 2, type: 'error', message: 'Cotton Rolls - Out of stock', date: '2025-10-08', read: false },
  { id: 3, type: 'info', message: 'Fluoride Varnish - Expiring in 25 days', date: '2025-10-08', read: false },
  { id: 4, type: 'success', message: 'Purchase order PO-2025-004 received', date: '2025-10-07', read: true },
  { id: 5, type: 'warning', message: 'Composite Resin A2 - Low stock', date: '2025-10-06', read: true },
];

// Users (for future use)
export const users = [
  { id: 1, name: 'Admin User', email: 'admin@dentalclinic.com', role: 'admin', status: 'Active' },
  { id: 2, name: 'Staff User', email: 'staff@dentalclinic.com', role: 'staff', status: 'Active' },
  { id: 3, name: 'Dr. John Smith', email: 'john.smith@dentalclinic.com', role: 'dentist', status: 'Active' },
  { id: 4, name: 'Sarah Johnson', email: 'sarah.j@dentalclinic.com', role: 'hygienist', status: 'Active' },
];
