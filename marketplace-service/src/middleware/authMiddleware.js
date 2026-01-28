const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware for Marketplace Service
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

        // Attach user info to request
        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            name: decoded.name || decoded.email.split('@')[0],
            role: decoded.role,
            roles: decoded.roles || ['STUDENT'],
            activeRole: decoded.activeRole || 'STUDENT',
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
            message: 'Authentication error.'
        });
    }
}

/**
 * Admin Middleware
 * Requires user to have ADMIN activeRole
 */
function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    // Check if user's active role is ADMIN
    const isAdmin = req.user.activeRole === 'ADMIN' || req.user.role === 'Admin' || req.user.role === 'ADMIN';
    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }

    next();
}

module.exports = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
