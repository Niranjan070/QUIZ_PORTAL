import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import '../student/Dashboard.css';
import '../admin/Admin.css';
import './Faculty.css';

const DEPARTMENT_DATA = {
    'Aided': {
        'PG': ['M.A., History', 'M.A., English Literature', 'B.Sc., Mathematics', 'M.Sc., Botany', 'M.Com., Commerce'],
        'UG': ['B.A., History', 'B.A., English', 'B.Sc., Mathematics', 'B.Sc., Physics', 'B.Sc., Chemistry', 'B.Sc., Botany', 'B.Sc., Zoology', 'B.Sc., Nutrition & Dietetics', 'B.Sc., Computer Science', 'B.Com.']
    },
    'Self Financing': {
        'PG': ['M.A., History', 'M.A., English Literature', 'B.Sc., Mathematics', 'M.Sc., Botany', 'M.Com., Commerce', 'M.A., English Literature', 'M.Sc., Mathematics', 'M.Sc., Physics', 'M.Sc., Foods & Nutrition', 'M.C.A., Computer Applications', 'M.Sc., Computer Science', 'M.Com.', 'M.Com., CA', 'M.Com., Corporate Secretaryship', 'M.L.I.Sc.', 'M.A., Tamil', 'M.Sc., Chemistry', 'MSW', 'M.Sc., Zoology'],
        'UG': ['B.A., English Literature', 'B.Sc., Mathematics', 'B.Sc., Physics', 'B.Sc., Biochemistry', 'B.C.A.', 'B.Sc., Computer Science (Additional Section)', 'B.Sc., Information Technology', 'B.Sc., Computer Technology', 'B.Sc., Costume Design & Fashion', 'B.Com., (Additional Section)', 'B.Com., with CA (Additional Section)', 'B.Com., Corporate Secretaryship', 'B.Com., Cooperation', 'B.Com., E-Commerce', 'B.B.A., with CA', 'B.A., Tamil Literature', 'B.Com., Professional Accounting', 'B.Com., Banking and Insurance', 'B.Com., with Accounting and Finance', 'B.Sc., Computer Science with Data Analytics', 'B.Sc., Geography', 'B.Sc., Computer Science with Artificial Intelligence', 'B.Sc., Computer Science with Cyber Security', 'B.Voc Fashion and Boutique Management', 'B.Com., Business Analytics', 'B.Sc., Internet of Things', 'B.Sc., Computer Science with Cognitive Systems']
    }
};

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        durationMinutes: 30,
        maxAttempts: 1,
        startTime: '',
        endTime: '',
        targetStream: '',
        targetLevel: '',
        targetDepartment: '',
        targetYear: '',
        minPercentageRequired: 0,
        maxPercentageRequired: 100,
        passingMarksPercentage: 40,
        shuffleQuestions: false,
        shuffleAnswers: false,
        generateCertificate: false,
        showResults: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [qRes, dRes] = await Promise.all([
                api.get('/faculty/questions'),
                api.get('/faculty/dashboard')
            ]);
            setQuestions(qRes.data.data.questions);
            setCourses(dRes.data.data.courses);
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

    const selectAllQuestions = () => {
        setSelectedQuestions(questions.map(q => q.id));
    };

    const clearSelectedQuestions = () => {
        setSelectedQuestions([]);
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
        <div className="animate-fade-in">
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
                    {/* Left Column: Quiz Details & Targeting */}
                    <div className="flex flex-col gap-4">
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
                                <label className="form-label">Course *</label>
                                <select
                                    className="form-select"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                    ))}
                                </select>
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

                            <div className="grid grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        id="shuffleQuestions"
                                        checked={formData.shuffleQuestions}
                                        onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                                    />
                                    <label htmlFor="shuffleQuestions" className="form-label mb-0">Shuffle Questions</label>
                                </div>
                                <div className="form-group flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        id="shuffleAnswers"
                                        checked={formData.shuffleAnswers}
                                        onChange={(e) => setFormData({ ...formData, shuffleAnswers: e.target.checked })}
                                    />
                                    <label htmlFor="shuffleAnswers" className="form-label mb-0">Shuffle Answers</label>
                                </div>
                            </div>
                            <div className="form-group flex items-center gap-1 mt-2">
                                <input
                                    type="checkbox"
                                    id="generateCertificate"
                                    checked={formData.generateCertificate}
                                    onChange={(e) => setFormData({ ...formData, generateCertificate: e.target.checked })}
                                />
                                <label htmlFor="generateCertificate" className="form-label mb-0 font-bold text-primary">Enable E-Certificate Generation</label>
                            </div>
                            <div className="form-group flex items-center gap-1 mt-2">
                                <input
                                    type="checkbox"
                                    id="showResults"
                                    checked={formData.showResults}
                                    onChange={(e) => setFormData({ ...formData, showResults: e.target.checked })}
                                />
                                <label htmlFor="showResults" className="form-label mb-0 font-bold text-primary">Allow students to see answer key after completion</label>
                            </div>
                        </div>

                        {/* Targeting & Requirements */}
                        <div className="card">
                            <h3 className="card-title mb-2">Targeting & Requirements</h3>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Target Stream</label>
                                    <select
                                        className="form-select"
                                        value={formData.targetStream}
                                        onChange={(e) => setFormData({ ...formData, targetStream: e.target.value, targetDepartment: '' })}
                                    >
                                        <option value="">All Streams</option>
                                        <option value="Aided">Aided</option>
                                        <option value="Self Financing">Self Financing</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Level</label>
                                    <select
                                        className="form-select"
                                        value={formData.targetLevel}
                                        onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value, targetYear: '', targetDepartment: '' })}
                                    >
                                        <option value="">All Levels</option>
                                        <option value="UG">UG</option>
                                        <option value="PG">PG</option>
                                    </select>
                                </div>
                                {formData.targetLevel && (
                                    <div className="form-group">
                                        <label className="form-label">Target Year</label>
                                        <select
                                            className="form-select"
                                            value={formData.targetYear}
                                            onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                                        >
                                            <option value="">All Years</option>
                                            <option value="I Year">I Year</option>
                                            <option value="II Year">II Year</option>
                                            {formData.targetLevel === 'UG' && <option value="III Year">III Year</option>}
                                        </select>
                                    </div>
                                )}
                            </div>


                            <div className="form-group">
                                <label className="form-label">Target Department</label>
                                <select
                                    className="form-select"
                                    value={formData.targetDepartment}
                                    onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                                >
                                    <option value="">All Departments</option>
                                    {formData.targetStream && formData.targetLevel &&
                                        DEPARTMENT_DATA[formData.targetStream][formData.targetLevel].map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))
                                    }
                                </select>
                                {(!formData.targetStream || !formData.targetLevel) && (
                                    <p className="text-muted small mt-1">Select Stream and Level to filter departments</p>
                                )}
                            </div>

                            {/* Score Range Targeting */}
                            <div className="form-group" style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                                <label className="form-label font-bold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🎯</span> Student Score Range Filter
                                </label>
                                <p className="text-muted small mb-2">Restrict this quiz to students who scored within a specific average score range in this course. Leave at 0–100 to allow all students.</p>
                                <div className="grid grid-2" style={{ gap: '1rem' }}>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Min. Avg Score (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={formData.minPercentageRequired}
                                            onChange={(e) => setFormData({ ...formData, minPercentageRequired: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-muted small mt-1">Students must score ≥ this</p>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label">Max. Avg Score (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="100"
                                            value={formData.maxPercentageRequired}
                                            onChange={(e) => setFormData({ ...formData, maxPercentageRequired: parseInt(e.target.value) || 100 })}
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-muted small mt-1">Students must score ≤ this</p>
                                    </div>
                                </div>
                                {(formData.minPercentageRequired > 0 || formData.maxPercentageRequired < 100) && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                        ✅ Only students with avg score between <strong>{formData.minPercentageRequired}%</strong> and <strong>{formData.maxPercentageRequired}%</strong> can take this quiz
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Passing Marks (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="40"
                                        value={formData.passingMarksPercentage}
                                        onChange={(e) => setFormData({ ...formData, passingMarksPercentage: parseInt(e.target.value) })}
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-muted small mt-1">Required to pass this quiz</p>
                                </div>
                            </div>

                            <div className="quiz-summary mt-4">
                                <div className="flex justify-between mb-1">
                                    <span>Selected Questions:</span>
                                    <span className="font-bold">{selectedQuestions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Marks:</span>
                                    <span className="font-bold">{totalMarks}</span>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full mt-4">
                                <Plus size={20} /> Create Quiz
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Question Selection */}
                    <div className="card" style={{ maxHeight: '850px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="card-title mb-0">Select Questions</h3>
                            <div className="flex gap-1">
                                <button type="button" className="btn btn-ghost btn-sm" onClick={selectAllQuestions}>
                                    Select All
                                </button>
                                <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={clearSelectedQuestions}>
                                    Clear
                                </button>
                            </div>
                        </div>

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
                                                <span className="text-muted truncate ml-auto">{q.course_name}</span>
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
            </form >

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
        </div >
    );
};

export default CreateQuiz;
