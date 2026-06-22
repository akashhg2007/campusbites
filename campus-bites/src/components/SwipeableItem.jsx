import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const SwipeableItem = ({ children, onDelete, onReorder, deleteLabel = 'Delete', reorderLabel = 'Reorder' }) => {
    const [offset, setOffset] = useState(0);
    const [swiping, setSwiping] = useState(false);

    const handlers = useSwipeable({
        onSwiping: (e) => {
            setSwiping(true);
            setOffset(Math.max(-120, Math.min(120, e.deltaX)));
        },
        onSwipedLeft: () => {
            if (offset < -80 && onDelete) onDelete();
            setOffset(0); setSwiping(false);
        },
        onSwipedRight: () => {
            if (offset > 80 && onReorder) onReorder();
            setOffset(0); setSwiping(false);
        },
        onSwiped: () => { setOffset(0); setSwiping(false); },
        trackMouse: true, trackTouch: true, delta: 10
    });

    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24 }}>
            {onDelete && (
                <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 100,
                    background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: offset < -20 ? 1 : 0, transition: 'opacity 0.2s'
                }}>
                    <Trash2 size={20} color="#EF4444" />
                </div>
            )}
            {onReorder && (
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 100,
                    background: 'linear-gradient(270deg, transparent, rgba(34,197,94,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: offset > 20 ? 1 : 0, transition: 'opacity 0.2s'
                }}>
                    <RefreshCw size={20} color="#22C55E" />
                </div>
            )}
            <motion.div
                {...handlers}
                animate={{ x: offset }}
                transition={swiping ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
                style={{ position: 'relative', zIndex: 1, touchAction: 'pan-y' }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SwipeableItem;
