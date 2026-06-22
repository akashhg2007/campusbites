import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { useAnalytics } from '../../hooks/useQueries';

const Analytics = () => {
    const { data, isLoading } = useAnalytics();

    if (isLoading) return (
        <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '4rem' }}>
            <Clock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Loading analytics...</p>
        </div>
    );

    const stats = [
        { label: "Today's Revenue", value: `₹${(data?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, color: '#E23744' },
        { label: "Today's Orders", value: data?.todayOrders || 0, icon: ShoppingBag, color: '#3B82F6' },
        { label: 'Weekly Orders', value: data?.weekOrders || 0, icon: TrendingUp, color: '#10B981' },
        { label: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: '#F59E0B' }
    ];

    return (
        <div style={{ color: 'white' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>System Analytics</h1>
                <p style={{ color: '#6B7280', margin: '4px 0 0 0' }}>Real-time performance tracking</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '20px', padding: '1.5rem', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 8px 0', fontWeight: 600 }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{stat.value}</h3>
                        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 100, height: 100, background: stat.color, filter: 'blur(60px)', opacity: 0.05 }} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Orders by Hour (This Week)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data?.hourlyData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} tickFormatter={h => `${h}:00`} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} />
                            <Bar dataKey="orders" fill="#E23744" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Revenue Trend (30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data?.revenueData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="_id" stroke="#6B7280" fontSize={10} tickFormatter={d => d.slice(5)} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#22C55E" fill="rgba(34,197,94,0.1)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Top Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {(data?.topProducts || []).map((item, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(226,55,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#E23744', fontSize: 14 }}>
                                    #{idx + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name || 'Unknown'}</p>
                                    <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: 0 }}>{item.totalQty} sold · ₹{item.totalRevenue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
