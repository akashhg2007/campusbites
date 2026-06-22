import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
    const burst = useCallback((options = {}) => {
        const defaults = {
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#E23744', '#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'],
            ...options
        };
        confetti(defaults);
    }, []);

    const celebrate = useCallback(() => {
        burst({ particleCount: 100, spread: 100 });
        setTimeout(() => burst({ particleCount: 60, spread: 80, origin: { x: 0.3 } }), 200);
        setTimeout(() => burst({ particleCount: 60, spread: 80, origin: { x: 0.7 } }), 400);
    }, [burst]);

    return { burst, celebrate };
};
