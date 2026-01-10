import api from '../utils/api';

const BDT_RATE = 115;

const convertPrice = (price) => {
  if (!price) return 0;
  // If price is already high (likely BDT), don't convert again
  if (parseFloat(price) > 100) return parseFloat(price);
  return parseFloat(price) * BDT_RATE;
};

const renthubService = {
  // =====================================================
  // RENTAL LISTINGS
  // =====================================================

  /**
   * Get all rental listings
   * @param {Object} params - Query parameters { category, status }
   * @returns {Promise} API response with listings array
   */
  getAllListings: async (params = {}) => {
    try {
      const response = await api.get('/renthub/listings', { params });
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(listing => ({
          ...listing,
          daily_price: convertPrice(listing.daily_price)
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get single rental listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise} API response with listing data
   */
  getListingById: async (id) => {
    try {
      const response = await api.get(`/renthub/listings/${id}`);
      if (response.data) {
        response.data.daily_price = convertPrice(response.data.daily_price);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new rental listing
   * @param {Object} listingData - Listing details
   * @returns {Promise} API response with created listing
   */
  createListing: async (listingData) => {
    try {
      const response = await api.post('/renthub/listings', listingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update rental listing
   * @param {string} id - Listing ID
   * @param {Object} updateData - Updated listing data
   * @returns {Promise} API response with updated listing
   */
  updateListing: async (id, updateData) => {
    try {
      const response = await api.put(`/renthub/listings/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete rental listing
   * @param {string} id - Listing ID
   * @returns {Promise} API response
   */
  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/renthub/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's listings (as owner)
   * @param {string} userId - User ID
   * @returns {Promise} API response with user's listings
   */
  getUserListings: async (userId) => {
    try {
      const response = await api.get(`/renthub/user/${userId}/listings`);
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(listing => ({
          ...listing,
          daily_price: convertPrice(listing.daily_price)
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // =====================================================
  // RENTAL TRANSACTIONS
  // =====================================================

  /**
   * Create rental transaction (rent an item)
   * @param {Object} transactionData - Transaction details
   * @returns {Promise} API response with created transaction
   */
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/renthub/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's rentals (as renter)
   * @param {string} userId - User ID
   * @returns {Promise} API response with user's rentals
   */
  getUserRentals: async (userId) => {
    try {
      const response = await api.get(`/renthub/user/${userId}/rentals`);
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(rental => ({
          ...rental,
          daily_price: convertPrice(rental.daily_price),
          total_price: convertPrice(rental.total_price)
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Complete rental transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise} API response
   */
  completeTransaction: async (transactionId) => {
    try {
      const response = await api.put(`/renthub/transactions/${transactionId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default renthubService;
