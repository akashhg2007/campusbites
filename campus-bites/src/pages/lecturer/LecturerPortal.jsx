import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../apiConfig';

const LecturerPortal = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('menu');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [successMsg, setSuccessMsg] = useState('');

    const categories = ['All', 'Snacks', 'Meals', 'Beverages', 'Desserts'];
    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(r => r.json()).then(setProducts).catch(() => {});
    }, []);

    useEffect(() => {
        if (tab === 'orders' && token) {
            fetch(`${API_URL}/api/orders/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()).then(data => {
                if (Array.isArray(data)) setOrders(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }).catch(() => {});
        }
    }, [tab, token]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(i => i._id === product._id);
            if (exists) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => i._id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
    };

    const placeOrder = async () => {
        if (!cart.length) return;
        setOrderLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/razorpay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: cartTotal })
            });
            const rzpOrder = await res.json();
            if (!res.ok) throw new Error(rzpOrder.message);

            const options = {
                key: rzpOrder.key_id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: 'Campus Bites',
                description: `Cabin Delivery to ${user.cabinNumber}`,
                order_id: rzpOrder.id,
                handler: async (response) => {
                    const verify = await fetch(`${API_URL}/api/orders/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: {
                                items: cart.map(i => ({ product: i._id, quantity: i.qty, price: i.price })),
                                totalAmount: cartTotal,
                                deliveryType: 'cabin',
                                cabinNumber: user.cabinNumber,
                                pickupTime: 'Cabin Delivery'
                            }
                        })
                    });
                    if (verify.ok) {
                        setCart([]);
                        setSuccessMsg(`✅ Order placed! Delivering to Cabin ${user.cabinNumber}`);
                        setTab('orders');
                        setTimeout(() => setSuccessMsg(''), 5000);
                    }
                },
                prefill: { name: user.name, email: user.email },
                theme: { color: '#7c3aed' }
            };
            new window.Razorpay(options).open();
        } catch (err) {
            alert(err.message || 'Order failed');
        } finally {
            setOrderLoading(false);
        }
    };

    const filtered = products.filter(p =>
        p.isAvailable !== false &&
        (category === 'All' || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const styles = {
        page: { minHeight: '100vh', background: '#0f0c1e', fontFamily: "'Inter',sans-serif", color: 'white', paddingBottom: 80 },
        header: { background: 'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(30,27,75,0.95))', backdropFilter: 'blur(20px)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 },
        badge: { background: '#7c3aed', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -6, right: -6, color: 'white' },
        card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s' },
        btn: (active) => ({ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 13, background: active ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'rgba(255,255,255,0.07)', color: active ? 'white' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }),
        navBtn: (active) => ({ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500, fontFamily: "'Inter',sans-serif", cursor: 'pointer', borderTop: `2px solid ${active ? '#a78bfa' : 'transparent'}`, transition: 'all 0.2s' }),
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'white' }}>🎓 Lecturer Portal</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                        {user?.name} · Cabin <span style={{ color: '#a78bfa', fontWeight: 600 }}>{user?.cabinNumber}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setTab('cart')}>
                        <span style={{ fontSize: 22 }}>🛒</span>
                        {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                    </div>
                    <button onClick={() => { logout(); navigate('/lecturer'); }} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                        Sign Out
                    </button>
                </div>
            </div>

            {successMsg && (
                <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', margin: '12px 16px', borderRadius: 12, padding: '12px 16px', color: '#86efac', fontSize: 14 }}>
                    {successMsg}
                </div>
            )}

            <div style={{ padding: '16px', maxWidth: 700, margin: '0 auto' }}>

                {/* MENU TAB */}
                {tab === 'menu' && (
                    <div>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search food..." style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', marginBottom: 14 }} />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                            {categories.map(c => <button key={c} style={styles.btn(category === c)} onClick={() => setCategory(c)}>{c}</button>)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
                            {filtered.map(p => {
                                const inCart = cart.find(i => i._id === p._id);
                                return (
                                    <div key={p._id} style={{ ...styles.card, cursor: 'pointer' }}>
                                        <div style={{ position: 'relative' }}>
                                            <img src={p.image || 'https://via.placeholder.com/200x130?text=Food'} alt={p.name} style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                                            <span style={{ position: 'absolute', top: 8, left: 8, background: p.isVeg ? '#16a34a' : '#dc2626', borderRadius: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>{p.isVeg ? '●' : '●'}</span>
                                        </div>
                                        <div style={{ padding: '10px 12px' }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                                            <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>₹{p.price}</div>
                                            {inCart ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <button onClick={() => updateQty(p._id, -1)} style={{ background: '#7c3aed', border: 'none', color: 'white', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>−</button>
                                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{inCart.qty}</span>
                                                    <button onClick={() => updateQty(p._id, 1)} style={{ background: '#7c3aed', border: 'none', color: 'white', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>+</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => addToCart(p)} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: 'none', color: 'white', padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Add</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 40, fontSize: 15 }}>No items found</p>}
                    </div>
                )}

                {/* CART TAB */}
                {tab === 'cart' && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Cart</h2>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                                <p>Cart is empty</p>
                                <button onClick={() => setTab('menu')} style={{ marginTop: 16, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Browse Menu</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ ...styles.card, padding: '14px 16px', marginBottom: 14, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>🚪 Delivery to</div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: '#a78bfa' }}>Cabin {user?.cabinNumber}</div>
                                    {user?.department && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{user?.department}</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                    {cart.map(item => (
                                        <div key={item._id} style={{ ...styles.card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <img src={item.image || 'https://via.placeholder.com/50?text=F'} alt={item.name} style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                                                <div style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>₹{item.price}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <button onClick={() => updateQty(item._id, -1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>−</button>
                                                <span style={{ fontWeight: 700, width: 20, textAlign: 'center' }}>{item.qty}</span>
                                                <button onClick={() => updateQty(item._id, 1)} style={{ background: '#7c3aed', border: 'none', color: 'white', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>+</button>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 14, minWidth: 50, textAlign: 'right' }}>₹{item.price * item.qty}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ ...styles.card, padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total ({cartCount} items)</span>
                                        <span style={{ fontWeight: 700, fontSize: 18, color: '#a78bfa' }}>₹{cartTotal}</span>
                                    </div>
                                    <button onClick={placeOrder} disabled={orderLoading} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: 'none', color: 'white', padding: '15px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: "'Inter',sans-serif", opacity: orderLoading ? 0.7 : 1 }}>
                                        {orderLoading ? '⏳ Processing...' : `🚪 Pay & Deliver to Cabin ${user?.cabinNumber}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ORDERS TAB */}
                {tab === 'orders' && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>My Orders</h2>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {orders.map(order => {
                                    const statusColor = { pending: '#f59e0b', preparing: '#3b82f6', ready: '#10b981', completed: '#6b7280', cancelled: '#ef4444' }[order.status] || '#6b7280';
                                    return (
                                        <div key={order._id} style={{ ...styles.card, padding: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span style={{ background: statusColor + '22', color: statusColor, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize', border: `1px solid ${statusColor}44` }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            {order.cabinNumber && (
                                                <div style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                                    🚪 Cabin Delivery · {order.cabinNumber}
                                                </div>
                                            )}
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>
                                                {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                            </div>
                                            <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: 16 }}>₹{order.totalAmount}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Bottom Nav */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,12,30,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 100 }}>
                {[
                    { key: 'menu', label: 'Menu', icon: '🍽️' },
                    { key: 'cart', label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}`, icon: '🛒' },
                    { key: 'orders', label: 'Orders', icon: '📦' },
                ].map(item => (
                    <button key={item.key} style={styles.navBtn(tab === item.key)} onClick={() => setTab(item.key)}>
                        <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
                        <div>{item.label}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LecturerPortal;
