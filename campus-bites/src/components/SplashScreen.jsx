import React, { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setExit(true), 2200);
        const completeTimer = setTimeout(() => onComplete(), 3300);
        return () => { clearTimeout(timer); clearTimeout(completeTimer); };
    }, [onComplete]);

    const handleSkip = () => {
        setExit(true);
        setTimeout(() => onComplete(), 300);
    };

    return (
        <div className={`splash-screen ${exit ? 'exit' : ''}`} onClick={handleSkip} style={{ cursor: 'pointer' }}>
            <div className="splash-logo-container">
                <div className="logo-3d-block">
                    <UtensilsCrossed size={36} className="logo-icon-3d" />
                </div>
            </div>
            <div className="splash-content">
                <h1 className="splash-text">CAMPUS BITES</h1>
            </div>
            <div className="splash-tagline-wrapper">
                <p className="splash-tagline">Satisfy your hunger, faster.</p>
            </div>
        </div>
    );
};

export default SplashScreen;
