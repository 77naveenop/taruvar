import React from 'react';
import { Sprout, Instagram, Mail, Globe, ArrowUpRight, Heart } from 'lucide-react';

export default function Footer({ setActivePage, onOpenPledge }) {
  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-taruvar-dark text-white border-t border-gray-800 pt-16 pb-12 relative overflow-hidden">
      {/* Decorative accent blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-taruvar-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-taruvar-secondary flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6 text-taruvar-accent" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight block leading-none text-white">
                  TARUVAR
                </span>
                <span className="text-xs font-bold text-taruvar-accent uppercase tracking-widest">
                  One Person. One Tree.
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              A growing environmental movement focused on tree care, community participation, youth leadership, women's empowerment, and technology-enabled environmental action.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-taruvar-primary/30 flex items-center justify-center text-gray-300 hover:text-white transition-all border border-white/10"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:connect@taruvar.org" 
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-taruvar-primary/30 flex items-center justify-center text-gray-300 hover:text-white transition-all border border-white/10"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://taruvar.org" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-taruvar-primary/30 text-xs font-semibold text-taruvar-accent border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>taruvar.org</span>
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-taruvar-accent mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigateTo('home')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Our Mission</button>
              </li>
              <li>
                <button onClick={() => navigateTo('tree-journey')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Tree Journey</button>
              </li>
              <li>
                <button onClick={() => navigateTo('initiatives')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Initiatives</button>
              </li>
              <li>
                <button onClick={() => navigateTo('get-involved')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Get Involved</button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="text-gray-300 hover:text-taruvar-primary transition-colors">About Us</button>
              </li>
            </ul>
          </div>

          {/* Col 4: Core Pillars */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-taruvar-accent mb-4">Core Philosophy</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-center gap-2">🌱 <span>Plant — Give a beginning</span></li>
              <li className="flex items-center gap-2">💧 <span>Care — Paalna Nurturing</span></li>
              <li className="flex items-center gap-2">📸 <span>Document — Growth log</span></li>
              <li className="flex items-center gap-2">🌿 <span>Grow — Survival focus</span></li>
              <li className="flex items-center gap-2">🤝 <span>Inspire — Public movement</span></li>
            </ul>
          </div>

          {/* Col 5: Movement Action */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-taruvar-accent mb-4">Join Movement</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Start with one tree. Take responsibility for its journey today.
            </p>
            <button
              onClick={onOpenPledge}
              className="w-full py-3 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>Take The Pledge</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 Taruvar (taruvar.org). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for long-term environmental participation <Heart className="w-3.5 h-3.5 text-taruvar-primary fill-taruvar-primary inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
