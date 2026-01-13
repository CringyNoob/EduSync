import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // Initialize from storage or default
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('edusync_theme') || 'system';
        }
        return 'system';
    });

    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('edusync_reduced_motion') === 'true';
        }
        return false;
    });

    // Handle Theme Application
    useEffect(() => {
        const root = window.document.documentElement;

        const removeOldTheme = () => {
            root.classList.remove('light', 'dark');
        };

        const applyTheme = (themeValue) => {
            removeOldTheme();
            if (themeValue === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(themeValue);
            }
        };

        applyTheme(theme);
        localStorage.setItem('edusync_theme', theme);

        // System theme listener
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Handle Reduced Motion
    useEffect(() => {
        localStorage.setItem('edusync_reduced_motion', reducedMotion);
        // We can use a data attribute or class on body/html to apply CSS based on this
        // For now, it's just state management, but can be extended to disable animations via global CSS
        if (reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }, [reducedMotion]);

    const toggleReducedMotion = () => {
        setReducedMotion(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, reducedMotion, toggleReducedMotion }}>
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
