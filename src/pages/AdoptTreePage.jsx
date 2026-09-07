import React, { useState } from 'react';
import { Sprout, Camera, Check, ArrowRight, ShieldCheck, Sparkles, MapPin, Heart, QrCode, Printer, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import GuardianIdCard from '../components/GuardianIdCard';

export default function AdoptTreePage({ currentUser, showToast, setActivePage, onOpenAuth }) {
  // Generate random 4-digit unique serials
  const [treeSerial, setTreeSerial] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [memberSerial, setMemberSerial] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const [formData, setFormData] = useState({
    name: currentUser?.user_metadata?.full_name || '',
    email: currentUser?.email || '',
    phone: '',
    treeType: 'Neem Tree (Azadirachta indica)',
    treeName: '',
    location: '',
    photo: null,
    photoPreview: null
  });

  const [loading, setLoading] = useState(false);
  const [adoptedRecord, setAdoptedRecord] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const treeOptions = [
    { name: 'Neem Tree (Azadirachta indica)', desc: 'High oxygen, natural air purifier, drought hardy', icon: '🌿' },
    { name: 'Peepal Tree (Ficus religiosa)', desc: '24/7 oxygen emissions, deep heritage, massive canopy', icon: '🍃' },
    { name: 'Banyan Tree (Ficus benghalensis)', desc: 'National tree of India, expansive shade, centuries lifespan', icon: '🌳' },
    { name: 'Mango Tree (Mangifera indica)', desc: 'Delicious fruit yield, biodiversity support, lush foliage', icon: '🥭' },
    { name: 'Gulmohar (Delonix regia)', desc: 'Vibrant fiery flowers, fast growing, great street shade', icon: '🌸' },
    { name: 'Jamun Tree (Syzygium cumini)', desc: 'Medicinal berries, groundwater retention, pollinator hub', icon: '🫐' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setPhotoError('Image size exceeds 8MB limit. Please choose a smaller photo.');
        return;
      }
      setPhotoError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo: reader.result,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.photo) {
      setPhotoError('Please upload a photo of your plantation action to complete adoption.');
      return;
    }

    setLoading(true);

    const generatedTreeId = `TRV-TREE-${treeSerial}`;
    const generatedMemberId = `TRV-IND-2026-${memberSerial}`;

    // Save to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('pledges').insert([
          {
            user_id: currentUser?.id || null,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            tree_type: formData.treeType,
            tree_name: formData.treeName || formData.treeType.split(' ')[0] + ' Guardian',
            location: formData.location || 'Local Community Drive',
            plantation_photo: formData.photo,
            status: 'pending',
            verified_months: 1,
            tree_id_code: generatedTreeId,
            member_id_code: generatedMemberId
          }
        ]);
      } catch (err) {
        console.error('Database pledge insert error:', err);
      }
    }

    setLoading(false);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    const newRecord = {
      guardianName: formData.name,
      memberId: generatedMemberId,
      treeId: generatedTreeId,
      species: formData.treeType,
      plantedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      location: formData.location || 'Local Community Area',
      verifiedMonths: 1,
      photoUrl: formData.photoPreview
    };

    setAdoptedRecord(newRecord);
    if (showToast) {
      showToast(`Congratulations ${formData.name}! Your Tree ID is ${generatedTreeId}.`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-24 pt-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SUCCESS SCREEN WITH OFFICIAL PRINTABLE ID CARD */}
      {adoptedRecord ? (
        <div className="space-y-8 animate-fade-in text-center">
          
          <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-8 sm:p-10 rounded-3xl shadow-2xl space-y-3">
            <div className="w-16 h-16 bg-taruvar-accent/20 rounded-full flex items-center justify-center mx-auto text-3xl border border-taruvar-accent/40 shadow-inner">
              🌱
            </div>
            <span className="px-3 py-1 bg-white/20 text-taruvar-accent text-xs font-bold rounded-full uppercase tracking-wider inline-block">
              Adoption Confirmed • Tree Passport Issued
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Welcome to Taruvar, Eco-Guardian!</h1>
            <p className="text-sm text-gray-200 max-w-lg mx-auto">
              Your Tree Passport <strong>{adoptedRecord.treeId}</strong> is officially registered. You can print your physical card or save it digitally below.
            </p>
          </div>

          {/* Render Physical Printable ID Card Component */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-taruvar-border shadow-card space-y-6">
            <h2 className="text-xl font-extrabold text-taruvar-dark flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-taruvar-secondary" />
              <span>Your Official Eco-Guardian ID Card</span>
            </h2>

            <GuardianIdCard 
              guardianName={adoptedRecord.guardianName}
              memberId={adoptedRecord.memberId}
              treeId={adoptedRecord.treeId}
              species={adoptedRecord.species}
              plantedDate={adoptedRecord.plantedDate}
              location={adoptedRecord.location}
              verifiedMonths={adoptedRecord.verifiedMonths}
              photoUrl={adoptedRecord.photoUrl}
            />

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setActivePage('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Go to My Profile & Monthly Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAdoptedRecord(null);
                  setTreeSerial(Math.floor(1000 + Math.random() * 9000));
                  setFormData({
                    name: currentUser?.user_metadata?.full_name || '',
                    email: currentUser?.email || '',
                    phone: '',
                    treeType: 'Neem Tree (Azadirachta indica)',
                    treeName: '',
                    location: '',
                    photo: null,
                    photoPreview: null
                  });
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-taruvar-light hover:bg-taruvar-border text-taruvar-dark font-bold rounded-2xl text-xs transition-all"
              >
                Adopt Another Tree
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ADOPTION FORM PAGE (CLEAN STANDALONE PAGE) */
        <div className="space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-taruvar-accent text-xs font-bold rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-taruvar-accent" />
                <span>One Person. One Tree. • एक व्यक्ति, एक पेड़</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black">Grow / Adopt Your Tree</h1>
              <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
                Take personal guardianship of a sapling. Upload your plantation photo, receive your official Unique ID card, and start your 5-month growth journey.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center shrink-0 min-w-[160px]">
              <p className="text-[10px] uppercase tracking-wider text-taruvar-accent font-bold">Auto Generated ID</p>
              <p className="text-lg font-mono font-black text-white">TRV-TREE-{treeSerial}</p>
              <p className="text-[9px] text-gray-300 mt-0.5">Unique Tree Passport</p>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-taruvar-border shadow-card space-y-8">
            
            {/* 1. Caretaker Information */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                <span className="w-6 h-6 rounded-full bg-taruvar-light text-taruvar-secondary text-xs flex items-center justify-center font-bold">1</span>
                <span>Guardian Information (अभिभावक की जानकारी)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Naveen Sharma"
                    className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 8543964107"
                    className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                    Plantation Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Sector 15 Botanical Park, Delhi NCR"
                    className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* 2. Tree Species Selection */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                <span className="w-6 h-6 rounded-full bg-taruvar-light text-taruvar-secondary text-xs flex items-center justify-center font-bold">2</span>
                <span>Select Indigenous Tree Species (पौधे की प्रजाति)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treeOptions.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setFormData({ ...formData, treeType: t.name })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.treeType === t.name
                        ? 'border-taruvar-secondary bg-taruvar-light/50 shadow-md'
                        : 'border-taruvar-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{t.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-taruvar-dark">{t.name}</h4>
                      <p className="text-[11px] text-taruvar-muted mt-0.5 leading-tight">{t.desc}</p>
                    </div>
                    {formData.treeType === t.name && (
                      <Check className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                  Tree Nickname (Optional / पेड़ का नाम)
                </label>
                <input
                  type="text"
                  value={formData.treeName}
                  onChange={(e) => setFormData({ ...formData, treeName: e.target.value })}
                  placeholder="e.g. My Peepal Guardian, Shanti Tree"
                  className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            {/* 3. Mandatory Plantation Action Photo Dropzone */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                <span className="w-6 h-6 rounded-full bg-taruvar-light text-taruvar-secondary text-xs flex items-center justify-center font-bold">3</span>
                <span>Plantation Photo Verification (पौधारोपण की तस्वीर) *</span>
              </h2>

              <p className="text-xs text-taruvar-muted">
                To guarantee genuine survival, each adoption requires a clear photo of the plantation action or newly planted sapling.
              </p>

              {photoError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* 100% Clickable Label Wrap */}
              <label 
                htmlFor="tree-photo-upload"
                className={`block w-full border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  formData.photoPreview 
                    ? 'border-taruvar-secondary bg-taruvar-light/30' 
                    : 'border-taruvar-secondary/50 hover:border-taruvar-secondary bg-taruvar-bg/60 hover:bg-taruvar-light/30'
                }`}
              >
                <input
                  id="tree-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {formData.photoPreview ? (
                  <div className="space-y-3">
                    <div className="max-w-xs mx-auto aspect-video rounded-2xl overflow-hidden border border-taruvar-border shadow">
                      <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-taruvar-secondary flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Photo Attached Successfully (Click to Change)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-taruvar-light text-taruvar-secondary flex items-center justify-center mx-auto text-2xl shadow-sm">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-taruvar-dark">Tap / Click here to Upload Plantation Photo</h4>
                    <p className="text-[11px] text-taruvar-muted">Supports JPG, PNG, WEBP from your camera or photo gallery (Up to 8MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* 4. Guardian Promise & Submit Button */}
            <div className="pt-4 border-t border-taruvar-border space-y-4">
              <div className="p-4 bg-taruvar-light/60 rounded-2xl border border-taruvar-border flex items-start gap-3 text-xs text-taruvar-dark">
                <ShieldCheck className="w-5 h-5 text-taruvar-secondary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  By submitting this adoption, you promise to water, protect, and document this sapling under the philosophy of <strong>Paalna (देखभाल)</strong>. Your Unique Eco-Guardian ID Card and QR Passport will be issued immediately.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Registering Adoption & Generating ID Card...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5" />
                    <span>Complete Tree Adoption & Issue ID Card</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
