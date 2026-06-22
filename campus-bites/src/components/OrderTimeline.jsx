import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Package, CheckCircle } from 'lucide-react';

const STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Clock, color: '#F59E0B' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: '#E23744' },
    { key: 'ready', label: 'Ready', icon: Package, color: '#3B82F6' },
    { key: 'completed', label: 'Completed', icon: CheckCircle, color: '#22C55E' }
];

const OrderTimeline = ({ status }) => {
    const currentIdx = STEPS.findIndex(s => s.key === status);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '8px 0' }}>
            {STEPS.map((step, idx) => {
                const active = idx <= currentIdx;
                const current = idx === currentIdx;
                const Icon = step.icon;
                return (
                    <React.Fragment key={step.key}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                width: current ? 36 : 28, height: current ? 36 : 28,
                                borderRadius: '50%',
                                background: active ? step.color : 'rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: current ? `2px solid ${step.color}` : 'none',
                                boxShadow: current ? `0 0 16px ${step.color}50` : 'none',
                                transition: 'all 0.3s ease',
                                flexShrink: 0
                            }}
                        >
                            <Icon size={current ? 16 : 12} color={active ? 'white' : '#6B7280'} />
                        </motion.div>
                        {idx < STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: 2, minWidth: 20,
                                background: idx < currentIdx ? step.color : 'rgba(255,255,255,0.08)',
                                borderRadius: 1, transition: 'background 0.5s ease'
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default OrderTimeline;
