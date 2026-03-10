const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const users = await query(
            'SELECT id, name, email, role, is_active, stream, level, department_name, designation, year FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact admin.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

// Role-based access control middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Check if user is admin
const isAdmin = authorize('admin');

// Check if user is faculty
const isFaculty = authorize('faculty');

// Check if user is student
const isStudent = authorize('student');

// Check if user is faculty or admin
const isFacultyOrAdmin = authorize('faculty', 'admin');

module.exports = {
    verifyToken,
    authorize,
    isAdmin,
    isFaculty,
    isStudent,
    isFacultyOrAdmin
};
