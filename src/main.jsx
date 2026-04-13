import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { GymProvider } from './context/GymContext'

const updateSW = registerSW({
    onNeedRefresh() {
        console.log('PWA: Content updated, refresh required.');
    },
    onOfflineReady() {
        console.log('PWA: App is ready for offline use.');
    },
    onRegistered(r) {
        console.log('PWA: Service Worker registered successfully.');
    },
    onRegisterError(error) {
        console.error('PWA: Service Worker registration failed:', error);
    }
})

try {
    const root = document.getElementById('root');
    if (!root) throw new Error("Root element not found!");
    
    createRoot(root).render(
        <StrictMode>
            <GymProvider>
                <App />
            </GymProvider>
        </StrictMode>
    );
} catch (error) {
    console.error('CRITICAL FRONTEND CRASH:', error);
    document.body.innerHTML = `
        <div style="background: #111; color: #ff5555; padding: 20px; font-family: sans-serif;">
            <h1>Critical Error</h1>
            <pre>${error.stack || error.message}</pre>
            <p>Please try a hard refresh (Ctrl + F5)</p>
        </div>
    `;
}

