import { useEffect } from 'react';

const initMonitoring = () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
        console.error('[CampusBites Error]', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.message
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('[CampusBites Unhandled Promise]', {
            reason: event.reason?.message || String(event.reason)
        });
    });
};

export const useMonitoring = () => {
    useEffect(() => { initMonitoring(); }, []);
};

export const logError = (context, error) => {
    console.error(`[${context}]`, error?.message || error);
};

export const logEvent = (event, data) => {
    console.log(`[CampusBites Event] ${event}`, data || '');
};
