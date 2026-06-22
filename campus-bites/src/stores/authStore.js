import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: true,
            theme: 'dark',

            login: (userData, userToken) => {
                set({ user: userData, token: userToken || null });
            },

            logout: () => {
                set({ user: null, token: null });
            },

            setLoading: (loading) => set({ loading }),

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                set({ theme: newTheme });
            },

            initTheme: () => {
                const theme = get().theme;
                document.documentElement.setAttribute('data-theme', theme);
            }
        }),
        {
            name: 'campusbites-auth',
            partialize: (state) => ({ user: state.user, token: state.token, theme: state.theme })
        }
    )
);
