import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { notify } from './Toast';
import API_URL from '../apiConfig';

const AddressBook = ({ onSelect, selectedId }) => {
    const { token } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ label: '', type: 'cabin', building: '', floor: '', roomNumber: '', landmark: '', isDefault: false });

    useEffect(() => { fetchAddresses(); }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setAddresses(await res.json());
        } catch {}
    };

    const saveAddress = async () => {
        if (!form.label) return notify.error('Label is required');
        try {
            const res = await fetch(`${API_URL}/api/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                notify.success('Address saved');
                setShowForm(false);
                setForm({ label: '', type: 'cabin', building: '', floor: '', roomNumber: '', landmark: '', isDefault: false });
                fetchAddresses();
            }
        } catch { notify.error('Failed to save'); }
    };

    const deleteAddress = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) { notify.success('Deleted'); fetchAddresses(); }
        } catch {}
    };

    const setDefault = async (id) => {
        try {
            const addr = addresses.find(a => a._id === id);
            await fetch(`${API_URL}/api/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isDefault: true })
            });
            fetchAddresses();
        } catch {}
    };

    const typeIcons = { cabin: '🚪', hostel: '🏠', library: '📚', other: '📍' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Delivery Addresses</h3>
                <button onClick={() => setShowForm(!showForm)} style={{
                    background: 'rgba(226,55,68,0.1)', border: '1px solid rgba(226,55,68,0.3)',
                    color: '#E23744', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <Plus size={14} /> Add
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
                            <input placeholder="Label (e.g., My Cabin)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'white', marginBottom: '8px', fontSize: '0.9rem' }} />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {['cabin', 'hostel', 'library', 'other'].map(t => (
                                    <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${form.type === t ? 'rgba(226,55,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        background: form.type === t ? 'rgba(226,55,68,0.1)' : 'transparent', color: form.type === t ? '#E23744' : '#9CA3AF',
                                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600
                                    }}>{typeIcons[t]} {t}</button>
                                ))}
                            </div>
                            <input placeholder="Building" value={form.building} onChange={e => setForm({ ...form, building: e.target.value })}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'white', marginBottom: '8px', fontSize: '0.9rem' }} />
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input placeholder="Floor" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '0.9rem' }} />
                                <input placeholder="Room No." value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'white', fontSize: '0.9rem' }} />
                            </div>
                            <button onClick={saveAddress} style={{
                                width: '100%', background: '#E23744', color: 'white', border: 'none',
                                padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600
                            }}>Save Address</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {addresses.map(addr => (
                    <motion.div key={addr._id} whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect?.(addr)}
                        style={{
                            background: selectedId === addr._id ? 'rgba(226,55,68,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${selectedId === addr._id ? 'rgba(226,55,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '14px', padding: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                        <span style={{ fontSize: '1.2rem' }}>{typeIcons[addr.type]}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{addr.label}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                {[addr.building, addr.floor && `Floor ${addr.floor}`, addr.roomNumber && `Room ${addr.roomNumber}`].filter(Boolean).join(' · ') || addr.type}
                            </div>
                        </div>
                        {addr.isDefault && <span style={{ fontSize: '0.65rem', background: 'rgba(34,197,94,0.15)', color: '#22C55E', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>DEFAULT</span>}
                        <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr._id); }} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={14} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AddressBook;
