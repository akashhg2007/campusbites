import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    ShoppingCart, Star, Clock, Search, TrendingUp, Sparkles, Filter,
    Plus, ChefHat, User, Mail, Phone, MapPin, Instagram, Twitter, Mic, MicOff
} from 'lucide-react';
import API_URL from '../apiConfig';
import { useRecommendations } from '../hooks/useQueries';
import { useVoiceOrder } from '../hooks/useVoiceOrder';
import VoiceButton from '../components/VoiceButton';
import { SkeletonGrid, SkeletonProductCard } from '../components/Skeleton';
import { notify } from '../components/Toast';

const FoodCard3DPreview = React.lazy(() => import('../components/FoodCard3D'));

const CONTACT_INFO = {
    email: 'support@campusbites.com',
    phone: '+91 95358 47861',
    location: 'Main Canteen, Ground Floor, Academic Block',
    instagram: '@campus.bites',
    twitter: '@campusbites_in'
};

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('All');
    const [foodTypeFilter, setFoodTypeFilter] = useState('all'); // 'all', 'veg', 'nonveg'
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [show3D, setShow3D] = useState(false);
    const { data: recommendations } = useRecommendations();

    const handleVoiceResult = useCallback((parsed) => {
        parsed.items.forEach(({ product, quantity }) => {
            for (let i = 0; i < quantity; i++) addToCart(product);
        });
    }, [addToCart]);

    const { isListening, transcript, startListening, stopListening } = useVoiceOrder(products, handleVoiceResult);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.log('Using mock data');
                setProducts([
                    { _id: '1', name: 'Samosa', price: 20, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60', description: 'Crispy fried pastry', isBestSeller: true },
                    { _id: '2', name: 'Vada Pav', price: 25, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60', description: 'Mumbai favorite', isSpicy: true },
                    { _id: '3', name: 'Veg Sandwich', price: 40, category: 'Snacks', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60', description: 'Grilled vegetable sandwich' },
                    { _id: '4', name: 'Masala Chai', price: 15, category: 'Beverages', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60', description: 'Spiced Indian tea', isPopular: true },
                    { _id: '5', name: 'Paneer Tikka', price: 120, category: 'Snacks', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60', description: 'Grilled paneer cubes', isBestSeller: true },
                    { _id: '6', name: 'Cold Coffee', price: 45, category: 'Beverages', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60', description: 'Refreshing cold coffee' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = [
        { name: 'All', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
        { name: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop' },
        { name: 'Meals', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop' },
        { name: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop' },
        { name: 'Combos', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
        { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop' }
    ];

    const filteredProducts = products.filter(p => {
        const matchesCategory = category === 'All' || p.category === category;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFoodType = foodTypeFilter === 'all' ||
            (foodTypeFilter === 'veg' && p.isVeg === true) ||
            (foodTypeFilter === 'nonveg' && p.isVeg === false);
        return matchesCategory && matchesSearch && matchesFoodType;
    });

    const shimmerStyle = {
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
    };

    if (loading) return (
        <div style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ ...shimmerStyle, height: '200px', borderRadius: '24px', marginBottom: '2rem' }} />
            <div style={{ ...shimmerStyle, height: '48px', borderRadius: '20px', marginBottom: '2rem' }} />
            <SkeletonGrid count={6} />
        </div>
    );

    return (
        <div style={{ padding: '0 1rem 8rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .product-card {
                    animation: scaleIn 0.4s ease-out forwards;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .product-card:active {
                    transform: scale(0.95);
                }
                .category-item {
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .category-item:hover {
                    transform: translateY(-5px);
                }
            `}</style>

            {/* Header / Hero */}
            <div style={{ paddingTop: '2.5rem' }}>


                {/* Visual Hero Banner */}
                <div style={{
                    position: 'relative',
                    height: '200px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <img
                        src="/hero_food_banner.png"
                        alt="Featured Food"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '1.5rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            color: 'white',
                            marginBottom: '10px',
                            maxWidth: '220px',
                            lineHeight: '1.2'
                        }}>
                            Order your favourite food here
                        </h2>
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#9CA3AF',
                            maxWidth: '280px',
                            lineHeight: '1.4'
                        }}>
                            Delicious meals from your campus canteen, prepared fresh and delivered hot.
                        </p>
                    </div>
                </div>

                {/* Search Omni-bar */}
                <div className="glass-panel" style={{
                    borderRadius: '20px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideInUp 0.6s ease-out',
                    border: '1px solid rgba(255,255,255,0.15)',
                    marginBottom: '2rem'
                }}>
                    <Search color="#9CA3AF" size={20} />
                    <input
                        type="text"
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            width: '100%',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <div style={{ background: 'rgba(226, 55, 68, 0.15)', borderRadius: '12px', padding: '10px' }}>
                        <TrendingUp size={18} color="#E23744" />
                    </div>
                    <VoiceButton isListening={isListening} onClick={isListening ? stopListening : startListening} />
                </div>

                {isListening && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '10px 16px', marginBottom: '1.5rem', color: '#FCA5A5', fontSize: '0.85rem', textAlign: 'center' }}>
                        🎤 {transcript || 'Listening... Try "Add two samosas"'}
                    </div>
                )}

                {recommendations?.forYou?.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={16} color="#F59E0B" /> Recommended for You
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {recommendations.forYou.slice(0, 4).map((product) => (
                                <motion.div key={product._id} whileTap={{ scale: 0.95 }} style={{ minWidth: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px', cursor: 'pointer' }}
                                    onClick={() => addToCart(product)}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{product.name}</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E23744', margin: '4px 0 0 0' }}>₹{product.price}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {recommendations?.timeBased?.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} color="#3B82F6" /> Perfect for Now
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {recommendations.timeBased.map((product) => (
                                <motion.div key={product._id} whileTap={{ scale: 0.95 }} style={{ minWidth: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px', cursor: 'pointer' }}
                                    onClick={() => addToCart(product)}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{product.name}</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E23744', margin: '4px 0 0 0' }}>₹{product.price}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Aesthetic Category Selection */}
                <div style={{ marginBottom: '2.5rem', padding: '0 4px', position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-deep)', paddingTop: '8px', paddingBottom: '8px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        overflowX: 'auto',
                        padding: '0.5rem 0.2rem 1rem',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.name}
                                onClick={() => setCategory(cat.name)}
                                className="category-item"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    animation: `fadeIn 0.5s ease-out ${idx * 0.1}s forwards`,
                                    opacity: 0,
                                    minWidth: '70px'
                                }}
                            >
                                {/* Image Circle */}
                                <div style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '50%',
                                    padding: '3px',
                                    border: category === cat.name ? '3px solid #E23744' : '2px solid rgba(255,255,255,0.08)',
                                    background: category === cat.name ? 'rgba(226, 55, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: category === cat.name ? 'scale(1.1)' : 'scale(1)',
                                    boxShadow: category === cat.name ? '0 8px 15px rgba(226, 55, 68, 0.3)' : 'none',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            transition: 'all 0.5s ease',
                                            filter: category === cat.name ? 'brightness(1.1) saturate(1.1)' : 'brightness(0.8) grayscale(0.2)'
                                        }}
                                    />
                                </div>
                                {/* Text label */}
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: category === cat.name ? 800 : 500,
                                    color: category === cat.name ? '#E23744' : '#9CA3AF',
                                    transition: 'all 0.3s ease',
                                    letterSpacing: '0.2px'
                                }}>
                                    {cat.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Veg/Non-Veg Filter Buttons */}
                <style>{`
                    @keyframes pulse-glow {
                        0%, 100% { box-shadow: 0 0 15px rgba(34, 197, 94, 0.3); }
                        50% { box-shadow: 0 0 25px rgba(34, 197, 94, 0.6); }
                    }
                    @keyframes pulse-glow-red {
                        0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
                        50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
                    }
                    @keyframes bounce-in {
                        0% { transform: scale(0.8); opacity: 0; }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .food-type-btn {
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                    .food-type-btn:hover {
                        transform: translateY(-3px);
                    }
                    .food-type-btn:active {
                        transform: translateY(-1px) scale(0.98);
                    }
                `}</style>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '2rem',
                    animation: 'bounce-in 0.6s ease-out 0.2s backwards'
                }}>
                    {/* All Button */}
                    <button
                        onClick={() => setFoodTypeFilter('all')}
                        className="food-type-btn glass-panel"
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '16px',
                            border: foodTypeFilter === 'all' ? '2px solid #E23744' : '1px solid rgba(255,255,255,0.1)',
                            background: foodTypeFilter === 'all'
                                ? 'linear-gradient(135deg, rgba(226, 55, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
                                : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: foodTypeFilter === 'all' ? '#E23744' : '#9CA3AF',
                            boxShadow: foodTypeFilter === 'all' ? '0 8px 20px rgba(226, 55, 68, 0.3)' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>🍽️</span>
                        All Items
                    </button>

                    {/* Veg Button */}
                    <button
                        onClick={() => setFoodTypeFilter('veg')}
                        className="food-type-btn glass-panel"
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '16px',
                            border: foodTypeFilter === 'veg' ? '2px solid #22C55E' : '1px solid rgba(255,255,255,0.1)',
                            background: foodTypeFilter === 'veg'
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                                : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: foodTypeFilter === 'veg' ? '#22C55E' : '#9CA3AF',
                            animation: foodTypeFilter === 'veg' ? 'pulse-glow 2s infinite' : 'none'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: `2px solid ${foodTypeFilter === 'veg' ? '#22C55E' : '#9CA3AF'}`,
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: foodTypeFilter === 'veg' ? '#22C55E' : '#9CA3AF'
                            }} />
                        </div>
                        Veg Only
                    </button>

                    {/* Non-Veg Button */}
                    <button
                        onClick={() => setFoodTypeFilter('nonveg')}
                        className="food-type-btn glass-panel"
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            borderRadius: '16px',
                            border: foodTypeFilter === 'nonveg' ? '2px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            background: foodTypeFilter === 'nonveg'
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                                : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: foodTypeFilter === 'nonveg' ? '#EF4444' : '#9CA3AF',
                            animation: foodTypeFilter === 'nonveg' ? 'pulse-glow-red 2s infinite' : 'none'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: `2px solid ${foodTypeFilter === 'nonveg' ? '#EF4444' : '#9CA3AF'}`,
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white'
                        }}>
                            <div style={{
                                width: 0,
                                height: 0,
                                borderLeft: '4px solid transparent',
                                borderRight: '4px solid transparent',
                                borderBottom: `7px solid ${foodTypeFilter === 'nonveg' ? '#EF4444' : '#9CA3AF'}`
                            }} />
                        </div>
                        Non-Veg
                    </button>
                </div>

                {/* Product Grid */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Menu <Filter size={18} color="#E23744" />
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setShow3D(!show3D)} style={{
                            background: show3D ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${show3D ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: show3D ? '#A78BFA' : '#9CA3AF',
                            padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600
                        }}>
                            {show3D ? '2D' : '3D'}
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>{filteredProducts.length} items</span>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: show3D ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {show3D && filteredProducts.map((product) => (
                            <React.Suspense key={product._id} fallback={<div style={{ height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: 24 }} />}>
                                <FoodCard3DPreview
                                    product={product}
                                    onAddToCart={() => addToCart(product)}
                                />
                            </React.Suspense>
                        ))}
                    {!show3D && filteredProducts.map((product, idx) => (
                        <div
                            key={product._id}
                            className="glass-panel product-card"
                            style={{
                                borderRadius: '24px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                animationDelay: `${idx * 0.05}s`,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(20, 20, 20, 0.6)'
                            }}
                        >
                            {/* Image */}
                            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />

                                {/* Gradient Overlay */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.7))',
                                    pointerEvents: 'none'
                                }} />

                                {/* Veg/Non-Veg Badge - Top Right */}
                                <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    borderRadius: '20px',
                                    background: product.isVeg !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                    border: `1px solid ${product.isVeg !== false ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                    backdropFilter: 'blur(8px)'
                                }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: product.isVeg !== false ? '#22C55E' : '#EF4444'
                                    }} />
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: product.isVeg !== false ? '#22C55E' : '#EF4444' }}>
                                        {product.isVeg !== false ? 'VEG' : 'NON-VEG'}
                                    </span>
                                </div>

                                {/* Badges */}
                                {product.isBestSeller && (
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#F59E0B', color: 'black', padding: '3px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        Best Seller
                                    </div>
                                )}
                                {product.isSpicy && (
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EF4444', color: 'white', padding: '3px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        🌶️ Spicy
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '10px',
                                    padding: '4px 8px',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    15 min
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '0.8rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '2px', color: 'white' }}>{product.name}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '1rem', flex: 1 }}>{product.category}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>₹{product.price}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        style={{
                                            background: '#E23744',
                                            color: 'white',
                                            border: 'none',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(226, 55, 68, 0.4)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Premium High-Res Footer */}
                <footer style={{
                    marginTop: '4rem',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#18181B',
                    animation: 'fadeIn 1.2s ease-out'
                }}>
                    {/* High-Res Background Image */}
                    <div style={{
                        position: 'relative',
                        height: '240px',
                        width: '100%'
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop"
                            alt="Footer Hero"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(to bottom, transparent, #18181B)'
                        }} />

                        {/* Brand Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '0',
                            right: '0',
                            textAlign: 'center',
                            zIndex: 2
                        }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '4px' }}>
                                Campus<span style={{ color: '#E23744' }}>Bites</span>
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>Deliciously Delivered.</p>
                        </div>
                    </div>

                    {/* Contact & Info Content */}
                    <div style={{ padding: '2rem 1.5rem 3rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '1.5rem',
                            marginBottom: '2.5rem'
                        }}>
                            {/* Contact Cards */}
                            <div className="glass-panel" style={{
                                padding: '1.2rem',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ background: 'rgba(226, 55, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Mail size={20} color="#E23744" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Email Us</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{CONTACT_INFO.email}</p>
                                </div>
                            </div>

                            <div className="glass-panel" style={{
                                padding: '1.2rem',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <Phone size={20} color="#3B82F6" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Call Us</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{CONTACT_INFO.phone}</p>
                                </div>
                            </div>

                            <div className="glass-panel" style={{
                                padding: '1.2rem',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <MapPin size={20} color="#22C55E" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Location</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: '1.4' }}>{CONTACT_INFO.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Socials & Bottom */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <Instagram size={22} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                                <Twitter size={22} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                                <Star size={22} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#52525B', textAlign: 'center' }}>
                                © 2026 Campus Bites. Created with ❤️ for students.<br />
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Menu;
