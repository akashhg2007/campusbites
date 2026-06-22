import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const LEVELS = [
    { name: 'Bronze', min: 0, color: '#CD7F32', emoji: '🥉' },
    { name: 'Silver', min: 10, color: '#C0C0C0', emoji: '🥈' },
    { name: 'Gold', min: 50, color: '#FFD700', emoji: '🥇' },
    { name: 'Platinum', min: 100, color: '#E5E4E2', emoji: '💎' }
];

export const getLevel = (totalOrders) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalOrders >= LEVELS[i].min) return { ...LEVELS[i], index: i };
    }
    return { ...LEVELS[0], index: 0 };
};

export const LevelBadge = ({ totalOrders = 0, size = 'normal' }) => {
    const level = getLevel(totalOrders);
    const nextLevel = LEVELS[level.index + 1];
    const progress = nextLevel
        ? ((totalOrders - level.min) / (nextLevel.min - level.min)) * 100
        : 100;

    if (size === 'small') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: `${level.color}20`, border: `1px solid ${level.color}40`,
                borderRadius: 20, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700,
                color: level.color
            }}>
                {level.emoji} {level.name}
            </span>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: `linear-gradient(135deg, ${level.color}15, ${level.color}08)`,
                border: `1px solid ${level.color}30`,
                borderRadius: '20px', padding: '16px',
                display: 'flex', alignItems: 'center', gap: '14px'
            }}
        >
            <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `${level.color}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', border: `2px solid ${level.color}40`
            }}>
                {level.emoji}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: level.color, fontSize: '0.95rem' }}>{level.name} Member</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        <AnimatedNumber value={totalOrders} /> orders
                    </span>
                </div>
                {nextLevel && (
                    <div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', background: level.color, borderRadius: 2 }}
                            />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 4, display: 'block' }}>
                            {nextLevel.min - totalOrders} more orders to {nextLevel.name}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const StreakCounter = ({ streak = 0 }) => {
    if (streak < 2) return null;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 20, padding: '6px 14px',
                fontSize: '0.85rem', fontWeight: 700
            }}
        >
            <span style={{ animation: 'pulse-flame 1.5s infinite' }}>🔥</span>
            <span style={{ color: '#F59E0B' }}>{streak}-day streak!</span>
            <style>{`@keyframes pulse-flame { 0%,100%{transform:scale(1)}50%{transform:scale(1.3)} }`}</style>
        </motion.div>
    );
};

const ACHIEVEMENTS = [
    { id: 'first_order', name: 'First Bite!', icon: '🎉', condition: (u) => u.totalOrders >= 1 },
    { id: 'regular', name: 'Regular', icon: '⭐', condition: (u) => u.totalOrders >= 10 },
    { id: 'loyal', name: 'Loyal Customer', icon: '❤️', condition: (u) => u.totalOrders >= 25 },
    { id: 'legend', name: 'Campus Legend', icon: '👑', condition: (u) => u.totalOrders >= 50 },
    { id: 'chai_lover', name: 'Chai Lover', icon: '☕', condition: () => false },
    { id: 'big_spender', name: 'Big Spender', icon: '💰', condition: (u) => u.loyaltyPoints >= 500 },
];

export const AchievementList = ({ user }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {ACHIEVEMENTS.map(a => {
            const unlocked = a.condition(user || {});
            return (
                <motion.div
                    key={a.id}
                    whileHover={{ scale: 1.05 }}
                    style={{
                        background: unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: '16px', padding: '14px 10px',
                        textAlign: 'center', opacity: unlocked ? 1 : 0.4,
                        filter: unlocked ? 'none' : 'grayscale(1)'
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{a.icon}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: unlocked ? 'white' : '#6B7280' }}>{a.name}</div>
                </motion.div>
            );
        })}
    </div>
);
