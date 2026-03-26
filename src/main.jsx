import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'
import { GymProvider } from './context/GymContext'

const updateSW = registerSW({
    onNeedRefresh() { },
    onOfflineReady() { },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GymProvider>
            <App />
        </GymProvider>
    </StrictMode>,
)
