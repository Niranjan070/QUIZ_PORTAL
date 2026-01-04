/**
 * Database Seed Script
 * Run this after setting up the database to create demo users with proper password hashes
 * 
 * Usage: node seed.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DEMO_PASSWORD = 'password123';

const users = [
    { name: 'System Admin', email: 'admin@quizportal.com', role: 'admin' },
    { name: 'Dr. John Smith', email: 'john.smith@college.edu', role: 'faculty' },
    { name: 'Prof. Sarah Johnson', email: 'sarah.j@college.edu', role: 'faculty' },
    { name: 'Nikitha Sri', email: 'nikitha@student.edu', role: 'student' },
    { name: 'Harini SN', email: 'harini@student.edu', role: 'student' },
    { name: 'Shruthika', email: 'shruthika@student.edu', role: 'student' },
    { name: 'Varshana', email: 'varshana@student.edu', role: 'student' }
];

async function seed() {
    console.log('🌱 Starting database seed...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'online_quiz_portal'
    });

    console.log('✅ Connected to database\n');

    // Hash password
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    console.log(`📝 Password hash created for: ${DEMO_PASSWORD}\n`);

    // Clear existing demo users and insert new ones
    console.log('👤 Creating users...');

    for (const user of users) {
        try {
            // Check if user exists
            const [existing] = await connection.execute(
                'SELECT id FROM users WHERE email = ?',
                [user.email]
            );

            if (existing.length > 0) {
                // Update existing user
                await connection.execute(
                    'UPDATE users SET name = ?, password = ?, role = ? WHERE email = ?',
                    [user.name, hashedPassword, user.role, user.email]
                );
                console.log(`   Updated: ${user.name} (${user.role})`);
            } else {
                // Insert new user
                await connection.execute(
                    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, hashedPassword, user.role]
                );
                console.log(`   Created: ${user.name} (${user.role})`);
            }
        } catch (error) {
            console.error(`   Error with ${user.email}:`, error.message);
        }
    }

    // Create sample courses if they don't exist
    console.log('\n📚 Creating courses...');

    const courses = [
        { name: 'Database Management Systems', code: 'DBMS101', description: 'Introduction to database concepts, SQL, and database design', faculty_id: 2 },
        { name: 'Web Development', code: 'WEB201', description: 'Full-stack web development with modern technologies', faculty_id: 3 },
        { name: 'Data Structures & Algorithms', code: 'DSA101', description: 'Fundamental data structures and algorithm design', faculty_id: 2 }
    ];

    for (const course of courses) {
        try {
            const [existing] = await connection.execute(
                'SELECT id FROM courses WHERE code = ?',
                [course.code]
            );

            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO courses (name, code, description, faculty_id) VALUES (?, ?, ?, ?)',
                    [course.name, course.code, course.description, course.faculty_id]
                );
                console.log(`   Created: ${course.name}`);
            } else {
                console.log(`   Exists: ${course.name}`);
            }
        } catch (error) {
            console.error(`   Error with ${course.code}:`, error.message);
        }
    }

    // Create enrollments
    console.log('\n📋 Creating enrollments...');

    const enrollments = [
        { student_id: 4, course_id: 1 },
        { student_id: 4, course_id: 2 },
        { student_id: 5, course_id: 1 },
        { student_id: 5, course_id: 3 },
        { student_id: 6, course_id: 2 },
        { student_id: 7, course_id: 1 },
        { student_id: 7, course_id: 2 },
        { student_id: 7, course_id: 3 }
    ];

    for (const enrollment of enrollments) {
        try {
            await connection.execute(
                'INSERT IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)',
                [enrollment.student_id, enrollment.course_id]
            );
        } catch (error) {
            // Ignore duplicate entries
        }
    }
    console.log('   Enrollments created');

    // Create sample questions
    console.log('\n❓ Creating sample questions...');

    const questions = [
        { course_id: 1, text: 'What does SQL stand for?', type: 'mcq', difficulty: 'easy', marks: 1 },
        { course_id: 1, text: 'A primary key uniquely identifies each record in a table.', type: 'true_false', difficulty: 'easy', marks: 1 },
        { course_id: 1, text: 'What is normalization in databases?', type: 'short_answer', difficulty: 'medium', marks: 2 },
        { course_id: 2, text: 'Which HTML tag is used to create a hyperlink?', type: 'mcq', difficulty: 'easy', marks: 1 },
        { course_id: 2, text: 'CSS stands for Cascading Style Sheets.', type: 'true_false', difficulty: 'easy', marks: 1 }
    ];

    const answers = {
        0: [
            { text: 'Structured Query Language', correct: true },
            { text: 'Simple Query Language', correct: false },
            { text: 'Standard Query Logic', correct: false },
            { text: 'System Query Language', correct: false }
        ],
        1: [
            { text: 'True', correct: true },
            { text: 'False', correct: false }
        ],
        3: [
            { text: '<a>', correct: true },
            { text: '<link>', correct: false },
            { text: '<href>', correct: false },
            { text: '<url>', correct: false }
        ],
        4: [
            { text: 'True', correct: true },
            { text: 'False', correct: false }
        ]
    };

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        try {
            const [result] = await connection.execute(
                'INSERT INTO questions (course_id, question_text, question_type, difficulty, marks, created_by) VALUES (?, ?, ?, ?, ?, 2)',
                [q.course_id, q.text, q.type, q.difficulty, q.marks]
            );

            // Add answers if available
            if (answers[i]) {
                for (const ans of answers[i]) {
                    await connection.execute(
                        'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
                        [result.insertId, ans.text, ans.correct]
                    );
                }
            }
            console.log(`   Created: ${q.text.substring(0, 40)}...`);
        } catch (error) {
            // Might be duplicate
        }
    }

    await connection.end();
    console.log('\n✅ Database seeding completed!');
    console.log('\n📌 Demo Login Credentials:');
    console.log('   Admin: admin@quizportal.com / password123');
    console.log('   Faculty: john.smith@college.edu / password123');
    console.log('   Student: nikitha@student.edu / password123\n');
}

seed().catch(console.error);
