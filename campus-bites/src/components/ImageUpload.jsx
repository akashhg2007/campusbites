import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';

const ImageUpload = ({ currentUrl, onUpload }) => {
    const { token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || '');
    const inputRef = useRef();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                const fullUrl = `${API_URL}${data.url}`;
                setPreview(fullUrl);
                onUpload(fullUrl);
            }
        } catch (err) {
            console.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    color: '#9CA3AF',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '160px',
                    justifyContent: 'center'
                }}
            >
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {preview && (
                <div style={{ position: 'relative' }}>
                    <img src={preview} alt="Preview" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button onClick={() => { setPreview(''); onUpload(''); }} style={{
                        position: 'absolute', top: -6, right: -6,
                        background: '#EF4444', border: 'none', borderRadius: '50%',
                        width: 20, height: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <X size={12} color="white" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
