import React, { useState, useEffect, useCallback } from 'react';
import { useSocket, emitSocket } from '../hooks/useSocket';
import API_URL from '../apiConfig';

const CanteenBoard = () => {
    const [orders, setOrders] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/orders/staff/active`, {
                headers: { Authorization: `Bearer admin` }
            });
            if (res.ok) setOrders(await res.json());
        } catch {}
    }, []);

    useEffect(() => { fetchOrders(); }, []);
    useEffect(() => { const t = setInterval(fetchOrders, 5000); return () => clearInterval(t); }, [fetchOrders]);
    useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);

    useSocket('new-order', useCallback(() => fetchOrders(), [fetchOrders]));
    useSocket('order-updated', useCallback(() => fetchOrders(), [fetchOrders]));

    const pending = orders.filter(o => o.status === 'pending');
    const preparing = orders.filter(o => o.status === 'preparing');
    const ready = orders.filter(o => o.status === 'ready');

    const nowServing = pending[0] || preparing[0];

    return (
        <div style={{
            minHeight: '100vh', background: '#000', color: 'white',
            padding: '2rem', fontFamily: 'monospace'
        }}>
            <style>{`
                @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(226,55,68,0.3)}50%{box-shadow:0 0 40px rgba(226,55,68,0.6)} }
                .order-number { font-size: 4rem; font-weight: 900; letter-spacing: 4px; }
                .pulse { animation: pulse-glow 2s infinite; }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-2px' }}>
                        CAMPUS<span style={{ color: '#E23744' }}>BITES</span>
                    </h1>
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '1rem' }}>Canteen Display Board</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Now Serving */}
            <div style={{
                background: 'rgba(226,55,68,0.1)', border: '2px solid #E23744',
                borderRadius: '24px', padding: '2rem', textAlign: 'center', marginBottom: '2rem'
            }} className="pulse">
                <p style={{ color: '#E23744', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '4px', textTransform: 'uppercase' }}>
                    NOW SERVING
                </p>
                <p className="order-number" style={{ color: 'white', margin: 0 }}>
                    {nowServing ? `#${nowServing._id.slice(-4).toUpperCase()}` : '---'}
                </p>
                {nowServing && (
                    <p style={{ color: '#9CA3AF', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        {nowServing.items?.map(i => i.product?.name).filter(Boolean).join(' + ')}
                    </p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                {/* Pending Queue */}
                <div>
                    <h2 style={{ color: '#F59E0B', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏳ PENDING ({pending.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pending.slice(0, 8).map(o => (
                            <div key={o._id} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>#{o._id.slice(-4).toUpperCase()}</span>
                                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{o.items?.length} items</span>
                            </div>
                        ))}
                        {pending.length > 8 && (
                            <p style={{ color: '#6B7280', textAlign: 'center', fontSize: '0.9rem' }}>+{pending.length - 8} more</p>
                        )}
                    </div>
                </div>

                {/* Preparing */}
                <div>
                    <h2 style={{ color: '#E23744', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔥 PREPARING ({preparing.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {preparing.slice(0, 8).map(o => (
                            <div key={o._id} style={{ background: 'rgba(226,55,68,0.08)', border: '1px solid rgba(226,55,68,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>#{o._id.slice(-4).toUpperCase()}</span>
                                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{o.items?.length} items</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ready */}
                <div>
                    <h2 style={{ color: '#22C55E', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ✅ READY ({ready.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ready.slice(0, 8).map(o => (
                            <div key={o._id} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>#{o._id.slice(-4).toUpperCase()}</span>
                                <span style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>{o.items?.length} items</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', color: '#333', fontSize: '0.8rem' }}>
                Auto-refreshes every 5 seconds
            </div>
        </div>
    );
};

export default CanteenBoard;
