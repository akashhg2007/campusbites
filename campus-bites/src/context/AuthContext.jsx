import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { user, token, loading, login, logout, setLoading, toggleTheme, theme } = useAuthStore();

    useEffect(() => {
        const storedToken = useAuthStore.getState().token;
        if (storedToken) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    logout();
                }
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, toggleTheme, theme }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
