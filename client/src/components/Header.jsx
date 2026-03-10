import { useAuth } from '../context/AuthContext';
import { Search, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="top-header">
            <div className="header-search">
                {/* Search can be added here if needed, or just left empty */}
            </div>

            <div className="header-actions">
                <NotificationDropdown />

                <ThemeToggle />

                <div className="header-divider"></div>

                <div className="header-user">
                    <div className="user-details-top">
                        <span className="user-name-top">{user?.name}</span>
                        <span className="user-role-top">
                            {user?.role === 'faculty'
                                ? `${user?.designation || 'Faculty'}${user?.department ? ` | ${user.department}` : ''}`
                                : user?.role === 'student'
                                    ? [user?.department, user?.funding_type, user?.level, user?.year].filter(Boolean).join(' • ') || 'Student'
                                    : user?.role}
                        </span>
                    </div>
                    <div className="user-avatar-top">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
