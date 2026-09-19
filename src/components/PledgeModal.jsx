import React, { useState } from 'react';
import { X, Sprout, Heart, ShieldCheck, Share2, Sparkles, Check, UserCheck, Lock, Camera, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { saveCloudPendingAdoption } from '../lib/cloudDb';

export default function PledgeModal({ isOpen, onClose, currentUser, onOpenAuth, onPledgeComplete }) {
  const [treeType, setTreeType] = useState('Neem Tree (Azadirachta indica)');
  const [adopterAge, setAdopterAge] = useState(18);
  const [treeNickname, setTreeNickname] = useState('');
  const [location, setLocation] = useState('');
  const [plantationPhoto, setPlantationPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pledged, setPledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const userName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || '';
  const userEmail = currentUser?.email || '';

  if (!isOpen) return null;

  const quickSpecies = [
    '🌿 Neem',
    '🍃 Peepal',
    '🌳 Banyan',
    '🥭 Mango',
    '🌸 Gulmohar',
    '🫐 Jamun',
    '🍈 Amla',
    '🌱 Guava'
  ];

  const handlePhotoSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPlantationPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePledgeSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Please log in or create an account first to complete tree adoption.');
      onOpenAuth();
      return;
    }

    if (Number(adopterAge) < 15) {
      setErrorMsg('Adopters must be at least 15–20 years old to pledge 15–20 year lifelong nurturing (Paalna).');
      return;
    }

    if (!treeType.trim()) {
      setErrorMsg('Please specify a tree species or sapling name.');
      return;
    }

    if (!photoPreview) {
      setErrorMsg('Please tap the box above to select your plantation photo.');
      return;
    }

    setLoading(true);

    try {
      if (supabase && currentUser) {
        const { error } = await supabase.from('pledges').insert([
          { 
            name: userName, 
            email: userEmail, 
            tree_type: treeType,
            tree_name: treeNickname || `${treeType} Sapling`,
            location: location || 'Community Neighborhood',
            plantation_photo: photoPreview,
            status: 'pending',
            user_id: currentUser.id
          }
        ]);
        if (error) {
          console.warn('Supabase insert notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('Adoption submission note:', err);
    }

    // Save to local storage for instant frontend and admin reflection
    try {
      const generatedTreeId = `TRV-TREE-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedMemberId = `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        id: generatedTreeId,
        isBulk: false,
        guardianName: userName,
        user_email: userEmail,
        adopter_name: userName,
        adopter_email: userEmail,
        memberId: generatedMemberId,
        treeId: generatedTreeId,
        tree_name: treeNickname || `${treeType} Guardian`,
        species: treeType,
        plantedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        planted_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        location: location || 'Community Neighborhood',
        verified_months: 1,
        verifiedMonths: 1,
        photoUrl: photoPreview,
        plantation_photo: photoPreview,
        status: 'pending',
        upvotes: 1,
        user_upvoted: false,
        reports: []
      };

      const allAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      allAdoptions.unshift(newRecord);
      localStorage.setItem('taruvar_adoptions', JSON.stringify(allAdoptions));

      const pendingAdoptions = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      pendingAdoptions.unshift({
        id: generatedTreeId,
        adopter_name: userName,
        adopter_email: userEmail,
        tree_name: newRecord.tree_name,
        species: treeType,
        location: location || 'Community Neighborhood',
        plantation_photo: photoPreview,
        date: newRecord.plantedDate
      });
      localStorage.setItem('taruvar_pending_adoptions', JSON.stringify(pendingAdoptions));

      // 3. Save to cloud DB
      saveCloudPendingAdoption(newRecord).catch((err) => console.warn('Cloud save notice:', err));
    } catch (e) {
      console.error('Pledge local storage error:', e);
    } finally {
      setLoading(false);
      setPledged(true);
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onPledgeComplete) {
        onPledgeComplete(`Tree adoption submitted! Pending admin team verification.`);
      }
    }
  };

  const resetAndClose = () => {
    setPledged(false);
    setPhotoPreview(null);
    setPlantationPhoto(null);
    setTreeNickname('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Centered Modal Container ~70% max bounds */}
      <div className="bg-white w-[92%] sm:w-[85%] md:w-[70%] max-w-lg max-h-[85vh] rounded-3xl shadow-2xl border border-taruvar-border overflow-hidden flex flex-col relative my-auto">
        
        {/* Sticky Header Bar */}
        <div className="bg-taruvar-bg px-5 py-3.5 border-b border-taruvar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-taruvar-primary/20 rounded-xl text-taruvar-secondary font-bold text-base">🌱</span>
            <div>
              <h3 className="font-bold text-taruvar-dark text-sm md:text-base leading-tight">Adopt & Care for a Tree</h3>
              <p className="text-[11px] text-taruvar-muted">Taruvar Movement • taruvar.org</p>
            </div>
          </div>

          <button 
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white border border-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark hover:bg-gray-100 transition-all shrink-0 shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {!pledged ? (
            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-taruvar-light text-taruvar-secondary text-xs font-semibold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Start Tree Care
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-taruvar-dark">Submit Tree Adoption Request</h4>
                <p className="text-xs text-taruvar-muted max-w-md mx-auto">
                  Attach a photo of your plantation action below. Our team will verify and confirm your adoption!
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Account Status / Login Gate */}
              {!currentUser ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Please <strong>Log In / Register</strong> to adopt a tree.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs shrink-0 shadow-sm"
                  >
                    Log In / Register
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-taruvar-light/70 border border-taruvar-primary/30 rounded-2xl flex items-center justify-between text-xs text-taruvar-dark">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-taruvar-secondary shrink-0" />
                    <span>Adopter: <strong>{userName}</strong></span>
                  </div>
                  <span className="text-[10px] bg-taruvar-secondary text-white font-bold px-2 py-0.5 rounded-full">Logged In</span>
                </div>
              )}

              {/* Adopter Age & Tree Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1 flex items-center justify-between">
                    <span>Adopter Age / आयु *</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Min 15–20 Yrs</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="110"
                    required
                    value={adopterAge}
                    onChange={(e) => setAdopterAge(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1">
                    Tree Species (Any) *
                  </label>
                  <input
                    type="text"
                    required
                    value={treeType}
                    onChange={(e) => setTreeType(e.target.value)}
                    placeholder="e.g. Neem, Peepal, Mango, Jamun..."
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div>
                <label className="block text-[10px] font-bold text-taruvar-muted uppercase tracking-wider mb-1">
                  Quick Species Suggestions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickSpecies.map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() => setTreeType(species.replace(/^[^\s]+\s/, ''))}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        treeType.toLowerCase().includes(species.replace(/^[^\s]+\s/, '').toLowerCase())
                          ? 'bg-taruvar-secondary text-white border-taruvar-secondary shadow-xs'
                          : 'bg-taruvar-bg text-taruvar-dark border-taruvar-border hover:bg-taruvar-light'
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plantation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1">
                    Tree Nickname / Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={treeNickname}
                    onChange={(e) => setTreeNickname(e.target.value)}
                    placeholder="e.g. My Peepal Guardian"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1">
                    Plantation Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 4 Green Park, Delhi"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
              </div>

              {/* 100% CLICKABLE PLANTATION PHOTO DROPZONE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-dark mb-1">
                  2. Plantation Action Picture * (Mandatory)
                </label>
                
                <label 
                  htmlFor="modal-photo-input"
                  className="block border-2 border-dashed border-taruvar-secondary/60 rounded-2xl p-4 text-center cursor-pointer hover:border-taruvar-secondary hover:bg-taruvar-light/40 transition-all bg-taruvar-bg relative z-10"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoSelect} 
                    className="hidden" 
                    id="modal-photo-input" 
                  />

                  {photoPreview ? (
                    <div className="relative pointer-events-none">
                      <img src={photoPreview} alt="Plantation proof" className="h-28 mx-auto object-cover rounded-xl border border-taruvar-border" />
                      <span className="block text-[11px] text-taruvar-secondary font-bold mt-2">✓ Photo attached! Click anywhere to change.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2 pointer-events-none">
                      <Camera className="w-8 h-8 text-taruvar-secondary mx-auto" />
                      <p className="text-xs font-bold text-taruvar-dark">Tap / Click here to select photo file</p>
                      <p className="text-[10px] text-taruvar-muted">Upload picture of you planting or watering sapling</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Robust Action Submit Button */}
              {currentUser ? (
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handlePledgeSubmit}
                  className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white/20" /> Submit Adoption (Pending Admin Approval)
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full py-3.5 bg-taruvar-dark hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Register / Log In to Submit Photo
                </button>
              )}

            </form>
          ) : (
            /* Output Confirmation Screen */
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-3xl shadow">
                ⏳
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-extrabold text-taruvar-dark">Adoption Request Submitted!</h4>
                <p className="text-xs text-taruvar-muted max-w-sm mx-auto">
                  Thank you, <strong>{userName}</strong>! Your plantation photo for <strong>{treeNickname || treeType}</strong> is sent to the Taruvar team for confirmation.
                </p>
              </div>

              <div className="p-4 bg-taruvar-bg rounded-2xl border border-taruvar-border text-xs text-left space-y-1">
                <p className="font-bold text-taruvar-secondary">What happens next?</p>
                <p className="text-taruvar-muted">1. Admin team will confirm your plantation photo.</p>
                <p className="text-taruvar-muted">2. Submit monthly reports for 5 months to become a Verified Eco-Guardian!</p>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full py-3 bg-taruvar-secondary text-white font-bold rounded-xl text-xs"
              >
                Go to My Profile & Journey
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
