const pool = require('../config/db');

// =====================================================
// GET ALL RENTAL LISTINGS
// =====================================================

const getAllRentalListings = async (req, res) => {
  try {
    const { category, status = 'AVAILABLE' } = req.query;

    let query = 'SELECT * FROM rental_listings WHERE status = $1';
    const params = [status];

    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching rental listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rental listings'
    });
  }
};

// =====================================================
// GET SINGLE RENTAL LISTING BY ID
// =====================================================

const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM rental_listings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rental listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching rental listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rental listing'
    });
  }
};

// =====================================================
// CREATE NEW RENTAL LISTING
// =====================================================

const createListing = async (req, res) => {
  try {
    console.log('=== CREATE RENTAL LISTING REQUEST RECEIVED ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body data:', {
      ...req.body,
      images: req.body.images ? `[${req.body.images.length} images]` : 'none'
    });

    const {
      owner_id,
      owner_name,
      owner_email,
      title,
      description,
      daily_price,
      category,
      images,
      availability_start,
      availability_end
    } = req.body;

    // Validation
    if (!owner_id || !owner_name || !owner_email || !title || !daily_price || !availability_start || !availability_end) {
      console.log('Validation failed - missing fields:', {
        owner_id: !!owner_id,
        owner_name: !!owner_name,
        owner_email: !!owner_email,
        title: !!title,
        daily_price: !!daily_price,
        availability_start: !!availability_start,
        availability_end: !!availability_end
      });
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (daily_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Daily price must be greater than 0'
      });
    }

    const result = await pool.query(
      `INSERT INTO rental_listings 
      (owner_id, owner_name, owner_email, title, description, daily_price, category, images, availability_start, availability_end, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'AVAILABLE') 
      RETURNING *`,
      [owner_id, owner_name, owner_email, title, description, daily_price, category || 'Other', images || [], availability_start, availability_end]
    );

    res.status(201).json({
      success: true,
      message: 'Rental listing created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating rental listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rental listing'
    });
  }
};

// =====================================================
// UPDATE RENTAL LISTING
// =====================================================

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      daily_price,
      category,
      images,
      availability_start,
      availability_end,
      status
    } = req.body;

    // Check if listing exists
    const checkResult = await pool.query(
      'SELECT * FROM rental_listings WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rental listing not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (daily_price) {
      updates.push(`daily_price = $${paramCount++}`);
      values.push(daily_price);
    }
    if (category) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (images) {
      updates.push(`images = $${paramCount++}`);
      values.push(images);
    }
    if (availability_start) {
      updates.push(`availability_start = $${paramCount++}`);
      values.push(availability_start);
    }
    if (availability_end) {
      updates.push(`availability_end = $${paramCount++}`);
      values.push(availability_end);
    }
    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE rental_listings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Rental listing updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating rental listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rental listing'
    });
  }
};

// =====================================================
// DELETE RENTAL LISTING
// =====================================================

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM rental_listings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rental listing not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rental listing deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting rental listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rental listing'
    });
  }
};

// =====================================================
// CREATE RENTAL TRANSACTION (RENT AN ITEM)
// =====================================================

const createRentalTransaction = async (req, res) => {
  try {
    const {
      listing_id,
      renter_id,
      renter_name,
      renter_email,
      start_date,
      end_date
    } = req.body;

    // Validation
    if (!listing_id || !renter_id || !renter_name || !renter_email || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if listing exists and is available
    const listingResult = await pool.query(
      'SELECT * FROM rental_listings WHERE id = $1 AND status = $2',
      [listing_id, 'AVAILABLE']
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rental listing not found or not available'
      });
    }

    const listing = listingResult.rows[0];

    // Calculate duration and total price
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const durationDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

    if (durationDays <= 0) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    const totalPrice = durationDays * parseFloat(listing.daily_price);

    // Check if dates are within availability
    const availStart = new Date(listing.availability_start);
    const availEnd = new Date(listing.availability_end);

    if (startDateObj < availStart || endDateObj > availEnd) {
      return res.status(400).json({
        success: false,
        error: 'Selected dates are outside the availability period'
      });
    }

    // Check for conflicting rentals
    const conflictResult = await pool.query(
      `SELECT * FROM rental_transactions 
       WHERE listing_id = $1 
       AND status IN ('PENDING', 'ACTIVE')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [listing_id, start_date, end_date]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Item is already rented for the selected dates'
      });
    }

    // Create transaction
    const transactionResult = await pool.query(
      `INSERT INTO rental_transactions 
      (listing_id, renter_id, renter_name, renter_email, start_date, end_date, duration_days, daily_price, total_price, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE') 
      RETURNING *`,
      [listing_id, renter_id, renter_name, renter_email, start_date, end_date, durationDays, listing.daily_price, totalPrice]
    );

    // Update listing status to RENTED
    await pool.query(
      'UPDATE rental_listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['RENTED', listing_id]
    );

    res.status(201).json({
      success: true,
      message: 'Rental transaction created successfully',
      data: transactionResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating rental transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rental transaction'
    });
  }
};

// =====================================================
// GET USER'S RENTAL TRANSACTIONS (AS RENTER)
// =====================================================

const getUserRentals = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT rt.*, rl.title, rl.images, rl.owner_name, rl.owner_email
       FROM rental_transactions rt
       JOIN rental_listings rl ON rt.listing_id = rl.id
       WHERE rt.renter_id = $1
       ORDER BY rt.created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user rentals'
    });
  }
};

// =====================================================
// GET USER'S LISTINGS (AS OWNER)
// =====================================================

const getUserListings = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM rental_listings WHERE owner_id = $1 ORDER BY created_at DESC',
      [user_id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user listings'
    });
  }
};

// =====================================================
// COMPLETE RENTAL TRANSACTION
// =====================================================

const completeRentalTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Update transaction status
    const transactionResult = await pool.query(
      `UPDATE rental_transactions 
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rental transaction not found'
      });
    }

    const transaction = transactionResult.rows[0];

    // Update listing status back to AVAILABLE
    await pool.query(
      'UPDATE rental_listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['AVAILABLE', transaction.listing_id]
    );

    res.status(200).json({
      success: true,
      message: 'Rental transaction completed successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error completing rental transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete rental transaction'
    });
  }
};

module.exports = {
  getAllRentalListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createRentalTransaction,
  getUserRentals,
  getUserListings,
  completeRentalTransaction
};
