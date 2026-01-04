import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, getDashboardPath } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            const dashboardPath = user.role === 'admin' ? '/admin' :
                user.role === 'faculty' ? '/faculty' : '/student';
            navigate(dashboardPath);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <GraduationCap size={48} />
                        <h1>QuizPortal</h1>
                    </div>
                    <h2>Welcome to the Future of Learning</h2>
                    <p>Experience seamless online assessments with our modern quiz platform.
                        Create, manage, and take quizzes with ease.</p>

                    <div className="auth-features">
                        <div className="feature-item">
                            <div className="feature-icon">📝</div>
                            <span>Create Interactive Quizzes</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <span>Track Performance Analytics</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⏱️</div>
                            <span>Timed Assessments</span>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h3>Sign In</h3>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={20} className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                        </div>

                        <div className="demo-credentials">
                            <p><strong>Demo Accounts:</strong></p>
                            <small>Admin: admin@quizportal.com</small><br />
                            <small>Faculty: john.smith@college.edu</small><br />
                            <small>Student: nikitha@student.edu</small><br />
                            <small>Password: password123</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
