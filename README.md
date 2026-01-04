# 🎓 Online Quiz Portal

A comprehensive web-based quiz management system with role-based dashboards for **Students**, **Faculty**, and **Administrators**.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technology Stack](#️-technology-stack)
4. [Prerequisites](#-prerequisites)
5. [Complete Installation Guide](#-complete-installation-guide-for-beginners)
6. [Running the Application](#-running-the-application)
7. [Demo Credentials](#-demo-credentials)
8. [Project Structure](#-project-structure)
9. [Troubleshooting](#-troubleshooting)
10. [Team Details](#-team-details)

---

## 🎯 Project Overview

This Online Quiz Portal is designed to automate quiz management and conduction in educational institutions. It provides a modern, user-friendly interface for creating, taking, and grading online assessments.

---

## 🚀 Features

### 👨‍🎓 Student Module
- ✅ Clean, mobile-friendly dashboard
- ✅ View active and upcoming quizzes
- ✅ Take quizzes with real-time timer
- ✅ Answer flagging and navigation
- ✅ View results and performance analytics
- ✅ Course enrollment overview

### 👨‍🏫 Faculty Module
- ✅ Question Bank management (MCQ, True/False, Short Answer, Descriptive)
- ✅ Quiz creation and scheduling
- ✅ Student performance analytics
- ✅ Grading interface for subjective questions
- ✅ Course management overview

### 👨‍💼 Admin Module
- ✅ User management (Students, Faculty, Admins)
- ✅ Course and faculty assignment
- ✅ System analytics and monitoring
- ✅ Audit logs and reporting

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js with Vite |
| **Backend** | Node.js with Express.js |
| **Database** | MySQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Styling** | Modern CSS with CSS Variables |

---

## � Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. Node.js (Required)
- **Download**: https://nodejs.org/
- **Recommended Version**: v18 or higher (LTS version)
- **How to check if installed**: Open Command Prompt/Terminal and type:
  ```bash
  node --version
  ```
  You should see something like `v18.x.x` or `v20.x.x`

### 2. MySQL (Required)
- **Download**: https://dev.mysql.com/downloads/installer/
- **Recommended Version**: v8.0 or higher
- During installation, remember the **root password** you set!

### 3. Git (Optional but Recommended)
- **Download**: https://git-scm.com/downloads
- Used for cloning this repository

---

## 📥 Complete Installation Guide (For Beginners)

Follow these steps carefully. Each step must be completed before moving to the next.

### Step 1: Download the Project

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/ONLINE_QUIZ_PORTAL.git
cd ONLINE_QUIZ_PORTAL
```

**Option B: Download ZIP**
1. Click the green "Code" button on GitHub
2. Click "Download ZIP"
3. Extract the ZIP file to your desired location

---

### Step 2: Set Up MySQL Database

#### 2.1 Open MySQL Command Line Client
- Search for "MySQL Command Line Client" in Windows Start Menu
- Enter your root password when prompted

#### 2.2 Create the Database and Tables
Run these commands one by one in MySQL:

```sql
-- Create the database
CREATE DATABASE online_quiz_portal;

-- Use the database
USE online_quiz_portal;

-- Exit MySQL (we'll import the schema file next)
exit;
```

#### 2.3 Import the Database Schema
Open **PowerShell** or **Command Prompt** and navigate to the project folder:

```bash
cd C:\path\to\ONLINE_QUIZ_PORTAL
```

Then run:
```bash
mysql -u root -p online_quiz_portal < database/schema.sql
```
- Enter your MySQL root password when prompted
- This will create all the tables and sample data

**📝 Note**: If `mysql` command is not recognized, add MySQL to your PATH:
- The MySQL path is usually: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- Or run the command from that directory

---

### Step 3: Configure the Backend Server

#### 3.1 Open the project in a code editor (VS Code recommended)

#### 3.2 Navigate to the server folder
```bash
cd server
```

#### 3.3 Install dependencies
```bash
npm install
```
Wait for all packages to install (this may take 2-3 minutes).

#### 3.4 Configure Environment Variables
1. Find the file `server/.env.example`
2. Create a copy and rename it to `.env`
3. Open `.env` and update these values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=online_quiz_portal

# JWT Configuration
JWT_SECRET=online_quiz_portal_super_secret_jwt_key_2024
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

⚠️ **Important**: Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

---

### Step 4: Configure the Frontend

#### 4.1 Open a NEW terminal/PowerShell window

#### 4.2 Navigate to the client folder
```bash
cd C:\path\to\ONLINE_QUIZ_PORTAL\client
```

#### 4.3 Install dependencies
```bash
npm install
```
Wait for all packages to install (this may take 2-3 minutes).

---

## ▶️ Running the Application

You need to run BOTH the backend and frontend servers simultaneously.

### Terminal 1: Start the Backend Server
```bash
cd server
npm run dev
```
You should see:
```
✅ MySQL Database connected successfully!
🚀 Server running on port 5000
📚 API: http://localhost:5000/api
```

### Terminal 2: Start the Frontend Server
Open a **new** terminal window:
```bash
cd client
npm run dev
```
You should see:
```
VITE ready in 300 ms
➜  Local:   http://localhost:5173/
```

### Access the Application
Open your web browser and go to: **http://localhost:5173**

---

## 🔐 Demo Credentials

Use these pre-created accounts to test the application:

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | admin@quizportal.com | password123 |
| 👨‍🏫 Faculty | john.smith@college.edu | password123 |
| 👨‍🎓 Student | nikitha@student.edu | password123 |

You can also register new accounts through the Sign Up page.

---

## 📁 Project Structure

```
ONLINE_QUIZ_PORTAL/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components (Sidebar, etc.)
│   │   ├── context/           # Auth context for user state
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register pages
│   │   │   ├── student/       # Student dashboard & quiz pages
│   │   │   ├── faculty/       # Faculty question/quiz management
│   │   │   └── admin/         # Admin user/course management
│   │   ├── services/          # API service (axios config)
│   │   └── styles/            # Global CSS files
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js Backend
│   ├── config/                # Database configuration
│   ├── controllers/           # Business logic handlers
│   ├── middleware/            # Auth middleware (JWT)
│   ├── routes/                # API endpoint definitions
│   ├── index.js               # Server entry point
│   ├── package.json
│   ├── .env                   # Environment variables (create this!)
│   └── .env.example           # Example env file
│
├── database/
│   └── schema.sql             # MySQL database schema
│
└── README.md                  # This file!
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### ❌ "mysql is not recognized as a command"
**Solution**: Add MySQL to your system PATH:
1. Find your MySQL installation (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
2. Add this path to your System Environment Variables

#### ❌ "ECONNREFUSED" error when logging in
**Solution**: The backend server is not running. Make sure to start it:
```bash
cd server
npm run dev
```

#### ❌ "Database connection failed"
**Solution**: 
1. Make sure MySQL service is running
2. Check your `.env` file has the correct password
3. Make sure the database `online_quiz_portal` exists

#### ❌ "EADDRINUSE: address already in use :::5000"
**Solution**: Port 5000 is already in use. Either:
1. Close any other terminal running the server
2. Or change the PORT in `.env` to 5001

#### ❌ "Table doesn't exist" error
**Solution**: Import the schema file:
```bash
mysql -u root -p online_quiz_portal < database/schema.sql
```

#### ❌ "vite is not recognized"
**Solution**: Install dependencies:
```bash
cd client
npm install
```

---

## 📊 Database Schema Overview

### Core Tables
| Table | Description |
|-------|-------------|
| `users` | All user accounts with roles (student/faculty/admin) |
| `courses` | Academic courses |
| `topics` | Topics within courses |
| `questions` | Question bank |
| `answers` | Answer options for questions |
| `quizzes` | Quiz configurations |
| `quiz_questions` | Quiz-question mapping |
| `quiz_attempts` | Student quiz attempts |
| `student_answers` | Individual student answers |
| `enrollments` | Course enrollments |
| `notifications` | User notifications |
| `announcements` | System announcements |
| `audit_logs` | Activity tracking |

---

## 📝 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Student APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Dashboard data |
| GET | `/api/student/quizzes` | Available quizzes |
| POST | `/api/student/quizzes/:id/start` | Start a quiz |
| POST | `/api/student/attempts/:id/submit` | Submit quiz |

### Faculty APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty/dashboard` | Dashboard data |
| GET/POST | `/api/faculty/questions` | Question management |
| GET/POST | `/api/faculty/quizzes` | Quiz management |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | System overview |
| GET/POST | `/api/admin/users` | User management |
| GET/POST | `/api/admin/courses` | Course management |

---

## 👥 Team Details

| Team Member | Role |
|-------------|------|
| Nikitha Sri | Developer |
| Harini SN | Developer |
| Shruthika | Developer |
| Varshana | Developer |

**Course**: Final Year BCA  
**Project Duration**: Dec 2025 – Mar 2025 (4 Months)

---

## 🎨 Design Highlights

- 🌙 **Modern Dark Theme** with gradient accents
- 💎 **Glassmorphism** effects for cards
- 📱 **Responsive Design** for all screen sizes
- ✨ **Smooth Animations** and transitions
- 🧭 **Intuitive Navigation** with sidebar

---

## 📄 License

MIT License - For educational purposes.

---

<div align="center">
  
**Built with ❤️ **

⭐ Star this repository if you found it helpful!

</div>
