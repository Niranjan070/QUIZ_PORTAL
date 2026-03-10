import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className="theme-toggle-track">
                <div className={`theme-toggle-thumb ${isDarkMode ? 'dark' : 'light'}`}>
                    {isDarkMode ? (
                        <Moon size={16} className="theme-icon" />
                    ) : (
                        <Sun size={16} className="theme-icon" />
                    )}
                </div>
            </div>
            <span className="theme-toggle-label">
                {isDarkMode ? 'Dark' : 'Light'}
            </span>
        </button>
    );
};

export default ThemeToggle;
