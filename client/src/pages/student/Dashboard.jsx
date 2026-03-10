import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import QuizCalendar from '../../components/QuizCalendar';
import {
    BookOpen, ClipboardList, Trophy, Clock,
    ChevronRight, Calendar, TrendingUp, MapPin, GraduationCap
} from 'lucide-react';
import '../../styles/dashboard.css';
import '../../styles/viewport-dashboard.css';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
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
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const { stats, activeQuizzes, upcomingQuizzes, recentResults, enrolledCourses, notifications } = dashboardData || {};

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Compact Profile Header */}
                <div className="page-header profile-header">
                    <div className="flex items-center gap-2">
                        <div className="profile-avatar big">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="page-title">{user?.name}</h1>
                            <div className="profile-meta-row">
                                <span className="profile-meta-item"><MapPin size={14} /> {user?.department || 'Department'}</span>
                                {user?.funding_type && <span className="profile-meta-item">{user.funding_type}</span>}
                                {user?.level && <span className="profile-meta-item"><GraduationCap size={14} /> {user.level}</span>}
                                {user?.year && <span className="profile-meta-item">{user.year}</span>}
                            </div>
                        </div>
                    </div>
                    <Link to="/student/quizzes" className="btn btn-primary">
                        <ClipboardList size={18} />
                        Browse Quizzes
                    </Link>
                </div>
                {/* Stats Grid */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon primary">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-value">{stats?.enrolledCourses || 0}</div>
                            <div className="stat-label">Enrolled Courses</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon success">
                                <ClipboardList size={24} />
                            </div>
                            <div className="stat-value">{stats?.activeQuizzes || 0}</div>
                            <div className="stat-label">Active Quizzes</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon warning">
                                <Trophy size={24} />
                            </div>
                            <div className="stat-value">{stats?.quizzesTaken || 0}</div>
                            <div className="stat-label">Quizzes Completed</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon secondary">
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-value">{stats?.averageScore || 0}%</div>
                            <div className="stat-label">Average Score</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">

                    {/* Left Column - Main Content */}
                    <div className="dashboard-left-column">

                        {/* Active Quizzes */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Clock size={18} className="text-success" />
                                    Active Quizzes
                                </h3>
                                <Link to="/student/quizzes" className="btn btn-ghost btn-sm">
                                    View All <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="card-body">
                                {activeQuizzes?.length > 0 ? (
                                    activeQuizzes.map((quiz) => (
                                        <div key={quiz.id} className="quiz-item">
                                            <div className="quiz-info">
                                                <h4 className="quiz-title">{quiz.title}</h4>
                                                <p className="quiz-meta">
                                                    <span className="badge badge-primary">{quiz.course_name}</span>
                                                    <span><Clock size={12} /> {quiz.duration_minutes} min</span>
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
                                        <ClipboardList size={32} />
                                        <p>No active quizzes at the moment</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Quizzes */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Calendar size={18} className="text-warning" />
                                    Upcoming Schedule
                                </h3>
                            </div>

                            <div className="card-body">
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
                                        <Calendar size={28} />
                                        <p>No upcoming quizzes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Results */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Trophy size={18} className="text-warning" />
                                    Recent Results
                                </h3>
                                <Link to="/student/results" className="btn btn-ghost btn-sm">
                                    View All <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="card-body">
                                {recentResults?.length > 0 ? (
                                    recentResults.map((result) => (
                                        <div key={result.id} className="result-item">
                                            <div className="result-info">
                                                <h4>{result.quiz_title}</h4>
                                                <p>{result.course_name}</p>
                                            </div>
                                            <div className="result-score">
                                                <span className={`score ${result.percentage >= 40 ? 'pass' : 'fail'} `}>
                                                    {result.percentage}%
                                                </span>
                                                <span className="score-detail">{result.score}/{result.total_marks}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state small">
                                        <Trophy size={28} />
                                        <p>No results yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Calendar */}
                    <div className="dashboard-right-column">
                        <div className="calendar-card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Calendar size={18} className="text-primary" />
                                    Quiz Calendar
                                </h3>
                            </div>
                            <QuizCalendar
                                quizzes={[...(activeQuizzes || []), ...(upcomingQuizzes || [])]}
                                onQuizClick={(quiz) => window.location.href = `/student/quiz/${quiz.id}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
