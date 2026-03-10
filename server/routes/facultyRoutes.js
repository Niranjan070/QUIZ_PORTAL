const express = require('express');
const router = express.Router();
const {
    getDashboard, getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizResults, getCourseStudents,
    enrollStudent, unenrollStudent, searchStudents, bulkEnrollStudents,
    facultyCreateCourse, facultyUpdateCourse, facultyDeleteCourse,
    bulkImportQuestions, toggleQuizArchive, getCourseReport
} = require('../controllers/facultyController');
const { verifyToken, isFaculty } = require('../middleware/auth');

router.use(verifyToken);

router.get('/dashboard', getDashboard);
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.post('/questions/bulk', bulkImportQuestions);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.patch('/quizzes/:id/archive', toggleQuizArchive);
router.get('/quizzes/:id/results', getQuizResults);
router.get('/courses/:id/students', getCourseStudents);
router.get('/courses/:courseId/report', getCourseReport);
router.delete('/courses/:courseId/students/:studentId', unenrollStudent);
router.post('/enroll', enrollStudent);
router.post('/enroll/bulk', bulkEnrollStudents);
router.get('/students/search', searchStudents);
router.post('/courses', facultyCreateCourse);
router.put('/courses/:id', facultyUpdateCourse);
router.delete('/courses/:id', facultyDeleteCourse);

module.exports = router;
