import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from 'lucide-react';

const AddToCartButton = ({ onAdd, size = 36, style = {} }) => {
    const [state, setState] = useState('idle'); // idle, adding, added

    const handleClick = (e) => {
        e.stopPropagation();
        if (state === 'adding') return;
        setState('adding');
        onAdd();
        setTimeout(() => {
            setState('added');
            setTimeout(() => setState('idle'), 800);
        }, 200);
    };

    return (
        <motion.button
            onClick={handleClick}
            animate={
                state === 'adding' ? { scale: 0.85 } :
                state === 'added' ? { scale: [1, 1.2, 1] } :
                { scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            whileHover={state === 'idle' ? { scale: 1.1 } : {}}
            style={{
                width: size,
                height: size,
                borderRadius: state === 'added' ? '50%' : '12px',
                background: state === 'added'
                    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                    : 'linear-gradient(135deg, #E23744, #DC2626)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: state === 'added'
                    ? '0 4px 15px rgba(34,197,94,0.4)'
                    : '0 4px 15px rgba(226,55,68,0.4)',
                transition: 'border-radius 0.3s ease, box-shadow 0.3s ease',
                ...style
            }}
        >
            <AnimatePresence mode="wait">
                {state === 'added' ? (
                    <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                        <Check size={size * 0.55} strokeWidth={3} />
                    </motion.div>
                ) : (
                    <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Plus size={size * 0.55} strokeWidth={3} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default AddToCartButton;
