import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Trophy, Clock, TrendingUp, CheckCircle, XCircle, Award, HelpCircle } from 'lucide-react';
import './Dashboard.css';

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const justCompleted = location.state?.justCompleted;

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await api.get('/student/results');
            setResults(response.data.data.results);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Calculate overall stats
    const overallStats = results.length > 0 ? {
        totalQuizzes: results.length,
        avgScore: Math.round(results.reduce((acc, r) => acc + parseFloat(r.percentage || 0), 0) / results.length),
        passed: results.filter(r => parseFloat(r.percentage) >= 40).length,
        failed: results.filter(r => parseFloat(r.percentage) < 40).length
    } : null;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Results</h1>
                    <p className="page-subtitle">View your quiz performance and history</p>
                </div>
            </div>

            {justCompleted && (
                <div className="card success-card mb-3">
                    <CheckCircle size={24} />
                    <div>
                        <strong>Quiz Completed!</strong>
                        <p>Score: {location.state.score}/{location.state.total} ({location.state.percentage}%)</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <>
                    {/* Stats Overview */}
                    {overallStats && (
                        <div className="grid grid-4 mb-3">
                            <div className="stat-card">
                                <div className="stat-icon primary"><Trophy size={24} /></div>
                                <div className="stat-value">{overallStats.totalQuizzes}</div>
                                <div className="stat-label">Quizzes Taken</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon secondary"><TrendingUp size={24} /></div>
                                <div className="stat-value">{overallStats.avgScore}%</div>
                                <div className="stat-label">Average Score</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon success"><CheckCircle size={24} /></div>
                                <div className="stat-value">{overallStats.passed}</div>
                                <div className="stat-label">Passed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon warning"><XCircle size={24} /></div>
                                <div className="stat-value">{overallStats.failed}</div>
                                <div className="stat-label">Failed</div>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Quiz History</h3>
                        </div>

                        {results.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Quiz</th>
                                            <th>Course</th>
                                            <th>Score</th>
                                            <th>Percentage</th>
                                            <th>Time Spent</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Details</th>
                                            <th>Certificate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result) => (
                                            <tr key={result.id}>
                                                <td><strong>{result.quiz_title}</strong></td>
                                                <td>{result.course_name}</td>
                                                <td>{result.score}/{result.total_marks}</td>
                                                <td>
                                                    <span className={`score ${parseFloat(result.percentage) >= 40 ? 'pass' : 'fail'}`}>
                                                        {result.percentage}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} /> {formatDuration(result.time_spent_seconds)}
                                                    </span>
                                                </td>
                                                <td>{formatDate(result.submitted_at)}</td>
                                                <td>
                                                    <span className={`badge ${parseFloat(result.percentage) >= 40 ? 'badge-success' : 'badge-danger'}`}>
                                                        {parseFloat(result.percentage) >= 40 ? 'Passed' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/student/results/${result.id}`} className="btn btn-sm btn-ghost text-primary flex items-center gap-1">
                                                        <HelpCircle size={16} /> View
                                                    </Link>
                                                </td>
                                                <td>
                                                    {result.generate_certificate && parseFloat(result.percentage) >= 40 ? (
                                                        <Link to={`/student/certificate/${result.id}`} className="btn btn-sm btn-ghost text-primary flex items-center gap-1">
                                                            <Award size={16} /> View
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted text-sm">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Trophy size={48} />
                                <p>No quiz results yet. Start taking quizzes to see your results here!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Results;
