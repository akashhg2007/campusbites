import React, { useState, useEffect } from 'react';
import { Users, Plus, Copy, CheckCircle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import API_URL from '../apiConfig';

const GroupOrder = ({ onAddItems }) => {
    const { token, user } = useAuth();
    const [group, setGroup] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useSocket('group-updated', (data) => setGroup(data));

    const createGroup = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/groups/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setGroup(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const joinGroup = async () => {
        if (!joinCode) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code: joinCode })
            });
            const data = await res.json();
            if (res.ok) setGroup(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const copyCode = () => {
        if (group?.code) {
            try { navigator.clipboard.writeText(group.code); } catch {}
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const totalItems = group?.members?.reduce((sum, m) => sum + m.items.length, 0) || 0;

    return (
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Users size={20} color="#3B82F6" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Group Order</h3>
            </div>

            {!group ? (
                <div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Order together with friends and split the bill
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <button onClick={createGroup} disabled={loading} style={{
                            flex: 1, background: '#3B82F6', color: 'white', border: 'none',
                            padding: '10px', borderRadius: '10px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                            <Plus size={16} /> Create Group
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            maxLength={6}
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '10px', color: 'white', fontSize: '0.9rem',
                                textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center'
                            }}
                        />
                        <button onClick={joinGroup} disabled={loading || !joinCode} style={{
                            background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
                            color: '#93C5FD', padding: '10px 16px', borderRadius: '10px',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                        }}>
                            Join
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Share Code</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6', margin: 0, letterSpacing: '4px' }}>{group.code}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={copyCode} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: copied ? '#22C55E' : '#9CA3AF' }}>
                                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '8px' }}>
                        {group.members?.length || 0} members · {totalItems} items
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {group.members?.map((m, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {m.name} {m.userId === user?.id && '(You)'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{m.items.length} items</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupOrder;
