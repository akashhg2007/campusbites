import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Mail, Lock, Phone, MapPin, CreditCard,
    Bell, Shield, LogOut, ChevronRight, Edit2,
    Save, X, Heart, Clock, Settings, HelpCircle, Star, Gift
} from 'lucide-react';
import { useLoyalty } from '../hooks/useQueries';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSelector from '../components/LanguageSelector';
import SocialShare from '../components/SocialShare';
import RecurringOrders from '../components/RecurringOrders';
import { notify } from '../components/Toast';
import { LevelBadge, AchievementList } from '../components/Gamification';
import SpendingChart from '../components/SpendingChart';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: ''
    });
    const { data: loyalty } = useLoyalty();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    const accountSections = [
        {
            title: 'Account Settings',
            items: [
                { icon: User, label: 'Edit Profile', action: () => setIsEditing(true) },
                { icon: Lock, label: 'Change Password', action: () => notify.info('Change password feature coming soon') },
                { icon: Bell, label: 'Notifications', action: () => notify.info('Notification settings coming soon') },
                { icon: Shield, label: 'Privacy & Security', action: () => notify.info('Privacy settings coming soon') }
            ]
        },
        {
            title: 'Payment & Orders',
            items: [
                { icon: CreditCard, label: 'Payment Methods', action: () => notify.info('Payment methods coming soon') },
                { icon: Clock, label: 'Order History', action: () => navigate('/dashboard/orders') },
                { icon: Heart, label: 'Favorites', action: () => notify.info('Favorites feature coming soon') }
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help Center', action: () => notify.info('Help center coming soon') },
                { icon: Settings, label: 'App Settings', action: () => notify.info('App settings coming soon') }
            ]
        }
    ];

    return (
        <div style={{ padding: '2rem 1rem 8rem 1rem', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Profile</h1>
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Manage your account and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="glass-panel" style={{
                padding: '2rem',
                borderRadius: '24px',
                marginBottom: '2rem',
                position: 'relative'
            }}>
                {/* Edit/Save Button */}
                <button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: isEditing ? '#22C55E' : 'rgba(226, 55, 68, 0.1)',
                        border: `1px solid ${isEditing ? '#22C55E' : '#E23744'}`,
                        color: isEditing ? 'white' : '#E23744',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}
                >
                    {isEditing ? (
                        <>
                            <Save size={16} /> Save
                        </>
                    ) : (
                        <>
                            <Edit2 size={16} /> Edit
                        </>
                    )}
                </button>

                {isEditing && (
                    <button
                        onClick={() => setIsEditing(false)}
                        style={{
                            position: 'absolute',
                            top: '1.5rem',
                            right: '7rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#9CA3AF',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem'
                        }}
                    >
                        <X size={16} /> Cancel
                    </button>
                )}

                {/* Avatar */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E23744 0%, #DC2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '2rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(226, 55, 68, 0.3)'
                }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Profile Info */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0.75rem',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                width: '100%',
                                marginBottom: '0.5rem'
                            }}
                        />
                    ) : (
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {user?.name || 'Guest User'}
                        </h2>
                    )}
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {user?.role || 'Student'}
                    </p>
                </div>

                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '1rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: 'rgba(226, 55, 68, 0.1)',
                            padding: '10px',
                            borderRadius: '12px'
                        }}>
                            <Mail size={20} color="#E23744" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Email</p>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            ) : (
                                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user?.email || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '1rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: 'rgba(226, 55, 68, 0.1)',
                            padding: '10px',
                            borderRadius: '12px'
                        }}>
                            <Phone size={20} color="#E23744" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Phone</p>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Add phone number"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            ) : (
                                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{formData.phone || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '1rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            background: 'rgba(226, 55, 68, 0.1)',
                            padding: '10px',
                            borderRadius: '12px'
                        }}>
                            <MapPin size={20} color="#E23744" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px' }}>Address</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Add delivery address"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            ) : (
                                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{formData.address || 'Not set'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Toggle + Language */}
            <div style={{ position: 'absolute', top: '2rem', right: '1rem', zIndex: 10, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LanguageSelector />
                <ThemeToggle />
            </div>

            {/* Loyalty Card */}
            {loyalty && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{
                    padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.05))',
                    border: '1px solid rgba(245,158,11,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(245,158,11,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <Star size={24} color="#F59E0B" fill="#F59E0B" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Loyalty Points</h3>
                            <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: 0 }}>{loyalty.totalOrders} orders completed</p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', margin: 0 }}>{loyalty.points}</p>
                            <p style={{ color: '#9CA3AF', fontSize: '0.7rem', margin: 0 }}>points</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {loyalty.rewards?.map(r => (
                            <div key={r.id} style={{ minWidth: '120px', background: loyalty.points >= r.cost ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${loyalty.points >= r.cost ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                                <Gift size={18} color={loyalty.points >= r.cost ? '#22C55E' : '#6B7280'} />
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '6px 0 2px', color: loyalty.points >= r.cost ? '#22C55E' : '#9CA3AF' }}>{r.name}</p>
                                <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>{r.cost} pts</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Level Badge */}
            <div style={{ marginBottom: '2rem' }}>
                <LevelBadge totalOrders={loyalty?.totalOrders || 0} />
            </div>

            {/* Spending Chart */}
            <div style={{ marginBottom: '2rem' }}>
                <SpendingChart />
            </div>

            {/* Achievements */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Achievements</h3>
                <AchievementList user={loyalty} />
            </div>

            {/* Account Sections */}
            {accountSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        color: '#9CA3AF'
                    }}>
                        {section.title}
                    </h3>
                    <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                        {section.items.map((item, itemIdx) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={itemIdx}
                                    onClick={item.action}
                                    style={{
                                        width: '100%',
                                        padding: '1.25rem',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: itemIdx < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        background: 'rgba(226, 55, 68, 0.1)',
                                        padding: '10px',
                                        borderRadius: '12px'
                                    }}>
                                        <Icon size={20} color="#E23744" />
                                    </div>
                                    <span style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem', fontWeight: 500 }}>
                                        {item.label}
                                    </span>
                                    <ChevronRight size={20} color="#9CA3AF" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Social Share */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#9CA3AF' }}>Share</h3>
                <SocialShare />
            </div>

            {/* Recurring Orders */}
            <div style={{ marginBottom: '2rem' }}>
                <RecurringOrders />
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '20px',
                    color: '#EF4444',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <LogOut size={20} />
                Logout
            </button>

            {/* App Version */}
            <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                color: '#6B7280',
                fontSize: '0.8rem'
            }}>
                Campus Bites v1.0.1 • 2026 Edition
            </div>
        </div>
    );
};

export default Profile;
