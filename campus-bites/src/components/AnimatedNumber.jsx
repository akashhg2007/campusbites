import React, { useEffect, useRef, useState } from 'react';

const AnimatedNumber = ({ value, duration = 600, prefix = '', suffix = '', style = {} }) => {
    const [display, setDisplay] = useState(0);
    const prevRef = useRef(0);
    const frameRef = useRef(null);

    useEffect(() => {
        const start = prevRef.current;
        const end = value;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            setDisplay(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                prevRef.current = end;
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    return <span style={style}>{prefix}{display.toLocaleString()}{suffix}</span>;
};

export default AnimatedNumber;
