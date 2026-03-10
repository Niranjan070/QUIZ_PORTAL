import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Flag, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle2, ArrowRight, BarChart3, Bell } from 'lucide-react';
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
    const [submitted, setSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const warningsShown = useRef({ fiveMin: false, oneMin: false });

    useEffect(() => {
        startQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        // Fire one-shot warning alerts
        if (timeLeft <= 300 && !warningsShown.current.fiveMin) {
            warningsShown.current.fiveMin = true;
            toast('⚠️ Only 5 minutes remaining!', {
                duration: 6000,
                icon: '⚠️',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)'
                }
            });
        }

        if (timeLeft <= 60 && !warningsShown.current.oneMin) {
            warningsShown.current.oneMin = true;
            toast('🚨 Only 1 minute remaining! Submit now!', {
                duration: 8000,
                icon: '🚨',
                style: {
                    background: '#991b1b',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    boxShadow: '0 0 30px rgba(153, 27, 27, 0.8)',
                    border: '2px solid #fff'
                }
            });
        }

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

            if (timedOut) {
                toast('⏰ Time up! Your quiz has been auto-submitted.', { icon: '⏰' });
            }

            // Show the confirmation screen
            setSubmissionResult(result);
            setSubmitted(true);
            setShowConfirm(false);
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

    // Show submission confirmation screen
    if (submitted && submissionResult) {
        const isPassed = submissionResult.percentage >= 40;
        return (
            <div className="take-quiz-page">
                <div className="submission-confirmation">
                    <div className="submission-icon-wrapper">
                        <CheckCircle2 size={64} className="submission-check-icon" />
                    </div>
                    <h1 className="submission-title">Your Quiz Has Been Recorded Successfully!</h1>
                    <p className="submission-subtitle">Thank you for completing the quiz. Your responses have been saved.</p>

                    <div className="submission-score-card">
                        <div className="submission-score-item">
                            <span className="submission-score-label">Score</span>
                            <span className="submission-score-value">{submissionResult.score} / {submissionResult.totalMarks}</span>
                        </div>
                        <div className="submission-divider"></div>
                        <div className="submission-score-item">
                            <span className="submission-score-label">Percentage</span>
                            <span className={`submission-score-value ${isPassed ? 'score-pass' : 'score-fail'}`}>
                                {submissionResult.percentage}%
                            </span>
                        </div>
                        <div className="submission-divider"></div>
                        <div className="submission-score-item">
                            <span className="submission-score-label">Status</span>
                            <span className={`submission-status-badge ${isPassed ? 'passed' : 'failed'}`}>
                                {isPassed ? '✅ Passed' : '❌ Failed'}
                            </span>
                        </div>
                    </div>

                    {submissionResult.showResults ? (
                        <p className="submission-answer-key-note">
                            📝 The answer key is available for this quiz. You can review your answers in the results page.
                        </p>
                    ) : (
                        <p className="submission-answer-key-note muted">
                            🔒 The answer key is not available for this quiz.
                        </p>
                    )}

                    <div className="submission-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/student/results', {
                                state: {
                                    justCompleted: true,
                                    score: submissionResult.score,
                                    total: submissionResult.totalMarks,
                                    percentage: submissionResult.percentage
                                }
                            })}
                        >
                            <BarChart3 size={20} /> View Results
                        </button>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => navigate('/student/quizzes')}
                        >
                            Back to Quizzes <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { quiz, questions } = quizData;
    const question = questions[currentQuestion];
    const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
    const isLowTime = timeLeft <= 300 && timeLeft > 60;    // 5 min warning zone
    const isVeryLowTime = timeLeft <= 60;                   // 1 min critical zone

    return (
        <div className="take-quiz-page">
            {/* Header */}
            <header className="quiz-header">
                <div className="quiz-title-section">
                    <h1>{quiz.title}</h1>
                    <span className="quiz-course-badge">{quiz.course_name}</span>
                </div>

                <div className={`quiz-timer ${isVeryLowTime ? 'critical' : isLowTime ? 'warning' : ''}`}>
                    <Clock size={20} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </header>

            {/* Time Warning Banner */}
            {isVeryLowTime && (
                <div className="time-warning-banner critical-banner">
                    <Bell size={18} className="banner-bell" />
                    <strong>🚨 Less than 1 minute remaining!</strong> Submit your quiz immediately!
                </div>
            )}
            {isLowTime && !isVeryLowTime && (
                <div className="time-warning-banner warning-banner">
                    <Bell size={18} />
                    <strong>⚠️ Only {Math.ceil(timeLeft / 60)} minutes remaining.</strong> Please review and submit soon.
                </div>
            )}

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
