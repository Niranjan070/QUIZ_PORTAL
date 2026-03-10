import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Download, ArrowLeft, Printer, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import './Certificate.css';

const Certificate = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const certificateRef = useRef();

    useEffect(() => {
        fetchCertData();
    }, [attemptId]);

    const fetchCertData = async () => {
        try {
            const response = await api.get(`/student/attempts/${attemptId}/certificate`);
            setCertData(response.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Certificate not available');
            navigate('/student/results');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!certData) return null;

    return (
        <div className="certificate-page animate-fade-in">
            {/* Control Panel (Hidden on Print) */}
            <div className="no-print mb-3 flex justify-between items-center w-full max-w-[1000px]">
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back to Results
                </button>
                <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={handlePrint}>
                        <Printer size={18} /> Print Certificate
                    </button>
                </div>
            </div>

            {/* Certificate Landscape Container */}
            <div className="certificate-container" ref={certificateRef}>
                {/* Visual Decorations */}
                <div className="certificate-decoration">
                    <div className="stripe-red-large"></div>
                    <div className="stripe-gold-thin"></div>
                    <div className="stripe-red-thin"></div>
                </div>

                {/* Content Area */}
                <div className="certificate-content">
                    <div className="college-branding">
                        <img src="/college_logo.png" alt="College Logo" className="college-logo-small" />
                        <h3 className="college-name-top">Vellalar College for Women (Autonomous)</h3>
                    </div>
                    
                    <div className="cert-title-wrapper">
                        <h1 className="cert-title">CERTIFICATE</h1>
                        <div className="cert-subtitle">OF ACHIEVEMENT</div>
                    </div>

                    <p className="cert-presentation">This certificate is proudly presented to</p>
                    
                    <h2 className="student-name-script">{certData.studentName}</h2>

                    {certData.rank <= 3 && (
                        <div className="student-rank-badge">
                            <Award size={24} className="rank-icon" />
                            <span>
                                {certData.rank === 1 ? '1st Place' : 
                                 certData.rank === 2 ? '2nd Place' : 
                                 '3rd Place'}
                            </span>
                        </div>
                    )}

                    <p className="cert-body-text">
                        For successfully completing the quiz <strong>"{certData.quizTitle}"</strong> 
                        in the course <strong>{certData.courseName}</strong> with an outstanding performance, 
                        achieving a score of <strong>{certData.score}/{certData.totalMarks}</strong> 
                        and a grade percentage of <strong>{certData.percentage}%</strong>.
                    </p>

                    {/* Footer Signatures */}
                    <div className="certificate-footer-new">
                        <div className="signature-block">
                            <div className="signature-line-new"></div>
                            <span className="signature-label">Principal</span>
                        </div>
                        
                        <div className="signature-block">
                            <div className="date-text">{new Date(certData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            <div className="signature-line-new"></div>
                            <span className="signature-label">Date Issued</span>
                        </div>

                        <div className="signature-block">
                            <div className="signature-line-new"></div>
                            <span className="signature-label">Head of the Department</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
