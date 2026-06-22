import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BottomSheet = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)', zIndex: 1000
                    }}
                />
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
                    style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        background: 'rgba(26,26,28,0.98)', backdropFilter: 'blur(20px)',
                        borderRadius: '28px 28px 0 0',
                        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
                        maxHeight: '85vh', overflowY: 'auto',
                        zIndex: 1001,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 16px' }} />
                    {title && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h3>
                            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#9CA3AF' }}>
                                <X size={18} />
                            </button>
                        </div>
                    )}
                    {children}
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

export default BottomSheet;
