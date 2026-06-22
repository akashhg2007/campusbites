import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SpeedInsights } from "@vercel/speed-insights/react"
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, refetchOnWindowFocus: false }
    }
})

const GCID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppWithProviders = () => (
    <QueryClientProvider client={queryClient}>
        {GCID ? (
            <GoogleOAuthProvider clientId={GCID}>
                <App />
                <SpeedInsights />
            </GoogleOAuthProvider>
        ) : (
            <>
                <App />
                <SpeedInsights />
            </>
        )}
    </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AppWithProviders />
        </ErrorBoundary>
    </React.StrictMode>,
)
