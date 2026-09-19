import React, { useState } from 'react';
import { Sprout, Camera, Check, ArrowRight, ShieldCheck, Sparkles, MapPin, Heart, QrCode, Printer, AlertCircle, RefreshCw, Building2, Users, User, TreePine, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { saveCloudPendingAdoption } from '../lib/cloudDb';
import { compressImage } from '../lib/imageCompressor';
import GuardianIdCard from '../components/GuardianIdCard';

export default function AdoptTreePage({ currentUser, showToast, setActivePage, onOpenAuth }) {
  // Adoption Mode: 'individual' (1 Person / 1 Tree) | 'organization' (School, College, NGO, Corporate, Group)
  const [adoptionMode, setAdoptionMode] = useState('individual');

  // Random serial generator
  const [treeSerial, setTreeSerial] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [memberSerial, setMemberSerial] = useState(() => Math.floor(1000 + Math.random() * 9000));

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser?.user_metadata?.full_name || '',
    email: currentUser?.email || '',
    phone: '',
    treeType: 'Neem Tree (Azadirachta indica)',
    treeName: '',
    location: '',
    photo: null,
    photoPreview: null,
    // Organization / Bulk Fields
    orgName: '',
    orgType: 'School / Educational Institute',
    personCount: 25, // default 25 trees for bulk drive
    coordinatorDesignation: 'Head Coordinator / Principal',
    speciesMix: 'Mixed Indigenous Forest (Neem, Peepal, Banyan, Jamun, Gulmohar)'
  });

  const [loading, setLoading] = useState(false);
  const [adoptedRecord, setAdoptedRecord] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const suggestedTreeSpecies = [
    '🌿 Neem (Azadirachta indica)',
    '🍃 Peepal (Ficus religiosa)',
    '🌳 Banyan (Bargad)',
    '🥭 Mango (Mangifera indica)',
    '🫐 Jamun (Syzygium cumini)',
    '🌸 Gulmohar (Delonix regia)',
    '🍈 Amla (Indian Gooseberry)',
    '🌱 Guava (Amrood)',
    '🌲 Arjun Tree',
    '🌿 Ashoka Tree',
    '🍋 Lemon / Citrus',
    '🎋 Bamboo / Bambusoideae',
    '🍀 Bel Patra (Aegle marmelos)',
    '🌳 Kadam Tree'
  ];

  const orgTypes = [
    'School / Educational Institute',
    'College / University Campus',
    'Corporate CSR / Company Office',
    'NGO / Environmental Group',
    'Resident Welfare Association (RWA) / Society',
    'Youth / Community Volunteer Group'
  ];

  const bulkCountPresets = [10, 25, 50, 100, 250, 500];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setPhotoError('Image size exceeds 15MB limit. Please choose a smaller photo.');
        return;
      }
      setPhotoError('');
      try {
        // Compress image using HTML Canvas to prevent localStorage quota issues and allow instant cloud sync
        const compressedBase64 = await compressImage(file, 900, 900, 0.7);
        if (compressedBase64) {
          setFormData(prev => ({
            ...prev,
            photo: compressedBase64,
            photoPreview: compressedBase64
          }));
        }
      } catch (err) {
        console.error('Photo compression error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (adoptionMode === 'individual') {
      if (!formData.name || !formData.email || !formData.treeType || !formData.photo) {
        setPhotoError('Please fill all required fields and upload a photo of your plantation action.');
        return;
      }
    } else {
      if (!formData.orgName || !formData.name || !formData.email || !formData.photo) {
        setPhotoError('Please upload a photo of your organization plantation drive to complete adoption.');
        return;
      }
    }

    setLoading(true);

    const isBulk = adoptionMode === 'organization';
    const count = isBulk ? Number(formData.personCount) || 10 : 1;
    const cleanOrgCode = isBulk ? formData.orgName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'ORG' : 'IND';
    
    const generatedTreeId = isBulk 
      ? `TRV-ORG-${cleanOrgCode}-${count}` 
      : `TRV-TREE-${treeSerial}`;
    const generatedMemberId = isBulk 
      ? `TRV-ORG-2026-${cleanOrgCode}-${memberSerial}` 
      : `TRV-IND-2026-${memberSerial}`;

    // Save to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('pledges').insert([
          {
            user_id: currentUser?.id || null,
            name: isBulk ? `${formData.orgName} (${formData.name})` : formData.name,
            email: formData.email,
            phone: formData.phone,
            tree_type: isBulk ? `${count} Trees (${formData.speciesMix})` : formData.treeType,
            tree_name: isBulk ? `${formData.orgName} Green Drive` : (formData.treeName || formData.treeType.split(' ')[0] + ' Guardian'),
            location: formData.location || (isBulk ? `${formData.orgName} Campus` : 'Community Area'),
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
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    const newRecord = {
      id: generatedTreeId,
      isBulk: isBulk,
      orgName: isBulk ? formData.orgName : null,
      treeCount: count,
      guardianName: formData.name,
      user_email: formData.email,
      adopter_name: isBulk ? `${formData.orgName} (${formData.name})` : formData.name,
      adopter_email: formData.email,
      memberId: generatedMemberId,
      treeId: generatedTreeId,
      tree_name: isBulk ? `${formData.orgName} Green Drive` : (formData.treeName || formData.treeType.split(' ')[0] + ' Guardian'),
      species: isBulk ? `${count} Trees • ${formData.speciesMix}` : formData.treeType,
      plantedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      planted_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      location: formData.location || (isBulk ? `${formData.orgName} Campus` : 'Community Area'),
      verified_months: 1,
      verifiedMonths: 1,
      photoUrl: formData.photoPreview,
      plantation_photo: formData.photoPreview,
      status: 'pending',
      upvotes: 1,
      user_upvoted: false,
      reports: []
    };

    // Save locally for real-time live site use
    try {
      const allAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      allAdoptions.unshift(newRecord);
      localStorage.setItem('taruvar_adoptions', JSON.stringify(allAdoptions));

      const pendingAdoptions = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      pendingAdoptions.unshift({
        id: generatedTreeId,
        adopter_name: newRecord.adopter_name,
        adopter_email: formData.email,
        tree_name: newRecord.tree_name,
        species: newRecord.species,
        location: newRecord.location,
        plantation_photo: formData.photoPreview,
        date: newRecord.plantedDate
      });
      localStorage.setItem('taruvar_pending_adoptions', JSON.stringify(pendingAdoptions));

      // 3. Save to shared Cloud DB for instant cross-device admin receipt
      saveCloudPendingAdoption(newRecord).catch((err) => console.warn('Cloud save notice:', err));
    } catch (e) {
      console.error(e);
    }

    setAdoptedRecord(newRecord);
    if (showToast) {
      showToast(isBulk 
        ? `Organization Bulk Adoption Recorded for ${formData.orgName} (${count} Trees)!` 
        : `Congratulations ${formData.name}! Your Tree ID is ${generatedTreeId}.`
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-taruvar-light text-taruvar-secondary rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xs border border-taruvar-border">
          🌱
        </div>
        <div className="space-y-2">
          <span className="px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full uppercase tracking-wider">
            Guardian Account Required
          </span>
          <h2 className="text-3xl font-black text-taruvar-dark">Sign In to Adopt a Tree</h2>
          <p className="text-xs sm:text-sm text-taruvar-muted leading-relaxed max-w-md mx-auto">
            To issue official Unique IDs, prevent unauthorized entries, and track 5-month growth logs, please sign in or register before adopting a tree.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-8 py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black text-sm rounded-2xl shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Sign In / Create Account to Adopt</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 pt-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SUCCESS SCREEN WITH OFFICIAL PRINTABLE ID CARD */}
      {adoptedRecord ? (
        <div className="space-y-8 animate-fade-in text-center">
          
          <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-8 sm:p-10 rounded-3xl shadow-2xl space-y-3">
            <div className="w-16 h-16 bg-taruvar-accent/20 rounded-full flex items-center justify-center mx-auto text-3xl border border-taruvar-accent/40 shadow-inner">
              {adoptedRecord.isBulk ? '🏢' : '🌱'}
            </div>
            <span className="px-3 py-1 bg-white/20 text-taruvar-accent text-xs font-bold rounded-full uppercase tracking-wider inline-block">
              {adoptedRecord.isBulk ? 'Bulk Adoption Registered • Master Certificate Issued' : 'Adoption Confirmed • Tree Passport Issued'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              {adoptedRecord.isBulk 
                ? `Congratulations, ${adoptedRecord.orgName}!`
                : 'Welcome to Taruvar, Eco-Guardian!'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 max-w-lg mx-auto leading-relaxed">
              {adoptedRecord.isBulk
                ? `Your master batch passport for ${adoptedRecord.treeCount} trees (${adoptedRecord.treeId}) is registered. Print your official organization badge below.`
                : `Your Tree Passport ${adoptedRecord.treeId} is officially registered. Print your physical card or save it digitally below.`}
            </p>
          </div>

          {/* Render Physical Printable ID Card Component */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-taruvar-border shadow-card space-y-6">
            <h2 className="text-xl font-extrabold text-taruvar-dark flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-taruvar-secondary" />
              <span>{adoptedRecord.isBulk ? 'Official Organization Master Badge' : 'Your Official Eco-Guardian ID Card'}</span>
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
              isBulk={adoptedRecord.isBulk}
              orgName={adoptedRecord.orgName}
              treeCount={adoptedRecord.treeCount}
            />

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setActivePage('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to My Profile & Monthly Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAdoptedRecord(null);
                  setTreeSerial(Math.floor(1000 + Math.random() * 9000));
                  setMemberSerial(Math.floor(1000 + Math.random() * 9000));
                  setFormData({
                    name: currentUser?.user_metadata?.full_name || '',
                    email: currentUser?.email || '',
                    phone: '',
                    adopterAge: 18,
                    treeType: 'Neem Tree (Azadirachta indica)',
                    treeName: '',
                    location: '',
                    photo: null,
                    photoPreview: null,
                    orgName: '',
                    orgType: 'School / Educational Institute',
                    personCount: 25,
                    coordinatorDesignation: 'Head Coordinator / Principal',
                    speciesMix: 'Mixed Indigenous Forest (Neem, Peepal, Banyan, Jamun, Gulmohar)'
                  });
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-taruvar-light hover:bg-taruvar-border text-taruvar-dark font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Adopt Another Tree / Drive
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ADOPTION FORM PAGE (STANDALONE FULL-SCREEN PAGE) */
        <div className="space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-taruvar-accent text-xs font-bold rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-taruvar-accent" />
                <span>One Person. One Tree. • एक व्यक्ति, एक पेड़</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black">Adopt / Grow Your Tree</h1>
              <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
                Take personal or institutional responsibility for saplings. Receive your official Unique ID card and embark on a verified 5-month journey.
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center shrink-0 min-w-[160px]">
              <p className="text-[10px] uppercase tracking-wider text-taruvar-accent font-bold">
                {adoptionMode === 'individual' ? 'Auto Generated Tree ID' : 'Auto Generated Batch ID'}
              </p>
              <p className="text-lg font-mono font-black text-white">
                {adoptionMode === 'individual' ? `TRV-TREE-${treeSerial}` : `TRV-ORG-${formData.personCount || 25}`}
              </p>
              <p className="text-[9px] text-gray-300 mt-0.5">Official Passport Serial</p>
            </div>
          </div>

          {/* STEP 1: CHOOSE ADOPTION TYPE (INDIVIDUAL vs ORGANIZATION / BULK) */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-taruvar-border shadow-card space-y-3">
            <h3 className="text-xs font-bold text-taruvar-muted uppercase tracking-wider">Select Adoption Pathway</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Individual */}
              <button
                type="button"
                onClick={() => setAdoptionMode('individual')}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  adoptionMode === 'individual'
                    ? 'border-taruvar-secondary bg-taruvar-light/60 shadow-md ring-2 ring-taruvar-secondary/20'
                    : 'border-taruvar-border bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-taruvar-light flex items-center justify-center text-2xl shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-taruvar-dark text-sm sm:text-base">Individual Adoption</h4>
                    {adoptionMode === 'individual' && <Check className="w-4 h-4 text-taruvar-secondary" />}
                  </div>
                  <p className="text-xs text-taruvar-muted mt-1 leading-relaxed">
                    Single person adopting 1 tree in home, neighborhood, or city garden.
                  </p>
                </div>
              </button>

              {/* Option B: Organization / Bulk */}
              <button
                type="button"
                onClick={() => setAdoptionMode('organization')}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  adoptionMode === 'organization'
                    ? 'border-taruvar-secondary bg-taruvar-light/60 shadow-md ring-2 ring-taruvar-secondary/20'
                    : 'border-taruvar-border bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
                  🏢
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-taruvar-dark text-sm sm:text-base">Organization / Bulk Drive</h4>
                    {adoptionMode === 'organization' && <Check className="w-4 h-4 text-taruvar-secondary" />}
                  </div>
                  <p className="text-xs text-taruvar-muted mt-1 leading-relaxed">
                    School, College, Corporate CSR, Society or Group adopting multiple trees.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-taruvar-border shadow-card space-y-8">
            
            {/* === INDIVIDUAL PATHWAY FIELDS === */}
            {adoptionMode === 'individual' ? (
              <>
                {/* 1. Individual Information */}
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
                        placeholder="e.g. Sector 15 Botanical Park, Delhi NCR / Home Garden"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Tree Species (Open / Any Species with Lifespan Suggestion) */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-taruvar-light text-taruvar-secondary text-xs flex items-center justify-center font-bold">2</span>
                    <span>Tree Species & Details (पौधे का नाम या प्रजाति - कोई भी पौधा)</span>
                  </h2>

                  {/* Lifespan Recommendation Note */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <p className="font-bold text-emerald-900">Tree Lifespan Recommendation (पेड़ की आयु सुझाव):</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        We recommend choosing indigenous tree species with a long lifespan of <strong>15–20+ years</strong> (such as Neem, Peepal, Banyan, Mango, Jamun, Gulmohar, Amla, Guava, Arjun, etc.) for enduring shade, oxygen, and lifetime nurturing (Paalna).
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                      Enter Tree Species / Plant Name (Any Tree) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.treeType}
                      onChange={(e) => setFormData({ ...formData, treeType: e.target.value })}
                      placeholder="e.g. Neem, Peepal, Mango, Banyan, Jamun, Gulmohar, Amla, Guava, Lemon, or any tree..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-taruvar-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 bg-taruvar-bg/40 focus:bg-white"
                    />
                    <p className="text-[11px] text-taruvar-muted mt-1">
                      You can adopt <strong>any tree species</strong> of your choice suitable for your local climate.
                    </p>
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-taruvar-muted uppercase tracking-wider mb-2">
                      Popular Suggestions (Click any to auto-fill):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTreeSpecies.map((species) => (
                        <button
                          key={species}
                          type="button"
                          onClick={() => setFormData({ ...formData, treeType: species })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            formData.treeType === species
                              ? 'bg-taruvar-secondary text-white border-taruvar-secondary shadow-xs scale-105'
                              : 'bg-taruvar-light/70 text-taruvar-dark border-taruvar-border hover:bg-taruvar-light hover:border-taruvar-secondary/40'
                          }`}
                        >
                          {species}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                      Tree Nickname (Optional / पेड़ का नाम)
                    </label>
                    <input
                      type="text"
                      value={formData.treeName}
                      onChange={(e) => setFormData({ ...formData, treeName: e.target.value })}
                      placeholder="e.g. My Green Guardian, Shanti Tree, Prana Vriksh"
                      className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* === ORGANIZATION / BULK PATHWAY FIELDS === */
              <>
                {/* 1. Organization Information */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
                    <span>Organization / Institution Details (संस्था की जानकारी)</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Organization / School / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        placeholder="e.g. Delhi Public School, IIT Roorkee Eco-Club, Tata CSR Drive"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Organization Type *
                      </label>
                      <select
                        value={formData.orgType}
                        onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 bg-white"
                      >
                        {orgTypes.map((ot) => (
                          <option key={ot} value={ot}>{ot}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Campus / Plantation Site Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Main Campus Grounds, Sector 62, Noida"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Number of Persons / Trees (Bulk Scale) */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
                    <span>Number of Persons / Trees to Adopt (पौधों / प्रतिभागियों की संख्या) *</span>
                  </h2>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {bulkCountPresets.map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setFormData({ ...formData, personCount: num })}
                        className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer border ${
                          Number(formData.personCount) === num
                            ? 'bg-taruvar-secondary text-white border-taruvar-secondary shadow-sm scale-105'
                            : 'bg-taruvar-bg text-taruvar-dark border-taruvar-border hover:bg-taruvar-light'
                        }`}
                      >
                        {num} Trees
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                      Or Enter Custom Tree / Participant Count:
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={10000}
                      value={formData.personCount}
                      onChange={(e) => setFormData({ ...formData, personCount: e.target.value })}
                      placeholder="e.g. 50"
                      className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-taruvar-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                      Species Strategy
                    </label>
                    <input
                      type="text"
                      value={formData.speciesMix}
                      onChange={(e) => setFormData({ ...formData, speciesMix: e.target.value })}
                      placeholder="e.g. Mixed Indigenous Forest (Neem, Peepal, Banyan, Jamun, Gulmohar)"
                      className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                    />
                  </div>
                </div>

                {/* 3. Lead Coordinator Details */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">3</span>
                    <span>Lead Coordinator Details (समन्वयक की जानकारी)</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Coordinator Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Verma"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={formData.coordinatorDesignation}
                        onChange={(e) => setFormData({ ...formData, coordinatorDesignation: e.target.value })}
                        placeholder="e.g. CSR Head / Principal / Eco-Club Head"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="coordinator@institution.org"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                        WhatsApp / Contact Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 8543964107"
                        className="w-full px-4 py-3 rounded-2xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* MANDATORY PLANTATION PHOTO DROPZONE */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-taruvar-dark flex items-center gap-2 border-b border-taruvar-border pb-2">
                <span className="w-6 h-6 rounded-full bg-taruvar-light text-taruvar-secondary text-xs flex items-center justify-center font-bold">
                  {adoptionMode === 'individual' ? '3' : '4'}
                </span>
                <span>
                  {adoptionMode === 'individual' 
                    ? 'Plantation Photo Verification (पौधारोपण की तस्वीर) *' 
                    : 'Plantation Drive Photo Proof (सामूहिक पौधारोपण की तस्वीर) *'}
                </span>
              </h2>

              <p className="text-xs text-taruvar-muted">
                {adoptionMode === 'individual'
                  ? 'To guarantee genuine survival, each adoption requires a clear photo of the plantation action or newly planted sapling.'
                  : 'Upload a group photo or plantation drive action photo showing the adopted trees and participants.'}
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
                    <h4 className="text-sm font-bold text-taruvar-dark">
                      {adoptionMode === 'individual' 
                        ? 'Tap / Click here to Upload Plantation Photo' 
                        : 'Tap / Click here to Upload Bulk Drive Photo Proof'}
                    </h4>
                    <p className="text-[11px] text-taruvar-muted">Supports JPG, PNG, WEBP from your camera or photo gallery (Up to 8MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Guardian Promise & Submit Button */}
            <div className="pt-4 border-t border-taruvar-border space-y-4">
              <div className="p-4 bg-taruvar-light/60 rounded-2xl border border-taruvar-border flex items-start gap-3 text-xs text-taruvar-dark">
                <ShieldCheck className="w-5 h-5 text-taruvar-secondary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  By submitting this adoption, you promise to water, protect, and document these trees under the philosophy of <strong>Paalna (देखभाल)</strong>. Your Official Unique ID Card and QR Passports will be generated immediately.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-black text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Registering Adoption & Generating Batch Passports...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5" />
                    <span>
                      {adoptionMode === 'individual'
                        ? 'Complete Tree Adoption & Issue ID Card'
                        : `Register Bulk Adoption (${formData.personCount || 25} Trees) & Issue Passports`}
                    </span>
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
