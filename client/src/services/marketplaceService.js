import api from '../utils/api';

/**
 * Marketplace Service - All marketplace related API calls
 */
const marketplaceService = {
  /**
   * Get all vendors by type
   * @param {string} type - 'STARTUP' or 'FOOD_VENDOR'
   * @returns {Promise} Response with vendors array
   */
  getVendors: async (type) => {
    const response = await api.get(`/market/vendors?type=${type}`);
    return response.data;
  },

  /**
   * Get vendor by ID with all products
   * @param {string} id - Vendor ID
   * @returns {Promise} Response with vendor details and products
   */
  getVendorById: async (id) => {
    const response = await api.get(`/market/vendors/${id}`);
    return response.data;
  },

  /**
   * Increment vendor profile views (for public marketplace visits)
   * @param {string} id - Vendor ID
   * @returns {Promise} Response with success status
   */
  incrementVendorViews: async (id) => {
    const response = await api.post(`/market/vendors/${id}/increment-views`);
    return response.data;
  },

  /**
   * Register a new vendor (shop registration)
   * @param {Object} vendorData - Vendor registration data
   * @param {string} vendorData.name - Shop/Business name
   * @param {string} vendorData.type - 'STARTUP' or 'FOOD_VENDOR'
   * @param {string} vendorData.description - Shop description
   * @param {string} vendorData.logoUrl - Logo URL (optional)
   * @param {string} vendorData.businessAddress - Business address
   * @param {string} vendorData.contactEmail - Contact email
   * @param {string} vendorData.contactPhone - Contact phone number
   * @returns {Promise} Response with vendorId and success status
   */
  registerVendor: async (vendorData) => {
    const response = await api.post('/market/vendors/register', vendorData);
    return response.data;
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise} Response with product details
   */
  getProductById: async (id) => {
    const response = await api.get(`/market/products/${id}`);
    return response.data;
  },

  /**
   * Get all pre-owned listings
   * @param {string} category - Optional category filter
   * @returns {Promise} Response with listings array
   */
  getPreownedListings: async (category = null) => {
    const url = category ? `/market/preowned?category=${category}` : '/market/preowned';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get single pre-owned listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise} Response with listing details
   */
  getPreownedById: async (id) => {
    const response = await api.get(`/market/preowned/${id}`);
    return response.data;
  },

  /**
   * Create new pre-owned listing
   * @param {Object} listingData - Listing data
   * @param {number} listingData.seller_id - Seller user ID
   * @param {string} listingData.seller_name - Seller name
   * @param {string} listingData.title - Listing title
   * @param {string} listingData.description - Listing description
   * @param {number} listingData.price - Item price
   * @param {string} listingData.category - Category (TEXTBOOKS, ELECTRONICS, etc.)
   * @param {string[]} listingData.images - Array of image URLs
   * @returns {Promise} Response with created listing
   */
  createPreownedListing: async (listingData) => {
    const response = await api.post('/market/preowned', listingData);
    return response.data;
  },

  /**
   * Mark pre-owned listing as sold
   * @param {string} id - Listing ID
   * @returns {Promise} Response confirming update
   */
  markAsSold: async (id) => {
    const response = await api.put(`/market/preowned/${id}/sold`);
    return response.data;
  },

  /**
   * Mark pre-owned listing as sold (alias)
   * @param {string} id - Listing ID
   * @returns {Promise} Response confirming update
   */
  markPreownedAsSold: async (id) => {
    const response = await api.put(`/market/preowned/${id}/sold`);
    return response.data;
  },

  /**
   * Update a pre-owned listing
   * @param {string} id - Listing ID
   * @param {Object} listingData - Updated listing data
   * @param {string} listingData.title - Listing title
   * @param {string} listingData.description - Listing description
   * @param {number} listingData.price - Item price
   * @param {string} listingData.category - Category
   * @param {string[]} listingData.images - Array of image URLs
   * @param {string} listingData.seller_id - Seller ID (for authorization)
   * @returns {Promise} Response with updated listing
   */
  updatePreownedListing: async (id, listingData) => {
    const response = await api.put(`/market/preowned/${id}`, listingData);
    return response.data;
  },

  /**
   * Delete a pre-owned listing
   * @param {string} id - Listing ID
   * @param {string} sellerId - Seller ID (for authorization)
   * @returns {Promise} Response confirming deletion
   */
  deletePreownedListing: async (id, sellerId) => {
    const response = await api.delete(`/market/preowned/${id}`, {
      data: { seller_id: sellerId }
    });
    return response.data;
  },

  /**
   * Get all pre-owned listings by a specific user
   * @param {string} userId - User ID
   * @returns {Promise} Response with listings array
   */
  getPreownedByUser: async (userId) => {
    const response = await api.get(`/market/preowned/user/${userId}`);
    return response.data;
  },

  // ==========================================
  // VENDOR MANAGEMENT APIs (for shop owners)
  // ==========================================

  /**
   * Get the current user's vendor (shop)
   * @returns {Promise} Response with vendor details
   */
  getMyVendor: async () => {
    const response = await api.get('/market/vendors/my-shop');
    return response.data;
  },

  /**
   * Update vendor profile
   * @param {Object} vendorData - Updated vendor data
   * @returns {Promise} Response with updated vendor
   */
  updateMyVendor: async (vendorData) => {
    const response = await api.put('/market/vendors/my-shop', vendorData);
    return response.data;
  },

  /**
   * Get all products for the current user's vendor
   * @returns {Promise} Response with products array
   */
  getMyProducts: async () => {
    const response = await api.get('/market/vendors/my-shop/products');
    return response.data;
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise} Response with created product
   */
  createProduct: async (productData) => {
    const response = await api.post('/market/vendors/my-shop/products', productData);
    return response.data;
  },

  /**
   * Update a product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} Response with updated product
   */
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/market/vendors/my-shop/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise} Response confirming deletion
   */
  deleteProduct: async (productId) => {
    const response = await api.delete(`/market/vendors/my-shop/products/${productId}`);
    return response.data;
  },

  /**
   * Get all orders for the current user's vendor
   * @param {string} status - Optional status filter (comma-separated)
   * @returns {Promise} Response with orders array
   */
  getMyOrders: async (status = null) => {
    const url = status ? `/market/vendors/my-shop/orders?status=${status}` : '/market/vendors/my-shop/orders';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise} Response with updated order
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/market/vendors/my-shop/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Get vendor analytics
   * @param {string} range - Time range (THIS_WEEK, THIS_MONTH, ALL_TIME)
   * @returns {Promise} Response with analytics data
   */
  getMyAnalytics: async (range = 'THIS_WEEK') => {
    const response = await api.get(`/market/vendors/my-shop/analytics?range=${range}`);
    return response.data;
  },

  // ========================================
  // CATEGORY MANAGEMENT
  // ========================================

  /**
   * Get all categories for the current user's vendor
   * @returns {Promise} Response with categories array and vendor type
   */
  getMyCategories: async () => {
    const response = await api.get('/market/vendors/my-shop/categories');
    return response.data;
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data { name, icon?, color? }
   * @returns {Promise} Response with created category
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/market/vendors/my-shop/categories', categoryData);
    return response.data;
  },

  /**
   * Update a category
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Category data { name?, icon?, color?, display_order? }
   * @returns {Promise} Response with updated category
   */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/market/vendors/my-shop/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @returns {Promise} Response with success status
   */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/market/vendors/my-shop/categories/${categoryId}`);
    return response.data;
  },

  // ========================================
  // CUSTOMER ORDER APIs
  // ========================================

  /**
   * Place a new order
   * @param {Object} orderData - Order data
   * @param {string} orderData.vendor_id - Vendor ID
   * @param {Array} orderData.items - Order items [{ product_id, product_name, quantity, price }]
   * @param {string} orderData.customer_name - Customer name
   * @param {string} orderData.customer_phone - Customer phone
   * @param {string} orderData.customer_address - Delivery address
   * @param {string} orderData.payment_method - CASH, BKASH, NAGAD, CARD
   * @param {number} orderData.subtotal - Subtotal amount
   * @param {number} orderData.delivery_fee - Delivery fee
   * @param {number} orderData.total - Total amount
   * @param {string} orderData.notes - Special notes
   * @returns {Promise} Response with created order
   */
  placeOrder: async (orderData) => {
    const response = await api.post('/market/orders', orderData);
    return response.data;
  },

  /**
   * Get customer's orders
   * @param {string} status - Optional status filter (comma-separated)
   * @returns {Promise} Response with orders array
   */
  getMyCustomerOrders: async (status = null) => {
    const url = status ? `/market/orders/my-orders?status=${status}` : '/market/orders/my-orders';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get single order details
   * @param {string} orderId - Order ID
   * @returns {Promise} Response with order details
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/market/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order (only if PENDING)
   * @param {string} orderId - Order ID
   * @returns {Promise} Response with cancelled order
   */
  cancelOrder: async (orderId) => {
    const response = await api.put(`/market/orders/${orderId}/cancel`);
    return response.data;
  }
};

export default marketplaceService;
