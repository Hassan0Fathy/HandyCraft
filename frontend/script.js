/**
 * Transaction ID Management Utilities
 * Provides functions for generating, storing, and managing transaction IDs
 */

// ==================== TRANSACTION ID GENERATION ====================

/**
 * Generate a unique Transaction ID with format: TXN-YYMMDD-HHMMSS-XXX
 * @returns {string} Unique transaction ID
 * @example
 * console.log(generateTransactionId()); // "TXN-250115-143022-456"
 */
function generateTransactionId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `TXN-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Generate a simple numeric Order ID
 * @returns {string} Numeric order ID with # prefix (e.g., "#1234")
 */
function generateOrderId() {
    return '#' + Math.floor(1000 + Math.random() * 9000);
}

// ==================== STORAGE MANAGEMENT ====================

/**
 * Store the last transaction ID in sessionStorage for cross-page access
 * @param {string} transactionId - The transaction ID to store
 */
function storeLastTransactionId(transactionId) {
    sessionStorage.setItem('hc_last_transaction_id', transactionId);
}

/**
 * Retrieve the last stored transaction ID
 * @returns {string|null} The stored transaction ID or null if not found
 */
function getLastTransactionId() {
    return sessionStorage.getItem('hc_last_transaction_id');
}

/**
 * Clear the stored transaction ID
 */
function clearLastTransactionId() {
    sessionStorage.removeItem('hc_last_transaction_id');
}

// ==================== ORDER DATA MANAGEMENT ====================

/**
 * Create a complete order object with IDs and metadata
 * @param {Object} orderData - Basic order information
 * @returns {Object} Complete order object with generated IDs
 */
function createOrderObject(orderData) {
    const orderId = generateOrderId();
    const transactionId = generateTransactionId();
    
    return {
        id: orderId,
        transactionId: transactionId,
        txid: transactionId,  // Alias for backward compatibility
        timestamp: new Date().toISOString(),
        status: 'Pending',
        ...orderData
    };
}

/**
 * Retrieve all orders from localStorage
 * @returns {Array} Array of order objects
 */
function getAllOrders() {
    try {
        return JSON.parse(localStorage.getItem('hc_orders') || '[]');
    } catch (e) {
        console.error('Error retrieving orders:', e);
        return [];
    }
}

/**
 * Save a new order to localStorage
 * @param {Object} orderData - Complete order object
 * @returns {boolean} Success status
 */
function saveOrder(orderData) {
    try {
        const orders = getAllOrders();
        orders.push(orderData);
        localStorage.setItem('hc_orders', JSON.stringify(orders));
        storeLastTransactionId(orderData.transactionId);
        return true;
    } catch (e) {
        console.error('Error saving order:', e);
        return false;
    }
}

/**
 * Find an order by transaction ID
 * @param {string} transactionId - The transaction ID to search for
 * @returns {Object|null} The order object or null if not found
 */
function findOrderByTransactionId(transactionId) {
    const orders = getAllOrders();
    return orders.find(order => order.transactionId === transactionId || order.txid === transactionId) || null;
}

/**
 * Find an order by Order ID
 * @param {string} orderId - The order ID to search for
 * @returns {Object|null} The order object or null if not found
 */
function findOrderById(orderId) {
    const orders = getAllOrders();
    return orders.find(order => order.id === orderId) || null;
}

/**
 * Update order status
 * @param {string} transactionId - The transaction ID of the order
 * @param {string} newStatus - The new status (e.g., 'Processing', 'Completed', 'Delivered')
 * @returns {boolean} Success status
 */
function updateOrderStatus(transactionId, newStatus) {
    try {
        const orders = getAllOrders();
        const orderIndex = orders.findIndex(order => order.transactionId === transactionId || order.txid === transactionId);
        
        if (orderIndex === -1) return false;
        
        orders[orderIndex].status = newStatus;
        orders[orderIndex].lastUpdated = new Date().toISOString();
        localStorage.setItem('hc_orders', JSON.stringify(orders));
        return true;
    } catch (e) {
        console.error('Error updating order status:', e);
        return false;
    }
}

// ==================== DISPLAY UTILITIES ====================

/**
 * Format transaction ID for display (with optional masking for privacy)
 * @param {string} transactionId - The transaction ID
 * @param {boolean} showFull - Whether to show the full ID (default true)
 * @returns {string} Formatted transaction ID
 */
function formatTransactionId(transactionId, showFull = true) {
    if (!transactionId) return 'N/A';
    if (showFull) return transactionId;
    
    // Show only first and last parts: TXN-... (masked middle)
    return transactionId.slice(0, 4) + '...' + transactionId.slice(-4);
}

/**
 * Get transaction ID from URL parameters or sessionStorage
 * @returns {string|null} The transaction ID or null if not found
 */
function getTransactionIdFromPageContext() {
    const params = new URLSearchParams(window.location.search);
    return params.get('transactionId') || getLastTransactionId();
}

/**
 * Get order ID from URL parameters
 * @returns {string|null} The order ID or null if not found
 */
function getOrderIdFromPageContext() {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId') || null;
}

// ==================== VALIDATION ====================

/**
 * Validate transaction ID format
 * @param {string} transactionId - The transaction ID to validate
 * @returns {boolean} Whether the transaction ID is valid
 */
function isValidTransactionId(transactionId) {
    const pattern = /^TXN-\d{6}-\d{6}-\d{3}$/;
    return pattern.test(transactionId);
}

/**
 * Validate order ID format
 * @param {string} orderId - The order ID to validate
 * @returns {boolean} Whether the order ID is valid
 */
function isValidOrderId(orderId) {
    const pattern = /^#\d{4}$/;
    return pattern.test(orderId);
}

// ==================== EXPORT FUNCTIONS ====================
// These are all globally available functions. No module exports needed for browser usage.
