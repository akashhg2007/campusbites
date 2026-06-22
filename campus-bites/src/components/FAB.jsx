import React from 'react';
import { motion } from 'framer-motion';

const FAB = ({ icon, onClick, color = '#E23744', label, style = {} }) => (
    <motion.button
        onClick={onClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
            position: 'fixed', bottom: 100, right: 20, zIndex: 998,
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${color}50`,
            color: 'white', ...style
        }}
        title={label}
    >
        {icon}
    </motion.button>
);

export default FAB;
