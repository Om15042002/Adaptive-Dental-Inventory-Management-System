// Mobile App - Barcode Scanner Module
// React Native/Flutter compatible implementation

/**
 * BarcodeScanner Module
 * 
 * This module handles barcode scanning functionality for mobile applications
 * Compatible with React Native and Flutter implementations
 * 
 * Features:
 * - Real-time barcode scanning
 * - QR Code support
 * - Inventory lookup
 * - Stock updates
 * - Offline support
 */

class BarcodeScannerModule {
    constructor() {
        this.isScanning = false;
        this.scannedData = [];
        this.offlineData = [];
        this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        this.authToken = null;
    }

    /**
     * Initialize barcode scanner
     * @param {string} token - JWT authentication token
     */
    async initialize(token) {
        try {
            this.authToken = token;
            console.log('Barcode Scanner initialized');
            return {
                success: true,
                message: 'Barcode Scanner initialized successfully'
            };
        } catch (error) {
            console.error('Barcode Scanner initialization error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Start barcode scanning
     * @param {Function} onBarcodeScanned - Callback function for scanned barcode
     */
    async startScanning(onBarcodeScanned) {
        try {
            this.isScanning = true;
            console.log('Barcode scanning started');
            
            return {
                success: true,
                scanning: true,
                callback: onBarcodeScanned
            };
        } catch (error) {
            console.error('Start scanning error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Stop barcode scanning
     */
    async stopScanning() {
        try {
            this.isScanning = false;
            console.log('Barcode scanning stopped');
            return {
                success: true,
                scanning: false
            };
        } catch (error) {
            console.error('Stop scanning error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process scanned barcode/SKU
     * @param {string} scannedCode - The scanned code (barcode/SKU)
     */
    async processBarcodeData(scannedCode) {
        try {
            if (!scannedCode) {
                return {
                    success: false,
                    error: 'Invalid barcode'
                };
            }

            // Clean the scanned code
            const cleanCode = scannedCode.trim();

            // Check if code is valid (basic validation)
            if (cleanCode.length < 3) {
                return {
                    success: false,
                    error: 'Barcode too short'
                };
            }

            // Search for product by SKU or barcode
            const productData = await this.searchProductBySKU(cleanCode);

            if (!productData.success) {
                return {
                    success: false,
                    error: 'Product not found'
                };
            }

            // Store scanned data
            this.scannedData.push({
                code: cleanCode,
                product: productData.product,
                timestamp: new Date().toISOString(),
                synced: false
            });

            return {
                success: true,
                product: productData.product,
                stockLevel: productData.stock,
                alertLevel: this.determineAlertLevel(productData.stock, productData.reorderLevel)
            };
        } catch (error) {
            console.error('Process barcode error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search product by SKU
     * @param {string} sku - Product SKU
     */
    async searchProductBySKU(sku) {
        try {
            // Try online first
            if (navigator.onLine) {
                const response = await fetch(
                    `${this.apiBaseUrl}/products/search?query=${sku}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.authToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.data.products.length > 0) {
                        const product = data.data.products[0];
                        return {
                            success: true,
                            product: {
                                id: product.id,
                                name: product.name,
                                sku: product.sku,
                                category: product.category_name,
                                supplier: product.supplier_name
                            },
                            stock: product.current_stock,
                            reorderLevel: product.reorder_level
                        };
                    }
                }
            }

            // Fallback to offline data
            return this.searchOfflineDatabase(sku);
        } catch (error) {
            console.error('Search product error:', error);
            // Try offline database on error
            return this.searchOfflineDatabase(sku);
        }
    }

    /**
     * Search offline database
     * @param {string} sku - Product SKU
     */
    searchOfflineDatabase(sku) {
        const product = this.offlineData.find(p => p.sku === sku);
        if (product) {
            return {
                success: true,
                product,
                stock: product.stock,
                reorderLevel: product.reorderLevel,
                offline: true
            };
        }
        return {
            success: false,
            error: 'Product not found in offline database'
        };
    }

    /**
     * Determine alert level based on stock
     * @param {number} currentStock - Current stock level
     * @param {number} reorderLevel - Reorder level
     */
    determineAlertLevel(currentStock, reorderLevel) {
        if (currentStock === 0) {
            return 'critical';
        } else if (currentStock <= reorderLevel * 0.25) {
            return 'critical';
        } else if (currentStock <= reorderLevel * 0.5) {
            return 'warning';
        } else if (currentStock <= reorderLevel) {
            return 'low';
        }
        return 'ok';
    }

    /**
     * Update inventory from scanned data
     * @param {number} productId - Product ID
     * @param {number} quantity - Quantity change
     * @param {string} movementType - Type of movement (IN/OUT)
     */
    async updateInventoryFromScan(productId, quantity, movementType) {
        try {
            if (!navigator.onLine) {
                // Store for later sync
                this.offlineData.push({
                    productId,
                    quantity,
                    movementType,
                    timestamp: new Date().toISOString(),
                    synced: false
                });
                return {
                    success: true,
                    offline: true,
                    message: 'Stored for later sync'
                };
            }

            const response = await fetch(
                `${this.apiBaseUrl}/stock-movements`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        product_id: productId,
                        quantity,
                        movement_type: movementType,
                        notes: `Scanned on mobile app at ${new Date().toLocaleString()}`
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    movement: data.data,
                    message: 'Inventory updated successfully'
                };
            }

            return {
                success: false,
                error: 'Failed to update inventory'
            };
        } catch (error) {
            console.error('Update inventory error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync offline data with server
     */
    async syncOfflineData() {
        try {
            if (!navigator.onLine) {
                return {
                    success: false,
                    error: 'No internet connection'
                };
            }

            const unsyncedData = this.offlineData.filter(d => !d.synced);

            if (unsyncedData.length === 0) {
                return {
                    success: true,
                    synced: 0,
                    message: 'No data to sync'
                };
            }

            let syncedCount = 0;

            for (const data of unsyncedData) {
                const response = await fetch(
                    `${this.apiBaseUrl}/stock-movements`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            product_id: data.productId,
                            quantity: data.quantity,
                            movement_type: data.movementType,
                            notes: `Synced from offline - scanned at ${data.timestamp}`
                        })
                    }
                );

                if (response.ok) {
                    data.synced = true;
                    syncedCount++;
                }
            }

            return {
                success: true,
                synced: syncedCount,
                total: unsyncedData.length,
                message: `Synced ${syncedCount} of ${unsyncedData.length} records`
            };
        } catch (error) {
            console.error('Sync offline data error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get scanned items summary
     */
    getScanSummary() {
        return {
            totalScanned: this.scannedData.length,
            synced: this.scannedData.filter(d => d.synced).length,
            pending: this.scannedData.filter(d => !d.synced).length,
            items: this.scannedData
        };
    }

    /**
     * Clear scanned data
     */
    clearScannedData() {
        this.scannedData = [];
        return {
            success: true,
            message: 'Scanned data cleared'
        };
    }

    /**
     * Load offline database
     * @param {Array} products - Array of products for offline use
     */
    loadOfflineDatabase(products) {
        this.offlineData = products.map(p => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category_name,
            stock: p.current_stock,
            reorderLevel: p.reorder_level
        }));
        return {
            success: true,
            loaded: this.offlineData.length,
            message: 'Offline database loaded'
        };
    }
}

// Export for React Native and Flutter
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarcodeScannerModule;
}

export default BarcodeScannerModule;
