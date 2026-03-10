import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    TrendingUp,
    GraduationCap,
    Layers,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import './Admin.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setAnalyticsData(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    const { perfByDept, perfByLevel, perfByStream, avgScores } = analyticsData || {};

    // Chart Data Helpers
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    padding: 20,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    const doughnutOptions = {
        ...chartOptions,
        scales: { y: { display: false }, x: { display: false } }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/admin')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">Performance Analytics</h1>
                        <p className="page-subtitle">Detailed student performance indices</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-2 mb-3">
                {/* Performance by Department */}
                <div className="card">
                    <div className="card-header pb-1">
                        <h3 className="card-title flex items-center gap-1">
                            <PieChartIcon size={20} className="text-primary-400" />
                            Department Performance (%)
                        </h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={{
                                labels: perfByDept?.map(d => d.department_name) || [],
                                datasets: [{
                                    label: 'Avg Score %',
                                    data: perfByDept?.map(d => d.avg_score) || [],
                                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                    borderRadius: 8
                                }]
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>

                {/* Course Wise Performance */}
                <div className="card">
                    <div className="card-header pb-1">
                        <h3 className="card-title flex items-center gap-1">
                            <GraduationCap size={20} className="text-success-400" />
                            Course Performance (%)
                        </h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar
                            data={{
                                labels: avgScores?.map(s => s.course_name) || [],
                                datasets: [{
                                    label: 'Avg Score %',
                                    data: avgScores?.map(s => s.avg_score) || [],
                                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                    borderRadius: 8
                                }]
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-3 mb-3">
                {/* Performance by Level */}
                <div className="card">
                    <div className="card-header pb-1">
                        <h3 className="card-title flex items-center gap-1">
                            <Layers size={18} className="text-warning-400" /> Level-wise Index
                        </h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Doughnut
                            data={{
                                labels: perfByLevel?.map(l => l.level) || [],
                                datasets: [{
                                    data: perfByLevel?.map(l => l.avg_score) || [],
                                    backgroundColor: ['#6366f1', '#14b8a6'],
                                    borderWidth: 0
                                }]
                            }}
                            options={doughnutOptions}
                        />
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-muted small">Avg Score by Academic Level</p>
                    </div>
                </div>

                {/* Performance by Stream */}
                <div className="card">
                    <div className="card-header pb-1">
                        <h3 className="card-title flex items-center gap-1">
                            <TrendingUp size={18} className="text-secondary-400" /> Stream-wise Index
                        </h3>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Doughnut
                            data={{
                                labels: perfByStream?.map(s => s.stream) || [],
                                datasets: [{
                                    data: perfByStream?.map(s => s.avg_score) || [],
                                    backgroundColor: ['#8b5cf6', '#06b6d4'],
                                    borderWidth: 0
                                }]
                            }}
                            options={doughnutOptions}
                        />
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-muted small">Avg Score by Funding Stream</p>
                    </div>
                </div>

                {/* Quick Info Card */}
                <div className="card flex flex-col justify-center items-center text-center">
                    <Activity size={48} className="text-primary-400 mb-2 animate-pulse" />
                    <h3 className="mb-1">Real-time Insights</h3>
                    <p className="text-secondary small">
                        Performance indices are calculated based on all completed quiz attempts across the system.
                    </p>
                    <div className="mt-3 p-2 bg-tertiary rounded w-full">
                        <div className="flex justify-between mb-1">
                            <span className="text-muted small">Highest Index</span>
                            <span className="text-success small font-bold">
                                {Math.max(...(perfByDept?.map(d => d.avg_score) || [0]))}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted small">Global Avg</span>
                            <span className="text-primary small font-bold">
                                {(perfByDept?.reduce((acc, curr) => acc + curr.avg_score, 0) / (perfByDept?.length || 1)).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
