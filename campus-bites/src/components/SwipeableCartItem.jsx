import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';

const SwipeableCartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const [offset, setOffset] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const itemRef = useRef(null);

    const handlers = useSwipeable({
        onSwiping: (e) => {
            setSwiping(true);
            setOffset(Math.max(-100, Math.min(0, e.deltaX)));
        },
        onSwipedLeft: () => {
            if (offset < -60) onRemove(item._id);
            setOffset(0);
            setSwiping(false);
        },
        onSwiped: () => { setOffset(0); setSwiping(false); },
        trackMouse: true,
        trackTouch: true,
        delta: 10
    });

    return (
        <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '20px', overflow: 'hidden' }}>
            {/* Delete background */}
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 80,
                background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: offset < -20 ? 1 : 0, transition: 'opacity 0.2s',
                borderRadius: '0 20px 20px 0'
            }}>
                <Trash2 size={20} color="#EF4444" />
            </div>

            {/* Swipeable content */}
            <motion.div
                {...handlers}
                ref={itemRef}
                animate={{ x: offset }}
                transition={swiping ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    position: 'relative', zIndex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    touchAction: 'pan-y'
                }}
            >
                {/* Image */}
                <div style={{ width: 60, height: 60, borderRadius: '12px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        border: `1.5px solid ${item.isVeg !== false ? '#22C55E' : '#EF4444'}`,
                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.isVeg !== false ? '#22C55E' : '#EF4444' }} />
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '2px 0 0' }}>₹{item.price * item.quantity}</p>
                </div>

                {/* Quantity Controls */}
                <div style={{ background: '#27272A', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '4px', flexShrink: 0 }}>
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => item.quantity > 1 ? onUpdateQuantity(item._id, -1) : onRemove(item._id)}
                        style={{ background: 'transparent', border: 'none', color: '#E23744', padding: '6px', cursor: 'pointer' }}
                    >
                        <Minus size={16} />
                    </motion.button>
                    <span style={{ margin: '0 8px', fontWeight: 600, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onUpdateQuantity(item._id, 1)}
                        style={{ background: 'transparent', border: 'none', color: '#E23744', padding: '6px', cursor: 'pointer' }}
                    >
                        <Plus size={16} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default SwipeableCartItem;
