const { query } = require('../config/database');

// @desc    Get dashboard data for student
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = async (req, res) => {
    try {
        const { id: studentId, department_name, level, stream, year } = req.user;

        // Get enrolled courses count
        const coursesResult = await query(
            'SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = "active"',
            [studentId]
        );

        // Get active quizzes (quizzes that are available now)
        const activeQuizzes = await query(
            `SELECT q.id, q.title, q.description, q.duration_minutes, q.total_marks,
                    q.start_time, q.end_time, c.name as course_name, c.code as course_code,
                    (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND student_id = ?) as attempts_made,
                    q.max_attempts
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             JOIN enrollments e ON e.course_id = c.id
             WHERE e.student_id = ? 
             AND q.is_published = TRUE
             AND q.start_time <= NOW()
             AND q.end_time >= NOW()
             AND (q.target_department IS NULL OR q.target_department = ?)
             AND (q.target_level IS NULL OR q.target_level = ?)
             AND (q.target_stream IS NULL OR q.target_stream = ?)
             AND (q.target_year IS NULL OR q.target_year = ?)
             ORDER BY q.end_time ASC
             LIMIT 10`,
            [studentId, studentId, department_name, level, stream, year]
        );

        // Get upcoming quizzes
        const upcomingQuizzes = await query(
            `SELECT q.id, q.title, q.description, q.duration_minutes, q.total_marks,
                    q.start_time, q.end_time, c.name as course_name
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             JOIN enrollments e ON e.course_id = c.id
             WHERE e.student_id = ? 
             AND q.is_published = TRUE
             AND q.start_time > NOW()
             AND (q.target_department IS NULL OR q.target_department = ?)
             AND (q.target_level IS NULL OR q.target_level = ?)
             AND (q.target_stream IS NULL OR q.target_stream = ?)
             AND (q.target_year IS NULL OR q.target_year = ?)
             ORDER BY q.start_time ASC
             LIMIT 5`,
            [studentId, department_name, level, stream, year]
        );

        // Get recent results
        const recentResults = await query(
            `SELECT qa.id, qa.score, qa.total_marks, qa.status, qa.submitted_at,
                    q.title as quiz_title, c.name as course_name,
                    ROUND((qa.score / qa.total_marks) * 100, 1) as percentage
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qa.student_id = ? AND qa.status = 'completed'
             ORDER BY qa.submitted_at DESC
             LIMIT 5`,
            [studentId]
        );

        // Get enrolled courses
        const enrolledCourses = await query(
            `SELECT c.id, c.name, c.code, c.description,
                    u.name as faculty_name,
                    (SELECT COUNT(*) FROM quizzes WHERE course_id = c.id AND is_published = TRUE) as total_quizzes
             FROM courses c
             JOIN enrollments e ON e.course_id = c.id
             LEFT JOIN users u ON c.faculty_id = u.id
             WHERE e.student_id = ? AND e.status = 'active'
             ORDER BY c.name`,
            [studentId]
        );

        // Get notifications
        const notifications = await query(
            `SELECT id, title, message, type, is_read, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 5`,
            [studentId]
        );

        // Calculate overall performance
        const performance = await query(
            `SELECT 
                COUNT(*) as total_quizzes_taken,
                ROUND(AVG((score / total_marks) * 100), 1) as average_percentage,
                SUM(CASE WHEN (score / total_marks) >= 0.4 THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN (score / total_marks) < 0.4 THEN 1 ELSE 0 END) as failed
             FROM quiz_attempts
             WHERE student_id = ? AND status = 'completed' AND total_marks > 0`,
            [studentId]
        );

        res.json({
            success: true,
            data: {
                stats: {
                    enrolledCourses: coursesResult[0].count,
                    activeQuizzes: activeQuizzes.length,
                    upcomingQuizzes: upcomingQuizzes.length,
                    quizzesTaken: performance[0].total_quizzes_taken || 0,
                    averageScore: performance[0].average_percentage || 0
                },
                activeQuizzes,
                upcomingQuizzes,
                recentResults,
                enrolledCourses,
                notifications,
                performance: performance[0]
            }
        });
    } catch (error) {
        console.error('Student dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data.'
        });
    }
};

// @desc    Get enrolled courses
// @route   GET /api/student/courses
// @access  Private (Student)
const getCourses = async (req, res) => {
    try {
        const courses = await query(
            `SELECT c.*, u.name as faculty_name,
                    (SELECT COUNT(*) FROM quizzes WHERE course_id = c.id AND is_published = TRUE) as total_quizzes,
                    e.enrolled_at
             FROM courses c
             JOIN enrollments e ON e.course_id = c.id
             LEFT JOIN users u ON c.faculty_id = u.id
             WHERE e.student_id = ? AND e.status = 'active'
             ORDER BY c.name`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: { courses }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching courses.'
        });
    }
};

// @desc    Get available quizzes
// @route   GET /api/student/quizzes
// @access  Private (Student)
const getQuizzes = async (req, res) => {
    try {
        const { status } = req.query; // 'active', 'upcoming', 'past'
        const studentId = req.user.id;

        let whereClause = '';
        if (status === 'active') {
            whereClause += ' AND q.start_time <= NOW() AND q.end_time >= NOW() AND saq.quiz_id IS NULL';
        } else if (status === 'upcoming') {
            whereClause += ' AND q.start_time > NOW() AND saq.quiz_id IS NULL';
        } else if (status === 'past') {
            whereClause += ' AND q.end_time < NOW() AND saq.quiz_id IS NULL';
        } else if (status === 'achieved') {
            whereClause = ' AND saq.quiz_id IS NOT NULL';
        }

        const quizzes = await query(
            `SELECT q.*, c.name as course_name, c.code as course_code,
                    u.name as created_by_name,
                    (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND student_id = ?) as attempts_made,
                    (SELECT MAX(score) FROM quiz_attempts WHERE quiz_id = q.id AND student_id = ? AND status = 'completed') as best_score,
                    (SELECT ROUND(AVG((qa.score / qa.total_marks) * 100), 1) 
                     FROM quiz_attempts qa 
                     JOIN quizzes qz ON qa.quiz_id = qz.id 
                     WHERE qa.student_id = ? AND qz.course_id = c.id AND qa.status = 'completed') as student_course_avg,
                    IF(saq.quiz_id IS NOT NULL, 1, 0) as is_student_archived
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             JOIN enrollments e ON e.course_id = c.id
             JOIN users s ON e.student_id = s.id
             LEFT JOIN users u ON q.created_by = u.id
             LEFT JOIN student_archived_quizzes saq ON saq.quiz_id = q.id AND saq.student_id = ?
             WHERE e.student_id = ? AND q.is_published = TRUE 
             AND (q.target_department IS NULL OR q.target_department = s.department_name)
             AND (q.target_level IS NULL OR q.target_level = s.level)
             AND (q.target_stream IS NULL OR q.target_stream = s.stream)
             AND (q.target_year IS NULL OR q.target_year = s.year)
             ${whereClause}
             ORDER BY q.start_time DESC`,
            [studentId, studentId, studentId, studentId, studentId]
        );

        // Client-side filter for score range since it depends on a subquery
        const filteredQuizzes = quizzes.filter(q => {
            const avg = q.student_course_avg || 0;
            const minReq = q.min_percentage_required || 0;
            const maxReq = q.max_percentage_required !== null && q.max_percentage_required !== undefined
                ? q.max_percentage_required
                : 100;
            // If both are defaults (0 and 100), allow all
            if (minReq === 0 && maxReq === 100) return true;
            return avg >= minReq && avg <= maxReq;
        });

        res.json({
            success: true,
            data: { quizzes: filteredQuizzes }
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quizzes.'
        });
    }
};

// @desc    Start a quiz attempt
// @route   POST /api/student/quizzes/:id/start
// @access  Private (Student)
const startQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const studentId = req.user.id;

        // Get quiz details
        const quizzes = await query(
            `SELECT q.*, c.name as course_name
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE q.id = ?`,
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found.'
            });
        }

        const quiz = quizzes[0];

        // Check if quiz is active
        const now = new Date();
        if (now < new Date(quiz.start_time)) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has not started yet.'
            });
        }
        if (now > new Date(quiz.end_time)) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has ended.'
            });
        }

        // Check enrollment
        const enrollment = await query(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, quiz.course_id]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not enrolled in this course.'
            });
        }

        // Check score range eligibility
        if (quiz.min_percentage_required > 0 || (quiz.max_percentage_required !== null && quiz.max_percentage_required < 100)) {
            const studentAvg = await query(
                `SELECT ROUND(AVG((qa.score / qa.total_marks) * 100), 1) as avg_score
                 FROM quiz_attempts qa
                 WHERE qa.student_id = ? AND qa.quiz_id IN (
                     SELECT id FROM quizzes WHERE course_id = ?
                 ) AND qa.status = 'completed' AND qa.total_marks > 0`,
                [studentId, quiz.course_id]
            );

            const avg = studentAvg[0].avg_score || 0;
            const minReq = quiz.min_percentage_required || 0;
            const maxReq = quiz.max_percentage_required !== null && quiz.max_percentage_required !== undefined
                ? quiz.max_percentage_required
                : 100;

            if (avg < minReq) {
                return res.status(403).json({
                    success: false,
                    message: `This quiz requires a minimum average score of ${minReq}% in this course. Your current average is ${avg}%.`
                });
            }
            if (avg > maxReq) {
                return res.status(403).json({
                    success: false,
                    message: `This quiz is intended for students with a maximum average score of ${maxReq}% in this course. Your current average is ${avg}%.`
                });
            }
        }

        // Check attempt limit
        const attempts = await query(
            'SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
            [quizId, studentId]
        );

        if (attempts[0].count >= quiz.max_attempts) {
            return res.status(400).json({
                success: false,
                message: `Maximum attempts (${quiz.max_attempts}) reached.`
            });
        }

        // Check for in-progress attempt
        const inProgress = await query(
            `SELECT * FROM quiz_attempts 
             WHERE quiz_id = ? AND student_id = ? AND status = 'in_progress'`,
            [quizId, studentId]
        );

        let attemptId;
        if (inProgress.length > 0) {
            // Resume existing attempt
            attemptId = inProgress[0].id;
        } else {
            // Create new attempt
            const result = await query(
                `INSERT INTO quiz_attempts (quiz_id, student_id, start_time, total_marks)
                 VALUES (?, ?, NOW(), ?)`,
                [quizId, studentId, quiz.total_marks]
            );
            attemptId = result.insertId;
        }

        // Get questions
        let orderBy = 'qq.question_order';
        if (quiz.shuffle_questions) {
            orderBy = 'RAND()';
        }

        const questions = await query(
            `SELECT q.id, q.question_text, q.question_type, q.image_url, qq.marks
             FROM quiz_questions qq
             JOIN questions q ON qq.question_id = q.id
             WHERE qq.quiz_id = ?
             ORDER BY ${orderBy}`,
            [quizId]
        );

        // Get answers for each question
        for (let question of questions) {
            let answerOrder = 'id';
            if (quiz.shuffle_answers) {
                answerOrder = 'RAND()';
            }

            const answers = await query(
                `SELECT id, answer_text FROM answers 
                 WHERE question_id = ? 
                 ORDER BY ${answerOrder}`,
                [question.id]
            );
            question.answers = answers;

            // Get saved answer if any
            const savedAnswer = await query(
                `SELECT selected_answer_id, text_answer, is_flagged
                 FROM student_answers
                 WHERE attempt_id = ? AND question_id = ?`,
                [attemptId, question.id]
            );
            question.savedAnswer = savedAnswer.length > 0 ? savedAnswer[0] : null;
        }

        // Calculate remaining time
        const attempt = inProgress.length > 0 ? inProgress[0] : { start_time: new Date() };
        const elapsedSeconds = Math.floor((new Date() - new Date(attempt.start_time)) / 1000);
        const remainingSeconds = Math.max(0, quiz.duration_minutes * 60 - elapsedSeconds);

        res.json({
            success: true,
            data: {
                attemptId,
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description,
                    duration_minutes: quiz.duration_minutes,
                    total_marks: quiz.total_marks,
                    course_name: quiz.course_name
                },
                questions,
                remainingSeconds,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting quiz.'
        });
    }
};

// @desc    Save answer for a question
// @route   POST /api/student/attempts/:attemptId/answer
// @access  Private (Student)
const saveAnswer = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { questionId, answerId, textAnswer, isFlagged } = req.body;
        const studentId = req.user.id;

        // Verify attempt belongs to student
        const attempts = await query(
            `SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ? AND status = 'in_progress'`,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found or already submitted.'
            });
        }

        // Check if answer already exists
        const existing = await query(
            'SELECT id FROM student_answers WHERE attempt_id = ? AND question_id = ?',
            [attemptId, questionId]
        );

        if (existing.length > 0) {
            // Update existing answer
            await query(
                `UPDATE student_answers 
                 SET selected_answer_id = ?, text_answer = ?, is_flagged = ?, answered_at = NOW()
                 WHERE attempt_id = ? AND question_id = ?`,
                [answerId || null, textAnswer || null, isFlagged || false, attemptId, questionId]
            );
        } else {
            // Insert new answer
            await query(
                `INSERT INTO student_answers (attempt_id, question_id, selected_answer_id, text_answer, is_flagged)
                 VALUES (?, ?, ?, ?, ?)`,
                [attemptId, questionId, answerId || null, textAnswer || null, isFlagged || false]
            );
        }

        res.json({
            success: true,
            message: 'Answer saved.'
        });
    } catch (error) {
        console.error('Save answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving answer.'
        });
    }
};

// @desc    Submit quiz
// @route   POST /api/student/attempts/:attemptId/submit
// @access  Private (Student)
const submitQuiz = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        // Verify attempt
        const attempts = await query(
            `SELECT qa.*, q.show_results
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             WHERE qa.id = ? AND qa.student_id = ?`,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found.'
            });
        }

        const attempt = attempts[0];

        if (attempt.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Quiz already submitted.'
            });
        }

        // Auto-grade objective questions
        const studentAnswers = await query(
            `SELECT sa.*, q.question_type, a.is_correct
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             LEFT JOIN answers a ON sa.selected_answer_id = a.id
             WHERE sa.attempt_id = ?`,
            [attemptId]
        );

        let totalScore = 0;

        for (const answer of studentAnswers) {
            if (answer.question_type === 'mcq' || answer.question_type === 'true_false') {
                // Get marks for this question
                const questionMarks = await query(
                    'SELECT marks FROM quiz_questions WHERE quiz_id = ? AND question_id = ?',
                    [attempt.quiz_id, answer.question_id]
                );

                const marks = questionMarks.length > 0 ? questionMarks[0].marks : 1;
                const isCorrect = answer.is_correct === 1;
                const marksObtained = isCorrect ? marks : 0;

                // Update student answer with grading
                await query(
                    `UPDATE student_answers 
                     SET is_correct = ?, marks_obtained = ?
                     WHERE id = ?`,
                    [isCorrect, marksObtained, answer.id]
                );

                totalScore += marksObtained;
            }
            // Descriptive questions need manual grading
        }

        // Calculate time spent
        const startTime = new Date(attempt.start_time);
        const endTime = new Date();
        const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);

        // Update attempt as completed
        await query(
            `UPDATE quiz_attempts 
             SET status = 'completed', score = ?, end_time = NOW(), 
                 time_spent_seconds = ?, submitted_at = NOW()
             WHERE id = ?`,
            [totalScore, timeSpentSeconds, attemptId]
        );

        // Create notification for student
        await query(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES (?, ?, ?, 'grade', ?)`,
            [studentId, 'Quiz Submitted', `Your quiz has been submitted. Score: ${totalScore}/${attempt.total_marks}`, `/student/results/${attemptId}`]
        );

        // Notify faculty
        try {
            const quizInfo = await query(
                `SELECT q.title, c.faculty_id, u.name as student_name 
                 FROM quizzes q 
                 JOIN courses c ON q.course_id = c.id 
                 JOIN users u ON u.id = ?
                 WHERE q.id = ?`,
                [studentId, attempt.quiz_id]
            );

            if (quizInfo.length > 0) {
                await query(
                    `INSERT INTO notifications (user_id, title, message, type, link)
                     VALUES (?, ?, ?, 'info', ?)`,
                    [
                        quizInfo[0].faculty_id, 
                        'New Quiz Submission', 
                        `${quizInfo[0].student_name} completed the quiz "${quizInfo[0].title}".`,
                        `/faculty/quizzes/${attempt.quiz_id}/results` // Adjust link as needed
                    ]
                );
            }
        } catch (facultyNotifError) {
            console.error('Error notifying faculty:', facultyNotifError);
        }

        res.json({
            success: true,
            message: 'Quiz submitted successfully!',
            data: {
                score: totalScore,
                totalMarks: attempt.total_marks,
                percentage: attempt.total_marks > 0 ? Math.round((totalScore / attempt.total_marks) * 100) : 0,
                showResults: attempt.show_results
            }
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting quiz.'
        });
    }
};

// @desc    Get quiz results
// @route   GET /api/student/attempts/:attemptId/result
// @access  Private (Student)
const getResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        // Get attempt with quiz details
        const attempts = await query(
            `SELECT qa.*, q.title as quiz_title, q.show_results, q.total_marks as quiz_total_marks,
                    c.name as course_name
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qa.id = ? AND qa.student_id = ?`,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Result not found.'
            });
        }

        const attempt = attempts[0];

        if (attempt.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Quiz not yet submitted.'
            });
        }

        let detailedAnswers = [];

        if (attempt.show_results) {
            // Get detailed answers with correct answers
            detailedAnswers = await query(
                `SELECT sa.*, q.question_text, q.question_type, q.explanation,
                        qq.marks as question_marks,
                        (SELECT answer_text FROM answers WHERE id = sa.selected_answer_id) as selected_answer,
                        (SELECT answer_text FROM answers WHERE question_id = q.id AND is_correct = TRUE LIMIT 1) as correct_answer
                 FROM student_answers sa
                 JOIN questions q ON sa.question_id = q.id
                 JOIN quiz_questions qq ON qq.question_id = q.id AND qq.quiz_id = ?
                 WHERE sa.attempt_id = ?`,
                [attempt.quiz_id, attemptId]
            );
        }

        res.json({
            success: true,
            data: {
                attempt: {
                    id: attempt.id,
                    quizTitle: attempt.quiz_title,
                    courseName: attempt.course_name,
                    score: attempt.score,
                    totalMarks: attempt.total_marks,
                    percentage: attempt.total_marks > 0 ? Math.round((attempt.score / attempt.total_marks) * 100) : 0,
                    timeSpent: attempt.time_spent_seconds,
                    submittedAt: attempt.submitted_at,
                    status: attempt.status
                },
                showDetailedResults: attempt.show_results,
                detailedAnswers
            }
        });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching result.'
        });
    }
};

// @desc    Get all results history
// @route   GET /api/student/results
// @access  Private (Student)
const getResultsHistory = async (req, res) => {
    try {
        const results = await query(
            `SELECT qa.id, qa.score, qa.total_marks, qa.status, qa.time_spent_seconds,
                    qa.submitted_at, q.title as quiz_title, q.generate_certificate, c.name as course_name,
                    ROUND((qa.score / qa.total_marks) * 100, 1) as percentage
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qa.student_id = ? AND qa.status = 'completed'
             ORDER BY qa.submitted_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: { results }
        });
    } catch (error) {
        console.error('Get results history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching results.'
        });
    }
};

const toggleQuizArchive = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const existing = await query(
            'SELECT * FROM student_archived_quizzes WHERE student_id = ? AND quiz_id = ?',
            [studentId, quizId]
        );

        let isArchived;
        if (existing.length > 0) {
            await query(
                'DELETE FROM student_archived_quizzes WHERE student_id = ? AND quiz_id = ?',
                [studentId, quizId]
            );
            isArchived = false;
        } else {
            await query(
                'INSERT INTO student_archived_quizzes (student_id, quiz_id) VALUES (?, ?)',
                [studentId, quizId]
            );
            isArchived = true;
        }

        res.json({
            success: true,
            message: `Quiz ${isArchived ? 'archived' : 'unarchived'} successfully`,
            is_archived: isArchived
        });
    } catch (error) {
        console.error('Student toggle archive error:', error);
        res.status(500).json({ success: false, message: 'Error toggling archive status' });
    }
};

const getCertificateData = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const studentId = req.user.id;

        // Get attempt and quiz details
        const attempts = await query(
            `SELECT qa.*, q.title as quiz_title, q.total_marks, q.course_id, q.generate_certificate, c.name as course_name, u.name as student_name
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             JOIN users u ON qa.student_id = u.id
             WHERE qa.id = ? AND qa.student_id = ?`,
            [attemptId, studentId]
        );

        if (attempts.length === 0) {
            return res.status(404).json({ success: false, message: 'Attempt not found.' });
        }

        const attempt = attempts[0];
        if (!attempt.generate_certificate) {
            return res.status(400).json({ success: false, message: 'Certificates are not enabled for this quiz.' });
        }

        // Get Leaderboard (Top 2)
        const toppers = await query(
            `SELECT u.name, MAX(qa.score) as best_score
             FROM quiz_attempts qa
             JOIN users u ON qa.student_id = u.id
             WHERE qa.quiz_id = ? AND qa.status = 'completed'
             GROUP BY qa.student_id
             ORDER BY best_score DESC, MIN(qa.time_spent_seconds) ASC
             LIMIT 2`,
            [attempt.quiz_id]
        );

        // Get student's rank
        const allScores = await query(
            `SELECT student_id, MAX(score) as best_score
             FROM quiz_attempts
             WHERE quiz_id = ? AND status = 'completed'
             GROUP BY student_id
             ORDER BY best_score DESC, MIN(time_spent_seconds) ASC`,
            [attempt.quiz_id]
        );

        const rank = allScores.findIndex(s => s.student_id === studentId) + 1;

        res.json({
            success: true,
            data: {
                studentName: attempt.student_name,
                quizTitle: attempt.quiz_title,
                courseName: attempt.course_name,
                score: attempt.score,
                totalMarks: attempt.total_marks,
                percentage: ((attempt.score / attempt.total_marks) * 100).toFixed(1),
                rank: rank,
                toppers: toppers.map((t, i) => ({
                    place: i + 1,
                    name: t.name,
                    score: t.best_score
                })),
                date: attempt.submitted_at
            }
        });
    } catch (error) {
        console.error('Certificate error:', error);
        res.status(500).json({ success: false, message: 'Error fetching certificate data.' });
    }
};

module.exports = {
    getDashboard,
    getCourses,
    getQuizzes,
    startQuiz,
    saveAnswer,
    submitQuiz,
    getResult,
    getResultsHistory,
    getCertificateData,
    toggleQuizArchive
};
