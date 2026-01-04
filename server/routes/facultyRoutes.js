const express = require('express');
const router = express.Router();
const {
    getDashboard, getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizResults, getCourseStudents
} = require('../controllers/facultyController');
const { verifyToken, isFaculty } = require('../middleware/auth');

router.use(verifyToken);

router.get('/dashboard', getDashboard);
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.get('/quizzes/:id/results', getQuizResults);
router.get('/courses/:id/students', getCourseStudents);

module.exports = router;
