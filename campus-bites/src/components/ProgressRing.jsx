import React from 'react';

const ProgressRing = ({ progress = 0, size = 60, strokeWidth = 4, color = '#E23744', bgColor = 'rgba(255,255,255,0.1)', children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${color}40)` }}
                />
            </svg>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children || <span style={{ fontSize: size * 0.22, fontWeight: 700, color }}>{Math.round(progress)}%</span>}
            </div>
        </div>
    );
};

export default ProgressRing;
