import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, RefreshCw, Clock, ChefHat, CheckCircle2, Flame, Inbox, PackageCheck, MapPin, Phone } from 'lucide-react';

import API_URL from '../../apiConfig';

const KitchenView = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const { logout, user, token } = useAuth();

    const fetchOrders = async (showSpinner = false) => {
        if (!user?.id) return;
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/staff/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            if (showSpinner) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
            const interval = setInterval(() => fetchOrders(), 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
        } catch (err) {
            alert('Update failed');
        }
    };

    const getMinutesAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
        if (diff < 1) return 'just now';
        if (diff === 1) return '1 min ago';
        return `${diff} mins ago`;
    };

    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
    };

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter.toLowerCase());

    const OrderCard = ({ order }) => {
        const isCabin = order.deliveryType === 'cabin' || order.cabinNumber || order.pickupTime === 'Cabin Delivery';
        
        return (
            <div key={order._id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', margin: 0 }}>#{order._id.slice(-6).toUpperCase()}</p>
                            <span style={{ 
                                fontSize: '0.65rem', 
                                background: order.status === 'pending' ? 'rgba(245,158,11,0.15)' : order.status === 'preparing' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                                color: order.status === 'pending' ? '#F59E0B' : order.status === 'preparing' ? '#3B82F6' : '#10B981',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                border: '1px solid currentColor',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                {order.status}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {getMinutesAgo(order.createdAt)}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {isCabin ? (
                            <div style={{ background: 'rgba(124,58,237,0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '1.1rem' }}>🚪</span>
                                <p style={{ fontWeight: 800, color: '#a78bfa', margin: 0, fontSize: '0.9rem' }}>Cabin {order.cabinNumber || 'N/A'}</p>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(59,130,246,0.15)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={14} color="#60a5fa" />
                                <p style={{ fontWeight: 800, color: '#60a5fa', margin: 0, fontSize: '0.9rem' }}>{order.pickupTime}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    {/* Customer Details */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', margin: '0 0 4px 0' }}>{order.user?.name || 'Guest'}</p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {order.user?.phone && <p style={{ fontSize: '0.7rem', color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} /> {order.user.phone}</p>}
                            {order.user?.department && <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: 0 }}>🏫 {order.user.department}</p>}
                        </div>
                    </div>

                    {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem' }}>
                            <div style={{ width: '16px', height: '16px', border: `1.5px solid ${item.product?.isVeg !== false ? '#22C55E' : '#EF4444'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', flexShrink: 0 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.product?.isVeg !== false ? '#22C55E' : '#EF4444' }} />
                            </div>
                            <div style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800, color: '#E23744', fontSize: '0.9rem' }}>{item.quantity}×</div>
                            <span style={{ color: '#D1D5DB', fontWeight: 500, fontSize: '0.95rem' }}>{item.product?.name || 'Item'}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    {order.status === 'pending' && (
                        <button onClick={() => updateStatus(order._id, 'preparing')} className="btn-action" style={{ backgroundColor: '#E23744', color: 'white', width: '100%' }}>
                            🔥 Start Cooking
                        </button>
                    )}
                    {order.status === 'preparing' && (
                        <button onClick={() => updateStatus(order._id, 'ready')} className="btn-action" style={{ backgroundColor: '#F59E0B', color: 'white', width: '100%' }}>
                            ✅ Mark Ready
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button onClick={() => updateStatus(order._id, 'completed')} className="btn-action" style={{ backgroundColor: '#22C55E', color: 'white', width: '100%' }}>
                            📦 Handover & Complete
                        </button>
                    )}
                    {order.status === 'completed' && (
                        <div style={{ textAlign: 'center', padding: '0.7rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px', color: '#22C55E', fontWeight: 700, fontSize: '0.85rem' }}>
                            <CheckCircle2 size={16} /> Order Completed
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0D0D0D', color: 'white', position: 'relative', overflowX: 'hidden' }}>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .floating-emoji { position: absolute; font-size: 3.5rem; opacity: 0.1; pointer-events: none; animation: float 8s ease-in-out infinite; z-index: 1; }
                .glass-card { background: rgba(26, 26, 28, 0.95); border-radius: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.08); padding: 1.25rem; transition: all 0.3s ease; position: relative; z-index: 10; display: flex; flex-direction: column; }
                .glass-card:hover { border-color: rgba(226, 55, 68, 0.3); transform: translateY(-3px); }
                .stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1rem; padding: 1.25rem; text-align: center; }
                .btn-action { padding: 0.75rem 1rem; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Inter', sans-serif; }
                .btn-action:hover { filter: brightness(1.1); transform: scale(1.01); }
                .filter-pill { padding: 0.5rem 1.25rem; border-radius: 2rem; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-weight: 600; transition: all 0.3s ease; font-size: 0.85rem; }
                .section-title { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 800; margin: 2.5rem 0 1.25rem 0; color: white; text-transform: uppercase; letter-spacing: 1px; }
                .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; marginBottom: 2.5rem; }
                .main-container { maxWidth: 1400px; margin: 0 auto; padding: 2rem; }
                @media (max-width: 768px) {
                    .main-container { padding: 1rem; }
                    .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
                    .orders-grid { grid-template-columns: 1fr; gap: 1.25rem; }
                    .filter-pill { padding: 0.4rem 1rem; font-size: 0.75rem; }
                }
            `}</style>

            {/* Header */}
            <header style={{
                background: '#111111',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #E23744 0%, #B91C1C 100%)', padding: '8px', borderRadius: '10px' }}>
                        <ChefHat color="white" size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Kitchen</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 700 }}>● LIVE</span>
                            <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Hi {user?.name}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button onClick={() => fetchOrders(true)} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}>
                        <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        <span>Refresh</span>
                    </button>
                    <button onClick={logout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="main-container">
                {/* Stats Dashboard - 3 Cards */}
                <div className="stats-grid">
                    <div className="stat-card" style={{ borderTop: '3px solid #F59E0B' }}>
                        <p style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>New</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#F59E0B' }}>{stats.pending}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '3px solid #E23744' }}>
                        <p style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Cooking</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#E23744' }}>{stats.preparing}</p>
                    </div>
                    <div className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
                        <p style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>Ready</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#22C55E' }}>{stats.ready}</p>
                    </div>
                </div>

                {/* Filter Bar with Counts */}
                <div className="filter-bar" style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: 4 }}>
                    {[
                        { id: 'All', label: 'All', count: orders.length },
                        { id: 'Pending', label: 'New', count: stats.pending },
                        { id: 'Preparing', label: 'Cooking', count: stats.preparing },
                        { id: 'Ready', label: 'Ready', count: stats.ready }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className="filter-pill"
                            style={{
                                backgroundColor: filter === f.id ? '#E23744' : 'rgba(255,255,255,0.05)',
                                color: filter === f.id ? 'white' : '#9CA3AF',
                                borderColor: filter === f.id ? '#E23744' : 'rgba(255,255,255,0.1)'
                            }}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>

                {/* Orders Grid */}
                <div className="orders-grid">
                    {filteredOrders.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 0' }}>
                            <Inbox size={48} style={{ opacity: 0.1, color: 'white', marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4B5563' }}>No {filter.toLowerCase()} orders right now</h2>
                        </div>
                    ) : (
                        filteredOrders.map(o => <OrderCard key={o._id} order={o} />)
                    )}
                </div>
            </div>

            {/* Background Decor */}
            <div className="floating-emoji" style={{ top: '20%', left: '5%' }}>🍳</div>
            <div className="floating-emoji" style={{ bottom: '20%', right: '5%' }}>🥗</div>
        </div>
    );
};

export default KitchenView;
