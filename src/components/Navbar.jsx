import React, { useState, useEffect } from 'react';
import { Menu, X, Sprout, ArrowRight, User, LogOut, LogIn, Download, Smartphone } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
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
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Taruvar on your device:\n\n• iOS (Safari): Tap Share button -> "Add to Home Screen"\n• Android (Chrome): Tap 3 dots menu -> "Install App" or "Add to Home Screen"\n• Desktop: Click the install icon in your address bar!');
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
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-taruvar-secondary flex items-center justify-center text-white shadow-md shadow-taruvar-secondary/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-taruvar-accent" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold tracking-tight text-taruvar-dark block leading-none">
                TARUVAR
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-taruvar-muted uppercase">
                taruvar.org
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activePage === link.id || (link.id === 'about-us' && activePage === 'about');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'text-taruvar-secondary bg-taruvar-light/70 font-bold' 
                      : 'text-taruvar-dark/80 hover:text-taruvar-secondary hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Area: PWA Install Button + User Status + Primary CTA */}
          <div className="hidden lg:flex items-center gap-2.5">
            
            {/* PWA Install Button right in header menu bar */}
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="px-3 py-2 bg-taruvar-light hover:bg-taruvar-primary/20 text-taruvar-secondary text-xs font-bold rounded-xl border border-taruvar-primary/30 transition-all flex items-center gap-1.5 shadow-sm"
                title="Install Taruvar App on your phone/desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* User Auth Status */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-taruvar-dark bg-taruvar-light px-3 py-2 rounded-xl flex items-center gap-1.5 border border-taruvar-primary/20">
                  <User className="w-3.5 h-3.5 text-taruvar-secondary" /> {displayName}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold text-taruvar-dark hover:text-taruvar-secondary hover:bg-taruvar-light rounded-xl transition-all flex items-center gap-1 border border-taruvar-border"
              >
                <LogIn className="w-3.5 h-3.5 text-taruvar-secondary" />
                <span>Log In / Register</span>
              </button>
            )}

            <button
              onClick={onOpenPledge}
              className="px-5 py-2.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-sm font-bold rounded-2xl shadow-md shadow-taruvar-secondary/20 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Adopt a Tree</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Install Button */}
          <div className="flex md:hidden items-center gap-2">
            {!isAppInstalled && (
              <button
                onClick={handleInstallPWA}
                className="px-2.5 py-1.5 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-xl border border-taruvar-primary/30 flex items-center gap-1"
                title="Install App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            )}

            <button
              onClick={onOpenPledge}
              className="px-3 py-1.5 bg-taruvar-secondary text-white text-xs font-bold rounded-xl"
            >
              Adopt
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-taruvar-dark hover:bg-white border border-taruvar-border focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur border-b border-taruvar-border px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          
          {!isAppInstalled && (
            <button
              onClick={() => { setMobileMenuOpen(false); handleInstallPWA(); }}
              className="w-full py-2.5 bg-taruvar-light text-taruvar-secondary font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 mb-2 border border-taruvar-primary/30"
            >
              <Download className="w-4 h-4" /> Install Taruvar App on Phone
            </button>
          )}

          {currentUser ? (
            <div className="p-3 bg-taruvar-light rounded-xl flex items-center justify-between text-xs font-bold text-taruvar-dark mb-2">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-taruvar-secondary" /> {displayName}</span>
              <button onClick={onLogout} className="text-red-600 font-bold flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Sign Out</button>
            </div>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
              className="w-full py-2.5 bg-taruvar-light text-taruvar-dark font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 mb-2"
            >
              <LogIn className="w-4 h-4 text-taruvar-secondary" /> Log In / Register
            </button>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-taruvar-dark hover:bg-taruvar-light/50 hover:text-taruvar-secondary transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPledge();
              }}
              className="w-full py-3.5 bg-taruvar-secondary text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <span>Adopt & Care for a Tree</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
