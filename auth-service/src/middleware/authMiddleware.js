// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches user info to request
 * 
 * Usage: Add to any route that requires authentication
 * Example: router.get('/profile', authMiddleware, controller.getProfile)
 */
function authMiddleware(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Check Bearer format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token format. Use: Bearer <token>'
            });
        }

        const token = parts[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        // Note: Token uses 'id' not 'userId' (from login/register)
        req.user = {
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role || decoded.activeRole, // Legacy support
            roles: decoded.roles, // Modern array format
            activeRole: decoded.activeRole // Current active role
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed.'
        });
    }
}

/**
 * Optional Auth Middleware
 * Attaches user info if token is present, but doesn't block if absent
 * Useful for routes that have different behavior for logged-in vs anonymous users
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        // Token invalid but we don't block - just set user to null
        req.user = null;
        next();
    }
}

/**
 * Role-based Access Control Middleware
 * Use after authMiddleware to restrict access to specific roles
 * 
 * Usage: router.get('/admin', authMiddleware, requireRole('admin'), controller.adminOnly)
 * 
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;
module.exports.requireRole = requireRole;
