import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

const CartBadgePulse = forwardRef(({ count }, ref) => {
    const [pulse, setPulse] = useState(false);
    const [floating, setFloating] = useState(false);
    const prevCount = useRef(0);

    useEffect(() => {
        if (count > prevCount.current) {
            setPulse(true);
            setFloating(true);
            setTimeout(() => setPulse(false), 400);
            setTimeout(() => setFloating(false), 800);
        }
        prevCount.current = count;
    }, [count]);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
            <motion.div
                animate={pulse ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <ShoppingBag size={24} />
            </motion.div>

            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: '#E23744',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            minWidth: 16,
                            height: 16,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #1C1C1E'
                        }}
                    >
                        {count}
                    </motion.span>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {floating && (
                    <motion.span
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -30, scale: 0.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            position: 'absolute',
                            top: -20,
                            right: -10,
                            background: '#22C55E',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                        }}
                    >
                        +1
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
});

export default CartBadgePulse;
