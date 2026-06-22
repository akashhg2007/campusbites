import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../components/Toast';
import API_URL from '../../apiConfig';

const ManageUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.set('role', roleFilter);
            if (search) params.set('search', search);
            const res = await fetch(`${API_URL}/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch {} finally { setLoading(false); }
    };

    const changeRole = async (userId, role) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role })
            });
            if (res.ok) { notify.success('Role updated'); fetchUsers(); }
        } catch { notify.error('Failed'); }
    };

    const toggleBan = async (userId) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/ban`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) { notify.success('User updated'); fetchUsers(); }
        } catch { notify.error('Failed'); }
    };

    const viewOrders = async (userId) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/orders`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                setUserOrders(await res.json());
                setSelectedUser(users.find(u => u._id === userId));
            }
        } catch {}
    };

    const roleColors = { admin: '#E23744', staff: '#F59E0B', student: '#3B82F6', lecturer: '#8B5CF6', delivery: '#22C55E' };

    if (selectedUser) return (
        <div style={{ color: 'white' }}>
            <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to Users
            </button>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '20px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${roleColors[selectedUser.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: roleColors[selectedUser.role] }}>
                        {selectedUser.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.name}</h3>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.8rem' }}>{selectedUser.email}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', background: `${roleColors[selectedUser.role]}20`, color: roleColors[selectedUser.role], padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{selectedUser.role}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#E23744' }}>{selectedUser.orderCount}</p>
                        <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Orders</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#22C55E' }}>₹{selectedUser.totalSpent}</p>
                        <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Spent</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#F59E0B' }}>{selectedUser.loyaltyPoints || 0}</p>
                        <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Points</p>
                    </div>
                </div>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Recent Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userOrders.map(order => (
                    <div key={order._id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>#{order._id.slice(-6).toUpperCase()}</p>
                            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span style={{ color: order.status === 'completed' ? '#22C55E' : order.status === 'cancelled' ? '#EF4444' : '#F59E0B', fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>{order.status}</span>
                        <span style={{ fontWeight: 700 }}>₹{order.totalAmount}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ color: 'white' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Manage Users</h1>
            <p style={{ color: '#6B7280', margin: '0 0 1.5rem' }}>{users.length} total users</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                        placeholder="Search by name or email..."
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 10px 10px 36px', color: 'white', fontSize: '0.9rem' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {['', 'student', 'staff', 'lecturer', 'delivery', 'admin'].map(r => (
                    <button key={r} onClick={() => setRoleFilter(r)} style={{
                        padding: '6px 14px', borderRadius: '20px',
                        border: `1px solid ${roleFilter === r ? 'rgba(226,55,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        background: roleFilter === r ? 'rgba(226,55,68,0.1)' : 'transparent',
                        color: roleFilter === r ? '#E23744' : '#9CA3AF',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                    }}>{r || 'All'}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {users.map(user => (
                    <motion.div key={user._id} whileHover={{ scale: 1.01 }} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${roleColors[user.role]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: roleColors[user.role], fontSize: '0.9rem' }}>
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.75rem' }}>{user.email} · {user.orderCount} orders</p>
                        </div>
                        <select value={user.role} onChange={e => changeRole(user._id, e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 8px', color: 'white', fontSize: '0.75rem' }}>
                            {['student', 'staff', 'lecturer', 'delivery', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => toggleBan(user._id)} style={{
                            background: user.isVerified ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                            border: `1px solid ${user.isVerified ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                            color: user.isVerified ? '#EF4444' : '#22C55E',
                            padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                        }}>{user.isVerified ? 'Ban' : 'Unban'}</button>
                        <button onClick={() => viewOrders(user._id)} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}>
                            <ChevronRight size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ManageUsers;
