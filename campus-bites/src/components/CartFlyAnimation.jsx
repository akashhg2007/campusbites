import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CartFlyAnimation = ({ children, targetRef }) => {
    const [flies, setFlies] = useState([]);
    const idRef = useRef(0);

    const triggerFly = useCallback((fromElement, product) => {
        if (!fromElement || !targetRef?.current) return;
        const from = fromElement.getBoundingClientRect();
        const to = targetRef.current.getBoundingClientRect();

        const id = ++idRef.current;
        setFlies(prev => [...prev, {
            id,
            x: from.left + from.width / 2,
            y: from.top + from.height / 2,
            targetX: to.left + to.width / 2,
            targetY: to.top + to.height / 2,
            image: product?.image,
            name: product?.name
        }]);

        setTimeout(() => setFlies(prev => prev.filter(f => f.id !== id)), 800);
    }, [targetRef]);

    return (
        <>
            {children(triggerFly)}
            {createPortal(
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
                    {flies.map(fly => (
                        <div
                            key={fly.id}
                            style={{
                                position: 'fixed',
                                left: fly.x,
                                top: fly.y,
                                width: 40,
                                height: 40,
                                zIndex: 9999,
                                animation: 'flyToCart 0.7s cubic-bezier(0.2, 1, 0.3, 1) forwards'
                            }}
                        >
                            <style>{`
                                @keyframes flyToCart {
                                    0% { transform: scale(1); opacity: 1; }
                                    50% { transform: scale(0.6) translateY(-60px); opacity: 0.8; }
                                    100% { transform: scale(0.2) translate(${fly.targetX - fly.x}px, ${fly.targetY - fly.y}px); opacity: 0; }
                                }
                            `}</style>
                            <div style={{
                                width: 40, height: 40, borderRadius: '10px',
                                background: 'linear-gradient(135deg, #E23744, #DC2626)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(226,55,68,0.4)'
                            }}>
                                {fly.image ? <img src={fly.image} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} /> : '🛒'}
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

export default CartFlyAnimation;
