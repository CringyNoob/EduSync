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
  }
};

export default marketplaceService;
