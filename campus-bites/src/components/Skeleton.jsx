import React, { useEffect } from 'react';

const shimmer = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '12px'
};

const SkeletonStyles = () => {
    useEffect(() => {
        if (typeof document !== 'undefined' && !document.querySelector('#skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
            document.head.appendChild(style);
        }
    }, []);
    return null;
};

export const SkeletonCard = () => (
    <div style={{ ...shimmer, height: '240px', borderRadius: '24px' }} />
);

export const SkeletonText = ({ width = '100%', height = '16px', style: s = {} }) => (
    <div style={{ ...shimmer, width, height, ...s }} />
);

export const SkeletonCircle = ({ size = 40 }) => (
    <div style={{ ...shimmer, width: size, height: size, borderRadius: '50%' }} />
);

export const SkeletonProductCard = () => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ ...shimmer, height: '140px', borderRadius: 0 }} />
        <div style={{ padding: '12px' }}>
            <SkeletonText width="70%" height="14px" style={{ marginBottom: '8px' }} />
            <SkeletonText width="40%" height="12px" style={{ marginBottom: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonText width="30%" height="18px" />
                <div style={{ ...shimmer, width: '36px', height: '36px', borderRadius: '12px' }} />
            </div>
        </div>
    </div>
);

export const SkeletonOrderCard = () => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
                <SkeletonText width="120px" height="14px" style={{ marginBottom: '8px' }} />
                <SkeletonText width="80px" height="10px" />
            </div>
            <div style={{ ...shimmer, width: '60px', height: '24px', borderRadius: '20px' }} />
        </div>
        <div style={{ ...shimmer, height: '4px', borderRadius: '2px', marginBottom: '12px' }} />
        <SkeletonText width="100%" height="12px" style={{ marginBottom: '6px' }} />
        <SkeletonText width="60%" height="12px" />
    </div>
);

export const SkeletonProfile = () => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <SkeletonCircle size={80} />
        </div>
        <SkeletonText width="40%" height="18px" style={{ margin: '0 auto 8px' }} />
        <SkeletonText width="25%" height="12px" style={{ margin: '0 auto 20px' }} />
        <SkeletonText width="100%" height="48px" style={{ marginBottom: '8px', borderRadius: '16px' }} />
        <SkeletonText width="100%" height="48px" style={{ borderRadius: '16px' }} />
    </div>
);

export const SkeletonGrid = ({ count = 6, Component = SkeletonProductCard }) => (
    <>
        <SkeletonStyles />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {Array.from({ length: count }).map((_, i) => <Component key={i} />)}
        </div>
    </>
);
