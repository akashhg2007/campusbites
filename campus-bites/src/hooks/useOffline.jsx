import { useState, useEffect } from 'react';

const DB_NAME = 'campusbites-offline';
const STORE_NAME = 'cache';

const openDB = () => new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

export const cacheData = async (key, data) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, key);
    } catch {}
};

export const getCachedData = async (key) => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
};

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

export const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    if (isOnline) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: 'white', textAlign: 'center', padding: '8px',
            fontSize: '0.8rem', fontWeight: 600
        }}>
            📡             You are offline - showing cached data
        </div>
    );
};
