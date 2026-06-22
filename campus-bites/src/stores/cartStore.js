import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            userId: null,

            setUserId: (id) => {
                const currentId = get().userId;
                if (currentId !== id) {
                    set({ userId: id, items: [] });
                }
            },

            addToCart: (product) => {
                set((state) => {
                    const existing = state.items.find(i => i._id === product._id);
                    if (existing) {
                        return { items: state.items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i) };
                    }
                    return { items: [...state.items, { ...product, quantity: 1 }] };
                });
            },

            removeFromCart: (productId) => {
                set((state) => ({ items: state.items.filter(i => i._id !== productId) }));
            },

            updateQuantity: (productId, delta) => {
                set((state) => ({
                    items: state.items.map(i => i._id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
                }));
            },

            clearCart: () => set({ items: [] }),

            get cartTotal() {
                return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            },

            get cartCount() {
                return get().items.reduce((sum, i) => sum + i.quantity, 0);
            }
        }),
        { name: 'campusbites-cart' }
    )
);
