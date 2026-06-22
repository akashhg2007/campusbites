import React from 'react';
import Lottie from 'lottie-react';

const emptyCartAnim = { v: "5.5.7", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "Empty", ddd: 0, assets: [], layers: [{ ddd: 0, ind: 1, ty: 4, nm: "Bag", sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [0], e: [10] }, { t: 30, s: [10], e: [0] }, { t: 60, s: [0] }] }, p: { a: 0, k: [100, 110, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } }, ao: 0, shapes: [{ ty: "gr", it: [{ ty: "rc", d: 1, s: { a: 0, k: [60, 70] }, p: { a: 0, k: [0, 5] }, r: { a: 0, k: 8 } }, { ty: "fl", c: { a: 0, k: [0.886, 0.216, 0.267, 1] } }, { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }], ip: 0, op: 60, st: 0 }] };

const checkAnim = { v: "5.5.7", fr: 30, ip: 0, op: 45, w: 100, h: 100, nm: "Check", ddd: 0, assets: [], layers: [{ ddd: 0, ind: 1, ty: 4, nm: "Circle", sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [100, 100, 100] }, { t: 15, s: [100, 100, 100] }] } }, ao: 0, shapes: [{ ty: "el", s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } }, { ty: "fl", c: { a: 0, k: [0.133, 0.773, 0.369, 1] } }], ip: 0, op: 45, st: 0 }] };

export const EmptyCartAnimation = ({ size = 150 }) => (
    <div style={{ width: size, height: size, opacity: 0.6 }}>
        <Lottie animationData={emptyCartAnim} loop={true} />
    </div>
);

export const SuccessAnimation = ({ size = 100 }) => (
    <div style={{ width: size, height: size }}>
        <Lottie animationData={checkAnim} loop={false} />
    </div>
);

export const LoadingDots = () => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#E23744',
                animation: `bounce-dot 1.4s ${i * 0.16}s infinite ease-in-out both`
            }} />
        ))}
        <style>{`@keyframes bounce-dot { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }`}</style>
    </div>
);
