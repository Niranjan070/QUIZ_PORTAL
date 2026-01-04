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
                        <GraduationCap size={48} />
                        <h1>QuizPortal</h1>
                    </div>
                    <h2>Join Our Learning Community</h2>
                    <p>Create an account to start taking quizzes, track your progress,
                        and enhance your learning experience.</p>

                    <div className="auth-features">
                        <div className="feature-item">
                            <div className="feature-icon">🎓</div>
                            <span>Access Multiple Courses</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏆</div>
                            <span>Earn Certificates</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📈</div>
                            <span>Track Your Progress</span>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h3>Create Account</h3>
                            <p>Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={20} className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    name="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={20} className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-input"
                                            placeholder="Create password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={20} className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            className="form-input"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <label className="checkbox-label">
                                <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                                <span>Show passwords</span>
                            </label>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Create Account'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login">Sign In</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
