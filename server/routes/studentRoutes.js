const express = require('express');
const router = express.Router();
const {
    getDashboard, getCourses, getQuizzes, startQuiz,
    saveAnswer, submitQuiz, getResult, getResultsHistory
} = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/auth');

router.use(verifyToken);

router.get('/dashboard', getDashboard);
router.get('/courses', getCourses);
router.get('/quizzes', getQuizzes);
router.post('/quizzes/:id/start', startQuiz);
router.post('/attempts/:attemptId/answer', saveAnswer);
router.post('/attempts/:attemptId/submit', submitQuiz);
router.get('/attempts/:attemptId/result', getResult);
router.get('/results', getResultsHistory);

module.exports = router;
