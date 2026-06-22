import React, { useState, useEffect } from 'react';
import { Clock, Users, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const SmartPickupTime = ({ onSelect, selectedTime }) => {
    const { token } = useAuth();
    const [queueLength, setQueueLength] = useState(0);
    const [avgPrepTime, setAvgPrepTime] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(orders => {
                const active = orders.filter(o => ['pending', 'preparing'].includes(o.status));
                setQueueLength(active.length);
                if (active.length > 0) {
                    const times = active.map(o => new Date(o.createdAt).getTime());
                    const avgWait = Math.max(...times) - Math.min(...times);
                    setAvgPrepTime(Math.max(10, Math.round(avgWait / 60000 / active.length) || 10));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    const now = new Date();
    const slots = [];
    for (let i = 0; i < 6; i++) {
        const time = new Date(now.getTime() + (i + 1) * avgPrepTime * 60000);
        const h = time.getHours();
        const m = time.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        slots.push({
            time: `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`,
            minutes: (i + 1) * avgPrepTime,
            fast: i === 0
        });
    }

    const getQueueColor = () => {
        if (queueLength <= 2) return '#22C55E';
        if (queueLength <= 5) return '#F59E0B';
        return '#EF4444';
    };

    const getQueueLabel = () => {
        if (queueLength <= 2) return 'Short queue';
        if (queueLength <= 5) return 'Moderate queue';
        return 'Long queue — order now!';
    };

    if (loading) return null;

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Queue Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: `${getQueueColor()}08`,
                    border: `1px solid ${getQueueColor()}30`,
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <div style={{
                    width: 40, height: 40, borderRadius: '12px',
                    background: `${getQueueColor()}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Users size={20} color={getQueueColor()} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: getQueueColor() }}>
                        {queueLength} {queueLength === 1 ? 'order' : 'orders'} ahead
                    </p>
                    <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.75rem' }}>{getQueueLabel()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#6B7280' }}>Avg wait</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: getQueueColor() }}>~{avgPrepTime}m</p>
                </div>
            </motion.div>

            {/* Quick Time Slots */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {slots.map((slot, i) => (
                    <motion.button
                        key={slot.time}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(slot.time)}
                        style={{
                            minWidth: '90px',
                            padding: '10px',
                            borderRadius: '14px',
                            border: `2px solid ${selectedTime === slot.time ? '#E23744' : 'rgba(255,255,255,0.08)'}`,
                            background: selectedTime === slot.time ? 'rgba(226,55,68,0.1)' : 'rgba(255,255,255,0.03)',
                            color: selectedTime === slot.time ? '#E23744' : 'white',
                            cursor: 'pointer',
                            textAlign: 'center',
                            flexShrink: 0
                        }}
                    >
                        {slot.fast && (
                            <div style={{ fontSize: '0.6rem', background: 'rgba(34,197,94,0.15)', color: '#22C55E', padding: '2px 6px', borderRadius: '6px', marginBottom: '4px', fontWeight: 700 }}>
                                FASTEST
                            </div>
                        )}
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{slot.time}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#6B7280' }}>in {slot.minutes}m</p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default SmartPickupTime;
