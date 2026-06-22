import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Star, Clock, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
};

const SearchBar = ({ products, onSelect, onAddToCart }) => {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [sort, setSort] = useState('relevance');
    const [recentSearches, setRecentSearches] = useState(() => {
        try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch { return []; }
    });

    const debouncedQuery = useDebounce(query, 200);

    const fuse = useMemo(() => new Fuse(products || [], {
        keys: ['name', 'description', 'category', 'tags'],
        threshold: 0.3,
        ignoreLocation: true
    }), [products]);

    const results = useMemo(() => {
        if (!debouncedQuery) return [];
        let items = fuse.search(debouncedQuery).map(r => r.item);
        items = items.filter(i => i.price >= priceRange[0] && i.price <= priceRange[1]);
        if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
        else if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
        else if (sort === 'popular') items.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        return items;
    }, [debouncedQuery, fuse, priceRange, sort]);

    const handleSearch = (q) => {
        setQuery(q);
        if (q && !recentSearches.includes(q)) {
            const updated = [q, ...recentSearches].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                    <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search food..."
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', padding: '12px 12px 12px 42px', color: 'white', fontSize: '0.95rem', outline: 'none'
                        }} />
                    {query && <button onClick={() => { setQuery(''); }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}><X size={16} /></button>}
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{
                    background: showFilters ? 'rgba(226,55,68,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${showFilters ? 'rgba(226,55,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '14px', padding: '12px', cursor: 'pointer', color: showFilters ? '#E23744' : '#9CA3AF'
                }}><ArrowUpDown size={18} /></button>
            </div>

            {!query && recentSearches.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Recent</span>
                        <button onClick={clearRecent} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.7rem' }}>Clear</button>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {recentSearches.map(s => (
                            <button key={s} onClick={() => handleSearch(s)} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px', padding: '6px 12px', color: '#9CA3AF', fontSize: '0.8rem', cursor: 'pointer'
                            }}>{s}</button>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showFilters && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginTop: '8px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Price: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    <input type="range" min={0} max={500} value={priceRange[0]} onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                                        style={{ flex: 1, accentColor: '#E23744' }} />
                                    <input type="range" min={0} max={500} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        style={{ flex: 1, accentColor: '#E23744' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[['relevance', 'Relevance'], ['price-low', 'Price ↑'], ['price-high', 'Price ↓'], ['popular', 'Popular']].map(([k, v]) => (
                                    <button key={k} onClick={() => setSort(k)} style={{
                                        padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                        border: `1px solid ${sort === k ? 'rgba(226,55,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                        background: sort === k ? 'rgba(226,55,68,0.1)' : 'transparent',
                                        color: sort === k ? '#E23744' : '#9CA3AF'
                                    }}>{v}</button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {query && results.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '4px', background: 'rgba(26,26,28,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    {results.slice(0, 8).map(item => (
                        <motion.div key={item._id} whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                            onClick={() => { onAddToCart(item); setQuery(''); }}
                            style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</p>
                                <p style={{ margin: 0, color: '#6B7280', fontSize: '0.7rem' }}>{item.category}</p>
                            </div>
                            <span style={{ fontWeight: 700, color: '#E23744', fontSize: '0.85rem' }}>₹{item.price}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {query && results.length === 0 && (
                <div style={{ marginTop: '8px', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem', padding: '1rem' }}>
                    No items found for "{query}"
                </div>
            )}
        </div>
    );
};

export default SearchBar;
