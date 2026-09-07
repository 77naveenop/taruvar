import React from 'react';
import { Home, Compass, Sprout, User, Layers, Sparkles } from 'lucide-react';

export default function BottomNav({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth }) {
  const handleNav = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-taruvar-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-all">
      <div className="max-w-lg mx-auto flex items-center justify-around relative">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => handleNav('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activePage === 'home'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activePage === 'home' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* 2. Tree Journey Tab */}
        <button
          onClick={() => handleNav('tree-journey')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activePage === 'tree-journey'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Compass className={`w-5 h-5 ${activePage === 'tree-journey' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Journey</span>
        </button>

        {/* 3. Center Raised Action Button: Grow / Adopt a Tree */}
        <div className="relative -top-3.5 flex flex-col items-center">
          <button
            onClick={onOpenPledge}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-taruvar-secondary via-[#1F5435] to-taruvar-primary text-white shadow-xl shadow-taruvar-secondary/35 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white group"
            title="Grow / Adopt Your Tree"
            aria-label="Adopt a Tree"
          >
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-taruvar-accent group-hover:rotate-12 transition-transform" />
          </button>
          <span className="text-[9px] font-extrabold text-taruvar-secondary mt-0.5 uppercase tracking-wider">Adopt</span>
        </div>

        {/* 4. Profile / Feed Tab */}
        <button
          onClick={() => {
            if (currentUser) {
              handleNav('profile');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activePage === 'profile'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${activePage === 'profile' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{currentUser ? 'Profile' : 'Log In'}</span>
        </button>

        {/* 5. Initiatives / Explore Tab */}
        <button
          onClick={() => handleNav('initiatives')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activePage === 'initiatives' || activePage === 'get-involved'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Layers className={`w-5 h-5 ${activePage === 'initiatives' || activePage === 'get-involved' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
        </button>

      </div>
    </nav>
  );
}
