const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

// @desc    Get admin dashboard data
const getDashboard = async (req, res) => {
    try {
        const userStats = await query(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
        const totalUsers = await query(`SELECT COUNT(*) as count FROM users`);
        const totalCourses = await query(`SELECT COUNT(*) as count FROM courses`);
        const totalQuizzes = await query(`SELECT COUNT(*) as count FROM quizzes`);
        const totalAttempts = await query(`SELECT COUNT(*) as count FROM quiz_attempts`);

        const recentUsers = await query(
            `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10`
        );

        const recentActivity = await query(
            `SELECT al.*, u.name as user_name FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 20`
        );

        const systemStats = {
            totalUsers: totalUsers[0].count,
            totalCourses: totalCourses[0].count,
            totalQuizzes: totalQuizzes[0].count,
            totalAttempts: totalAttempts[0].count,
            usersByRole: userStats.reduce((acc, curr) => { acc[curr.role] = curr.count; return acc; }, {})
        };

        res.json({ success: true, data: { systemStats, recentUsers, recentActivity } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard.' });
    }
};

// @desc    Get all users
const getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let sql = `SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1`;
        const params = [];

        if (role) { sql += ' AND role = ?'; params.push(role); }
        if (search) { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        sql += ' ORDER BY created_at DESC';

        const users = await query(sql, params);
        res.json({ success: true, data: { users } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users.' });
    }
};

// @desc    Create user
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields required.' });
        }

        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ success: true, message: 'User created!', data: { userId: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user.' });
    }
};

// @desc    Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        await query('UPDATE users SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
            [name, email, role, isActive, id]);

        res.json({ success: true, message: 'User updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user.' });
    }
};

// @desc    Delete user
const deleteUser = async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = ? AND id != ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'User deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user.' });
    }
};

// @desc    Reset user password
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        res.json({ success: true, message: 'Password reset!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error resetting password.' });
    }
};

// @desc    Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await query(
            `SELECT c.*, u.name as faculty_name,
                    (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count
             FROM courses c LEFT JOIN users u ON c.faculty_id = u.id ORDER BY c.name`
        );
        res.json({ success: true, data: { courses } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching courses.' });
    }
};

// @desc    Create course
const createCourse = async (req, res) => {
    try {
        const { name, code, description, facultyId } = req.body;
        const result = await query(
            'INSERT INTO courses (name, code, description, faculty_id) VALUES (?, ?, ?, ?)',
            [name, code, description, facultyId]
        );
        res.status(201).json({ success: true, message: 'Course created!', data: { courseId: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating course.' });
    }
};

// @desc    Update course
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, facultyId, isActive } = req.body;

        await query('UPDATE courses SET name = ?, code = ?, description = ?, faculty_id = ?, is_active = ? WHERE id = ?',
            [name, code, description, facultyId, isActive, id]);

        res.json({ success: true, message: 'Course updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating course.' });
    }
};

// @desc    Delete course
const deleteCourse = async (req, res) => {
    try {
        await query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Course deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting course.' });
    }
};

// @desc    Enroll student in course
const enrollStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        await query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [studentId, courseId]);
        res.status(201).json({ success: true, message: 'Student enrolled!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error enrolling student.' });
    }
};

// @desc    Get system analytics
const getAnalytics = async (req, res) => {
    try {
        const quizzesByMonth = await query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
             FROM quizzes GROUP BY month ORDER BY month DESC LIMIT 12`
        );

        const attemptsByMonth = await query(
            `SELECT DATE_FORMAT(submitted_at, '%Y-%m') as month, COUNT(*) as count
             FROM quiz_attempts WHERE status = 'completed' GROUP BY month ORDER BY month DESC LIMIT 12`
        );

        const avgScores = await query(
            `SELECT c.name as course_name, ROUND(AVG((qa.score / qa.total_marks) * 100), 1) as avg_score
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qa.total_marks > 0
             GROUP BY c.id, c.name`
        );

        res.json({ success: true, data: { quizzesByMonth, attemptsByMonth, avgScores } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching analytics.' });
    }
};

// @desc    Get audit logs
const getAuditLogs = async (req, res) => {
    try {
        const logs = await query(
            `SELECT al.*, u.name as user_name FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 100`
        );
        res.json({ success: true, data: { logs } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching logs.' });
    }
};

module.exports = {
    getDashboard, getUsers, createUser, updateUser, deleteUser, resetPassword,
    getCourses, createCourse, updateCourse, deleteCourse, enrollStudent,
    getAnalytics, getAuditLogs
};
