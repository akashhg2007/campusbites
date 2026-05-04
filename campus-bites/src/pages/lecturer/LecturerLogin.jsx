import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const LecturerLogin = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', cabinNumber: '', department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const departments = [
        'Computer Science', 'Electronics', 'Mechanical', 'Civil',
        'Mathematics', 'Physics', 'Chemistry', 'Management', 'Other'
    ];

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'login'
                ? `${API_URL}/api/auth/lecturer/login`
                : `${API_URL}/api/auth/lecturer/register`;

            const body = mode === 'login'
                ? { email: formData.email, password: formData.password }
                : formData;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/lecturer/menu');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Server connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '20px'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .lec-input {
                    width: 100%;
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: white;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                }
                .lec-input:focus {
                    border-color: #a78bfa;
                    background: rgba(167,139,250,0.1);
                    box-shadow: 0 0 0 3px rgba(167,139,250,0.15);
                }
                .lec-input::placeholder { color: rgba(255,255,255,0.4); }
                .lec-input option { background: #1e1b4b; color: white; }
                .lec-btn {
                    width: 100%;
                    padding: 15px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #7c3aed, #a78bfa);
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.3px;
                }
                .lec-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(124,58,237,0.4);
                }
                .lec-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.5);
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                }
                .tab-btn.active {
                    color: #a78bfa;
                    border-bottom-color: #a78bfa;
                }
                .spin { animation: spin 1s linear infinite; display: inline-block; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.1))',
                    padding: '36px 32px 24px',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{
                        width: 64, height: 64,
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        borderRadius: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 28,
                        boxShadow: '0 8px 24px rgba(124,58,237,0.4)'
                    }}>🎓</div>
                    <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
                        Lecturer Portal
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        Campus Bites — Faculty Food Ordering
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
                        Sign In
                    </button>
                    <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10, padding: '12px 16px',
                            color: '#fca5a5', fontSize: 14, marginBottom: 20
                        }}>{error}</div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {mode === 'register' && (
                            <input
                                className="lec-input"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        )}

                        <input
                            className="lec-input"
                            name="email"
                            type="email"
                            placeholder="Institutional Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="lec-input"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {mode === 'register' && (
                            <>
                                <input
                                    className="lec-input"
                                    name="cabinNumber"
                                    placeholder="Cabin Number (e.g. C-204, Room 12)"
                                    value={formData.cabinNumber}
                                    onChange={handleChange}
                                    required
                                />
                                <select
                                    className="lec-input"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        <button className="lec-btn" type="submit" disabled={loading}>
                            {loading
                                ? <span className="spin">⏳</span>
                                : mode === 'login' ? 'Sign In to Portal' : 'Create Account'
                            }
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>
                            ← Back to Student Login
                        </Link>
                    </div>

                    {mode === 'login' && (
                        <div style={{
                            marginTop: 20, padding: '14px 16px',
                            background: 'rgba(167,139,250,0.08)',
                            borderRadius: 10,
                            border: '1px solid rgba(167,139,250,0.2)'
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>
                                🏠 Orders will be delivered directly to your registered cabin number
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LecturerLogin;
