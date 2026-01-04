import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Clock, Calendar, PlayCircle, CheckCircle, Filter } from 'lucide-react';
import './Dashboard.css';

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        fetchQuizzes();
    }, [filter]);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get(`/student/quizzes?status=${filter}`);
            setQuizzes(response.data.data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
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

    const getQuizStatus = (quiz) => {
        const now = new Date();
        const start = new Date(quiz.start_time);
        const end = new Date(quiz.end_time);

        if (now < start) return { text: 'Upcoming', class: 'badge-warning' };
        if (now > end) return { text: 'Ended', class: 'badge-secondary' };
        return { text: 'Active', class: 'badge-success' };
    };

    return (
        <div className="page-container">
            <Sidebar role="student" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Quizzes</h1>
                        <p className="page-subtitle">Browse and take available quizzes</p>
                    </div>
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        <PlayCircle size={18} /> Active
                    </button>
                    <button
                        className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        <Calendar size={18} /> Upcoming
                    </button>
                    <button
                        className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        <CheckCircle size={18} /> Past
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <div className="quizzes-grid">
                        {quizzes.length > 0 ? quizzes.map((quiz) => {
                            const status = getQuizStatus(quiz);
                            const canTake = status.text === 'Active' && quiz.attempts_made < quiz.max_attempts;

                            return (
                                <div key={quiz.id} className="card quiz-card">
                                    <div className="quiz-card-header">
                                        <span className={`badge ${status.class}`}>{status.text}</span>
                                        <span className="quiz-course">{quiz.course_name}</span>
                                    </div>

                                    <h3 className="quiz-card-title">{quiz.title}</h3>
                                    <p className="quiz-card-desc">{quiz.description || 'No description'}</p>

                                    <div className="quiz-card-meta">
                                        <div className="meta-item">
                                            <Clock size={16} />
                                            <span>{quiz.duration_minutes} min</span>
                                        </div>
                                        <div className="meta-item">
                                            <span>{quiz.total_marks} marks</span>
                                        </div>
                                    </div>

                                    <div className="quiz-card-dates">
                                        <small>Start: {formatDate(quiz.start_time)}</small>
                                        <small>End: {formatDate(quiz.end_time)}</small>
                                    </div>

                                    <div className="quiz-card-footer">
                                        <span className="attempts-info">
                                            Attempts: {quiz.attempts_made}/{quiz.max_attempts}
                                        </span>
                                        {canTake ? (
                                            <Link to={`/student/quiz/${quiz.id}`} className="btn btn-primary btn-sm">
                                                Start Quiz
                                            </Link>
                                        ) : quiz.best_score !== null ? (
                                            <span className="best-score">Best: {quiz.best_score}/{quiz.total_marks}</span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <Calendar size={48} />
                                <p>No {filter} quizzes found</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Quizzes;
