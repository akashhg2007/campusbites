import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = ({ orderId, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E23744', '#22C55E', '#F59E0B', '#3B82F6']
            });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    style={{ textAlign: 'center', padding: '2rem' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                        style={{
                            width: 100, height: 100, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 2rem',
                            boxShadow: '0 0 40px rgba(34,197,94,0.4)'
                        }}
                    >
                        <CheckCircle size={50} color="white" />
                    </motion.div>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}
                    >
                        Order Placed!
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: '#9CA3AF', fontSize: '1rem', marginBottom: '0.5rem' }}
                    >
                        Order #{orderId?.slice(-6).toUpperCase() || '---'}
                    </motion.p>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '2rem' }}
                    >
                        Your food is being prepared. We'll notify you when ready!
                    </motion.p>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        onClick={onDismiss}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'linear-gradient(135deg, #E23744, #DC2626)',
                            color: 'white', border: 'none',
                            padding: '14px 32px', borderRadius: '14px',
                            fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 8px 24px rgba(226,55,68,0.4)'
                        }}
                    >
                        Track Order <ArrowRight size={18} />
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OrderSuccess;
