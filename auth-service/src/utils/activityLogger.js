// src/utils/activityLogger.js
const db = require('../config/db');

/**
 * Log an activity to the database
 * @param {Object} activity - Activity details
 * @param {string} activity.userId - User who performed the action (optional)
 * @param {string} activity.userName - Name of the user
 * @param {string} activity.userEmail - Email of the user
 * @param {string} activity.actionType - Type of action (USER_REGISTERED, VENDOR_APPROVED, etc.)
 * @param {string} activity.entityType - Type of entity (USER, VENDOR, ISSUE, POST)
 * @param {string} activity.entityId - ID of the entity (optional)
 * @param {string} activity.description - Human-readable description
 * @param {Object} activity.metadata - Additional data (optional)
 * @param {string} activity.ipAddress - IP address (optional)
 */
async function logActivity({
    userId = null,
    userName,
    userEmail,
    actionType,
    entityType = null,
    entityId = null,
    description,
    metadata = null,
    ipAddress = null
}) {
    try {
        await db.query(`
            INSERT INTO activity_logs (
                user_id, user_name, user_email, action_type, 
                entity_type, entity_id, description, metadata, ip_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [userId, userName, userEmail, actionType, entityType, entityId, description, metadata, ipAddress]);
        
        console.log('✅ Activity logged:', actionType);
    } catch (error) {
        console.error('❌ Error logging activity:', error);
        // Don't throw - logging failures shouldn't break the main flow
    }
}

module.exports = { logActivity };
