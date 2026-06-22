import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceButton = ({ isListening, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: isListening
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : 'rgba(255,255,255,0.05)',
            border: `2px solid ${isListening ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isListening ? 'white' : '#9CA3AF',
            transition: 'all 0.3s ease',
            animation: isListening ? 'pulse-mic 1.5s infinite' : 'none',
            boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.5)' : 'none'
        }}
        title="Voice Order"
    >
        {isListening ? <Mic size={22} /> : <MicOff size={22} />}
        <style>{`
            @keyframes pulse-mic {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
            }
        `}</style>
    </button>
);

export default VoiceButton;
