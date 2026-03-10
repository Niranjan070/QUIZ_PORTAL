import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false; // Default to light mode
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        if (isDarkMode) {
            root.classList.add('dark');
            root.classList.remove('light');
            body.classList.add('dark');
            body.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
            body.classList.add('light');
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
