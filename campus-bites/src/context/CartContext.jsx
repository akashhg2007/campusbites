import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const store = useCartStore();

    useEffect(() => {
        if (user?.id) store.setUserId(user.id);
    }, [user?.id]);

    const cartTotal = useMemo(() => store.items.reduce((sum, i) => sum + i.price * i.quantity, 0), [store.items]);
    const cartCount = useMemo(() => store.items.reduce((sum, i) => sum + i.quantity, 0), [store.items]);

    return (
        <CartContext.Provider value={{
            cartItems: store.items,
            addToCart: store.addToCart,
            removeFromCart: store.removeFromCart,
            updateQuantity: store.updateQuantity,
            clearCart: store.clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
