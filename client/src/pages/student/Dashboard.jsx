import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import {
    BookOpen, ClipboardList, Trophy, Clock,
    ChevronRight, Calendar, TrendingUp, Bell
} from 'lucide-react';
import './Dashboard.css';

const StudentDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/student/dashboard');
            setDashboardData(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="page-container">
                <Sidebar role="student" />
                <main className="main-content">
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </main>
            </div>
        );
    }

    const { stats, activeQuizzes, upcomingQuizzes, recentResults, enrolledCourses, notifications } = dashboardData || {};

    return (
        <div className="page-container">
            <Sidebar role="student" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Student Dashboard</h1>
                        <p className="page-subtitle">Welcome back! Here's your learning overview.</p>
                    </div>
                    <Link to="/student/quizzes" className="btn btn-primary">
                        <ClipboardList size={20} />
                        Browse Quizzes
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-card">
                        <div className="stat-icon primary">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-value">{stats?.enrolledCourses || 0}</div>
                        <div className="stat-label">Enrolled Courses</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon success">
                            <ClipboardList size={24} />
                        </div>
                        <div className="stat-value">{stats?.activeQuizzes || 0}</div>
                        <div className="stat-label">Active Quizzes</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon warning">
                            <Trophy size={24} />
                        </div>
                        <div className="stat-value">{stats?.quizzesTaken || 0}</div>
                        <div className="stat-label">Quizzes Completed</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon secondary">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-value">{stats?.averageScore || 0}%</div>
                        <div className="stat-label">Average Score</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Active Quizzes */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Clock size={20} className="text-success" />
                                Active Quizzes
                            </h3>
                            <Link to="/student/quizzes" className="btn btn-ghost btn-sm">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="quiz-list">
                            {activeQuizzes?.length > 0 ? (
                                activeQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="quiz-item">
                                        <div className="quiz-info">
                                            <h4 className="quiz-title">{quiz.title}</h4>
                                            <p className="quiz-meta">
                                                <span className="badge badge-primary">{quiz.course_name}</span>
                                                <span><Clock size={14} /> {quiz.duration_minutes} min</span>
                                            </p>
                                        </div>
                                        <div className="quiz-actions">
                                            <span className="quiz-deadline">
                                                Due: {formatDate(quiz.end_time)}
                                            </span>
                                            {quiz.attempts_made < quiz.max_attempts && (
                                                <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary btn-sm">
                                                    Start Quiz
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <ClipboardList size={40} />
                                    <p>No active quizzes at the moment</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Quizzes */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Calendar size={20} className="text-warning" />
                                Upcoming Schedule
                            </h3>
                        </div>

                        <div className="schedule-list">
                            {upcomingQuizzes?.length > 0 ? (
                                upcomingQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="schedule-item">
                                        <div className="schedule-date">
                                            <span className="date-day">{new Date(quiz.start_time).getDate()}</span>
                                            <span className="date-month">
                                                {new Date(quiz.start_time).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="schedule-info">
                                            <h4>{quiz.title}</h4>
                                            <p>{quiz.course_name} • {quiz.duration_minutes} min</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state small">
                                    <Calendar size={32} />
                                    <p>No upcoming quizzes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Results */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Trophy size={20} className="text-warning" />
                                Recent Results
                            </h3>
                            <Link to="/student/results" className="btn btn-ghost btn-sm">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="results-list">
                            {recentResults?.length > 0 ? (
                                recentResults.map((result) => (
                                    <div key={result.id} className="result-item">
                                        <div className="result-info">
                                            <h4>{result.quiz_title}</h4>
                                            <p>{result.course_name}</p>
                                        </div>
                                        <div className="result-score">
                                            <span className={`score ${result.percentage >= 40 ? 'pass' : 'fail'}`}>
                                                {result.percentage}%
                                            </span>
                                            <span className="score-detail">{result.score}/{result.total_marks}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state small">
                                    <Trophy size={32} />
                                    <p>No results yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <BookOpen size={20} className="text-primary" />
                                My Courses
                            </h3>
                        </div>

                        <div className="courses-grid">
                            {enrolledCourses?.length > 0 ? (
                                enrolledCourses.map((course) => (
                                    <div key={course.id} className="course-card">
                                        <div className="course-icon">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="course-info">
                                            <h4>{course.name}</h4>
                                            <p>{course.faculty_name || 'No instructor'}</p>
                                            <span className="course-quizzes">
                                                {course.total_quizzes} quizzes available
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <BookOpen size={40} />
                                    <p>Not enrolled in any courses</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
