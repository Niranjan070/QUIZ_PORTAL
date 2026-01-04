import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Faculty.css';

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [filters, setFilters] = useState({ type: '', difficulty: '' });
    const [formData, setFormData] = useState({
        courseId: '', questionText: '', questionType: 'mcq',
        difficulty: 'medium', marks: 1, answers: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        fetchQuestions();
    }, [filters]);

    const fetchQuestions = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);

            const response = await api.get(`/faculty/questions?${params}`);
            setQuestions(response.data.data.questions);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            courseId: '', questionText: '', questionType: 'mcq',
            difficulty: 'medium', marks: 1, answers: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
        setEditingQuestion(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingQuestion) {
                await api.put(`/faculty/questions/${editingQuestion.id}`, formData);
                toast.success('Question updated!');
            } else {
                await api.post('/faculty/questions', formData);
                toast.success('Question created!');
            }
            setShowModal(false);
            resetForm();
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to save question');
        }
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            courseId: question.course_id,
            questionText: question.question_text,
            questionType: question.question_type,
            difficulty: question.difficulty,
            marks: question.marks,
            answers: question.answers?.length > 0 ? question.answers.map(a => ({
                text: a.answer_text, isCorrect: a.is_correct
            })) : [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/faculty/questions/${id}`);
            toast.success('Question deleted!');
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...formData.answers];
        if (field === 'isCorrect') {
            // For MCQ, only one can be correct
            if (formData.questionType === 'mcq') {
                newAnswers.forEach((a, i) => a.isCorrect = i === index);
            } else {
                newAnswers[index].isCorrect = value;
            }
        } else {
            newAnswers[index][field] = value;
        }
        setFormData({ ...formData, answers: newAnswers });
    };

    return (
        <div className="page-container">
            <Sidebar role="faculty" />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Question Bank</h1>
                        <p className="page-subtitle">Manage your assessment questions</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={20} /> Add Question
                    </button>
                </div>

                {/* Filters */}
                <div className="filter-bar mb-3">
                    <select
                        className="form-select"
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        style={{ width: 'auto' }}
                    >
                        <option value="">All Types</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                    </select>

                    <select
                        className="form-select"
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                        style={{ width: 'auto' }}
                    >
                        <option value="">All Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <div className="card">
                        {questions.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Question</th>
                                            <th>Type</th>
                                            <th>Difficulty</th>
                                            <th>Marks</th>
                                            <th>Course</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map((q) => (
                                            <tr key={q.id}>
                                                <td style={{ maxWidth: '400px' }}>
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {q.question_text}
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-primary">{q.question_type}</span></td>
                                                <td>
                                                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' :
                                                            q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'
                                                        }`}>{q.difficulty}</span>
                                                </td>
                                                <td>{q.marks}</td>
                                                <td>{q.course_name}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(q)}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(q.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No questions found. Create your first question!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    <div className="form-group">
                                        <label className="form-label">Course ID</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.courseId}
                                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Question Text</label>
                                        <textarea
                                            className="form-textarea"
                                            value={formData.questionText}
                                            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-3" style={{ gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={formData.questionType}
                                                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                                            >
                                                <option value="mcq">MCQ</option>
                                                <option value="true_false">True/False</option>
                                                <option value="short_answer">Short Answer</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Difficulty</label>
                                            <select
                                                className="form-select"
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Marks</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.marks}
                                                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    {(formData.questionType === 'mcq' || formData.questionType === 'true_false') && (
                                        <div className="form-group">
                                            <label className="form-label">Answer Options</label>
                                            {formData.answers.map((answer, idx) => (
                                                <div key={idx} className="flex gap-1 mb-1" style={{ alignItems: 'center' }}>
                                                    <input
                                                        type={formData.questionType === 'mcq' ? 'radio' : 'checkbox'}
                                                        name="correctAnswer"
                                                        checked={answer.isCorrect}
                                                        onChange={() => updateAnswer(idx, 'isCorrect', !answer.isCorrect)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder={`Option ${idx + 1}`}
                                                        value={answer.text}
                                                        onChange={(e) => updateAnswer(idx, 'text', e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingQuestion ? 'Update' : 'Create'} Question
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuestionBank;
