import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const CSVUpload = ({ onSuccess }) => {
    const { token } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const inputRef = useRef();

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/upload/bulk-csv`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            setResult(data);
            if (res.ok && onSuccess) onSuccess();
        } catch (err) {
            setResult({ message: 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#3B82F6" /> Bulk Import (CSV)
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
                CSV columns: name, price, category, description, image, isVeg, prepTimeMinutes, tags
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                />
                <button
                    onClick={() => inputRef.current?.click()}
                    style={{
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: '#93C5FD',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Upload size={16} /> Choose File
                </button>
                {file && <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{file.name}</span>}
                {file && (
                    <button onClick={handleUpload} disabled={uploading} style={{
                        background: uploading ? '#6B7280' : '#3B82F6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        {uploading ? 'Uploading...' : 'Import'}
                    </button>
                )}
                {file && !uploading && (
                    <button onClick={() => { setFile(null); setResult(null); }} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {result && (
                <div style={{
                    background: result.errors?.length ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                    border: `1px solid ${result.errors?.length ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                }}>
                    {result.errors?.length ? <AlertCircle size={18} color="#F59E0B" /> : <CheckCircle size={18} color="#22C55E" />}
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{result.message}</p>
                        {result.errors?.length > 0 && (
                            <ul style={{ margin: '8px 0 0', paddingLeft: '16px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                {result.errors.slice(0, 5).map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                                {result.errors.length > 5 && <li>...and {result.errors.length - 5} more errors</li>}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CSVUpload;
