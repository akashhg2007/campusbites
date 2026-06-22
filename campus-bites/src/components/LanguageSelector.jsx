import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const LanguageSelector = ({ style = {} }) => {
    const { lang, changeLang, availableLanguages } = useI18n();
    const labels = { en: 'English', hi: 'हिन्दी' };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', ...style }}>
            <Globe size={16} color="#9CA3AF" />
            <select value={lang} onChange={e => changeLang(e.target.value)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '4px 8px', color: 'white', fontSize: '0.8rem',
                cursor: 'pointer', outline: 'none'
            }}>
                {availableLanguages.map(l => <option key={l} value={l} style={{ background: '#1C1C1E' }}>{labels[l] || l}</option>)}
            </select>
        </div>
    );
};

export default LanguageSelector;
