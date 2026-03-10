const { query } = require('../config/database');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await query(
            `SELECT * FROM notifications 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: { notifications }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Error fetching notifications.' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notification.' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.user.id]
        );

        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notifications.' });
    }
};

// Utility function to create a notification (can be imported elsewhere)
const createNotification = async (userId, title, message, type = 'info', link = null) => {
    try {
        await query(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, title, message, type, link]
        );
        return true;
    } catch (error) {
        console.error('Create notification error:', error);
        return false;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
};
