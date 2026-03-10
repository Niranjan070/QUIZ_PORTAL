const { query, bulkQuery } = require('../config/database');

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

        const performanceStats = await query(
            `SELECT 
                ROUND(AVG((qa.score / qa.total_marks) * 100), 1) as avg_percentage,
                SUM(CASE WHEN qa.score >= q.passing_marks THEN 1 ELSE 0 END) as pass_count,
                SUM(CASE WHEN qa.score < q.passing_marks THEN 1 ELSE 0 END) as fail_count
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE c.faculty_id = ? AND qa.status = 'completed' AND qa.total_marks > 0`,
            [facultyId]
        );

        const coursePerformance = await query(
            `SELECT 
                c.id, c.name, c.code,
                ROUND(AVG((qa.score / qa.total_marks) * 100), 1) as average_score,
                SUM(CASE WHEN qa.score >= q.passing_marks THEN 1 ELSE 0 END) as passed_count,
                SUM(CASE WHEN qa.score < q.passing_marks THEN 1 ELSE 0 END) as failed_count
             FROM courses c
             JOIN quizzes q ON c.id = q.course_id
             JOIN quiz_attempts qa ON q.id = qa.quiz_id
             WHERE c.faculty_id = ? AND qa.status = 'completed' AND qa.total_marks > 0
             GROUP BY c.id, c.name, c.code`,
            [facultyId]
        );

        // Fetch all quizzes for calendar view
        const quizzes = await query(
            `SELECT q.*, c.name as course_name, c.code as course_code
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE c.faculty_id = ?
             ORDER BY q.start_time ASC`,
            [facultyId]
        );

        // Calculate pass rate
        const totalAttempts = (performanceStats[0].pass_count || 0) + (performanceStats[0].fail_count || 0);
        const passRate = totalAttempts > 0
            ? Math.round(((performanceStats[0].pass_count || 0) / totalAttempts) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                kpis: {
                    totalStudents: totalStudents[0].count,
                    averageScore: Math.round(performanceStats[0].avg_percentage || 0),
                    passRate: passRate,
                    totalQuizzes: totalQuizzes[0].count
                },
                passFailDistribution: {
                    passed: performanceStats[0].pass_count || 0,
                    failed: performanceStats[0].fail_count || 0
                },
                coursePerformance,
                stats: {
                    totalCourses: courses.length,
                    totalStudents: totalStudents[0].count,
                    totalQuizzes: totalQuizzes[0].count,
                    totalQuestions: totalQuestions[0].count,
                    overallAvg: performanceStats[0].avg_percentage || 0,
                    passCount: performanceStats[0].pass_count || 0,
                    failCount: performanceStats[0].fail_count || 0
                },
                courses,
                recentSubmissions,
                quizzes
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
        const {
            title, description, courseId, durationMinutes, maxAttempts,
            startTime, endTime, questionIds,
            targetDepartment, targetLevel, targetStream, minPercentageRequired,
            passingMarksPercentage, targetYear
        } = req.body;

        if (!title || !courseId || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Required fields missing.' });
        }

        let totalMarks = 0;
        if (questionIds?.length > 0) {
            const m = await query('SELECT SUM(marks) as total FROM questions WHERE id IN (?)', [questionIds]);
            totalMarks = m[0].total || 0;
        }

        const passingMarks = Math.ceil((totalMarks * (passingMarksPercentage || 40)) / 100);

        const result = await query(
            `INSERT INTO quizzes (
                title, description, course_id, duration_minutes, total_marks, passing_marks, 
                max_attempts, start_time, end_time, created_by,
                target_department, target_level, target_stream, min_percentage_required, max_percentage_required,
                shuffle_questions, shuffle_answers, generate_certificate, target_year,
                show_results
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, description, courseId, durationMinutes || 30, totalMarks, passingMarks,
                maxAttempts || 1, startTime, endTime, req.user.id,
                targetDepartment || null, targetLevel || null, targetStream || null, minPercentageRequired || 0,
                req.body.maxPercentageRequired !== undefined ? req.body.maxPercentageRequired : 100,
                req.body.shuffleQuestions || false, req.body.shuffleAnswers || false, req.body.generateCertificate || false,
                targetYear || null,
                req.body.showResults !== undefined ? req.body.showResults : true
            ]
        );

        if (questionIds?.length > 0) {
            for (let i = 0; i < questionIds.length; i++) {
                const q = await query('SELECT marks FROM questions WHERE id = ?', [questionIds[i]]);
                await query('INSERT INTO quiz_questions (quiz_id, question_id, question_order, marks) VALUES (?, ?, ?, ?)',
                    [result.insertId, questionIds[i], i + 1, q[0]?.marks || 1]);
            }
        }

        // Notify enrolled students
        try {
            const course = await query('SELECT name FROM courses WHERE id = ?', [courseId]);
            const courseName = course[0]?.name || 'a course';

            // Get all students enrolled in this course who match the target filters
            let studentSql = `
                SELECT u.id FROM users u
                JOIN enrollments e ON u.id = e.student_id
                WHERE e.course_id = ? AND u.role = 'student'
            `;
            const studentParams = [courseId];

            if (targetDepartment) { studentSql += ' AND u.department_name = ?'; studentParams.push(targetDepartment); }
            if (targetLevel) { studentSql += ' AND u.level = ?'; studentParams.push(targetLevel); }
            if (targetStream) { studentSql += ' AND u.stream = ?'; studentParams.push(targetStream); }
            if (targetYear) { studentSql += ' AND u.year = ?'; studentParams.push(targetYear); }

            const students = await query(studentSql, studentParams);

            if (students.length > 0) {
                const notificationValues = students.map(s => [
                    s.id,
                    'New Quiz Scheduled',
                    `A new quiz "${title}" has been scheduled for ${courseName}.`,
                    'quiz',
                    `/student/quizzes`
                ]);

                await bulkQuery(
                    'INSERT INTO notifications (user_id, title, message, type, link) VALUES ?',
                    [notificationValues]
                );
            }
        } catch (notifError) {
            console.error('Error creating notifications:', notifError);
            // Don't fail the quiz creation if notifications fail
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
        const {
            title, description, durationMinutes, duration_minutes,
            maxAttempts, max_attempts,
            startTime, start_time,
            endTime, end_time,
            isPublished, is_published,
            targetDepartment, target_department,
            targetLevel, target_level,
            targetStream, target_stream,
            minPercentageRequired, min_percentage_required,
            passingMarksPercentage, passing_marks_percentage,
            targetYear, target_year,
            showResults, show_results,
            shuffleQuestions, shuffle_questions,
            shuffleAnswers, shuffle_answers,
            generateCertificate, generate_certificate
        } = req.body;

        // Calculate passing marks if needed
        const quiz = await query('SELECT total_marks, passing_marks FROM quizzes WHERE id = ?', [id]);
        if (quiz.length === 0) {
            return res.status(404).json({ success: false, message: 'Quiz not found.' });
        }

        const totalMarks = quiz[0].total_marks || 0;
        const currentPassingPercentage = (quiz[0].passing_marks / totalMarks) * 100 || 40;
        const passingMarks = Math.ceil((totalMarks * (passingMarksPercentage || passing_marks_percentage || currentPassingPercentage)) / 100);

        await query(
            `UPDATE quizzes SET 
                title = ?, description = ?, duration_minutes = ?, max_attempts = ?, 
                start_time = ?, end_time = ?, is_published = ?,
                target_department = ?, target_level = ?, target_stream = ?, min_percentage_required = ?, max_percentage_required = ?,
                passing_marks = ?, shuffle_questions = ?, shuffle_answers = ?, generate_certificate = ?,
                target_year = ?, show_results = ?
             WHERE id = ?`,
            [
                title || req.body.title,
                description !== undefined ? description : req.body.description,
                durationMinutes || duration_minutes || 30,
                maxAttempts || max_attempts || 1,
                startTime || start_time,
                endTime || end_time,
                isPublished !== undefined ? isPublished : (is_published !== undefined ? is_published : false),
                targetDepartment || target_department || null,
                targetLevel || target_level || null,
                targetStream || target_stream || null,
                minPercentageRequired || min_percentage_required || 0,
                (req.body.maxPercentageRequired !== undefined ? req.body.maxPercentageRequired : (req.body.max_percentage_required !== undefined ? req.body.max_percentage_required : 100)),
                passingMarks,
                shuffleQuestions !== undefined ? shuffleQuestions : (shuffle_questions !== undefined ? shuffle_questions : false),
                shuffleAnswers !== undefined ? shuffleAnswers : (shuffle_answers !== undefined ? shuffle_answers : false),
                generateCertificate !== undefined ? generateCertificate : (generate_certificate !== undefined ? generate_certificate : false),
                targetYear || target_year || null,
                showResults !== undefined ? showResults : (show_results !== undefined ? show_results : true),
                id
            ]
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

// @desc    Get detailed course report
const getCourseReport = async (req, res) => {
    try {
        const { courseId } = req.params;
        const report = await query(
            `SELECT 
                u.name as student_name,
                u.email as student_email,
                u.department_name,
                u.level,
                u.stream,
                q.title as quiz_title,
                qa.score,
                qa.total_marks,
                ROUND((qa.score / qa.total_marks) * 100, 1) as percentage,
                CASE WHEN qa.score >= q.passing_marks THEN 'Pass' ELSE 'Fail' END as status,
                qa.submitted_at
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN users u ON qa.student_id = u.id
             WHERE q.course_id = ? AND qa.status = 'completed'
             ORDER BY u.name, q.title`,
            [courseId]
        );
        res.json({ success: true, data: { report } });
    } catch (error) {
        console.error('Course report error:', error);
        res.status(500).json({ success: false, message: 'Error generating course report.' });
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
        const { department, level, stream } = req.query;
        let sql = `SELECT u.id, u.name, u.email, u.department_name, u.level, u.stream, e.enrolled_at,
                   (SELECT ROUND(AVG((qa.score/qa.total_marks)*100), 1) FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.student_id = u.id AND q.course_id = ?) as avg_score,
                   (SELECT COUNT(*) FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.student_id = u.id AND q.course_id = ? AND qa.score >= q.passing_marks AND qa.status='completed') as pass_count,
                   (SELECT COUNT(*) FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id WHERE qa.student_id = u.id AND q.course_id = ? AND qa.score < q.passing_marks AND qa.status='completed') as fail_count
                   FROM users u
                   JOIN enrollments e ON u.id = e.student_id 
                   WHERE e.course_id = ?`;
        const params = [req.params.id, req.params.id, req.params.id, req.params.id];

        if (department) { sql += ' AND u.department_name = ?'; params.push(department); }
        if (level) { sql += ' AND u.level = ?'; params.push(level); }
        if (stream) { sql += ' AND u.stream = ?'; params.push(stream); }

        const students = await query(sql, params);
        res.json({ success: true, data: { students } });
    } catch (error) {
        console.error('Fetch course students error:', error);
        res.status(500).json({ success: false, message: 'Error fetching students.' });
    }
};

// @desc    Enroll students in course
const enrollStudent = async (req, res) => {
    try {
        const { courseId, studentEmail } = req.body;

        // Verify faculty owns the course
        const course = await query('SELECT id FROM courses WHERE id = ? AND faculty_id = ?', [courseId, req.user.id]);
        if (course.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized course access.' });
        }

        // Find student
        const student = await query('SELECT id FROM users WHERE email = ? AND role = "student"', [studentEmail]);
        if (student.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        // Create enrollment
        await query(
            'INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student[0].id, courseId]
        );

        res.json({ success: true, message: 'Student enrolled successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error enrolling student.' });
    }
};

// @desc    Search students not enrolled in a course
const searchStudents = async (req, res) => {
    try {
        const { query: searchQuery } = req.query;
        const students = await query(
            `SELECT id, name, email FROM users 
             WHERE role = 'student' AND (name LIKE ? OR email LIKE ?) LIMIT 10`,
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );
        res.json({ success: true, data: { students } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error searching students.' });
    }
};

// @desc    Unenroll student from course
const unenrollStudent = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        // Verify faculty owns the course
        const course = await query('SELECT id FROM courses WHERE id = ? AND faculty_id = ?', [courseId, req.user.id]);
        if (course.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized course access.' });
        }

        await query('DELETE FROM enrollments WHERE course_id = ? AND student_id = ?', [courseId, studentId]);

        res.json({ success: true, message: 'Student unenrolled successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error unenrolling student.' });
    }
};

// @desc    Faculty create course
const facultyCreateCourse = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Name and Code are required.' });
        }

        const result = await query(
            'INSERT INTO courses (name, code, description, faculty_id) VALUES (?, ?, ?, ?)',
            [name, code, description, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'Course created successfully!',
            data: { courseId: result.insertId }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Course code already exists.' });
        }
        res.status(500).json({ success: false, message: 'Error creating course.' });
    }
};

// @desc    Faculty update course
const facultyUpdateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, isActive } = req.body;

        const result = await query(
            'UPDATE courses SET name = ?, code = ?, description = ?, is_active = ? WHERE id = ? AND faculty_id = ?',
            [name, code, description, isActive !== undefined ? isActive : true, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized or course not found.' });
        }

        res.json({ success: true, message: 'Course updated!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating course.' });
    }
};

// @desc    Faculty delete course
const facultyDeleteCourse = async (req, res) => {
    try {
        const result = await query('DELETE FROM courses WHERE id = ? AND faculty_id = ?', [req.params.id, req.user.id]);

        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized or course not found.' });
        }

        res.json({ success: true, message: 'Course deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting course.' });
    }
};

// @desc    Bulk enroll students
const bulkEnrollStudents = async (req, res) => {
    try {
        const { courseId, emails } = req.body;
        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({ success: false, message: 'Invalid data format.' });
        }

        // Verify faculty owns the course
        const course = await query('SELECT id FROM courses WHERE id = ? AND faculty_id = ?', [courseId, req.user.id]);
        if (course.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized course access.' });
        }

        const results = { success: 0, failed: 0, errors: [] };

        for (const email of emails) {
            try {
                const student = await query('SELECT id FROM users WHERE email = ? AND role = "student"', [email.trim()]);
                if (student.length === 0) {
                    throw new Error(`Student with email ${email} not found.`);
                }

                await query(
                    'INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)',
                    [student[0].id, courseId]
                );
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }

        res.json({
            success: true,
            message: `Bulk enrollment completed: ${results.success} successes, ${results.failed} failures.`,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error in bulk enrollment.' });
    }
};

// @desc    Bulk import questions
const bulkImportQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ success: false, message: 'Invalid data format.' });
        }

        const results = { success: 0, failed: 0, errors: [] };

        for (const qData of questions) {
            try {
                const { courseId, questionText, questionType, difficulty, marks, answers } = qData;

                if (!courseId || !questionText || !questionType) {
                    throw new Error(`Missing required fields for: ${questionText?.substring(0, 20)}...`);
                }

                // Verify faculty owns the course
                const course = await query('SELECT id FROM courses WHERE id = ? AND faculty_id = ?', [courseId, req.user.id]);
                if (course.length === 0) {
                    throw new Error(`Unauthorized access to course ID ${courseId}`);
                }

                const result = await query(
                    `INSERT INTO questions (course_id, question_text, question_type, difficulty, marks, created_by)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [courseId, questionText, questionType, difficulty || 'medium', marks || 1, req.user.id]
                );

                if (answers?.length > 0) {
                    for (const a of answers) {
                        await query('INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
                            [result.insertId, a.text, a.isCorrect || false]);
                    }
                }
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }

        res.json({
            success: true,
            message: `Process completed: ${results.success} success, ${results.failed} failed.`,
            data: results
        });
    } catch (error) {
        console.error('Bulk import questions error:', error);
        res.status(500).json({ success: false, message: 'Error during bulk import.' });
    }
};

// @desc    Toggle quiz archive status
const toggleQuizArchive = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await query('SELECT is_archived FROM quizzes WHERE id = ?', [id]);

        if (quiz.length === 0) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const newStatus = !quiz[0].is_archived;
        await query('UPDATE quizzes SET is_archived = ? WHERE id = ?', [newStatus, id]);

        res.json({
            success: true,
            message: `Quiz ${newStatus ? 'archived' : 'unarchived'} successfully`,
            is_archived: newStatus
        });
    } catch (error) {
        console.error('Toggle archive error:', error);
        res.status(500).json({ success: false, message: 'Error toggling archive status' });
    }
};

module.exports = {
    getDashboard, getQuestions, createQuestion, updateQuestion, deleteQuestion,
    getQuizzes, createQuiz, updateQuiz, deleteQuiz, getQuizResults, getCourseStudents,
    enrollStudent, unenrollStudent, searchStudents, bulkEnrollStudents,
    facultyCreateCourse, facultyUpdateCourse, facultyDeleteCourse,
    bulkImportQuestions, toggleQuizArchive, getCourseReport
};
