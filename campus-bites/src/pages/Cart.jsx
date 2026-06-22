import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Clock, ShoppingBag, ArrowRight, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UPIPayment from '../components/UPIPayment';
import GroupOrder from '../components/GroupOrder';
import SmartPickupTime from '../components/SmartPickupTime';
import AddressBook from '../components/AddressBook';
import OrderSuccess from '../components/OrderSuccess';
import SwipeableCartItem from '../components/SwipeableCartItem';
import { notify } from '../components/Toast';

import API_URL from '../apiConfig';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const [pickupTime, setPickupTime] = useState('');
    const [isDonationChecked, setIsDonationChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [orderSuccess, setOrderSuccess] = useState(null);
    const navigate = useNavigate();

    const taxAmount = Math.round(cartTotal * 0.05);
    const donationAmount = isDonationChecked ? 3 : 0;
    const finalTotal = cartTotal + taxAmount + donationAmount;

    const handleCheckout = async () => {
        if (!pickupTime) {
            notify.error('Please select a pickup time');
            return;
        }

        if (!user || !token) {
            notify.error('Please log in to place an order');
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                totalAmount: finalTotal,
                pickupTime,
                donation: donationAmount
            };

            // 1. Create Razorpay Order on server
            const razorpayRes = await fetch(`${API_URL}/api/orders/razorpay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: finalTotal })
            });

            const razorpayOrder = await razorpayRes.json();
            if (!razorpayRes.ok) throw new Error(razorpayOrder.message || 'Payment init failed');

            // 2. Open Razorpay Modal
            const options = {
                key: razorpayOrder.key_id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Campus Bites",
                description: "Canteen Order Payment",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    // 3. Verify Payment on server
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/orders/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData
                            })
                        });

                        if (verifyRes.ok) {
                            const orderData = await verifyRes.json();
                            clearCart();
                            setOrderSuccess(orderData.order);
                        } else {
                            notify.error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        notify.error('Error verifying payment');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#E23744"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Checkout error:', err);
            notify.error(err.message || 'Failed to process checkout');
        } finally {
            setLoading(false);
        }
    };

    // For lecturer: auto-set pickupTime to cabin delivery label
    const isLecturer = user?.role === 'lecturer';
    useEffect(() => {
        if (isLecturer && !pickupTime) {
            setPickupTime(`Cabin ${user?.cabinNumber || 'Delivery'}`);
        }
    }, [isLecturer, pickupTime, user?.cabinNumber]);

    const convert12to24 = (time12h) => {
        if (!time12h) return '';
        try {
            const [time, modifier] = time12h.split(' ');
            let [hours, minutes] = time.split(':');
            let h = parseInt(hours, 10);
            if (modifier === 'PM' && h !== 12) h += 12;
            if (modifier === 'AM' && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    if (cartItems.length === 0) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{
                    background: 'rgba(226, 55, 68, 0.1)',
                    padding: '2rem',
                    borderRadius: '50%',
                    marginBottom: '1.5rem'
                }}>
                    <ShoppingBag size={64} color="#E23744" opacity={0.6} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
                <p style={{ color: '#9CA3AF' }}>Looks like you haven't added any delicious food yet.</p>
                <button
                    onClick={() => navigate('/dashboard/menu')}
                    style={{
                        marginTop: '2rem',
                        background: '#E23744',
                        color: 'white',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <>
        <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Cart</h1>

            {/* Cart Items List */}
            <div style={{ marginBottom: '2rem' }}>
                {cartItems.map(item => (
                    <SwipeableCartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                    />
                ))}
            </div>

            {/* Bill Details */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Bill Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Item Total</span>
                    <span>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: '#22C55E' }}>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#9CA3AF', fontSize: '0.9rem' }}>
                    <span>Govt Taxes & Charges</span>
                    <span>₹{taxAmount}</span>
                </div>
                {isDonationChecked && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#E23744', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span>Feeding India Donation</span>
                        <span>₹{donationAmount}</span>
                    </div>
                )}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1rem',
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                }}>
                    <span>To Pay</span>
                    <span>₹{finalTotal}</span>
                </div>
            </div>

            {/* Donation Option */}
            <div style={{ marginBottom: '2rem' }}>
                <style>{`
                    @keyframes pulse-heart {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                    .donation-card {
                        position: relative;
                        overflow: hidden;
                        border-radius: 24px;
                        padding: 1.5rem;
                        background: #1C1C1E;
                        border: 1px solid rgba(226, 55, 68, 0.2);
                        transition: all 0.3s ease;
                    }
                    .donation-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, rgba(28, 28, 30, 0.85) 0%, rgba(28, 28, 30, 0.1) 100%), url('/donation.png');
                        background-size: cover;
                        background-position: center 20%;
                        filter: brightness(1.3) contrast(1.1);
                        opacity: 1;
                        pointer-events: none;
                    }
                    .donation-content {
                        position: relative;
                        z-index: 1;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .clock-face {
                        background: rgba(255, 255, 255, 0.03);
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        box-shadow: 
                            inset 0 0 40px rgba(0, 0, 0, 0.4),
                            0 15px 35px rgba(0, 0, 0, 0.5);
                    }
                    .clock-number {
                        transition: all 0.3s ease;
                        font-family: 'Inter', sans-serif;
                    }
                    .clock-hand-shadow {
                        filter: drop-shadow(0 0 8px rgba(226, 55, 68, 0.6));
                    }
                    @keyframes sweep {
                        from { transform: translateX(-50%) rotate(var(--start-deg)); }
                        to { transform: translateX(-50%) rotate(var(--end-deg)); }
                    }
                `}</style>
                <div className="donation-card" style={{
                    borderColor: isDonationChecked ? 'rgba(226, 55, 68, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                    background: isDonationChecked ? 'rgba(226, 55, 68, 0.05)' : '#1C1C1E'
                }}>
                    <div className="donation-bg"></div>
                    <div className="donation-content">
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Heart
                                    size={18}
                                    fill={isDonationChecked ? "#E23744" : "none"}
                                    color="#E23744"
                                    style={{ animation: isDonationChecked ? 'pulse-heart 1.5s infinite' : 'none' }}
                                />
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Feeding India</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', maxWidth: '80%' }}>
                                Working towards a hunger-free India. Support a meal with just ₹3.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDonationChecked(!isDonationChecked)}
                            style={{
                                background: isDonationChecked ? '#E23744' : 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isDonationChecked ? 'Added' : 'Add ₹3'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pickup Time / Cabin Delivery */}
            <div style={{ marginBottom: '2rem' }}>
                {isLecturer ? (
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(226,55,68,0.25)', background: 'rgba(226,55,68,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🚪 Cabin Delivery
                        </h3>
                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: 8 }}>Your order will be delivered to:</p>
                        <p style={{ color: '#E23744', fontWeight: 800, fontSize: '1.3rem' }}>Cabin {user?.cabinNumber}</p>
                        {user?.department && <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: 4 }}>{user.department}</p>}
                    </div>
                ) : (
                    <SmartPickupTime onSelect={setPickupTime} selectedTime={pickupTime} />
                )}

                {!isLecturer && <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '1rem', textAlign: 'center' }}>Pickup available during college hours: 07:00 AM - 07:00 PM</p>}
            </div>

            {/* Delivery Address (Students) */}
            {!isLecturer && (
                <div style={{ marginBottom: '2rem' }}>
                    <AddressBook />
                </div>
            )}

            {/* Group Ordering */}
            <div style={{ marginBottom: '2rem' }}>
                <GroupOrder />
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[{ id: 'razorpay', label: 'Razorpay', color: '#3B82F6' }, { id: 'upi', label: 'UPI Direct', color: '#8B5CF6' }].map(m => (
                        <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{
                            flex: 1, padding: '12px', borderRadius: '12px',
                            border: `2px solid ${paymentMethod === m.id ? m.color : 'rgba(255,255,255,0.1)'}`,
                            background: paymentMethod === m.id ? `${m.color}15` : 'rgba(255,255,255,0.03)',
                            color: paymentMethod === m.id ? m.color : '#9CA3AF',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                        }}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {paymentMethod === 'upi' && (
                <div style={{ marginBottom: '2rem' }}>
                    <UPIPayment amount={finalTotal} />
                </div>
            )}

            {/* Checkout Button */}
            <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    border: 'none',
                    width: '100%',
                    padding: '1.2rem',
                    borderRadius: '24px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 8px 20px rgba(226, 55, 68, 0.4)',
                    transition: 'transform 0.2s ease'
                }}
            >
                <span>{loading ? 'Processing...' : isLecturer ? `🚪 Deliver to Cabin ${user?.cabinNumber}` : 'Place Order'}</span>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '8px'
                }}>
                    <ArrowRight size={20} />
                </div>
            </button>
        </div>

        {/* Order Success Overlay */}
        {orderSuccess && (
            <OrderSuccess
                orderId={orderSuccess._id}
                onDismiss={() => { setOrderSuccess(null); navigate('/dashboard/orders'); }}
            />
        )}
        </>
    );
};

export default Cart;
