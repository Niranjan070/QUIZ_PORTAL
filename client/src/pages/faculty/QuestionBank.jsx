import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Filter, X, Upload, Download, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({ type: '', difficulty: '', courseId: '' });
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
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [filters]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/faculty/dashboard');
            setCourses(response.data.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.courseId) params.append('courseId', filters.courseId);

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
                toast.success('Question updated');
            } else {
                await api.post('/faculty/questions', formData);
                toast.success('Question created');
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
            toast.success('Question deleted');
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const handleBulkImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    toast.error('CSV file is empty or has no data rows');
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim());
                const questionsImport = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const q = {};
                    headers.forEach((h, i) => q[h] = values[i]);

                    if (q.question_type === 'mcq') {
                        const options = (q.options || '').split('|');
                        const correctIndices = (q.correct_indices || '0').split('|').map(Number);
                        q.answers = options.map((opt, idx) => ({
                            text: opt,
                            isCorrect: correctIndices.includes(idx)
                        }));
                    } else if (q.question_type === 'true_false') {
                        q.answers = [
                            { text: 'True', isCorrect: q.correct_answer.toLowerCase() === 'true' },
                            { text: 'False', isCorrect: q.correct_answer.toLowerCase() === 'false' }
                        ];
                    } else if (q.question_type === 'short_answer') {
                        q.answers = [{ text: q.correct_answer, isCorrect: true }];
                    }
                    return q;
                });

                const loadingToast = toast.loading('Importing questions...');
                const response = await api.post('/faculty/questions/bulk', { questions: questionsImport });
                toast.dismiss(loadingToast);

                if (response.data.success) {
                    toast.success('Questions imported successfully');
                    fetchQuestions();
                }
            } catch (err) {
                toast.error('Import failed');
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...formData.answers];
        if (field === 'isCorrect') {
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

    const downloadTemplate = () => {
        const headers = ['courseId', 'questionText', 'questionType', 'difficulty', 'marks', 'options', 'correct_indices', 'correct_answer'];
        const rows = [
            ['1', 'What is React?', 'mcq', 'easy', '1', 'A Library|A Framework', '0', ''],
            ['1', 'React uses Virtual DOM', 'true_false', 'easy', '1', '', '', 'True'],
            ['1', 'What hook is used for state?', 'short_answer', 'medium', '2', '', '', 'useState']
        ];
        const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'question_template.csv';
        a.click();
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Question Bank</h1>
                    <p className="page-subtitle">Manage your questions across all courses</p>
                </div>
                <div className="flex gap-1">
                    <button className="btn btn-ghost" onClick={downloadTemplate}>
                        <Download size={18} /> Template
                    </button>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={18} /> Bulk Import
                        <input type="file" hidden accept=".csv" onChange={handleBulkImport} />
                    </label>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={20} /> Add Question
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-3">
                <select
                    className="form-select"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">All Types</option>
                    <option value="mcq">MCQ</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                </select>

                <select
                    className="form-select"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                    <option value="">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                <select
                    className="form-select"
                    value={filters.courseId}
                    onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>

                <div className="ml-auto text-sm text-muted">
                    {questions.length} questions found
                </div>
            </div>

            {/* Questions Table */}
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
                                        <th>Course</th>
                                        <th>Type</th>
                                        <th>Difficulty</th>
                                        <th>Marks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((q) => (
                                        <tr key={q.id}>
                                            <td>
                                                <div style={{ maxWidth: '400px' }}>
                                                    <div className="font-medium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {q.question_text}
                                                    </div>
                                                    {q.answers && q.answers.length > 0 && (
                                                        <div className="text-muted small mt-1">
                                                            {q.answers.map((a, i) => (
                                                                <span key={i} style={{ marginRight: '8px' }}>
                                                                    <span className={a.is_correct ? 'text-success font-bold' : ''}>
                                                                        {String.fromCharCode(65 + i)}) {a.answer_text}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{q.course_name}</td>
                                            <td>
                                                <span className="badge badge-primary">{q.question_type}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' :
                                                    q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'
                                                    }`}>{q.difficulty}</span>
                                            </td>
                                            <td>{q.marks}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(q)} title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon text-danger" onClick={() => handleDelete(q.id)} title="Delete">
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
                            <FileQuestion size={48} />
                            <p>No questions found. Create your first question!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-2" style={{ gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Course</label>
                                        <select
                                            className="form-select"
                                            value={formData.courseId}
                                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Question Type</label>
                                        <select
                                            className="form-select"
                                            value={formData.questionType}
                                            onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                                        >
                                            <option value="mcq">Multiple Choice</option>
                                            <option value="true_false">True/False</option>
                                            <option value="short_answer">Short Answer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Question Text</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        value={formData.questionText}
                                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                        required
                                        placeholder="Enter question..."
                                    />
                                </div>

                                <div className="grid grid-2" style={{ gap: '1rem' }}>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {formData.answers.map((answer, idx) => (
                                                <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${answer.isCorrect ? 'border-success bg-success/5' : 'border-transparent bg-tertiary'}`}>
                                                    <input
                                                        type={formData.questionType === 'mcq' ? 'radio' : 'checkbox'}
                                                        name="correctAnswer"
                                                        checked={answer.isCorrect}
                                                        onChange={() => updateAnswer(idx, 'isCorrect', !answer.isCorrect)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                        value={answer.text}
                                                        onChange={(e) => updateAnswer(idx, 'text', e.target.value)}
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingQuestion ? 'Update' : 'Create'} Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
