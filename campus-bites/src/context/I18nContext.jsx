import React, { createContext, useContext, useState } from 'react';

const translations = {
    en: {
        menu: 'Menu', cart: 'Cart', orders: 'Orders', profile: 'Profile',
        search: 'Search for food...', addToCart: 'Add to Cart', placeOrder: 'Place Order',
        pickupTime: 'Select Pickup Time', total: 'Total', subtotal: 'Subtotal',
        tax: 'Tax', delivery: 'Delivery', free: 'Free', emptyCart: 'Your Cart is Empty',
        browseMenu: 'Browse Menu', orderPlaced: 'Order placed successfully!',
        preparing: 'Preparing', ready: 'Ready', completed: 'Completed',
        pending: 'Order Placed', cancelled: 'Cancelled', reorder: 'Reorder',
        logout: 'Logout', login: 'Sign In', register: 'Create Account',
        email: 'Email Address', password: 'Password', name: 'Full Name',
        forgotPassword: 'Forgot Password?', welcome: 'Welcome to Campus Bites',
        loyaltyPoints: 'Loyalty Points', level: 'Level', streak: 'streak',
        offline: 'You\'re offline — showing cached data'
    },
    hi: {
        menu: 'मेन्यू', cart: 'कार्ट', orders: 'ऑर्डर', profile: 'प्रोफ़ाइल',
        search: 'खाना खोजें...', addToCart: 'कार्ट में डालें', placeOrder: 'ऑर्डर करें',
        pickupTime: 'पिकअप समय चुनें', total: 'कुल', subtotal: 'उप-कुल',
        tax: 'कर', delivery: 'डिलीवरी', free: 'मुफ़्त', emptyCart: 'आपकी कार्ट खाली है',
        browseMenu: 'मेन्यू देखें', orderPlaced: 'ऑर्डर सफलतापूर्वक दिया गया!',
        preparing: 'बन रहा है', ready: 'तैयार', completed: 'पूरा हुआ',
        pending: 'ऑर्डर दिया गया', cancelled: 'रद्द', reorder: 'फिर से ऑर्डर करें',
        logout: 'लॉग आउट', login: 'साइन इन', register: 'खाता बनाएं',
        email: 'ईमेल', password: 'पासवर्ड', name: 'पूरा नाम',
        forgotPassword: 'पासवर्ड भूल गए?', welcome: 'कैंपस बाइट्स में आपका स्वागत है',
        loyaltyPoints: 'लॉयल्टी पॉइंट्स', level: 'स्तर', streak: 'लगातार',
        offline: 'आप ऑफ़लाइन हैं — कैश्ड डेटा दिखा रहे हैं'
    }
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('campusbites-lang') || 'en');

    const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

    const changeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem('campusbites-lang', newLang);
    };

    return (
        <I18nContext.Provider value={{ lang, t, changeLang, availableLanguages: Object.keys(translations) }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => useContext(I18nContext);
