import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import API_URL from '../apiConfig';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_URL, { transports: ['websocket', 'polling'] });
    }
    return socket;
};

export const useSocket = (event, handler) => {
    const savedHandler = useRef(handler);
    useEffect(() => { savedHandler.current = handler; }, [handler]);

    useEffect(() => {
        const s = getSocket();
        const listener = (...args) => savedHandler.current(...args);
        s.on(event, listener);
        return () => s.off(event, listener);
    }, [event]);
};

export const emitSocket = (event, data) => {
    getSocket().emit(event, data);
};
