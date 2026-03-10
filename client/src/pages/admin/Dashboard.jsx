import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, BookOpen, ClipboardList, Activity, TrendingUp, Shield, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '../../styles/dashboard.css';
import '../../styles/viewport-dashboard.css';
import '../student/Dashboard.css';
import './Admin.css';

ChartJS.register(ArcElement, Tooltip, Legend);

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
            <div className="loading-container"><div className="spinner"></div></div>
        );
    }

    const { systemStats, recentUsers } = data || {};

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">System overview and management</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-4 mb-3">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon primary"><Users size={28} /></div>
                            <div className="stat-value">{systemStats?.totalUsers || 0}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon success"><BookOpen size={28} /></div>
                            <div className="stat-value">{systemStats?.totalCourses || 0}</div>
                            <div className="stat-label">Courses</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon warning"><ClipboardList size={28} /></div>
                            <div className="stat-value">{systemStats?.totalQuizzes || 0}</div>
                            <div className="stat-label">Quizzes</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon secondary"><Activity size={28} /></div>
                            <div className="stat-value">{systemStats?.totalAttempts || 0}</div>
                            <div className="stat-label">Quiz Attempts</div>
                        </div>
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

                {/* Visual Analytics */}
                <div className="grid grid-3 mb-3">
                    <div className="card">
                        <div className="card-header pb-1">
                            <h3 className="card-title flex items-center gap-1">
                                <PieChartIcon size={18} /> Department Wise
                            </h3>
                        </div>
                        <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={{
                                    labels: Object.keys(systemStats?.byDepartment || {}),
                                    datasets: [{
                                        data: Object.values(systemStats?.byDepartment || {}),
                                        backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#94a3b8' } } } }}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header pb-1">
                            <h3 className="card-title flex items-center gap-1">
                                <Activity size={18} /> Level (UG/PG)
                            </h3>
                        </div>
                        <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={{
                                    labels: Object.keys(systemStats?.byLevel || {}),
                                    datasets: [{
                                        data: Object.values(systemStats?.byLevel || {}),
                                        backgroundColor: ['#4f46e5', '#10b981'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#94a3b8' } } } }}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header pb-1">
                            <h3 className="card-title flex items-center gap-1">
                                <TrendingUp size={18} /> Stream (Aided/SF)
                            </h3>
                        </div>
                        <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={{
                                    labels: Object.keys(systemStats?.byStream || {}),
                                    datasets: [{
                                        data: Object.values(systemStats?.byStream || {}),
                                        backgroundColor: ['#8b5cf6', '#06b6d4'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#94a3b8' } } } }}
                            />
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
                            <Link to="/admin/analytics" className="quick-link">
                                <BarChart3 size={20} />
                                <span>Performance Report</span>
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
            </div>
        </div>
    );
};

export default AdminDashboard;
