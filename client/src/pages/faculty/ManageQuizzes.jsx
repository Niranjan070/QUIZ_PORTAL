import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus, Edit2, Trash2, Eye, Users, Clock,
    Calendar, Archive, ArchiveRestore, Search,
    ClipboardList, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

const ManageQuizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, [filter]);

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

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            await api.delete(`/faculty/quizzes/${id}`);
            toast.success('Quiz deleted successfully');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to delete quiz');
        }
    };

    const togglePublish = async (e, quiz) => {
        e.stopPropagation();
        try {
            await api.put(`/faculty/quizzes/${quiz.id}`, {
                title: quiz.title,
                description: quiz.description,
                durationMinutes: quiz.duration_minutes,
                maxAttempts: quiz.max_attempts,
                startTime: quiz.start_time,
                endTime: quiz.end_time,
                isPublished: !quiz.is_published,
                targetDepartment: quiz.target_department,
                targetLevel: quiz.target_level,
                targetStream: quiz.target_stream,
                targetYear: quiz.target_year,
                minPercentageRequired: quiz.min_percentage_required,
                showResults: quiz.show_results,
                shuffleQuestions: quiz.shuffle_questions,
                shuffleAnswers: quiz.shuffle_answers,
                generateCertificate: quiz.generate_certificate
            });
            toast.success(quiz.is_published ? 'Quiz unpublished' : 'Quiz published!');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to update quiz');
        }
    };

    const toggleArchive = async (e, id) => {
        e.stopPropagation();
        try {
            const response = await api.patch(`/faculty/quizzes/${id}/archive`);
            toast.success(response.data.message);
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to archive quiz');
        }
    };

    const getStatus = (quiz) => {
        const now = new Date();
        const start = new Date(quiz.start_time);
        const end = new Date(quiz.end_time);

        if (quiz.is_archived) return { text: 'Archived', className: 'badge-warning' };
        if (!quiz.is_published) return { text: 'Draft', className: 'badge-secondary' };
        if (now < start) return { text: 'Upcoming', className: 'badge-primary' };
        if (now > end) return { text: 'Ended', className: 'badge-danger' };
        return { text: 'Live', className: 'badge-success' };
    };

    const filteredQuizzes = quizzes.filter(q => {
        const matchesFilter = filter === 'achieved' ? q.is_archived : !q.is_archived;
        const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.course_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Quizzes</h1>
                    <p className="page-subtitle">{filteredQuizzes.length} quizzes found</p>
                </div>
                <div className="flex gap-1">
                    <Link to="/faculty/quizzes/create" className="btn btn-primary">
                        <Plus size={20} /> Create Quiz
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-3">
                <div className="input-wrapper">
                    <Search size={18} className="input-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search quizzes..."
                        style={{ width: '250px', paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`filter-tab ${filter === 'achieved' ? 'active' : ''}`}
                        onClick={() => setFilter('achieved')}
                    >
                        Archived
                    </button>
                </div>
            </div>

            {/* Quiz Cards Grid */}
            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="admin-courses-grid">
                    {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => {
                        const status = getStatus(quiz);
                        return (
                            <div
                                key={quiz.id}
                                className="card admin-course-card"
                                onClick={() => navigate(`/faculty/quizzes/${quiz.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="course-header">
                                    <span className={`badge ${status.className}`}>{status.text}</span>
                                    <div className="flex gap-1">
                                        <button className="btn btn-ghost btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/faculty/quizzes/${quiz.id}/edit`); }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn btn-ghost btn-icon text-danger" onClick={(e) => handleDelete(e, quiz.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3>{quiz.title}</h3>
                                <p className="course-desc">{quiz.description || 'No description'}</p>
                                <p className="course-faculty" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <ClipboardList size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    {quiz.course_name}
                                </p>

                                <div className="course-stats-row">
                                    <span><Clock size={14} /> {quiz.duration_minutes} min</span>
                                    <span><Eye size={14} /> {quiz.question_count} questions</span>
                                    <span><Users size={14} /> {quiz.attempt_count} attempts</span>
                                </div>

                                <div className="flex gap-1 mt-2" style={{ marginTop: '0.75rem' }}>
                                    <button
                                        onClick={(e) => togglePublish(e, quiz)}
                                        className={`btn btn-sm ${quiz.is_published ? 'btn-secondary' : 'btn-primary'}`}
                                        style={{ flex: 1 }}
                                    >
                                        {quiz.is_published ? (
                                            <><ArchiveRestore size={14} /> Unpublish</>
                                        ) : (
                                            <><TrendingUp size={14} /> Publish</>
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => toggleArchive(e, quiz.id)}
                                        className="btn btn-ghost btn-icon"
                                        title={quiz.is_archived ? "Restore" : "Archive"}
                                    >
                                        {quiz.is_archived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <ClipboardList size={48} />
                            <p>No quizzes found</p>
                            <Link to="/faculty/quizzes/create" className="btn btn-primary mt-2">
                                Create First Quiz
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageQuizzes;
