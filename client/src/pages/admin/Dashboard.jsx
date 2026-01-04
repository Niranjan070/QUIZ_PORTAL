import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users, BookOpen, ClipboardList, Activity, TrendingUp, Shield } from 'lucide-react';
import '../student/Dashboard.css';
import './Admin.css';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/admin/dashboard');
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
                <Sidebar role="admin" />
                <main className="main-content">
                    <div className="loading-container"><div className="spinner"></div></div>
                </main>
            </div>
        );
    }

    const { systemStats, recentUsers } = data || {};

    return (
        <div className="page-container">
            <Sidebar role="admin" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">System overview and management</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-card">
                        <div className="stat-icon primary"><Users size={24} /></div>
                        <div className="stat-value">{systemStats?.totalUsers || 0}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success"><BookOpen size={24} /></div>
                        <div className="stat-value">{systemStats?.totalCourses || 0}</div>
                        <div className="stat-label">Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning"><ClipboardList size={24} /></div>
                        <div className="stat-value">{systemStats?.totalQuizzes || 0}</div>
                        <div className="stat-label">Quizzes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon secondary"><Activity size={24} /></div>
                        <div className="stat-value">{systemStats?.totalAttempts || 0}</div>
                        <div className="stat-label">Quiz Attempts</div>
                    </div>
                </div>

                {/* Users by Role */}
                <div className="grid grid-3 mb-3">
                    <div className="role-card students">
                        <div className="role-icon"><Users size={28} /></div>
                        <div className="role-info">
                            <span className="role-count">{systemStats?.usersByRole?.student || 0}</span>
                            <span className="role-label">Students</span>
                        </div>
                    </div>
                    <div className="role-card faculty">
                        <div className="role-icon"><BookOpen size={28} /></div>
                        <div className="role-info">
                            <span className="role-count">{systemStats?.usersByRole?.faculty || 0}</span>
                            <span className="role-label">Faculty</span>
                        </div>
                    </div>
                    <div className="role-card admins">
                        <div className="role-icon"><Shield size={28} /></div>
                        <div className="role-info">
                            <span className="role-count">{systemStats?.usersByRole?.admin || 0}</span>
                            <span className="role-label">Admins</span>
                        </div>
                    </div>
                </div>

                {/* Quick Access & Recent Users */}
                <div className="dashboard-grid">
                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">Quick Access</h3>
                        </div>
                        <div className="quick-links">
                            <Link to="/admin/users" className="quick-link">
                                <Users size={20} />
                                <span>Manage Users</span>
                            </Link>
                            <Link to="/admin/courses" className="quick-link">
                                <BookOpen size={20} />
                                <span>Manage Courses</span>
                            </Link>
                        </div>
                    </div>

                    <div className="card dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">Recent Users</h3>
                            <Link to="/admin/users" className="btn btn-ghost btn-sm">View All</Link>
                        </div>
                        <div className="users-list">
                            {recentUsers?.length > 0 ? recentUsers.slice(0, 5).map((user) => (
                                <div key={user.id} className="user-item">
                                    <div className="user-avatar-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <h4>{user.name}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                    <span className={`badge badge-${user.role === 'admin' ? 'danger' :
                                            user.role === 'faculty' ? 'primary' : 'success'
                                        }`}>{user.role}</span>
                                </div>
                            )) : (
                                <div className="empty-state small">
                                    <p>No users yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
