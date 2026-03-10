import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    BarChart3, PieChart, TrendingUp, Award,
    BookOpen, Users, ClipboardList, Percent, Download,
    Target, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/faculty/dashboard');
            setAnalyticsData(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (courseId, courseName) => {
        try {
            const response = await api.get(`/faculty/courses/${courseId}/report`);
            const reportData = response.data.data.report;

            if (!reportData || reportData.length === 0) {
                toast.error('No data available to export for this course.');
                return;
            }

            const headers = [
                'Student Name', 'Email', 'Department', 'Level', 'Stream',
                'Quiz Title', 'Score Obtained', 'Total Marks', 'Percentage (%)',
                'Status', 'Submitted At'
            ];

            const rows = reportData.map(item => [
                item.student_name,
                item.student_email,
                item.department_name,
                item.level,
                item.stream,
                item.quiz_title,
                item.score,
                item.total_marks,
                item.percentage,
                item.status,
                new Date(item.submitted_at).toLocaleString()
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${courseName}_Detailed_Report.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container"><div className="spinner"></div></div>
        );
    }

    const { kpis, passFailDistribution, coursePerformance } = analyticsData || {};

    const overallPassFail = {
        labels: ['Passed', 'Failed'],
        datasets: [{
            data: passFailDistribution ? [passFailDistribution.passed, passFailDistribution.failed] : [0, 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
            hoverOffset: 15,
        }]
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Performance Analytics</h1>
                    <p className="page-subtitle">Overview of course and student performance</p>
                </div>
                <button className="btn btn-ghost" onClick={fetchAnalytics}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* KPI Stats Row */}
            <div className="stats-row mb-3">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon primary">
                            <Users size={24} />
                        </div>
                        <div className="stat-value">{kpis?.totalStudents || 0}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon success">
                            <Target size={24} />
                        </div>
                        <div className="stat-value">{kpis?.averageScore || 0}%</div>
                        <div className="stat-label">Average Score</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon warning">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-value">{kpis?.passRate || 0}%</div>
                        <div className="stat-label">Pass Rate</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon secondary">
                            <ClipboardList size={24} />
                        </div>
                        <div className="stat-value">{kpis?.totalQuizzes || 0}</div>
                        <div className="stat-label">Total Quizzes</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-2 mb-3" style={{ gap: '1rem' }}>
                {/* Bar Chart - Course Performance */}
                <div className="card p-3">
                    <h3 className="card-title mb-2 flex items-center gap-1">
                        <BarChart3 size={18} /> Course Performance
                    </h3>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={{
                                labels: coursePerformance?.map(c => c.code) || [],
                                datasets: [{
                                    label: 'Average Score (%)',
                                    data: coursePerformance?.map(c => c.average_score) || [],
                                    backgroundColor: 'rgba(99, 102, 241, 0.4)',
                                    borderColor: '#6366f1',
                                    borderWidth: 2,
                                    borderRadius: 8,
                                    hoverBackgroundColor: '#6366f1',
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 11 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 11 } }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Doughnut Chart - Pass/Fail Distribution */}
                <div className="card p-3">
                    <h3 className="card-title mb-2 flex items-center gap-1">
                        <PieChart size={18} /> Pass/Fail Distribution
                    </h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '220px', position: 'relative' }}>
                            <Doughnut
                                data={overallPassFail}
                                options={{
                                    cutout: '70%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { color: '#94A3B8', font: { size: 12 }, padding: 20 }
                                        }
                                    },
                                    animation: { animateScale: true, animateRotate: true }
                                }}
                            />
                            <div style={{
                                position: 'absolute', top: '45%', left: '50%',
                                transform: 'translate(-50%, -50%)', textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {kpis?.passRate || 0}%
                                </span>
                                <br />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    Pass Rate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Breakdown Cards */}
            <div className="card">
                <div className="card-header pb-1">
                    <h3 className="card-title">Course Breakdown</h3>
                </div>
                <div className="admin-courses-grid" style={{ padding: '1rem' }}>
                    {coursePerformance?.map((course) => (
                        <div key={course.id} className="card admin-course-card">
                            <div className="course-header">
                                <span className="course-code">{course.code}</span>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleExport(course.id, course.name)}
                                    title="Export Report"
                                >
                                    <Download size={16} />
                                </button>
                            </div>

                            <h3>{course.name}</h3>

                            <div style={{
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem',
                                marginTop: '0.75rem'
                            }}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-muted">Average Score</span>
                                    <span className="font-bold">{course.average_score}%</span>
                                </div>
                                <div style={{
                                    height: '6px', background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '3px', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%', width: `${course.average_score}%`,
                                        background: 'var(--gradient-primary)', borderRadius: '3px',
                                        transition: 'width 1s ease'
                                    }} />
                                </div>
                            </div>

                            <div className="course-stats-row">
                                <span className="text-success">
                                    ✓ {course.passed_count} passed
                                </span>
                                <span className="text-danger">
                                    ✗ {course.failed_count} failed
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
