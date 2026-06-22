import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Clock, Bell, ArrowRight, ChevronRight } from 'lucide-react';

const slides = [
    { icon: '🍔', title: 'Welcome to Campus Bites', desc: 'Order your favorite canteen food from your phone. No more waiting in lines!', color: '#E23744' },
    { icon: '⏰', title: 'Set Your Pickup Time', desc: 'Choose when you want to pick up your order. Food ready when you are.', color: '#F59E0B' },
    { icon: '🔔', title: 'Get Notified', desc: 'Real-time updates on your order status. Know exactly when your food is ready.', color: '#3B82F6' },
    { icon: '🎉', title: 'Earn Rewards', desc: 'Collect loyalty points with every order. Redeem for free food!', color: '#22C55E' }
];

const Onboarding = ({ onComplete }) => {
    const [current, setCurrent] = useState(0);

    const next = () => {
        if (current < slides.length - 1) setCurrent(current + 1);
        else {
            localStorage.setItem('campusbites-onboarded', 'true');
            onComplete();
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#0D0D0D', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <AnimatePresence mode="wait">
                <motion.div key={current}
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                    style={{ textAlign: 'center', maxWidth: '360px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>{slides[current].icon}</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: slides[current].color }}>
                        {slides[current].title}
                    </h2>
                    <p style={{ color: '#9CA3AF', fontSize: '0.95rem', lineHeight: 1.6 }}>{slides[current].desc}</p>
                </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
                {slides.map((_, i) => (
                    <div key={i} style={{
                        width: i === current ? 24 : 8, height: 8, borderRadius: 4,
                        background: i === current ? slides[current].color : 'rgba(255,255,255,0.15)',
                        transition: 'all 0.3s ease'
                    }} />
                ))}
            </div>

            <button onClick={next} style={{
                marginTop: '2rem', background: slides[current].color, color: 'white', border: 'none',
                padding: '14px 32px', borderRadius: '14px', fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: `0 8px 24px ${slides[current].color}40`
            }}>
                {current < slides.length - 1 ? <><ChevronRight size={20} /> Next</> : <><ArrowRight size={20} /> Get Started</>}
            </button>

            {current < slides.length - 1 && (
                <button onClick={() => { localStorage.setItem('campusbites-onboarded', 'true'); onComplete(); }}
                    style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Skip
                </button>
            )}
        </div>
    );
};

export default Onboarding;
