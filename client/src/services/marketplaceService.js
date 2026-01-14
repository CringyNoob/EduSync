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
  }
};

export default marketplaceService;
