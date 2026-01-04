import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import {
    BookOpen, Users, FileQuestion, ClipboardList,
    Plus, TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import '../student/Dashboard.css';
import './Faculty.css';

const FacultyDashboard = () => {
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
            <div className="page-container">
                <Sidebar role="faculty" />
                <main className="main-content">
                    <div className="loading-container"><div className="spinner"></div></div>
                </main>
            </div>
        );
    }

    const { stats, courses, recentSubmissions } = data || {};

    return (
        <div className="page-container">
            <Sidebar role="faculty" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Faculty Dashboard</h1>
                        <p className="page-subtitle">Manage your courses, quizzes, and students</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/faculty/quizzes/create" className="btn btn-primary">
                            <Plus size={20} /> Create Quiz
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-card">
                        <div className="stat-icon primary"><BookOpen size={24} /></div>
                        <div className="stat-value">{stats?.totalCourses || 0}</div>
                        <div className="stat-label">Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success"><Users size={24} /></div>
                        <div className="stat-value">{stats?.totalStudents || 0}</div>
                        <div className="stat-label">Students</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning"><ClipboardList size={24} /></div>
                        <div className="stat-value">{stats?.totalQuizzes || 0}</div>
                        <div className="stat-label">Quizzes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon secondary"><FileQuestion size={24} /></div>
                        <div className="stat-value">{stats?.totalQuestions || 0}</div>
                        <div className="stat-label">Questions</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions mb-3">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <Link to="/faculty/quizzes/create" className="action-card">
                            <div className="action-icon"><Plus size={24} /></div>
                            <span>Create Quiz</span>
                        </Link>
                        <Link to="/faculty/questions" className="action-card">
                            <div className="action-icon"><FileQuestion size={24} /></div>
                            <span>Question Bank</span>
                        </Link>
                        <Link to="/faculty/quizzes" className="action-card">
                            <div className="action-icon"><ClipboardList size={24} /></div>
                            <span>Manage Quizzes</span>
                        </Link>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* My Courses */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title"><BookOpen size={20} /> My Courses</h3>
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
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state small">
                                    <BookOpen size={32} />
                                    <p>No courses assigned</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title"><CheckCircle size={20} /> Recent Submissions</h3>
                        </div>
                        <div className="submissions-list">
                            {recentSubmissions?.length > 0 ? recentSubmissions.map((sub) => (
                                <div key={sub.id} className="submission-item">
                                    <div className="submission-info">
                                        <h4>{sub.student_name}</h4>
                                        <p>{sub.quiz_title}</p>
                                    </div>
                                    <div className="submission-score">
                                        <span className={parseFloat(sub.score / sub.total_marks * 100) >= 40 ? 'pass' : 'fail'}>
                                            {sub.score}/{sub.total_marks}
                                        </span>
                                        <small>{new Date(sub.submitted_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state small">
                                    <CheckCircle size={32} />
                                    <p>No submissions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyDashboard;
