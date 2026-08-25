import React, { useState } from 'react';
import { X, Sprout, Heart, ShieldCheck, Share2, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PledgeModal({ isOpen, onClose, onPledgeComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [treeType, setTreeType] = useState('Neem');
  const [email, setEmail] = useState('');
  const [pledged, setPledged] = useState(false);

  if (!isOpen) return null;

  const treeOptions = [
    { name: 'Neem', desc: 'Air purifying & medicinal guardian', emoji: '🌿' },
    { name: 'Peepal', desc: 'Oxygen giver & sacred shelter', emoji: '🌳' },
    { name: 'Banyan', desc: 'Deep roots & generational canopy', emoji: '🌴' },
    { name: 'Mango', desc: 'Fruit-bearing & bird sanctuary', emoji: '🥭' },
    { name: 'Gulmohar', desc: 'Vibrant shade & summer bloom', emoji: '🌺' }
  ];

  const handlePledge = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setPledged(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (onPledgeComplete) {
      onPledgeComplete(`Thank you, ${name}! Your Taruvar Tree Pledge card has been generated.`);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setName('');
    setEmail('');
    setPledged(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-taruvar-border overflow-hidden relative">
        {/* Header Bar */}
        <div className="bg-taruvar-bg px-6 py-4 border-b border-taruvar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-taruvar-primary/15 rounded-xl text-taruvar-secondary font-bold text-lg">🌱</span>
            <div>
              <h3 className="font-bold text-taruvar-dark leading-tight">One Person. One Tree.</h3>
              <p className="text-xs text-taruvar-muted">Taruvar Digital Pledge • taruvar.org</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="w-9 h-9 rounded-full bg-white border border-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {!pledged ? (
            <form onSubmit={handlePledge} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-semibold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Start Your Personal Journey
                </span>
                <h4 className="text-2xl font-bold text-taruvar-dark">Pledge to Plant & Nurture</h4>
                <p className="text-sm text-taruvar-muted max-w-md mx-auto">
                  Take responsibility for one tree. Give it a beginning, care for its survival, and follow its growth.
                </p>
              </div>

              {/* Step 1: Choose Tree */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-2">
                  1. Select a Tree to Plant or Care For
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {treeOptions.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setTreeType(t.name)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        treeType === t.name 
                          ? 'border-taruvar-secondary bg-taruvar-light/40 ring-2 ring-taruvar-primary/30' 
                          : 'border-taruvar-border hover:border-taruvar-primary/50 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xl">{t.emoji}</span>
                        {treeType === t.name && (
                          <span className="w-5 h-5 rounded-full bg-taruvar-secondary text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-sm text-taruvar-dark">{t.name}</p>
                        <p className="text-[11px] text-taruvar-muted leading-tight mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1.5">
                    2. Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-taruvar-border focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 text-taruvar-dark placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1.5">
                    3. Your Email (To receive tree updates)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-taruvar-border focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 text-taruvar-dark placeholder:text-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Commitment Box */}
              <div className="bg-taruvar-bg p-4 rounded-2xl border border-taruvar-border flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-taruvar-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-taruvar-dark leading-relaxed">
                  <strong className="font-semibold text-taruvar-secondary">The Taruvar Paalna Pledge:</strong> I commit to not just planting this {treeType} tree, but watering, protecting, and documenting its journey so it survives and grows strong.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg shadow-taruvar-secondary/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Heart className="w-5 h-5 fill-white/20" /> Generate My Digital Pledge Card
              </button>
            </form>
          ) : (
            /* Digital Pledge Card Preview */
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-semibold rounded-full">
                <Check className="w-4 h-4" /> Pledge Completed!
              </div>

              {/* Card visual */}
              <div className="bg-gradient-to-br from-taruvar-secondary to-[#1B4E31] text-white p-6 md:p-8 rounded-3xl shadow-xl text-left relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🌱</div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-taruvar-accent">TARUVAR MOVEMENT</span>
                    <h4 className="text-xl font-extrabold tracking-tight">TREE CARE PLEDGE</h4>
                  </div>
                  <span className="text-xs bg-white/10 backdrop-blur px-3 py-1 rounded-full text-taruvar-accent font-mono border border-white/10">
                    ID: TRV-{Math.floor(1000 + Math.random() * 9000)}
                  </span>
                </div>

                <div className="space-y-4 my-6">
                  <div>
                    <p className="text-xs text-white/70 uppercase tracking-wider">Pledged By</p>
                    <p className="text-2xl font-bold text-white">{name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-white/70">Selected Sapling</p>
                      <p className="font-semibold text-taruvar-accent">{treeType} Tree 🌱</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Core Promise</p>
                      <p className="font-semibold text-white">Plant → Care → Grow</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-4 text-xs text-white/60">
                  <span>Official Public Movement</span>
                  <span className="font-mono font-medium text-white/80">taruvar.org</span>
                </div>
              </div>

              <p className="text-xs text-taruvar-muted">
                Your pledge is registered. When the Taruvar Tree Journey mobile app launches, you will be able to log photos and sync this pledge!
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`I just pledged to plant & care for a ${treeType} tree with Taruvar! Join the movement at https://taruvar.org #OnePersonOneTree`);
                    alert('Pledge link copied to clipboard!');
                  }}
                  className="flex-1 py-3 px-4 bg-taruvar-light text-taruvar-secondary font-bold rounded-xl hover:bg-taruvar-primary/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 className="w-4 h-4" /> Share Pledge
                </button>
                <button
                  onClick={resetAndClose}
                  className="flex-1 py-3 px-4 bg-taruvar-secondary text-white font-bold rounded-xl hover:bg-taruvar-hover transition-all text-sm"
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
