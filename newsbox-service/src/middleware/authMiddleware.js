const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware for NewsBox Service
 * Verifies Bearer token and attaches user info to request
 */
function authMiddleware(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check Bearer format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use: Bearer <token>'
            });
        }

        const token = parts[1];

        // Verify token (use same JWT_SECRET as auth-service)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        // Attach user info to request (support both 'id' and 'userId' for compatibility)
        req.user = {
            userId: decoded.id || decoded.userId, // Support both field names
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            role: decoded.role,
            department: decoded.department,
            batch: decoded.batch
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
}

/**
 * Optional Auth Middleware
 * Attaches user info if token is present, but doesn't block if absent
 */
function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            req.user = null;
            return next();
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            req.user = null;
            return next();
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

        req.user = {
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            role: decoded.role,
            department: decoded.department,
            batch: decoded.batch
        };

        next();

    } catch (error) {
        // If token is invalid, just continue without user info
        req.user = null;
        next();
    }
}

/**
 * Admin Only Middleware
 * Requires user to be authenticated and have Admin role
 */
function adminMiddleware(req, res, next) {
    // First ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Check for Admin role
    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
}

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    adminMiddleware
};
