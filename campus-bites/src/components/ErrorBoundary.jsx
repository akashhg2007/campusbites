import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    background: '#0D0D0D',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    fontFamily: 'monospace'
                }}>
                    <div style={{ maxWidth: 600 }}>
                        <h1 style={{ color: '#E23744', fontSize: '1.5rem' }}>Something went wrong</h1>
                        <pre style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '12px',
                            overflow: 'auto',
                            fontSize: '0.85rem',
                            color: '#F87171'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={() => { localStorage.clear(); window.location.reload(); }}
                            style={{
                                marginTop: '1rem',
                                background: '#E23744',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Clear Data & Reload
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
