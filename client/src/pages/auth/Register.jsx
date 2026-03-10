import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword, role } = formData;

        if (!name || !email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!email.toLowerCase().endsWith('@vcw.ac.in')) {
            toast.error('Please use your college email ID (@vcw.ac.in)');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const user = await register(name, email, password, role);
            toast.success('Registration successful!');

            const dashboardPath = user.role === 'faculty' ? '/faculty' : '/student';
            navigate(dashboardPath);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
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
                    <h2>Join Our <br />Learning Community</h2>
                    <p>Create an account to start taking quizzes, track your progress,
                        and enhance your learning experience.</p>

                    <div className="auth-features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <GraduationCap size={18} />
                            </div>
                            <span>Access Multiple Courses</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <User size={18} />
                            </div>
                            <span>Personalized Profile</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">
                                <Eye size={18} />
                            </div>
                            <span>Track Your Progress</span>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-header">
                        <h3>Create Account</h3>
                        <p>Fill in your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="your@vcw.ac.in"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <div className="input-wrapper">
                                <GraduationCap size={20} className="input-icon" />
                                <select
                                    name="role"
                                    className="form-input"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
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

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?
                        <Link to="/login" className="auth-link">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
