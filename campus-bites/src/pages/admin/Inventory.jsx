import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, RefreshCw, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../components/Toast';
import API_URL from '../../apiConfig';

const Inventory = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [prodRes, lowRes] = await Promise.all([
                fetch(`${API_URL}/api/products`),
                fetch(`${API_URL}/api/inventory/low-stock`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (prodRes.ok) setProducts(await prodRes.json());
            if (lowRes.ok) setLowStock(await lowRes.json());
        } catch {} finally { setLoading(false); }
    };

    const updateStock = async (productId, newStock) => {
        try {
            const res = await fetch(`${API_URL}/api/inventory/${productId}/stock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ stock: newStock })
            });
            if (res.ok) { notify.success('Stock updated'); fetchAll(); }
        } catch { notify.error('Failed'); }
    };

    return (
        <div style={{ color: 'white' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Inventory</h1>
            <p style={{ color: '#6B7280', margin: '0 0 1.5rem' }}>Manage stock levels</p>

            {lowStock.length > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '16px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertTriangle size={18} color="#F59E0B" />
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Low Stock Alert</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {lowStock.map(p => (
                            <span key={p._id} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#FDE68A' }}>
                                {p.name}: {p.stock} left
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {products.map(product => (
                    <motion.div key={product._id} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <img src={product.image} alt={product.name} style={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</p>
                            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>{product.category} · ₹{product.price}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateStock(product._id, Math.max(0, (product.stock || 0) - 1))}
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Minus size={14} />
                            </button>
                            <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: (product.stock || 0) <= 5 ? '#F59E0B' : '#22C55E' }}>
                                {product.stock ?? '∞'}
                            </span>
                            <button onClick={() => updateStock(product._id, (product.stock || 0) + 10)}
                                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={14} />
                            </button>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '8px',
                            background: product.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: product.isAvailable ? '#22C55E' : '#EF4444'
                        }}>{product.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Inventory;
