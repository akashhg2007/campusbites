import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { notify } from './Toast';
import API_URL from '../apiConfig';

const FeedbackForm = ({ orderId, onSubmitted }) => {
    const { token } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!rating) return notify.error('Please select a rating');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ orderId, rating, comment })
            });
            if (res.ok) {
                notify.success('Thanks for your feedback!');
                onSubmitted?.();
            } else {
                const data = await res.json();
                notify.error(data.message || 'Failed to submit');
            }
        } catch { notify.error('Network error'); }
        finally { setSubmitting(false); }
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Rate your order</h4>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <Star size={28} fill={(hover || rating) >= star ? '#F59E0B' : 'transparent'}
                            color={(hover || rating) >= star ? '#F59E0B' : '#6B7280'} />
                    </motion.button>
                ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..."
                maxLength={500} style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px', color: 'white', fontSize: '0.85rem',
                    resize: 'vertical', minHeight: '60px', fontFamily: 'inherit'
                }} />
            <button onClick={submit} disabled={submitting} style={{
                marginTop: '8px', background: '#E23744', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
                <Send size={14} /> {submitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};

export default FeedbackForm;
