import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, HelpCircle } from 'lucide-react';
import './Dashboard.css';

const ResultDetails = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            const response = await api.get(`/student/attempts/${attemptId}/result`);
            setResultData(response.data.data);
        } catch (error) {
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!resultData) return <div className="error-container">Result not found</div>;

    const { attempt, showDetailedResults, detailedAnswers } = resultData;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">Quiz Result</h1>
                        <p className="page-subtitle">{attempt.quizTitle} - {attempt.courseName}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-3 mb-3">
                <div className="stat-card">
                    <div className="stat-label">Score</div>
                    <div className="stat-value">{attempt.score} / {attempt.totalMarks}</div>
                    <div className="stat-label mt-1">{attempt.percentage}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Time Spent</div>
                    <div className="stat-value flex items-center gap-1">
                        <Clock size={20} />
                        {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Status</div>
                    <div className={`stat-value ${attempt.percentage >= 40 ? 'text-success' : 'text-danger'}`}>
                        {attempt.percentage >= 40 ? 'Passed' : 'Failed'}
                    </div>
                </div>
            </div>

            {!showDetailedResults ? (
                <div className="card text-center py-4">
                    <HelpCircle size={48} className="text-muted mb-2 mx-auto" />
                    <h3>Answer Key Hidden</h3>
                    <p className="text-muted">The faculty has disabled viewing the answer key for this quiz.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <h2 className="section-title">Detailed Review</h2>
                    {detailedAnswers.map((answer, index) => (
                        <div key={answer.id} className={`card ${answer.is_correct ? 'border-success' : 'border-danger'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold">Question {index + 1}</span>
                                <span className={`badge ${answer.is_correct ? 'badge-success' : 'badge-danger'}`}>
                                    {answer.is_correct ? 'Correct' : 'Incorrect'} ({answer.marks_obtained} marks)
                                </span>
                            </div>
                            <p className="mb-2">{answer.question_text}</p>

                            <div className="grid grid-2 gap-2 mt-2">
                                <div className="p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                                    <span className="text-muted small">Your Answer:</span>
                                    <p className={answer.is_correct ? 'text-success' : 'text-danger'}>
                                        {answer.selected_answer || (answer.text_answer ? answer.text_answer : '(Not answered)')}
                                    </p>
                                </div>
                                <div className="p-2 border rounded" style={{ background: 'var(--bg-secondary)' }}>
                                    <span className="text-muted small">Correct Answer:</span>
                                    <p className="text-success font-bold">{answer.correct_answer}</p>
                                </div>
                            </div>

                            {answer.explanation && (
                                <div className="mt-2 p-2 rounded" style={{ borderLeft: '4px solid var(--primary-500)', background: 'rgba(99, 102, 241, 0.05)' }}>
                                    <span className="text-muted small font-bold">Explanation:</span>
                                    <p className="small">{answer.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultDetails;
