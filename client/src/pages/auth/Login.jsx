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
                        <GraduationCap size={42} />
                        <span>QuizPortal</span>
                    </div>
                    <h2>Unlock Your <br />Learning Potential</h2>
                    <p>Experience the next generation of online assessments.
                        Interactive, secure, and designed for success.</p>

                    <div className="auth-features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <GraduationCap size={18} />
                            </div>
                            <span>Smart Assessment Engine</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Mail size={18} />
                            </div>
                            <span>Instant Feedback System</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Lock size={18} />
                            </div>
                            <span>Secure & Reliable Platform</span>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-header">
                        <h3>Welcome Back</h3>
                        <p>Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?
                        <Link to="/register" className="auth-link">Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
