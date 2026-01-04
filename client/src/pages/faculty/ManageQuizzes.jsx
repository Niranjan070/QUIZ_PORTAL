import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Eye, Users, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Faculty.css';

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get('/faculty/quizzes');
            setQuizzes(response.data.data.quizzes);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try {
            await api.delete(`/faculty/quizzes/${id}`);
            toast.success('Quiz deleted!');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const togglePublish = async (quiz) => {
        try {
            await api.put(`/faculty/quizzes/${quiz.id}`, {
                ...quiz,
                isPublished: !quiz.is_published
            });
            toast.success(quiz.is_published ? 'Quiz unpublished' : 'Quiz published!');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const getStatus = (quiz) => {
        const now = new Date();
        const start = new Date(quiz.start_time);
        const end = new Date(quiz.end_time);

        if (!quiz.is_published) return { text: 'Draft', class: 'badge-secondary' };
        if (now < start) return { text: 'Scheduled', class: 'badge-warning' };
        if (now > end) return { text: 'Ended', class: 'badge-secondary' };
        return { text: 'Active', class: 'badge-success' };
    };

    return (
        <div className="page-container">
            <Sidebar role="faculty" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Manage Quizzes</h1>
                        <p className="page-subtitle">Create and manage your quizzes</p>
                    </div>
                    <Link to="/faculty/quizzes/create" className="btn btn-primary">
                        <Plus size={20} /> Create Quiz
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <div className="quizzes-grid">
                        {quizzes.length > 0 ? quizzes.map((quiz) => {
                            const status = getStatus(quiz);
                            return (
                                <div key={quiz.id} className="card quiz-card">
                                    <div className="quiz-card-header">
                                        <span className={`badge ${status.class}`}>{status.text}</span>
                                        <span className="quiz-course">{quiz.course_name}</span>
                                    </div>

                                    <h3 className="quiz-card-title">{quiz.title}</h3>
                                    <p className="quiz-card-desc">{quiz.description || 'No description'}</p>

                                    <div className="quiz-card-meta">
                                        <div className="meta-item"><Clock size={16} /> {quiz.duration_minutes} min</div>
                                        <div className="meta-item">{quiz.question_count} questions</div>
                                        <div className="meta-item"><Users size={16} /> {quiz.attempt_count}</div>
                                    </div>

                                    <div className="quiz-card-dates">
                                        <small><Calendar size={12} /> Start: {formatDate(quiz.start_time)}</small>
                                        <small><Calendar size={12} /> End: {formatDate(quiz.end_time)}</small>
                                    </div>

                                    <div className="quiz-card-footer">
                                        <button
                                            className={`btn btn-sm ${quiz.is_published ? 'btn-secondary' : 'btn-success'}`}
                                            onClick={() => togglePublish(quiz)}
                                        >
                                            {quiz.is_published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <div className="flex gap-1">
                                            <button className="btn btn-ghost btn-icon"><Eye size={16} /></button>
                                            <button className="btn btn-ghost btn-icon"><Edit2 size={16} /></button>
                                            <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(quiz.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <p>No quizzes yet. Create your first quiz!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageQuizzes;
