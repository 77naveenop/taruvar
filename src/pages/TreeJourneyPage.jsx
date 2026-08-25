import React, { useState } from 'react';
import { Sparkles, QrCode, Camera, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import TreeJourneySandbox from '../components/TreeJourneySandbox';
import { supabase } from '../lib/supabase';

export default function TreeJourneyPage({ showToast, onOpenPledge }) {
  const [notifyEmail, setNotifyEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;

    if (supabase) {
      try {
        await supabase.from('early_access').insert([
          { email: notifyEmail }
        ]);
      } catch (err) {
        console.error('Supabase early_access error:', err);
      }
    }

    setSubscribed(true);
    if (showToast) {
      showToast('Thank you! You will be notified when Taruvar Tree Journey launches.');
    }
  };

  return (
    <div className="space-y-20 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-primary/20">
          <Sparkles className="w-3.5 h-3.5" /> FUTURE DIGITAL ECOSYSTEM • COMING SOON
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-taruvar-dark tracking-tight">
          Your Tree. Its Story. <br />
          <span className="text-taruvar-secondary">A Journey That Continues.</span>
        </h1>
        <p className="text-taruvar-muted text-base sm:text-lg leading-relaxed">
          Taruvar is building a digital ecosystem where participants will plant a tree, receive a unique Tree ID, document progress updates, and build a lifetime growth timeline.
        </p>
      </div>

      {/* 5-Step Digital Flow Diagram */}
      <section className="bg-white p-8 md:p-12 rounded-3xl border border-taruvar-border shadow-card space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-taruvar-dark">How the Taruvar Digital Ecosystem Will Work</h2>
          <p className="text-xs text-taruvar-muted">We are actively building this technology platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          {[
            { step: '1', title: 'Plant', desc: 'Plant a sapling in your home, campus, or neighborhood.', icon: '🌱' },
            { step: '2', title: 'Create', desc: 'Create a Tree Profile and receive a unique Tree ID.', icon: '🏷️' },
            { step: '3', title: 'Document', desc: 'Upload plantation photo with GPS location tag.', icon: '📸' },
            { step: '4', title: 'Update', desc: 'Return at Day 30, Month 6 & Year 1 to log growth.', icon: '🔄' },
            { step: '5', title: 'Grow', desc: 'Watch your tree timeline grow into a verified canopy.', icon: '🌳' }
          ].map((item, index) => (
            <div key={item.title} className="p-5 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-2 relative">
              <span className="text-3xl block">{item.icon}</span>
              <span className="text-[10px] font-bold text-taruvar-secondary uppercase tracking-widest">STEP {item.step}</span>
              <h3 className="font-bold text-taruvar-dark text-base">{item.title}</h3>
              <p className="text-xs text-taruvar-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Sandbox Component */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-taruvar-dark">Try the Interactive Concept Prototype</h2>
          <p className="text-xs text-taruvar-muted">Preview how tree growth milestones and tree passports will look in the upcoming app.</p>
        </div>
        
        <TreeJourneySandbox />
      </section>

      {/* Early Access / Notify Me Form */}
      <section className="bg-gradient-to-br from-taruvar-secondary to-green-900 text-white p-8 md:p-14 rounded-3xl shadow-xl max-w-4xl mx-auto text-center space-y-6">
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-white/10 backdrop-blur text-taruvar-accent text-xs font-bold rounded-full border border-white/10">
            EARLY ACCESS
          </span>
          <h2 className="text-3xl font-extrabold">Be First to Experience Tree Journey</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Enter your email to receive early access when the Taruvar Tree Journey digital platform & mobile companion go live on taruvar.org.
          </p>
        </div>

        {!subscribed ? (
          <form onSubmit={handleNotifySubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-xl text-taruvar-dark text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Notify Me</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-taruvar-accent font-semibold text-sm inline-flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>You're on the early access list for taruvar.org!</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 text-xs text-white/60">
          We respect your privacy. Zero spam. Updates only regarding Taruvar Tree Journey releases.
        </div>
      </section>

    </div>
  );
}
