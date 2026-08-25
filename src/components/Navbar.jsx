import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User, LogOut, LogIn, Download, Sparkles } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Our Mission' },
    { id: 'tree-journey', label: 'Tree Journey' },
    { id: 'initiatives', label: 'Initiatives' },
    { id: 'get-involved', label: 'Get Involved' },
    { id: 'about-us', label: 'About Us' }
  ];

  const handleNavClick = (id) => {
    if (id === 'about' || id === 'about-us') {
      setActivePage('about');
    } else {
      setActivePage(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-taruvar-border/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          
          {/* 1. LEFT: Logo Icon Only */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none p-1 rounded-2xl hover:bg-taruvar-light/50 transition-all"
              title="Taruvar Homepage"
            >
              <img 
                src="/logo.jpg" 
                alt="Taruvar Logo Icon" 
                className="h-12 w-12 object-contain rounded-xl mix-blend-multiply group-hover:scale-105 transition-transform"
              />
            </button>
          </div>

          {/* 2. MIDDLE: TARUVAR (Takes to Homepage) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <button
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none flex flex-col items-center"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-wider text-taruvar-dark group-hover:text-taruvar-secondary transition-colors font-sans">
                TARUVAR
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-taruvar-secondary tracking-widest uppercase -mt-0.5">
                One Person. One Tree.
              </span>
            </button>
          </div>

          {/* 3. RIGHT: Two Icons (Install & Menu) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Icon 1: Install App Icon */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="p-2.5 sm:px-3.5 sm:py-2 bg-taruvar-secondary hover:bg-taruvar-hover text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 focus:outline-none animate-pulse hover:animate-none"
                title="Install Taruvar App"
                aria-label="Install App"
              >
                <Download className="w-5 h-5 text-taruvar-accent shrink-0" />
                <span className="text-xs font-bold hidden sm:inline">Install</span>
              </button>
            )}

            {/* Icon 2: Menu Icon (Opens Navigation & User Drawer) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 bg-white text-taruvar-dark hover:bg-taruvar-light border border-taruvar-border rounded-2xl shadow-sm focus:outline-none transition-colors"
              aria-label="Toggle Menu"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-taruvar-secondary" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* PWA Install Guide Modal (If native prompt not triggered) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-taruvar-border space-y-4 text-center relative">
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center absolute top-4 right-4 text-gray-500 hover:text-dark"
            >
              <X className="w-4 h-4" />
            </button>

            <img src="/logo.jpg" alt="Taruvar Logo" className="w-20 h-auto mx-auto mix-blend-multiply" />

            <h3 className="text-xl font-bold text-taruvar-dark">Install Taruvar App</h3>
            <p className="text-xs text-taruvar-muted leading-relaxed">
              Install Taruvar directly onto your phone or desktop home screen for fast 1-tap access:
            </p>

            <div className="bg-taruvar-bg p-4 rounded-2xl text-left space-y-2 text-xs text-taruvar-dark">
              <p className="font-bold text-taruvar-secondary">📱 Android (Chrome):</p>
              <p>Tap the <strong>⋮ (3 dots)</strong> menu top-right → select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</p>
              
              <p className="font-bold text-taruvar-secondary pt-2">🍎 iPhone (Safari):</p>
              <p>Tap the <strong>Share button (⎋)</strong> at bottom → scroll & select <strong>"Add to Home Screen"</strong>.</p>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 bg-taruvar-secondary text-white font-bold rounded-xl text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Menu Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="bg-white/95 backdrop-blur border-b border-taruvar-border px-4 py-6 space-y-4 animate-fade-in shadow-2xl max-w-7xl mx-auto">
          
          {/* User Account Bar */}
          <div className="p-4 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-taruvar-dark flex items-center gap-2">
                  <User className="w-4 h-4 text-taruvar-secondary" /> {displayName}
                </span>
                <button 
                  onClick={onLogout} 
                  className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-taruvar-muted">Join the movement:</span>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="px-4 py-2 bg-taruvar-secondary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-4 h-4" /> Log In / Register
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`p-3.5 rounded-2xl text-center text-sm font-bold transition-all border ${
                  activePage === link.id || (link.id === 'about-us' && activePage === 'about')
                    ? 'bg-taruvar-secondary text-white border-taruvar-secondary shadow-md'
                    : 'bg-white text-taruvar-dark border-taruvar-border hover:bg-taruvar-light'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPledge();
              }}
              className="w-full py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base transition-all"
            >
              <span>Adopt & Care for a Tree</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
