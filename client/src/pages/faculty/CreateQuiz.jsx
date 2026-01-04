import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import './Faculty.css';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        durationMinutes: 30,
        maxAttempts: 1,
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/faculty/questions');
            setQuestions(response.data.data.questions);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleQuestion = (questionId) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.courseId || !formData.startTime || !formData.endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (selectedQuestions.length === 0) {
            toast.error('Please select at least one question');
            return;
        }

        try {
            await api.post('/faculty/quizzes', {
                ...formData,
                questionIds: selectedQuestions
            });
            toast.success('Quiz created successfully!');
            navigate('/faculty/quizzes');
        } catch (error) {
            toast.error('Failed to create quiz');
        }
    };

    const totalMarks = questions
        .filter(q => selectedQuestions.includes(q.id))
        .reduce((sum, q) => sum + q.marks, 0);

    return (
        <div className="page-container">
            <Sidebar role="faculty" />

            <main className="main-content">
                <div className="page-header">
                    <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="page-title">Create Quiz</h1>
                            <p className="page-subtitle">Set up a new quiz for your students</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                        {/* Quiz Details */}
                        <div className="card">
                            <h3 className="card-title mb-2">Quiz Details</h3>

                            <div className="form-group">
                                <label className="form-label">Quiz Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter quiz title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Enter quiz description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Course ID *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Enter course ID"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Attempts</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.maxAttempts}
                                        onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        className="form-input"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="quiz-summary">
                                <p><strong>Selected Questions:</strong> {selectedQuestions.length}</p>
                                <p><strong>Total Marks:</strong> {totalMarks}</p>
                            </div>

                            <button type="submit" className="btn btn-primary w-full mt-2">
                                <Plus size={20} /> Create Quiz
                            </button>
                        </div>

                        {/* Question Selection */}
                        <div className="card" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                            <h3 className="card-title mb-2">Select Questions</h3>

                            {questions.length > 0 ? (
                                <div className="question-selection-list">
                                    {questions.map((q) => (
                                        <div
                                            key={q.id}
                                            className={`question-select-item ${selectedQuestions.includes(q.id) ? 'selected' : ''}`}
                                            onClick={() => toggleQuestion(q.id)}
                                        >
                                            <div className="question-checkbox">
                                                {selectedQuestions.includes(q.id) && <Check size={16} />}
                                            </div>
                                            <div className="question-content">
                                                <p className="question-text-preview">{q.question_text}</p>
                                                <div className="question-meta">
                                                    <span className={`badge badge-sm ${q.difficulty === 'easy' ? 'badge-success' :
                                                            q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'
                                                        }`}>{q.difficulty}</span>
                                                    <span className="badge badge-sm badge-primary">{q.question_type}</span>
                                                    <span>{q.marks} marks</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state small">
                                    <p>No questions available. Create questions first!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </main>

            <style>{`
        .quiz-summary {
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          margin-top: 1rem;
        }
        .quiz-summary p {
          margin-bottom: 0.25rem;
        }
        .question-selection-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .question-select-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .question-select-item:hover {
          background: rgba(99, 102, 241, 0.1);
        }
        .question-select-item.selected {
          border-color: var(--primary-500);
          background: rgba(99, 102, 241, 0.1);
        }
        .question-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--neutral-500);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .question-select-item.selected .question-checkbox {
          background: var(--primary-500);
          border-color: var(--primary-500);
          color: white;
        }
        .question-content {
          flex: 1;
          min-width: 0;
        }
        .question-text-preview {
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .question-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .badge-sm {
          padding: 0.125rem 0.5rem;
          font-size: 0.65rem;
        }
      `}</style>
        </div>
    );
};

export default CreateQuiz;
