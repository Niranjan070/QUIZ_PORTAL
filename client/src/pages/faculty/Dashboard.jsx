import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import QuizCalendar from '../../components/QuizCalendar';
import {
    BookOpen, Users, FileQuestion, ClipboardList,
    Plus, Clock, CheckCircle, Briefcase, MapPin, Calendar,
    TrendingUp, ChevronRight
} from 'lucide-react';
import '../../styles/dashboard.css';
import '../../styles/viewport-dashboard.css';
import '../student/Dashboard.css';
import './Faculty.css';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/faculty/dashboard');
            setData(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const { stats, courses, recentSubmissions, quizzes } = data || {};

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Profile Header */}
                <div className="page-header profile-header">
                    <div className="flex items-center gap-2">
                        <div className="profile-avatar big">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="page-title">{user?.name}</h1>
                            <div className="profile-meta-row">
                                <span className="profile-meta-item">
                                    <Briefcase size={14} /> {user?.designation || 'Faculty'}
                                </span>
                                <span className="profile-meta-item">
                                    <MapPin size={14} /> {user?.department || 'Department'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="header-stats">
                        <div className="stat-badge">
                            <span className="label">Active Quizzes</span>
                            <span className="value">{quizzes?.filter(q => q.status === 'active').length || 0}</span>
                        </div>
                        <div className="stat-badge">
                            <span className="label">Participation</span>
                            <span className="value">92%</span> {/* Placeholder for now */}
                        </div>
                        <Link to="/faculty/quizzes/create" className="btn btn-primary">
                            <Plus size={18} />
                            Create Quiz
                        </Link>
                    </div>
                </div>
                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon primary">
                                <BookOpen size={24} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stats?.totalCourses || 0}</div>
                                <div className="stat-label">Active Courses</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon success">
                                <Users size={24} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stats?.totalStudents || 0}</div>
                                <div className="stat-label">Total Students</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon warning">
                                <ClipboardList size={24} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stats?.totalQuizzes || 0}</div>
                                <div className="stat-label">Total Quizzes</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon secondary">
                                <FileQuestion size={24} />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stats?.totalQuestions || 0}</div>
                                <div className="stat-label">Question Bank</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-main-grid">

                    {/* Left Column */}
                    <div className="dashboard-left-column">

                        {/* Quick Actions */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3 className="section-title">Quick Actions</h3>
                            </div>
                            <div className="quick-actions-grid">
                                <Link to="/faculty/quizzes/create" className="quick-action-card">
                                    <div className="quick-action-icon">
                                        <Plus size={24} />
                                    </div>
                                    <span className="quick-action-label">Create Quiz</span>
                                </Link>
                                <Link to="/faculty/questions" className="quick-action-card">
                                    <div className="quick-action-icon">
                                        <FileQuestion size={24} />
                                    </div>
                                    <span className="quick-action-label">Question Bank</span>
                                </Link>
                                <Link to="/faculty/quizzes" className="quick-action-card">
                                    <div className="quick-action-icon">
                                        <ClipboardList size={24} />
                                    </div>
                                    <span className="quick-action-label">Manage Quizzes</span>
                                </Link>
                                <Link to="/faculty/analytics" className="quick-action-card">
                                    <div className="quick-action-icon">
                                        <TrendingUp size={24} />
                                    </div>
                                    <span className="quick-action-label">Analytics</span>
                                </Link>
                            </div>
                        </div>

                        {/* My Courses */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <BookOpen size={20} /> My Courses
                                </h3>
                                {/* Simple text link instead of button for cleaner look */}
                            </div>
                            <div className="courses-list">
                                {courses?.length > 0 ? courses.map((course) => (
                                    <div key={course.id} className="course-item">
                                        <div className="course-info">
                                            <h4>{course.name}</h4>
                                            <p>{course.code}</p>
                                        </div>
                                        <div className="course-stats">
                                            <span><Users size={14} /> {course.student_count}</span>
                                            <span><ClipboardList size={14} /> {course.quiz_count}</span>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <p>No courses assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Calendar */}
                    <div className="dashboard-right-column">
                        <div className="calendar-card">
                            {/* QuizCalendar component handles its own header usually, ensuring it fits */}
                            <QuizCalendar
                                quizzes={quizzes || []}
                                onQuizClick={(quiz) => window.location.href = `/faculty/quizzes/${quiz.id}/edit`}
                            />
                        </div >
                    </div >

                </div >
            </div >
        </div >
    );
};

export default FacultyDashboard;
