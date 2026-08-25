import React, { useState } from 'react';
import { Menu, X, Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenPledge }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Primary CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenPledge}
              className="px-5 py-2.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-sm font-bold rounded-2xl shadow-md shadow-taruvar-secondary/20 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Start Your Tree Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenPledge}
              className="px-3.5 py-1.5 bg-taruvar-secondary text-white text-xs font-bold rounded-xl"
            >
              Pledge
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
              <span>Start Your Tree Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
