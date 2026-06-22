import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedNumber from './AnimatedNumber';
import API_URL from '../apiConfig';

const BudgetTracker = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_URL}/api/orders/mine`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(orders => {
                const completed = orders.filter(o => o.status !== 'cancelled');
                const now = new Date();
                const thisMonth = completed.filter(o => {
                    const d = new Date(o.createdAt);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
                const lastMonth = completed.filter(o => {
                    const d = new Date(o.createdAt);
                    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
                });

                const thisMonthTotal = thisMonth.reduce((s, o) => s + o.totalAmount, 0);
                const lastMonthTotal = lastMonth.reduce((s, o) => s + o.totalAmount, 0);
                const totalSpent = completed.reduce((s, o) => s + o.totalAmount, 0);
                const totalOrders = completed.length;
                const avgPerOrder = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

                const weeklyData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
                    const dayOrders = completed.filter(o => new Date(o.createdAt).toDateString() === d.toDateString());
                    weeklyData.push({ day: dayStr, amount: dayOrders.reduce((s, o) => s + o.totalAmount, 0) });
                }

                setStats({
                    thisMonthTotal,
                    lastMonthTotal,
                    totalSpent,
                    totalOrders,
                    avgPerOrder,
                    weeklyData,
                    change: lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user, token]);

    if (loading || !stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '16px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(139,92,246,0.15)', padding: '8px', borderRadius: '10px' }}>
                    <Wallet size={20} color="#8B5CF6" />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Budget Tracker</h3>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>{stats.totalOrders} orders total</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#E23744' }}>₹<AnimatedNumber value={stats.thisMonthTotal} /></p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#6B7280' }}>This Month</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#22C55E' }}>₹<AnimatedNumber value={stats.avgPerOrder} /></p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#6B7280' }}>Avg / Order</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        {stats.change > 0 ? <TrendingUp size={14} color="#EF4444" /> : <TrendingDown size={14} color="#22C55E" />}
                        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: stats.change > 0 ? '#EF4444' : '#22C55E' }}>
                            {Math.abs(stats.change)}%
                        </p>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#6B7280' }}>vs Last Month</p>
                </div>
            </div>

            {/* Weekly Chart */}
            <ResponsiveContainer width="100%" height={100}>
                <BarChart data={stats.weeklyData}>
                    <XAxis dataKey="day" stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: '#6B7280', textAlign: 'center' }}>
                Total spent: ₹<AnimatedNumber value={stats.totalSpent} />
            </p>
        </motion.div>
    );
};

export default BudgetTracker;
