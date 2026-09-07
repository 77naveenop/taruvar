import React, { useState, useEffect } from 'react';
import { ArrowRight, User, LogOut, LogIn, Download, Sprout, ShieldCheck } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth, onLogout }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleNavClick = (id) => {
    setActivePage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-taruvar-border/70 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* 1. LEFT: Logo Icon Only */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none p-1 rounded-xl hover:bg-taruvar-light/50 transition-all cursor-pointer"
              title="Taruvar Homepage"
            >
              <img 
                src="/logo.jpg" 
                alt="Taruvar Logo" 
                className="h-9 w-9 sm:h-11 sm:w-11 object-contain rounded-xl mix-blend-multiply group-hover:scale-105 transition-transform"
              />
            </button>
          </div>

          {/* 2. MIDDLE: TARUVAR Wordmark (Takes to Homepage) */}
          <div className="flex-1 text-center min-w-0 px-1 overflow-hidden">
            <button
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none inline-block max-w-full cursor-pointer"
            >
              <span className="text-base sm:text-2xl font-black tracking-wider text-taruvar-dark group-hover:text-taruvar-secondary transition-colors font-sans truncate block leading-none">
                TARUVAR
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-taruvar-secondary tracking-widest uppercase truncate block mt-0.5">
                One Person. One Tree. • एक व्यक्ति, एक पेड़
              </span>
            </button>
          </div>

          {/* 3. RIGHT: Clean Install & Action Buttons (No Menu Toggle) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* PWA Install Button */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-taruvar-secondary via-[#1F5435] to-taruvar-secondary hover:brightness-110 text-white text-[10px] sm:text-xs font-extrabold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1 border border-taruvar-accent/40 tracking-tight shrink-0 cursor-pointer"
                title="Install Taruvar PWA App"
                aria-label="Install App"
              >
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-taruvar-accent animate-bounce shrink-0" />
                <span className="font-sans">Install</span>
              </button>
            )}

            {/* Adopt / Profile Link Button */}
            {currentUser ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="px-3 py-1.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs font-bold rounded-xl border border-taruvar-border transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{displayName}</span>
                <span className="sm:hidden">Profile</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('adopt')}
                className="px-3.5 py-1.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sprout className="w-3.5 h-3.5 text-taruvar-accent" />
                <span>Adopt</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* PWA Install Guide Modal (Shown only if browser blocks beforeinstallprompt) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-taruvar-border space-y-4 text-center relative">
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center absolute top-4 right-4 text-gray-500 hover:text-dark cursor-pointer"
            >
              ✕
            </button>

            <img src="/logo.jpg" alt="Taruvar Logo" className="w-16 h-auto mx-auto mix-blend-multiply" />

            <h3 className="text-xl font-bold text-taruvar-dark">Install Taruvar App</h3>
            <p className="text-xs text-taruvar-muted leading-relaxed">
              Install Taruvar directly onto your phone or desktop home screen for 1-tap offline access:
            </p>

            <div className="bg-taruvar-bg p-4 rounded-2xl text-left space-y-2 text-xs text-taruvar-dark">
              <p className="font-bold text-taruvar-secondary">📱 Android (Chrome):</p>
              <p>Tap <strong>⋮ (3 dots)</strong> at top right → select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</p>
              
              <p className="font-bold text-taruvar-secondary pt-2">🍎 iPhone (Safari):</p>
              <p>Tap the <strong>Share icon (⎋)</strong> at bottom → select <strong>"Add to Home Screen"</strong>.</p>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 bg-taruvar-secondary text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
