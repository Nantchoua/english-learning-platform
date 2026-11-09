'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';

export default function InstallPwaButton({ className = '' }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone (app-like) mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // Fallback for desktop Chrome/Edge or when prompt isn't captured
      alert('To install Speaking Express as an app:\n\nClick the Install icon (💻/➕) in your browser address bar, or open your browser menu (⋮) and select "Install Speaking Express" or "Create Shortcut".');
    }
  };

  // If already installed and running standalone, do not show button
  if (isStandalone) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        title="Download and install Speaking Express as a web app on your home screen or desktop"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
          installed
            ? 'bg-slate-100 text-slate-500'
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
        } ${className}`}
      >
        {installed ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>App Installed</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
            <span>Install App</span>
          </>
        )}
      </button>

      {/* iOS Safari Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Smartphone className="w-5 h-5 text-emerald-600" /> Install on iPhone / iPad
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Install <strong>Speaking Express</strong> on your home screen for full-screen app experience:
            </p>

            <ol className="text-xs text-slate-700 space-y-2.5 list-decimal pl-4">
              <li>
                Tap the <strong className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-800"><Share className="w-3 h-3" /> Share</strong> button in Safari toolbar.
              </li>
              <li>
                Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (➕).
              </li>
              <li>
                Tap <strong>&quot;Add&quot;</strong> in the top-right corner.
              </li>
            </ol>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
