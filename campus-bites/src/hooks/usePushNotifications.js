import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

export const usePushNotifications = () => {
    const { token } = useAuth();
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        setSupported('serviceWorker' in navigator && 'PushManager' in window);
    }, []);

    const subscribe = useCallback(async () => {
        if (!supported || !token) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            const reg = await navigator.serviceWorker.ready;
            const vapidRes = await fetch(`${API_URL}/api/push/vapid-key`);
            const { key } = await vapidRes.json();
            if (!key) return;

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(key)
            });

            const sub = subscription.toJSON();
            await fetch(`${API_URL}/api/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys })
            });
            setSubscribed(true);
        } catch (err) {
            console.error('Push subscription failed:', err);
        }
    }, [supported, token]);

    return { supported, subscribed, subscribe };
};

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
