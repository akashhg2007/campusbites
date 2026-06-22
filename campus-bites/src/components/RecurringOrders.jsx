import React, { useState, useEffect } from 'react';
import { Repeat, Clock, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RecurringOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecurring();
    }, []);

    const fetchRecurring = async () => {
        try {
            const res = await fetch(`${API_URL}/api/recurring/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const cancelRecurring = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/recurring/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(prev => prev.filter(o => o.id !== id));
        } catch (err) { console.error(err); }
    };

    if (loading) return null;

    return (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Repeat size={20} color="#10B981" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Recurring Orders</h3>
            </div>

            {orders.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                    No recurring orders set. Create one from the Cart page.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                                    {order.items?.length} items · ₹{order.totalAmount}
                                </p>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                                    {order.days?.map(d => (
                                        <span key={d} style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                                            {DAYS[d]}
                                        </span>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> {order.pickupTime}
                                </p>
                            </div>
                            <button onClick={() => cancelRecurring(order.id)} style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#F87171',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}>
                                <Trash2 size={14} /> Cancel
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecurringOrders;
