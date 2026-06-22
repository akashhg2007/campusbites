import toast, { Toaster } from 'react-hot-toast';

export const ToastProvider = () => (
    <Toaster
        position="bottom-center"
        gutter={12}
        containerStyle={{ bottom: 100 }}
        toastOptions={{
            duration: 3000,
            style: {
                background: 'rgba(26, 26, 28, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                maxWidth: '400px'
            },
            success: {
                iconTheme: { primary: '#22C55E', secondary: '#fff' },
                style: { border: '1px solid rgba(34,197,94,0.3)' }
            },
            error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
                style: { border: '1px solid rgba(239,68,68,0.3)' }
            }
        }}
    />
);

export const notify = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg, { icon: 'ℹ️' }),
    loading: (msg) => toast.loading(msg),
    promise: (p, msgs) => toast.promise(p, msgs),
    dismiss: (id) => toast.dismiss(id),
    custom: (jsx) => toast.custom(jsx)
};
