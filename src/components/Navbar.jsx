import React, { useState, useEffect } from 'react';
import { ArrowRight, User, LogOut, LogIn, Download, Sprout, ShieldCheck, Heart } from 'lucide-react';

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

  const isAdmin = currentUser?.user_metadata?.role === 'admin';
  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];

  const desktopNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Reels 🎥' },
    { id: 'about', label: 'Our Mission' },
    { id: 'tree-journey', label: 'Tree Journey' },
    { id: 'initiatives', label: 'Initiatives' },
    { id: 'get-involved', label: 'Get Involved' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Desk 🔒' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-taruvar-border shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* 1. LEFT: Prominent Logo + Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left"
              title="Taruvar — One Person. One Tree."
            >
              <img 
                src="/logo.jpg" 
                alt="TARUVAR Logo" 
                className="h-11 w-11 sm:h-14 sm:w-14 object-contain rounded-2xl group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-taruvar-dark group-hover:text-taruvar-secondary transition-colors leading-none font-sans">
                  TARUVAR
                </span>
                <span className="text-[9px] sm:text-[11px] font-bold text-taruvar-secondary tracking-widest uppercase mt-0.5">
                  One Person. One Tree.
                </span>
              </div>
            </button>
          </div>

          {/* 2. CENTER: Full Desktop Navigation Bar (Visible on Desktop / Tablets) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {desktopNavLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'text-taruvar-secondary bg-taruvar-light font-extrabold shadow-xs'
                      : 'text-taruvar-dark hover:text-taruvar-secondary hover:bg-taruvar-bg'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* 3. RIGHT: Action Buttons (Install + Explore / Reels Button + Profile / Log In) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* PWA Install Button */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex px-3 py-1.5 bg-taruvar-bg hover:bg-taruvar-light text-taruvar-dark text-xs font-bold rounded-xl border border-taruvar-border transition-all items-center gap-1.5 shadow-xs cursor-pointer"
                title="Install Taruvar App"
              >
                <Download className="w-3.5 h-3.5 text-taruvar-secondary animate-bounce" />
                <span>Install App</span>
              </button>
            )}

            {/* Prominent Explore / Reels Button in place of Adopt Button */}
            <button
              onClick={() => handleNavClick('explore')}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/30"
              title="Explore Tree Reels & Adoption Stories"
            >
              <Compass className="w-4 h-4 text-taruvar-accent" />
              <span>Explore / एक्सप्लोर</span>
            </button>

            {/* Account / Login Button */}
            {currentUser ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl border border-taruvar-border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="View Profile"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">{displayName}</span>
                <span className="lg:hidden">Profile</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="hidden md:flex px-4 py-2.5 bg-taruvar-bg hover:bg-taruvar-light text-taruvar-dark text-xs sm:text-sm font-bold rounded-2xl border border-taruvar-border transition-all items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4 text-taruvar-secondary" />
                <span>Log In</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-taruvar-border space-y-4 text-center relative">
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center absolute top-4 right-4 text-gray-500 hover:text-dark cursor-pointer"
            >
              ✕
            </button>

            <img src="/logo.jpg" alt="Taruvar Logo" className="w-16 h-auto mx-auto drop-shadow-sm rounded-2xl" />

            <h3 className="text-xl font-bold text-taruvar-dark">Install Taruvar App</h3>
            <p className="text-xs text-taruvar-muted leading-relaxed">
              Install Taruvar directly onto your phone or desktop for fast 1-tap offline access:
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
