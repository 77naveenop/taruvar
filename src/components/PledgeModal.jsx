import React, { useState, useEffect } from 'react';
import { X, Sprout, Heart, ShieldCheck, Share2, Sparkles, Check, UserCheck, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

export default function PledgeModal({ isOpen, onClose, currentUser, onOpenAuth, onPledgeComplete }) {
  const [treeType, setTreeType] = useState('Neem');
  const [pledged, setPledged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto populate name/email if user logged in
  const userName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || '';
  const userEmail = currentUser?.email || '';

  if (!isOpen) return null;

  const treeOptions = [
    { name: 'Neem', desc: 'Air purifying & medicinal guardian', emoji: '🌿' },
    { name: 'Peepal', desc: 'Oxygen giver & natural shade', emoji: '🌳' },
    { name: 'Banyan', desc: 'Deep roots & strong canopy', emoji: '🌴' },
    { name: 'Mango', desc: 'Fruit-bearing & bird home', emoji: '🥭' },
    { name: 'Gulmohar', desc: 'Vibrant shade & summer bloom', emoji: '🌺' }
  ];

  const handlePledgeSubmit = async (e) => {
    e.preventDefault();

    // Enforce login requirement
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setLoading(true);

    if (supabase && currentUser) {
      try {
        await supabase.from('pledges').insert([
          { 
            name: userName, 
            email: userEmail, 
            tree_type: treeType,
            user_id: currentUser.id || null
          }
        ]);
      } catch (err) {
        console.error('Tree care commitment error:', err);
      }
    }

    setLoading(false);
    setPledged(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onPledgeComplete) {
      onPledgeComplete(`Congratulations ${userName}! Your Tree Care Card has been generated.`);
    }
  };

  const resetAndClose = () => {
    setPledged(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Centered Modal Container with strict ~70% max bounds and clear scrolling & close button */}
      <div className="bg-white w-[92%] sm:w-[85%] md:w-[70%] max-w-lg max-h-[85vh] rounded-3xl shadow-2xl border border-taruvar-border overflow-hidden flex flex-col relative my-auto">
        
        {/* Sticky Header Bar with always visible Close Button */}
        <div className="bg-taruvar-bg px-5 py-3.5 border-b border-taruvar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-taruvar-primary/20 rounded-xl text-taruvar-secondary font-bold text-base">🌱</span>
            <div>
              <h3 className="font-bold text-taruvar-dark text-sm md:text-base leading-tight">Adopt & Care for a Tree</h3>
              <p className="text-[11px] text-taruvar-muted">Taruvar Movement • taruvar.org</p>
            </div>
          </div>

          {/* Clear, tapping-friendly X Close Button */}
          <button 
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white border border-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark hover:bg-gray-100 transition-all shrink-0 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {!pledged ? (
            <form onSubmit={handlePledgeSubmit} className="space-y-5">
              
              <div className="text-center space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-semibold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Start Tree Care
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-taruvar-dark">Choose Your Sapling</h4>
                <p className="text-xs text-taruvar-muted max-w-md mx-auto">
                  Take personal responsibility to water, protect, and care for one tree.
                </p>
              </div>

              {/* Account Status / Login Gate Banner */}
              {!currentUser ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Please <strong>Log In / Register</strong> to save your tree care record.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shrink-0"
                  >
                    Log In / Register
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-taruvar-light/70 border border-taruvar-primary/30 rounded-2xl flex items-center justify-between text-xs text-taruvar-dark">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-taruvar-secondary shrink-0" />
                    <span>Logged in as <strong>{userName}</strong> ({userEmail})</span>
                  </div>
                  <span className="text-[10px] bg-taruvar-secondary text-white font-bold px-2 py-0.5 rounded-full">Verified</span>
                </div>
              )}

              {/* Tree Options Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-2">
                  Select Tree Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {treeOptions.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTreeType(t.name)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        treeType === t.name 
                          ? 'border-taruvar-secondary bg-taruvar-light/50 ring-2 ring-taruvar-primary/30' 
                          : 'border-taruvar-border hover:border-taruvar-primary/50 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xl">{t.emoji}</span>
                        {treeType === t.name && (
                          <span className="w-4 h-4 rounded-full bg-taruvar-secondary text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-xs text-taruvar-dark">{t.name}</p>
                        <p className="text-[10px] text-taruvar-muted leading-tight mt-0.5 truncate">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple Promise Box */}
              <div className="bg-taruvar-bg p-3.5 rounded-2xl border border-taruvar-border flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-taruvar-dark leading-relaxed">
                  <strong>My Simple Promise:</strong> I will water and protect this {treeType} tree as it grows.
                </p>
              </div>

              {/* Action Button */}
              {currentUser ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Heart className="w-4 h-4 fill-white/20" /> Generate My Tree Care Card
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full py-3.5 bg-taruvar-dark hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" /> Register / Log In to Adopt Tree
                </button>
              )}

            </form>
          ) : (
            /* Tree Care Card Output */
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-semibold rounded-full">
                <Check className="w-4 h-4" /> Adopted Successfully!
              </div>

              <div className="bg-gradient-to-br from-taruvar-secondary to-[#1B4E31] text-white p-6 rounded-3xl shadow-xl text-left relative overflow-hidden space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-taruvar-accent">TARUVAR MOVEMENT</span>
                    <h4 className="text-lg font-black tracking-tight">TREE CARE CARD</h4>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-taruvar-accent font-mono border border-white/10">
                    ID: TRV-{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-white/70 uppercase">Caretaker</p>
                  <p className="text-xl font-bold text-white">{userName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                  <div>
                    <p className="text-[10px] text-white/70">Tree Selected</p>
                    <p className="font-semibold text-xs text-taruvar-accent">{treeType} Tree 🌱</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/70">Promise</p>
                    <p className="font-semibold text-xs text-white">Water & Protect</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3 text-[10px] text-white/60">
                  <span>Verified User Account</span>
                  <span className="font-mono text-white/90">taruvar.org</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`I just adopted a ${treeType} tree with Taruvar! Join the movement at https://taruvar.org`);
                    alert('Tree Care link copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 bg-taruvar-light text-taruvar-secondary font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={resetAndClose}
                  className="flex-1 py-2.5 bg-taruvar-secondary text-white font-bold rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
