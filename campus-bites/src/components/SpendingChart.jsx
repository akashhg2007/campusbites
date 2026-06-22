import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMyOrders } from '../hooks/useQueries';

const SpendingChart = () => {
    const { data: orders } = useMyOrders();

    if (!orders?.length) return null;

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
        const dayOrders = orders.filter(o => {
            const od = new Date(o.createdAt);
            return od.toDateString() === d.toDateString() && o.status !== 'cancelled';
        });
        return { day: dayStr, amount: dayOrders.reduce((s, o) => s + o.totalAmount, 0) };
    });

    const hasData = weeklyData.some(d => d.amount > 0);
    if (!hasData) return null;

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>This Week's Spending</h4>
            <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weeklyData}>
                    <XAxis dataKey="day" stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="amount" fill="#E23744" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
