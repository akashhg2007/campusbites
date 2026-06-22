import React from 'react';
import { Share2 } from 'lucide-react';

const shareToWhatsApp = (text, url) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
};

const shareToInstagram = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied! Paste it in your Instagram story.');
};

const shareNative = async (title, text, url) => {
    if (navigator.share) {
        try { await navigator.share({ title, text, url }); } catch {}
    } else {
        navigator.clipboard.writeText(url);
    }
};

const SocialShare = ({ title = 'Check out Campus Bites!', text = 'Order food from your college canteen', url = window.location.href }) => (
    <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => shareToWhatsApp(text, url)} style={{
            background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
            color: '#25D366', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
        }}>WhatsApp</button>
        <button onClick={shareNative.bind(null, title, text, url)} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#9CA3AF', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
        }}><Share2 size={14} /> Share</button>
    </div>
);

export default SocialShare;
export { shareToWhatsApp, shareToInstagram, shareNative };
