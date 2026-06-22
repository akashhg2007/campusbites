import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { notify } from './Toast';
import API_URL from '../apiConfig';

const QuickReorder = () => {
    const { user, token } = useAuth();
    const { addToCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [lastOrder, setLastOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_URL}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(orders => {
                const completed = orders.find(o => o.status === 'completed' || o.status === 'ready');
                if (completed) setLastOrder(completed);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user, token]);

    const handleQuickReorder = () => {
        if (!lastOrder) return;
        clearCart();
        lastOrder.items.forEach(item => {
            if (item.product) {
                for (let i = 0; i < item.quantity; i++) {
                    addToCart({ ...item.product, _id: item.product._id || item.product });
                }
            }
        });
        notify.success('Items added to cart!');
        navigate('/dashboard/cart');
    };

    if (loading || !lastOrder) return null;

    const itemNames = lastOrder.items.map(i => i.product?.name || 'Item').join(', ');
    const timeAgo = getTimeAgo(lastOrder.createdAt);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, rgba(226,55,68,0.12), rgba(220,38,38,0.05))',
                border: '1px solid rgba(226,55,68,0.25)',
                borderRadius: '20px',
                padding: '16px',
                marginBottom: '1.5rem',
                cursor: 'pointer'
            }}
            onClick={handleQuickReorder}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '14px',
                        background: 'linear-gradient(135deg, #E23744, #DC2626)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Zap size={20} color="white" />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Quick Reorder
                            <span style={{ fontSize: '0.7rem', background: 'rgba(226,55,68,0.2)', color: '#E23744', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>2s</span>
                        </p>
                        <p style={{ margin: '2px 0 0', color: '#9CA3AF', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                            {itemNames}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#E23744' }}>₹{lastOrder.totalAmount}</p>
                    <p style={{ margin: '2px 0 0', color: '#6B7280', fontSize: '0.7rem' }}>{timeAgo}</p>
                </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#E23744', fontSize: '0.8rem', fontWeight: 600 }}>
                <RefreshCw size={14} /> Tap to reorder → cart → checkout
            </div>
        </motion.div>
    );
};

function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default QuickReorder;
