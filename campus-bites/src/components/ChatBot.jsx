import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! I\'m Campus Bites Bot. Ask me about our menu, orders, or anything else!' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEnd = useRef();
    const { user } = useAuth();

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const getResponse = async (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('menu') || lower.includes('food') || lower.includes('order')) {
            const res = await fetch(`${API_URL}/api/products`);
            if (res.ok) {
                const products = await res.json();
                const list = products.slice(0, 5).map(p => `${p.name} - ₹${p.price}`).join('\n');
                return `Here are our popular items:\n${list}\n\nCheck out the full menu in the Menu tab!`;
            }
            return 'You can browse our full menu in the Menu tab. We have Snacks, Meals, and Beverages!';
        }
        if (lower.includes('status') || lower.includes('track')) return user ? 'Go to Orders tab to track your order status in real-time!' : 'Please log in to check your order status.';
        if (lower.includes('loyalty') || lower.includes('points') || lower.includes('reward')) return 'Earn 1 point for every ₹10 spent! Redeem rewards at: Free Chai (100pts), Free Samosa (150pts), ₹50 Off (200pts).';
        if (lower.includes('payment') || lower.includes('pay') || lower.includes('upi')) return 'We accept Razorpay (cards, wallets, UPI) and direct UPI payments. Choose your preferred method at checkout!';
        if (lower.includes('delivery') || lower.includes('pickup')) return 'Pickup orders are ready at the canteen. Lecturers get cabin delivery! Select your pickup time during checkout.';
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return `Hello${user ? ', ' + user.name : ''}! How can I help you today?`;
        if (lower.includes('help') || lower.includes('support')) return 'I can help with:\n• Menu & food items\n• Order tracking\n• Payment methods\n• Loyalty points\n• Delivery options\n\nWhat would you like to know?';
        if (lower.includes('thank')) return 'You\'re welcome! Enjoy your meal! 🍔';
        return 'I\'m not sure I understand. Try asking about:\n• Menu items\n• Order status\n• Payments\n• Loyalty points\n• Delivery options';
    };

    const send = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setTimeout(async () => {
            const response = await getResponse(input);
            setMessages(prev => [...prev, { role: 'bot', text: response }]);
            setLoading(false);
        }, 600);
    };

    return (
        <>
            <motion.button onClick={() => setOpen(!open)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed', bottom: 100, left: 20, zIndex: 1000,
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E23744, #DC2626)',
                    border: 'none', cursor: 'pointer', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(226,55,68,0.4)'
                }}>
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            position: 'fixed', bottom: 160, left: 20, zIndex: 999,
                            width: 320, height: 420, background: 'rgba(26,26,28,0.98)', backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #E23744, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Campus Bites Bot</p>
                                <p style={{ margin: 0, color: '#22C55E', fontSize: '0.7rem' }}>Online</p>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    animation: 'slideInUp 0.3s ease-out'
                                }}>
                                    <div style={{
                                        maxWidth: '80%', padding: '10px 14px', borderRadius: '14px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #E23744, #DC2626)' : 'rgba(255,255,255,0.05)',
                                        color: 'white', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-line'
                                    }}>
                                        {msg.role === 'bot' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '0.7rem', color: '#E23744', fontWeight: 700 }}>🤖 Bot</div>}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', width: 'fit-content' }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B7280', animation: `bounce-dot 1.4s ${i * 0.16}s infinite ease-in-out both` }} />)}
                                    <style>{`@keyframes bounce-dot { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }`}</style>
                                </div>
                            )}
                            <div ref={messagesEnd} />
                        </div>

                        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
                            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                                placeholder="Ask me anything..." style={{
                                    flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', padding: '10px 12px', color: 'white', fontSize: '0.85rem', outline: 'none'
                                }} />
                            <button onClick={send} disabled={loading} style={{
                                background: '#E23744', border: 'none', borderRadius: '12px',
                                width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}><Send size={16} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
