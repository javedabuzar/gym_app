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

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GymProvider>
            <App />
        </GymProvider>
    </StrictMode>,
)
