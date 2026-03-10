const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password.'
            });
        }

        // Validate domain
        if (!email.toLowerCase().endsWith('@vcw.ac.in')) {
            return res.status(400).json({
                success: false,
                message: 'Only college domain IDs (@vcw.ac.in) are accepted.'
            });
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only allow student registration by default
        // Faculty and admin must be created by admin
        const userRole = role === 'faculty' ? 'faculty' : 'student';

        // Insert user
        const result = await query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );

        // Get created user
        const users = await query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = users[0];

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration.'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user
        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact admin.'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile_image: user.profile_image,
                    department: user.department_name,
                    designation: user.designation,
                    level: user.level,
                    funding_type: user.funding_type,
                    year: user.year
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login.'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const users = await query(
            `SELECT id, name, email, role, profile_image, is_active, created_at,
                    department_name as department, designation, level, funding_type, year
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            data: { user: users[0] }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile.'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password.'
            });
        }

        // Get user with password
        const users = await query(
            'SELECT * FROM users WHERE id = ?',
            [req.user.id]
        );

        const user = users[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({
            success: true,
            message: 'Password updated successfully!'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating password.'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updatePassword
};
