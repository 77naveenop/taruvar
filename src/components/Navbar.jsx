import React, { useState, useEffect } from 'react';
import { ArrowRight, User, LogOut, LogIn, Download, Sprout, ShieldCheck, Heart, Compass } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth, onLogout }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    try {
      return localStorage.getItem('taruvar_pwa_installed') === 'true' ||
             window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true ||
             (typeof document !== 'undefined' && document.referrer.includes('android-app://'));
    } catch {
      return false;
    }
  });
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // If already installed, ignore prompt
      if (localStorage.getItem('taruvar_pwa_installed') === 'true') {
        setIsAppInstalled(true);
        return;
      }
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      try {
        localStorage.setItem('taruvar_pwa_installed', 'true');
      } catch {}
      setDeferredPrompt(null);
      setShowInstallGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
    ) {
      setIsAppInstalled(true);
      try {
        localStorage.setItem('taruvar_pwa_installed', 'true');
      } catch {}
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
        try {
          localStorage.setItem('taruvar_pwa_installed', 'true');
        } catch {}
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

  const isAdmin = currentUser?.user_metadata?.role === 'admin' || currentUser?.email?.toLowerCase() === 'naveenpr332@gmail.com';
  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';

  const desktopNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Our Mission' },
    { id: 'be-a-part', label: 'Be a Part' },
    { id: 'initiatives', label: 'Initiatives' },
    { id: 'get-involved', label: 'Get Involved' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Desk 🔒' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-taruvar-border shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 lg:gap-6">
          
          {/* 1. LEFT: Logo + Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none cursor-pointer text-left"
              title="Taruvar — One Person. One Tree."
            >
              <img 
                src="/logo.jpg" 
                alt="TARUVAR Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-2xl group-hover:scale-105 transition-transform drop-shadow-sm shrink-0"
              />
              <div className="flex flex-col justify-center">
                <span className="text-lg sm:text-xl font-black tracking-tight text-taruvar-dark group-hover:text-taruvar-secondary transition-colors leading-none font-sans">
                  TARUVAR
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-taruvar-secondary tracking-widest uppercase mt-0.5 whitespace-nowrap">
                  One Person. One Tree.
                </span>
              </div>
            </button>
          </div>

          {/* 2. CENTER: Clean Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 whitespace-nowrap">
            {desktopNavLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-taruvar-secondary bg-taruvar-light font-black shadow-2xs'
                      : 'text-taruvar-dark hover:text-taruvar-secondary hover:bg-taruvar-bg/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* 3. RIGHT: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* PWA Install Button (Mobile Only, sleek, compact & aligned) */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="flex md:hidden items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-xl transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                title="Install Taruvar App"
              >
                <Download className="w-3.5 h-3.5 text-emerald-100" />
                <span>Install</span>
              </button>
            )}

            {/* Explore Reels Button (Desktop Only) */}
            <button
              onClick={() => handleNavClick('explore')}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-2 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                activePage === 'explore'
                  ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white hover:scale-105'
              }`}
              title="Explore Tree Reels & Adoption Stories"
            >
              <Compass className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Explore Reels 🎥</span>
            </button>

            {/* Admin Desk Button (Mobile & Desktop) */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  activePage === 'admin'
                    ? 'bg-amber-700 text-white shadow-sm ring-2 ring-amber-400/40'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
                title="Admin Verification Desk"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Admin</span>
              </button>
            )}

            {/* Account / Login Button (Desktop Only — on mobile it is in the sticky bottom navigation) */}
            {currentUser ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs sm:text-sm font-bold rounded-xl border border-taruvar-border transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                title="View Profile"
              >
                <div className="w-5 h-5 rounded-full bg-taruvar-secondary text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-taruvar-bg hover:bg-taruvar-light text-taruvar-dark text-xs sm:text-sm font-bold rounded-xl border border-taruvar-border transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <LogIn className="w-4 h-4 text-taruvar-secondary shrink-0" />
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
