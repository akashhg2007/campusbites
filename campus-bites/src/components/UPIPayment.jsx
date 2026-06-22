import React, { useState } from 'react';
import { Smartphone, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const UPIPayment = ({ amount, orderId, onSuccess }) => {
    const { token } = useAuth();
    const [upiData, setUpiData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateUPILink = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/upi/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount, orderId })
            });
            const data = await res.json();
            if (res.ok) setUpiData(data);
        } catch (err) {
            console.error('UPI generation failed');
        } finally {
            setLoading(false);
        }
    };

    const copyUPI = () => {
        if (upiData?.upiUrl) {
            try { navigator.clipboard.writeText(upiData.upiUrl); } catch {}
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const openUPI = () => {
        if (upiData?.upiUrl) {
            window.location.href = upiData.upiUrl;
        }
    };

    return (
        <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <Smartphone size={20} color="#8B5CF6" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>UPI Payment</h3>
            </div>

            {!upiData ? (
                <button onClick={generateUPILink} disabled={loading} style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    opacity: loading ? 0.7 : 1
                }}>
                    {loading ? 'Generating...' : `Pay ₹${amount} via UPI`}
                </button>
            ) : (
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', wordBreak: 'break-all', flex: 1, marginRight: '8px' }}>{upiData.upiUrl}</span>
                        <button onClick={copyUPI} style={{ background: 'transparent', border: 'none', color: copied ? '#22C55E' : '#8B5CF6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                    </div>
                    <button onClick={openUPI} style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <ExternalLink size={18} /> Open UPI App
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center', marginTop: '8px' }}>
                        Works with Google Pay, PhonePe, Paytm & any UPI app
                    </p>
                </div>
            )}
        </div>
    );
};

export default UPIPayment;
