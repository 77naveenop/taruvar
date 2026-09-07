import React from 'react';
import { Instagram, Mail, Phone, MessageCircle, Globe, ArrowUpRight, Heart, Sprout } from 'lucide-react';

export default function Footer({ setActivePage, onOpenPledge, onNavigateGetInvolved }) {
  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-taruvar-dark text-white border-t border-gray-800 pt-14 pb-24 md:pb-12 relative overflow-hidden">
      {/* Decorative accent blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-taruvar-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1 & 2: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-2xl inline-block">
                <img 
                  src="/logo.jpg" 
                  alt="TARUVAR — One Person. One Tree." 
                  className="h-11 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Taruvar is an environmental movement dedicated to individual tree responsibility, long-term nurturing (Paalna), and technology-enabled tree growth documentation.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2 text-xs text-gray-300 pt-1">
              <a 
                href="mailto:teamtaruvar@gmail.com" 
                className="flex items-center gap-2 hover:text-taruvar-accent transition-colors"
              >
                <Mail className="w-4 h-4 text-taruvar-primary shrink-0" />
                <span>teamtaruvar@gmail.com</span>
              </a>
              <a 
                href="tel:8543964107" 
                className="flex items-center gap-2 hover:text-taruvar-accent transition-colors"
              >
                <Phone className="w-4 h-4 text-taruvar-primary shrink-0" />
                <span>+91 8543964107</span>
              </a>
            </div>

            {/* Social & Connect Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a 
                href="https://www.instagram.com/taruvar_foundationn?stkn=dnIxa2prN2N0YXRi" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="Taruvar Instagram"
                title="Follow @taruvar_foundationn on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/918543964107" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="WhatsApp Contact"
                title="WhatsApp Taruvar Foundation"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="mailto:teamtaruvar@gmail.com" 
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-taruvar-primary/30 flex items-center justify-center text-gray-300 hover:text-white transition-all border border-white/10"
                aria-label="Email"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a 
                href="https://taruvar.org" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-taruvar-primary/30 text-xs font-semibold text-taruvar-accent border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>taruvar.org</span>
              </a>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-accent mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('home')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Home (मुख्य पृष्ठ)</button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Our Mission (उद्देश्य)</button>
              </li>
              <li>
                <button onClick={() => navigateTo('tree-journey')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Tree Journey (पेड़ का सफर)</button>
              </li>
              <li>
                <button onClick={() => navigateTo('profile')} className="text-gray-300 hover:text-taruvar-primary transition-colors">My Profile (मेरी प्रोफाइल)</button>
              </li>
              <li>
                <button onClick={() => navigateTo('initiatives')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Initiatives (पहल)</button>
              </li>
              <li>
                <button onClick={() => navigateTo('get-involved')} className="text-gray-300 hover:text-taruvar-primary transition-colors">Get Involved (शामिल हों)</button>
              </li>
            </ul>
          </div>

          {/* Col 4: 5-Step Framework */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-accent mb-3">5-Step Care Cycle</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2">🌱 <span>1. Plant (पौधारोपण)</span></li>
              <li className="flex items-center gap-2">💧 <span>2. Care (देखभाल)</span></li>
              <li className="flex items-center gap-2">📸 <span>3. Document (तस्वीर लॉग)</span></li>
              <li className="flex items-center gap-2">🌿 <span>4. Grow (विकास)</span></li>
              <li className="flex items-center gap-2">🤝 <span>5. Inspire (प्रेरणा)</span></li>
            </ul>
          </div>

          {/* Col 5: Movement Action */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-accent mb-3">Join Movement</h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              One Person. One Tree. Take responsibility for a sapling today.
            </p>
            <button
              onClick={onOpenPledge}
              className="w-full py-3 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Sprout className="w-4 h-4" />
              <span>Grow / Adopt a Tree</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar with discreet admin link */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © 2026 Taruvar Foundation (
            <button 
              onClick={() => navigateTo('admin')} 
              className="hover:text-gray-200 transition-colors cursor-pointer"
              title="taruvar.org"
            >
              taruvar.org
            </button>
            ). All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built for long-term environmental participation <Heart className="w-3.5 h-3.5 text-taruvar-primary fill-taruvar-primary inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
