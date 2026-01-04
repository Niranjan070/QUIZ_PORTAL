import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Flag, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import './TakeQuiz.css';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        startQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const startQuiz = async () => {
        try {
            const response = await api.post(`/student/quizzes/${id}/start`);
            const data = response.data.data;
            setQuizData(data);
            setTimeLeft(data.remainingSeconds);

            // Load saved answers
            const savedAnswers = {};
            const savedFlagged = {};
            data.questions.forEach(q => {
                if (q.savedAnswer) {
                    if (q.savedAnswer.selected_answer_id) {
                        savedAnswers[q.id] = q.savedAnswer.selected_answer_id;
                    }
                    if (q.savedAnswer.text_answer) {
                        savedAnswers[q.id] = q.savedAnswer.text_answer;
                    }
                    if (q.savedAnswer.is_flagged) {
                        savedFlagged[q.id] = true;
                    }
                }
            });
            setAnswers(savedAnswers);
            setFlagged(savedFlagged);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start quiz');
            navigate('/student/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const saveAnswer = async (questionId, answerId, textAnswer = null) => {
        try {
            await api.post(`/student/attempts/${quizData.attemptId}/answer`, {
                questionId,
                answerId: answerId || null,
                textAnswer: textAnswer || null,
                isFlagged: flagged[questionId] || false
            });
        } catch (error) {
            console.error('Error saving answer:', error);
        }
    };

    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
        saveAnswer(questionId, answerId);
    };

    const handleTextAnswer = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };

    const handleTextBlur = (questionId) => {
        saveAnswer(questionId, null, answers[questionId]);
    };

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const newFlagged = { ...prev, [questionId]: !prev[questionId] };
            saveAnswer(questionId, answers[questionId], null);
            return newFlagged;
        });
    };

    const handleSubmit = async (timedOut = false) => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const response = await api.post(`/student/attempts/${quizData.attemptId}/submit`);
            const result = response.data.data;

            toast.success(timedOut ? 'Time up! Quiz auto-submitted.' : 'Quiz submitted successfully!');

            // Navigate to results
            navigate('/student/results', {
                state: {
                    justCompleted: true,
                    score: result.score,
                    total: result.totalMarks,
                    percentage: result.percentage
                }
            });
        } catch (error) {
            toast.error('Failed to submit quiz');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="quiz-loading">
                <div className="spinner"></div>
                <p>Loading quiz...</p>
            </div>
        );
    }

    const { quiz, questions } = quizData;
    const question = questions[currentQuestion];
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
    const isLowTime = timeLeft <= 60;

    return (
        <div className="take-quiz-page">
            {/* Header */}
            <header className="quiz-header">
                <div className="quiz-title-section">
                    <h1>{quiz.title}</h1>
                    <span className="quiz-course-badge">{quiz.course_name}</span>
                </div>

                <div className={`quiz-timer ${isLowTime ? 'warning' : ''}`}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="quiz-content">
                {/* Question Navigator */}
                <aside className="question-navigator">
                    <h3>Questions</h3>
                    <div className="question-grid">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                className={`question-num ${currentQuestion === index ? 'current' : ''} 
                           ${answers[q.id] ? 'answered' : ''} 
                           ${flagged[q.id] ? 'flagged' : ''}`}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                {index + 1}
                                {flagged[q.id] && <Flag size={10} className="flag-icon" />}
                            </button>
                        ))}
                    </div>

                    <div className="navigator-legend">
                        <div className="legend-item"><span className="dot current"></span> Current</div>
                        <div className="legend-item"><span className="dot answered"></span> Answered</div>
                        <div className="legend-item"><span className="dot flagged"></span> Flagged</div>
                        <div className="legend-item"><span className="dot"></span> Not Answered</div>
                    </div>

                    <div className="progress-info">
                        <span>{answeredCount} of {questions.length} answered</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
                        </div>
                    </div>
                </aside>

                {/* Question Panel */}
                <main className="question-panel">
                    <div className="question-header">
                        <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
                        <button
                            className={`flag-btn ${flagged[question.id] ? 'active' : ''}`}
                            onClick={() => toggleFlag(question.id)}
                        >
                            <Flag size={18} />
                            {flagged[question.id] ? 'Flagged' : 'Flag for Review'}
                        </button>
                    </div>

                    <div className="question-content">
                        <p className="question-text">{question.question_text}</p>

                        {question.image_url && (
                            <img src={question.image_url} alt="Question" className="question-image" />
                        )}

                        <div className="answers-section">
                            {question.question_type === 'mcq' || question.question_type === 'true_false' ? (
                                <div className="options-list">
                                    {question.answers.map((answer, idx) => (
                                        <label
                                            key={answer.id}
                                            className={`option-item ${answers[question.id] === answer.id ? 'selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                checked={answers[question.id] === answer.id}
                                                onChange={() => handleAnswerSelect(question.id, answer.id)}
                                            />
                                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                            <span className="option-text">{answer.answer_text}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="form-textarea"
                                    placeholder="Type your answer here..."
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                                    onBlur={() => handleTextBlur(question.id)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="question-navigation">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {currentQuestion < questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={() => setShowConfirm(true)}
                            >
                                <Send size={20} /> Submit Quiz
                            </button>
                        )}
                    </div>
                </main>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <AlertTriangle size={24} className="text-warning" />
                            <h3>Submit Quiz?</h3>
                        </div>
                        <div className="modal-body">
                            <p>You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.</p>
                            {answeredCount < questions.length && (
                                <p className="text-warning">⚠️ You have {questions.length - answeredCount} unanswered questions!</p>
                            )}
                            <p>Are you sure you want to submit?</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                                Continue Quiz
                            </button>
                            <button className="btn btn-success" onClick={() => handleSubmit(false)} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeQuiz;
