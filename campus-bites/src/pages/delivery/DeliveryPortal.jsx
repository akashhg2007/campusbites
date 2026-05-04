import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, Phone, MapPin, Clock, Package, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../../apiConfig';

const STATUS_BADGE = {
    pending:   { label: '🆕 New',       color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)' },
    preparing: { label: '🔥 Cooking',   color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)' },
    ready:     { label: '✅ Ready',      color: '#10B981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)' },
    completed: { label: '📦 Delivered', color: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
};

const DeliveryPortal = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('ready');
    const [refreshing, setRefreshing] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [completing, setCompleting] = useState({});

    const fetchOrders = async (spinner = false) => {
        if (!token) return;
        if (spinner) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/delivery/active`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) { console.error(err); }
        finally { if (spinner) setRefreshing(false); }
    };

    useEffect(() => {
        fetchOrders();
        const poll = setInterval(fetchOrders, 12000);
        return () => clearInterval(poll);
    }, [token]);

    const markDelivered = async (orderId) => {
        setCompleting(p => ({ ...p, [orderId]: true }));
        try {
            const res = await fetch(`${API_URL}/api/orders/delivery/${orderId}/complete`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) { fetchOrders(); }
            else alert('Failed to update order');
        } catch { alert('Network error'); }
        finally { setCompleting(p => ({ ...p, [orderId]: false })); }
    };

    const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
    };

    const getMinutesAgo = (d) => {
        const diff = Math.floor((new Date() - new Date(d)) / 60000);
        return diff < 1 ? 'just now' : diff === 1 ? '1 min ago' : `${diff} mins ago`;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', fontFamily: "'Inter',sans-serif", paddingBottom: 40 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
                .glass { background:rgba(26,26,28,0.9);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.07); }
                .del-card { animation:fadeIn 0.4s ease both;border-radius:18px;transition:all 0.2s ease;overflow:hidden; }
                .del-card:hover { transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.4); }
                .deliver-btn { width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#10B981,#059669);color:white;font-weight:700;font-size:0.9rem;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s ease;box-shadow:0 4px 15px rgba(16,185,129,0.3); }
                .deliver-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 20px rgba(16,185,129,0.4); }
                .deliver-btn:disabled { opacity:0.6;cursor:not-allowed; }
                .ready-pulse { animation:pulse-ring 2s infinite; }
                .filter-btn { padding:8px 16px;border-radius:20px;border:none;cursor:pointer;font-size:0.8rem;font-weight:600;font-family:'Inter',sans-serif;transition:all 0.2s;white-space:nowrap; }
                .info-row { display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px; }
                .info-row:last-child { border-bottom:none; }
            `}</style>

            {/* Header */}
            <div className="glass" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>🚴</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#F59E0B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Delivery Portal</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{user?.name} · <span style={{ color: '#10B981' }}>● Live</span></div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => fetchOrders(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '7px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                        <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                    </button>
                    <button onClick={() => { logout(); navigate('/delivery'); }} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', padding: '7px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Inter',sans-serif" }}>
                        <LogOut size={13} /> Out
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px' }}>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                    {[
                        { key: 'all', label: 'Total', icon: '📋', color: '#E23744' },
                        { key: 'pending', label: 'New', icon: '🆕', color: '#F59E0B' },
                        { key: 'preparing', label: 'Cooking', icon: '🔥', color: '#3B82F6' },
                        { key: 'ready', label: 'Ready', icon: '✅', color: '#10B981' },
                    ].map(s => (
                        <div key={s.key} className="glass" style={{ borderRadius: 14, padding: '12px 10px', textAlign: 'center', borderTop: `3px solid ${s.color}`, cursor: 'pointer', opacity: filter === s.key ? 1 : 0.65, transition: 'all 0.2s' }} onClick={() => setFilter(s.key)}>
                            <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                            <div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{counts[s.key]}</div>
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
                    {[
                        { key: 'all', label: '📋 All' },
                        { key: 'ready', label: '✅ Ready to Deliver' },
                        { key: 'preparing', label: '🔥 Cooking' },
                        { key: 'pending', label: '🆕 New' },
                    ].map(f => (
                        <button key={f.key} className="filter-btn" onClick={() => setFilter(f.key)} style={{
                            background: filter === f.key ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'rgba(255,255,255,0.05)',
                            color: filter === f.key ? 'black' : '#9CA3AF',
                            border: filter === f.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            boxShadow: filter === f.key ? '0 4px 15px rgba(245,158,11,0.3)' : 'none',
                        }}>
                            {f.label} {counts[f.key] > 0 ? `(${counts[f.key]})` : ''}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#4B5563' }}>
                        <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📭</div>
                        <p style={{ fontSize: 16, fontWeight: 600 }}>No orders here</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>Orders will appear automatically when ready</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map((order, idx) => {
                            const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
                            const isCabin = order.deliveryType === 'cabin' || order.cabinNumber;
                            const isOpen = expanded[order._id];

                            return (
                                <div key={order._id} className="glass del-card" style={{ animationDelay: `${idx * 0.05}s`, borderLeft: `3px solid ${badge.color}` }}>

                                    {/* Card Header */}
                                    <div style={{ padding: '16px 16px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>#{order._id?.slice(-6).toUpperCase()}</span>
                                                    <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{badge.label}</span>
                                                    {isCabin && <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🚪 Cabin</span>}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={11} /> {getMinutesAgo(order.createdAt)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: 16, color: '#F59E0B' }}>₹{order.totalAmount}</div>
                                                <div style={{ fontSize: 11, color: '#6B7280' }}>{order.items?.length} items</div>
                                            </div>
                                        </div>

                                        {/* Delivery destination — always visible */}
                                        <div style={{ background: isCabin ? 'rgba(124,58,237,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${isCabin ? 'rgba(124,58,237,0.2)' : 'rgba(59,130,246,0.2)'}`, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <MapPin size={15} color={isCabin ? '#a78bfa' : '#60a5fa'} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: isCabin ? '#a78bfa' : '#60a5fa' }}>
                                                        {isCabin ? `Cabin ${order.cabinNumber}` : `Pickup — ${order.pickupTime || 'ASAP'}`}
                                                    </div>
                                                    {order.user?.department && <div style={{ fontSize: 11, color: '#6B7280' }}>{order.user.department}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer info */}
                                        <div className="glass" style={{ borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
                                            <div className="info-row">
                                                <span style={{ fontSize: 16 }}>👤</span>
                                                <span style={{ color: '#9CA3AF', fontSize: 12, width: 60, flexShrink: 0 }}>Name</span>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{order.user?.name || '—'}</span>
                                            </div>
                                            {order.user?.phone && (
                                                <div className="info-row">
                                                    <Phone size={14} color="#10B981" />
                                                    <span style={{ color: '#9CA3AF', fontSize: 12, width: 60, flexShrink: 0 }}>Phone</span>
                                                    <a href={`tel:${order.user.phone}`} style={{ fontWeight: 600, color: '#10B981', textDecoration: 'none' }}>{order.user.phone}</a>
                                                </div>
                                            )}
                                            {order.user?.email && (
                                                <div className="info-row">
                                                    <span style={{ fontSize: 14 }}>✉️</span>
                                                    <span style={{ color: '#9CA3AF', fontSize: 12, width: 60, flexShrink: 0 }}>Email</span>
                                                    <span style={{ fontWeight: 500, color: '#D1D5DB', fontSize: 12 }}>{order.user.email}</span>
                                                </div>
                                            )}
                                            {isCabin && order.cabinNumber && (
                                                <div className="info-row">
                                                    <span style={{ fontSize: 14 }}>🚪</span>
                                                    <span style={{ color: '#9CA3AF', fontSize: 12, width: 60, flexShrink: 0 }}>Cabin</span>
                                                    <span style={{ fontWeight: 700, color: '#a78bfa', fontSize: 14 }}>{order.cabinNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Items toggle */}
                                        <button onClick={() => toggleExpand(order._id)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#9CA3AF', width: '100%', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontFamily: "'Inter',sans-serif", fontWeight: 500, marginBottom: isOpen ? 10 : 0 }}>
                                            <span>🛍️ {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} — ₹{order.totalAmount}</span>
                                            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                        </button>

                                        {isOpen && (
                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, animation: 'slideDown 0.2s ease' }}>
                                                {order.items?.map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {item.product?.image && <img src={item.product.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                                                            <span style={{ fontSize: 13, color: '#D1D5DB' }}>
                                                                <span style={{ color: '#F59E0B', fontWeight: 700, marginRight: 4 }}>×{item.quantity}</span>
                                                                {item.product?.name || 'Item'}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>₹{(item.price || item.product?.price || 0) * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Deliver button (only for ready orders) */}
                                        {order.status === 'ready' && (
                                            <button className={`deliver-btn ${order.status === 'ready' ? 'ready-pulse' : ''}`} onClick={() => markDelivered(order._id)} disabled={completing[order._id]}>
                                                {completing[order._id] ? '⏳ Updating...' : <><CheckCircle size={16} /> Mark as Delivered</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryPortal;
