import React from 'react';
import { motion } from 'framer-motion';

const emptyStates = {
    cart: {
        emoji: '🛒',
        title: 'Your cart is empty',
        subtitle: 'Add some delicious food to get started!',
        animation: 'bounce'
    },
    orders: {
        emoji: '📦',
        title: 'No orders yet',
        subtitle: 'Your order history will appear here',
        animation: 'wave'
    },
    search: {
        emoji: '🔍',
        title: 'No results found',
        subtitle: 'Try a different search term',
        animation: 'shake'
    },
    error: {
        emoji: '😵',
        title: 'Something went wrong',
        subtitle: 'Please try again later',
        animation: 'shake'
    },
    loyalty: {
        emoji: '⭐',
        title: 'No points yet',
        subtitle: 'Start ordering to earn rewards!',
        animation: 'float'
    }
};

const animations = {
    bounce: {
        y: [0, -20, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    wave: {
        rotate: [0, 15, -15, 15, -15, 0],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    },
    shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
    },
    float: {
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
};

const EmptyState = ({ type = 'cart', action, actionLabel, style = {} }) => {
    const state = emptyStates[type] || emptyStates.cart;
    const anim = animations[state.animation] || animations.bounce;

    return (
        <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: 'white',
            ...style
        }}>
            <motion.div
                animate={anim}
                style={{ fontSize: '4rem', marginBottom: '1.5rem', display: 'inline-block' }}
            >
                {state.emoji}
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}
            >
                {state.title}
            </motion.h3>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ color: '#9CA3AF', fontSize: '0.95rem', marginBottom: '1.5rem' }}
            >
                {state.subtitle}
            </motion.p>

            {action && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action}
                    style={{
                        background: 'linear-gradient(135deg, #E23744, #DC2626)',
                        color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: '12px',
                        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(226,55,68,0.3)'
                    }}
                >
                    {actionLabel || 'Get Started'}
                </motion.button>
            )}
        </div>
    );
};

export default EmptyState;
