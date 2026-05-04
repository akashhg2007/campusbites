import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, RefreshCw, CheckCircle2, Clock, ChefHat, Flame, PackageCheck, Inbox, MapPin, Phone } from 'lucide-react';
import API_URL from '../../apiConfig';

const STATUS_CONFIG = {
    pending:   { label: 'New Order',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  next: 'preparing', nextLabel: '🔥 Start Cooking', icon: '🆕' },
    preparing: { label: 'Cooking',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  next: 'ready',    nextLabel: '✅ Mark Ready',    icon: '👨‍🍳' },
    ready:     { label: 'Ready',      color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  next: 'completed', nextLabel: '📦 Complete',    icon: '✅' },
};

const KitchenView = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [now, setNow] = useState(new Date());
    const { logout, user, token } = useAuth();

    const fetchOrders = async (showSpinner = false) => {
        if (!token) return;
        if (showSpinner) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/staff/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) { console.error(err); }
        finally { if (showSpinner) setRefreshing(false); }
    };

    useEffect(() => {
        fetchOrders();
        const poll = setInterval(fetchOrders, 10000);
        const tick = setInterval(() => setNow(new Date()), 60000);
        return () => { clearInterval(poll); clearInterval(tick); };
    }, [token]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
        } catch { alert('Update failed'); }
    };

    const getMinutesAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
        if (diff < 1) return 'just now';
        if (diff === 1) return '1 min ago';
        return `${diff} mins ago`;
    };

    const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter.toLowerCase());
    const counts = {
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', fontFamily: "'Inter',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes fadeSlide { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.3} }
                .glass { background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08); }
                .order-card { animation:fadeSlide 0.4s ease both;border-radius:20px;transition:transform 0.2s ease,box-shadow 0.2s ease; }
                .order-card:hover { transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.4); }
                .action-btn { border:none;border-radius:12px;font-weight:700;font-size:0.85rem;padding:10px 16px;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s ease; }
                .action-btn:hover { transform:translateY(-1px);filter:brightness(1.1); }
                .filter-tab { padding:8px 18px;border-radius:20px;border:none;cursor:pointer;font-size:0.82rem;font-weight:600;font-family:'Inter',sans-serif;transition:all 0.25s ease; }
                .stat-card { border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:14px; }
            `}</style>

            {/* Header */}
            <div className="glass" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'linear-gradient(135deg,#E23744,#DC2626)', borderRadius: 14, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(226,55,68,0.35)' }}>
                        <ChefHat size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 17, background: 'linear-gradient(135deg,#E23744,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Kitchen Panel</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>
                            Hi {user?.name} ·&nbsp;
                            <span style={{ color: '#10B981' }}>● Live</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => fetchOrders(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                        <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                    <button onClick={() => { logout(); }} style={{ background: 'rgba(226,55,68,0.12)', border: '1px solid rgba(226,55,68,0.2)', color: '#E23744', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                        <LogOut size={14} /> Out
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 40px' }}>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'New', count: counts.pending, color: '#F59E0B', icon: '🆕' },
                        { label: 'Cooking', count: counts.preparing, color: '#3B82F6', icon: '🔥' },
                        { label: 'Ready', count: counts.ready, color: '#10B981', icon: '✅' },
                    ].map(s => (
                        <div key={s.label} className="glass stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                            <div style={{ fontSize: 24 }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.count}</div>
                                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                    {['All', 'Pending', 'Preparing', 'Ready'].map(f => (
                        <button key={f} className="filter-tab" onClick={() => setFilter(f)} style={{
                            background: filter === f ? 'linear-gradient(135deg,#E23744,#DC2626)' : 'rgba(255,255,255,0.05)',
                            color: filter === f ? 'white' : '#9CA3AF',
                            border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: filter === f ? '0 4px 15px rgba(226,55,68,0.3)' : 'none',
                            whiteSpace: 'nowrap'
                        }}>
                            {f} {f !== 'All' && counts[f.toLowerCase()] > 0 ? `(${counts[f.toLowerCase()]})` : ''}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#4B5563' }}>
                        <Inbox size={56} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <p style={{ fontSize: 16, fontWeight: 600 }}>No orders right now</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>New orders will appear here automatically</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map((order, idx) => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const isCabin = order.deliveryType === 'cabin' || order.cabinNumber;
                            return (
                                <div key={order._id} className="glass order-card" style={{ padding: 18, animationDelay: `${idx * 0.06}s`, borderLeft: `3px solid ${cfg.color}` }}>

                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                                                    #{order._id?.slice(-6).toUpperCase()}
                                                </span>
                                                <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                                {isCabin && (
                                                    <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                                        🚪 Cabin
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={11} /> {getMinutesAgo(order.createdAt)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#E23744' }}>₹{order.totalAmount}</div>
                                            <div style={{ fontSize: 11, color: '#6B7280' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>

                                    {/* Delivery info */}
                                    {isCabin && order.cabinNumber && (
                                        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <MapPin size={14} color="#a78bfa" />
                                            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700 }}>Deliver to Cabin {order.cabinNumber}</span>
                                        </div>
                                    )}
                                    {!isCabin && order.pickupTime && order.pickupTime !== 'Cabin Delivery' && (
                                        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Clock size={14} color="#60a5fa" />
                                            <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>Pickup: {order.pickupTime}</span>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
                                        {order.items?.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: i < order.items.length - 1 ? 6 : 0, marginBottom: i < order.items.length - 1 ? 6 : 0, borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                <span style={{ fontSize: 13, color: '#D1D5DB' }}>
                                                    <span style={{ fontWeight: 700, color: '#E23744', marginRight: 6 }}>×{item.quantity}</span>
                                                    {item.product?.name || 'Item'}
                                                </span>
                                                <span style={{ fontSize: 13, color: '#9CA3AF' }}>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    {cfg.next && (
                                        <button className="action-btn" onClick={() => updateStatus(order._id, cfg.next)}
                                            style={{
                                                width: '100%',
                                                background: cfg.next === 'preparing' ? 'linear-gradient(135deg,#F59E0B,#D97706)' :
                                                             cfg.next === 'ready'     ? 'linear-gradient(135deg,#10B981,#059669)' :
                                                             'linear-gradient(135deg,#6B7280,#4B5563)',
                                                color: 'white',
                                                boxShadow: cfg.next === 'preparing' ? '0 4px 15px rgba(245,158,11,0.3)' :
                                                            cfg.next === 'ready'     ? '0 4px 15px rgba(16,185,129,0.3)' : 'none'
                                            }}>
                                            {cfg.nextLabel}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KitchenView;
