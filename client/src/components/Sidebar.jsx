import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, BookOpen, FileQuestion, ClipboardList,
    Users, Settings, LogOut, GraduationCap, BarChart3, Bell
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentLinks = [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/quizzes', icon: ClipboardList, label: 'My Quizzes' },
        { to: '/student/results', icon: BarChart3, label: 'Results' },
    ];

    const facultyLinks = [
        { to: '/faculty', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/faculty/questions', icon: FileQuestion, label: 'Question Bank' },
        { to: '/faculty/quizzes', icon: ClipboardList, label: 'Manage Quizzes' },
    ];

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    ];

    const links = role === 'admin' ? adminLinks : role === 'faculty' ? facultyLinks : studentLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <GraduationCap size={32} className="logo-icon" />
                    <span className="logo-text">QuizPortal</span>
                </div>
            </div>

            <div className="user-info">
                <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === `/${role}`}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <link.icon size={20} />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
