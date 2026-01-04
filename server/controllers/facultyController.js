const { query } = require('../config/database');

// @desc    Get faculty dashboard data
// @route   GET /api/faculty/dashboard
const getDashboard = async (req, res) => {
    try {
        const facultyId = req.user.id;

        const courses = await query(
            `SELECT c.*, 
                    (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
                    (SELECT COUNT(*) FROM quizzes WHERE course_id = c.id) as quiz_count
             FROM courses c WHERE c.faculty_id = ?`,
            [facultyId]
        );

        const totalStudents = await query(
            `SELECT COUNT(DISTINCT e.student_id) as count FROM enrollments e
             JOIN courses c ON e.course_id = c.id WHERE c.faculty_id = ?`,
            [facultyId]
        );

        const totalQuizzes = await query(
            `SELECT COUNT(*) as count FROM quizzes q
             JOIN courses c ON q.course_id = c.id WHERE c.faculty_id = ?`,
            [facultyId]
        );

        const totalQuestions = await query(
            `SELECT COUNT(*) as count FROM questions WHERE created_by = ?`,
            [facultyId]
        );

        const recentSubmissions = await query(
            `SELECT qa.id, qa.score, qa.total_marks, qa.submitted_at,
                    u.name as student_name, q.title as quiz_title
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             JOIN users u ON qa.student_id = u.id
             WHERE c.faculty_id = ? AND qa.status = 'completed'
             ORDER BY qa.submitted_at DESC LIMIT 10`,
            [facultyId]
        );

        res.json({
            success: true,
            data: {
                stats: {
                    totalCourses: courses.length,
                    totalStudents: totalStudents[0].count,
                    totalQuizzes: totalQuizzes[0].count,
                    totalQuestions: totalQuestions[0].count
                },
                courses,
                recentSubmissions
            }
        });
    } catch (error) {
        console.error('Faculty dashboard error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard.' });
    }
};

// @desc    Get question bank
const getQuestions = async (req, res) => {
    try {
        const { courseId, type, difficulty } = req.query;
        let sql = `SELECT q.*, c.name as course_name FROM questions q
                   JOIN courses c ON q.course_id = c.id
                   WHERE q.created_by = ?`;
        const params = [req.user.id];

        if (courseId) { sql += ' AND q.course_id = ?'; params.push(courseId); }
        if (type) { sql += ' AND q.question_type = ?'; params.push(type); }
        if (difficulty) { sql += ' AND q.difficulty = ?'; params.push(difficulty); }
        sql += ' ORDER BY q.created_at DESC';

        const questions = await query(sql, params);
        for (const q of questions) {
            q.answers = await query('SELECT * FROM answers WHERE question_id = ?', [q.id]);
        }

        res.json({ success: true, data: { questions } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching questions.' });
    }
};

// @desc    Create a question
const createQuestion = async (req, res) => {
    try {
        const { courseId, topicId, questionText, questionType, difficulty, marks, answers } = req.body;
        if (!courseId || !questionText || !questionType) {
            return res.status(400).json({ success: false, message: 'Required fields missing.' });
        }

        const result = await query(
            `INSERT INTO questions (course_id, topic_id, question_text, question_type, difficulty, marks, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [courseId, topicId || null, questionText, questionType, difficulty || 'medium', marks || 1, req.user.id]
        );

        if (answers?.length > 0) {
            for (const a of answers) {
                await query('INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
                    [result.insertId, a.text, a.isCorrect || false]);
            }
        }

        res.status(201).json({ success: true, message: 'Question created!', data: { questionId: result.insertId } });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ success: false, message: 'Error creating question.', error: error.message });
    }
};

// @desc    Update a question
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, questionType, difficulty, marks, answers } = req.body;

        await query(`UPDATE questions SET question_text = ?, question_type = ?, difficulty = ?, marks = ? WHERE id = ? AND created_by = ?`,
            [questionText, questionType, difficulty, marks, id, req.user.id]);

        if (answers) {
            await query('DELETE FROM answers WHERE question_id = ?', [id]);
            for (const a of answers) {
                await query('INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
                    [id, a.text, a.isCorrect || false]);
            }
        }

        res.json({ success: true, message: 'Question updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating question.' });
    }
};

// @desc    Delete a question
const deleteQuestion = async (req, res) => {
    try {
        await query('DELETE FROM questions WHERE id = ? AND created_by = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Question deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting question.' });
    }
};

// @desc    Get all quizzes
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await query(
            `SELECT q.*, c.name as course_name,
                    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
                    (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
             FROM quizzes q JOIN courses c ON q.course_id = c.id
             WHERE c.faculty_id = ? ORDER BY q.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: { quizzes } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching quizzes.' });
    }
};

// @desc    Create a quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, durationMinutes, maxAttempts, startTime, endTime, questionIds } = req.body;
        if (!title || !courseId || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Required fields missing.' });
        }

        let totalMarks = 0;
        if (questionIds?.length > 0) {
            const m = await query('SELECT SUM(marks) as total FROM questions WHERE id IN (?)', [questionIds]);
            totalMarks = m[0].total || 0;
        }

        const result = await query(
            `INSERT INTO quizzes (title, description, course_id, duration_minutes, total_marks, max_attempts, start_time, end_time, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, courseId, durationMinutes || 30, totalMarks, maxAttempts || 1, startTime, endTime, req.user.id]
        );

        if (questionIds?.length > 0) {
            for (let i = 0; i < questionIds.length; i++) {
                const q = await query('SELECT marks FROM questions WHERE id = ?', [questionIds[i]]);
                await query('INSERT INTO quiz_questions (quiz_id, question_id, question_order, marks) VALUES (?, ?, ?, ?)',
                    [result.insertId, questionIds[i], i + 1, q[0]?.marks || 1]);
            }
        }

        res.status(201).json({ success: true, message: 'Quiz created!', data: { quizId: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating quiz.' });
    }
};

// @desc    Update quiz
const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, durationMinutes, maxAttempts, startTime, endTime, isPublished } = req.body;

        await query(
            `UPDATE quizzes SET title = ?, description = ?, duration_minutes = ?, max_attempts = ?, start_time = ?, end_time = ?, is_published = ? WHERE id = ?`,
            [title, description, durationMinutes, maxAttempts, startTime, endTime, isPublished, id]
        );

        res.json({ success: true, message: 'Quiz updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating quiz.' });
    }
};

// @desc    Delete quiz
const deleteQuiz = async (req, res) => {
    try {
        await query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Quiz deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting quiz.' });
    }
};

// @desc    Get quiz results
const getQuizResults = async (req, res) => {
    try {
        const results = await query(
            `SELECT qa.*, u.name as student_name, u.email as student_email
             FROM quiz_attempts qa JOIN users u ON qa.student_id = u.id
             WHERE qa.quiz_id = ? ORDER BY qa.submitted_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, data: { results } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching results.' });
    }
};

// @desc    Get course students
const getCourseStudents = async (req, res) => {
    try {
        const students = await query(
            `SELECT u.id, u.name, u.email, e.enrolled_at FROM users u
             JOIN enrollments e ON u.id = e.student_id WHERE e.course_id = ?`,
            [req.params.id]
        );
        res.json({ success: true, data: { students } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching students.' });
    }
};

module.exports = {
    getDashboard, getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizResults, getCourseStudents
};
