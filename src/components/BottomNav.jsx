import React from 'react';
import { Home, Compass, Sprout, User, ShieldCheck, Users } from 'lucide-react';

export default function BottomNav({ activePage, setActivePage, onOpenPledge, currentUser, onOpenAuth }) {
  const handleNav = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = currentUser?.user_metadata?.role === 'admin' || currentUser?.email?.toLowerCase() === 'naveenpr332@gmail.com';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-taruvar-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1.5 sm:px-3 py-1.5 transition-all">
      <div className="max-w-lg mx-auto flex items-center justify-between relative">
        
        {/* 1. Home Tab */}
        <button
          onClick={() => handleNav('home')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activePage === 'home'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Home className={`w-5 h-5 shrink-0 ${activePage === 'home' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Home</span>
        </button>

        {/* 2. Be a Part Tab */}
        <button
          onClick={() => handleNav('be-a-part')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activePage === 'be-a-part'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Users className={`w-5 h-5 shrink-0 ${activePage === 'be-a-part' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Be a Part</span>
        </button>

        {/* 3. Center Raised Action Button: Grow / Adopt a Tree (Taruvar Logo) */}
        <div className="relative -top-3.5 flex flex-col items-center px-1 shrink-0">
          <button
            onClick={onOpenPledge}
            className="w-12 h-12 rounded-full bg-white shadow-xl shadow-taruvar-secondary/35 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-taruvar-secondary group p-1 cursor-pointer overflow-hidden"
            title="Grow / Adopt Your Tree"
            aria-label="Adopt a Tree"
          >
            <img 
              src="/logo.jpg" 
              alt="Adopt Tree" 
              className="w-full h-full object-contain rounded-full group-hover:scale-110 transition-transform" 
            />
          </button>
          <span className="text-[9px] font-extrabold text-taruvar-secondary mt-0.5 uppercase tracking-wider">Adopt</span>
        </div>

        {/* 4. Explore Reels Feed Tab */}
        <button
          onClick={() => handleNav('explore')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activePage === 'explore'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <Compass className={`w-5 h-5 shrink-0 ${activePage === 'explore' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">Explore</span>
        </button>

        {/* 5. Profile / Feed Tab */}
        <button
          onClick={() => {
            if (currentUser) {
              handleNav('profile');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activePage === 'profile'
              ? 'text-taruvar-secondary font-extrabold scale-105'
              : 'text-taruvar-muted hover:text-taruvar-dark font-medium'
          }`}
        >
          <User className={`w-5 h-5 shrink-0 ${activePage === 'profile' ? 'text-taruvar-secondary stroke-[2.5]' : ''}`} />
          <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate">{currentUser ? 'Profile' : 'Log In'}</span>
        </button>

      </div>
    </nav>
  );
}
