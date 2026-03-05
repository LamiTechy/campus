// src/components/InstallBanner.jsx
// Shows "Add to Home Screen" prompt on mobile
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('pwa-dismissed')) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
    if (ios) { setIsIOS(true); setShow(true); return; }

    // Android/Chrome install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-6 md:w-80">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">CP</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Install CampusPlug</p>
          {isIOS ? (
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
              Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> to install
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-0.5">
              Add to your home screen for the best experience
            </p>
          )}
          {!isIOS && (
            <button onClick={handleInstall}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors">
              <Download size={12} /> Install App
            </button>
          )}
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
