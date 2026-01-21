// src/middleware/authMiddleware.js
// JWT Authentication Middleware for Chat Service
const jwt = require('jsonwebtoken');

/**
 * Express Middleware: Verify JWT token
 * Attaches user info to req.user
 */
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token format. Use: Bearer <token>'
            });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role || decoded.activeRole
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please login again.'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
}

/**
 * Socket.io Middleware: Verify JWT from handshake
 * @param {Socket} socket 
 * @param {Function} next 
 */
function socketAuthMiddleware(socket, next) {
    try {
        // Token can be in auth object or query params
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to socket
        socket.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role || decoded.activeRole
        };

        next();
    } catch (error) {
        console.error('Socket auth error:', error.message);
        next(new Error('Invalid or expired token'));
    }
}

module.exports = {
    authMiddleware,
    socketAuthMiddleware
};
