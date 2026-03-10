const express = require('express');
const router = express.Router();
const {
    getDashboard, getUsers, createUser, updateUser, deleteUser, resetPassword,
    bulkImportUsers,
    getCourses, createCourse, updateCourse, deleteCourse, enrollStudent,
    getAnalytics, getAuditLogs
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetPassword);
router.post('/users/bulk-import', bulkImportUsers);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.post('/enrollments', enrollStudent);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
