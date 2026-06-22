import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API_URL from '../apiConfig';

let socket = null;
let failed = false;

export const getSocket = () => {
    if (failed) return null;
    if (!socket) {
        try {
            socket = io(API_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 3,
                reconnectionDelay: 5000,
                timeout: 10000
            });
            socket.on('connect_error', () => {
                failed = true;
                socket?.disconnect();
                socket = null;
            });
        } catch {
            failed = true;
            return null;
        }
    }
    return socket;
};

export const useSocket = (event, handler) => {
    const savedHandler = useRef(handler);
    useEffect(() => { savedHandler.current = handler; }, [handler]);

    useEffect(() => {
        const s = getSocket();
        if (!s) return;
        const listener = (...args) => savedHandler.current(...args);
        s.on(event, listener);
        return () => s.off(event, listener);
    }, [event]);
};

export const emitSocket = (event, data) => {
    const s = getSocket();
    if (s) s.emit(event, data);
};
