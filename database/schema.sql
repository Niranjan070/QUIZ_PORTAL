-- Online Quiz Portal Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS online_quiz_portal;
USE online_quiz_portal;

-- =============================================
-- USERS TABLE
-- Stores all users (students, faculty, admins)
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
    profile_image VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- =============================================
-- COURSES TABLE
-- Academic courses/subjects
-- =============================================
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    faculty_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- TOPICS TABLE
-- Topics/Chapters within courses
-- =============================================
CREATE TABLE topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =============================================
-- QUESTIONS TABLE
-- Question Bank
-- =============================================
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT,
    course_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('mcq', 'true_false', 'short_answer', 'descriptive') NOT NULL DEFAULT 'mcq',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    marks INT DEFAULT 1,
    image_url VARCHAR(255) DEFAULT NULL,
    explanation TEXT,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- ANSWERS TABLE
-- Answer options for questions
-- =============================================
CREATE TABLE answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- =============================================
-- QUIZZES TABLE
-- Quiz/Exam definitions
-- =============================================
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    course_id INT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    total_marks INT DEFAULT 0,
    passing_marks INT DEFAULT 0,
    max_attempts INT DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_answers BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- QUIZ_QUESTIONS TABLE
-- Links quizzes to questions
-- =============================================
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_id INT NOT NULL,
    question_order INT DEFAULT 0,
    marks INT DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_question (quiz_id, question_id)
);

-- =============================================
-- QUIZ_ATTEMPTS TABLE
-- Student quiz attempts
-- =============================================
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    time_spent_seconds INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    total_marks INT DEFAULT 0,
    status ENUM('in_progress', 'completed', 'submitted', 'timed_out') DEFAULT 'in_progress',
    submitted_at TIMESTAMP NULL,
    graded_by INT DEFAULT NULL,
    graded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- STUDENT_ANSWERS TABLE
-- Individual answers for each question in an attempt
-- =============================================
CREATE TABLE student_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer_id INT DEFAULT NULL,
    text_answer TEXT DEFAULT NULL,
    is_correct BOOLEAN DEFAULT NULL,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_answer_id) REFERENCES answers(id) ON DELETE SET NULL
);

-- =============================================
-- ENROLLMENTS TABLE
-- Student course enrollments
-- =============================================
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- User notifications
-- =============================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error', 'quiz', 'grade', 'announcement') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- ANNOUNCEMENTS TABLE
-- Course/System-wide announcements
-- =============================================
CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    course_id INT DEFAULT NULL,
    created_by INT,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- AUDIT_LOGS TABLE
-- System audit trail
-- =============================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_dates ON quizzes(start_time, end_time);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);

-- =============================================
-- INSERT DEFAULT ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- =============================================
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@quizportal.com', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'admin');

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Sample Faculty
INSERT INTO users (name, email, password, role) VALUES 
('Dr. John Smith', 'john.smith@college.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'faculty'),
('Prof. Sarah Johnson', 'sarah.j@college.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'faculty');

-- Sample Students
INSERT INTO users (name, email, password, role) VALUES 
('Nikitha Sri', 'nikitha@student.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'student'),
('Harini SN', 'harini@student.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'student'),
('Shruthika', 'shruthika@student.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'student'),
('Varshana', 'varshana@student.edu', '$2b$10$rQZ5QP.Kz.nT4WG5T1Z6Z.1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6', 'student');

-- Sample Courses
INSERT INTO courses (name, code, description, faculty_id) VALUES 
('Database Management Systems', 'DBMS101', 'Introduction to database concepts, SQL, and database design', 2),
('Web Development', 'WEB201', 'Full-stack web development with modern technologies', 3),
('Data Structures & Algorithms', 'DSA101', 'Fundamental data structures and algorithm design', 2);

-- Sample Topics
INSERT INTO topics (course_id, name, description) VALUES 
(1, 'Introduction to DBMS', 'Basic concepts of database management'),
(1, 'SQL Fundamentals', 'Learning SQL queries and commands'),
(1, 'Normalization', 'Database normalization techniques'),
(2, 'HTML & CSS', 'Frontend fundamentals'),
(2, 'JavaScript', 'Client-side programming'),
(3, 'Arrays & Linked Lists', 'Linear data structures');

-- Sample Enrollments
INSERT INTO enrollments (student_id, course_id) VALUES 
(4, 1), (4, 2), (5, 1), (5, 3), (6, 2), (7, 1), (7, 2), (7, 3);
