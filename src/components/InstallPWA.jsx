import React, { useState, useEffect } from 'react';
import { Download, Monitor } from 'lucide-react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        console.log('Install button clicked.');
        console.log('deferredPrompt available:', !!deferredPrompt);
        
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    setIsInstallable(false); // Set to false after successful installation
                }
            } catch (err) {
                console.error('Error during PWA installation:', err);
            }
        } else {
            console.log('PWA Prompt not available. Possible reasons: Insecure origin, Missing manifest, or Already installed.');
            alert("Installation prompt is not ready. Please try again in 5 seconds or check your browser's menu (three dots) -> 'Install App'.");
        }
    };

    // Only show the button if it's not installed and is installable
    if (isInstalled || !isInstallable) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-black border bg-gym-neon text-black border-gym-neon animate-pulse-slow shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-[1.02] active:scale-95 text-xs uppercase"
        >
            <Monitor size={18} />
            <span>Install Desktop App</span>
        </button>
    );
};

export default InstallPWA;
