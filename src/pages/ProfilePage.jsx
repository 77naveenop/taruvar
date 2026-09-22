import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Heart, Award, Camera, Upload, CheckCircle2, Clock, 
  Sparkles, ThumbsUp, MapPin, Calendar, Plus, ChevronRight, Layers, Lock, Flame, LogOut,
  Waves, Mountain, Trash2, Sprout, Leaf, Activity, Droplets, Sun, Shield, MessageCircle, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import GuardianIdCard from '../components/GuardianIdCard';
import { getCloudPendingAdoptions, getCloudApprovedAdoptions } from '../lib/cloudDb';

export default function ProfilePage({ currentUser, onOpenAuth, onOpenAdopt, onLogout, setActivePage, showToast }) {
  // Tabs: 'my-trees' (Section A) | 'social-work' (Section B) | 'id-card' | 'leaderboard'
  const [activeTab, setActiveTab] = useState('my-trees');

  // ==========================================
  // SECTION A: MY ADOPTED TREES & WELLNESS CARE
  // ==========================================
  const [reportModalTree, setReportModalTree] = useState(null);
  const [careIntervalDays, setCareIntervalDays] = useState(1); // 1-15 days dropdown
  const [careActivity, setCareActivity] = useState('Watering & Soil Nurturing');
  const [wellnessStatus, setWellnessStatus] = useState('Thriving & Lush Green');
  const [reportNotes, setReportNotes] = useState('');
  const [reportPhoto, setReportPhoto] = useState(null);
  const [reportPhotoPreview, setReportPhotoPreview] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // User's own adopted trees
  const [myTrees, setMyTrees] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const filtered = currentUser?.email
        ? all.filter(t => t.user_email === currentUser.email || t.adopter_email === currentUser.email)
        : all;
      return filtered.map(t => ({
        ...t,
        id: t.id || t.treeId || `tree-${Date.now()}`,
        tree_name: t.tree_name || t.treeName || 'My Adopted Tree',
        species: t.species || 'Indigenous Tree',
        location: t.location || 'Community Green Area',
        plantation_photo: t.photoUrl || t.plantation_photo || '/logo.jpg',
        verified_months: t.verified_months || t.verifiedMonths || 1,
        wellness: t.wellness || 'Thriving & Lush Green',
        lastCareInterval: t.lastCareInterval || '1 Day Care',
        upvotes: t.upvotes || 1,
        user_upvoted: false,
        reports: Array.isArray(t.reports) ? t.reports : []
      }));
    } catch {
      return [];
    }
  });

  // ==========================================
  // SECTION B: SOCIAL ENVIRONMENTAL WORKS (Clean, Zero Dummy Data)
  // ==========================================
  const [socialWorks, setSocialWorks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taruvar_social_works') || '[]');
    } catch {
      return [];
    }
  });

  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialForm, setSocialForm] = useState({
    title: '',
    category: 'River & Water Cleaning',
    timeInterval: '1 Day Action',
    location: '',
    impact: '',
    description: '',
    photo: null,
    photoPreview: null
  });
  const [submittingSocial, setSubmittingSocial] = useState(false);

  // Sync with Cloud database in background
  useEffect(() => {
    async function loadCloudProfileData() {
      try {
        const [cloudPending, cloudApproved] = await Promise.all([
          getCloudPendingAdoptions(),
          getCloudApprovedAdoptions()
        ]);
        const allCloud = [...(cloudApproved || []), ...(cloudPending || [])];
        if (allCloud.length > 0 && currentUser?.email) {
          const userEmailLower = currentUser.email.toLowerCase();
          const userTrees = allCloud
            .filter(d => 
              (d.adopter_email && d.adopter_email.toLowerCase() === userEmailLower) ||
              (d.user_email && d.user_email.toLowerCase() === userEmailLower)
            )
            .map(d => ({
              ...d,
              id: d.id || d.treeId || `tree-${Date.now()}`,
              tree_name: d.tree_name || d.treeName || 'My Adopted Tree',
              species: d.species || 'Indigenous Tree',
              location: d.location || 'Community Green Area',
              plantation_photo: d.plantation_photo || d.photoUrl || '/logo.jpg',
              verified_months: d.verified_months || d.verifiedMonths || 1,
              wellness: d.wellness || 'Thriving & Lush Green',
              lastCareInterval: d.lastCareInterval || '1 Day Care',
              upvotes: d.upvotes || 1,
              user_upvoted: false,
              reports: Array.isArray(d.reports) ? d.reports : []
            }));
          if (userTrees.length > 0) {
            setMyTrees(userTrees);
          }
        }
      } catch (e) {
        console.warn('Profile cloud sync note:', e);
      }
    }
    loadCloudProfileData();
  }, [currentUser]);

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Tree Care Guardian';
  const userEmail = currentUser?.email || 'teamtaruvar@gmail.com';
  const isAdmin = currentUser?.user_metadata?.role === 'admin' || currentUser?.email?.toLowerCase() === 'naveenpr332@gmail.com';

  // Photo Select for Tree Care Report
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Section A: Tree Care & Wellness Update
  const submitTreeCareUpdate = (e) => {
    e.preventDefault();
    if (!reportPhotoPreview) {
      alert('Please upload a progress / wellness photo for your tree.');
      return;
    }

    setSubmittingReport(true);

    const newReport = {
      id: `report-${Date.now()}`,
      intervalDays: careIntervalDays,
      activity: careActivity,
      wellness: wellnessStatus,
      photo: reportPhotoPreview,
      notes: reportNotes || `Logged ${careIntervalDays}-day wellness update: ${careActivity}. Tree status: ${wellnessStatus}`,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedTrees = myTrees.map(t => {
      if (t.id === reportModalTree.id) {
        return {
          ...t,
          wellness: wellnessStatus,
          lastCareInterval: `${careIntervalDays} Days`,
          reports: [...(t.reports || []), newReport]
        };
      }
      return t;
    });

    setMyTrees(updatedTrees);
    try {
      localStorage.setItem('taruvar_adoptions', JSON.stringify(updatedTrees));
    } catch {}

    setSubmittingReport(false);
    setReportModalTree(null);
    setReportNotes('');
    setReportPhotoPreview(null);
    
    confetti({ particleCount: 50, spread: 50 });
    if (showToast) {
      showToast(`${careIntervalDays}-Day Tree Wellness Update logged & synced to Explore feed! 🌱`);
    }
  };

  // Photo Select for Social Work
  const handleSocialPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSocialForm(prev => ({
          ...prev,
          photo: reader.result,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Section B: Social Environmental Work
  const submitSocialWork = (e) => {
    e.preventDefault();
    if (!socialForm.title.trim() || !socialForm.photoPreview) {
      alert('Please provide a title and photo proof for your environmental care work.');
      return;
    }

    setSubmittingSocial(true);

    const categoryIcons = {
      'River & Water Cleaning': '🌊',
      'Mountain & Forest Care': '🏔️',
      'Neighborhood & Park Waste Cleanup': '🧹',
      'Plantation & Seedballs': '🪴',
      'Eco Wellness & Awareness': '🧘',
      'Plastic Free Drive': '♻️'
    };

    const newWork = {
      id: `sw-${Date.now()}`,
      author: displayName,
      userEmail: currentUser?.email || 'user@taruvar.org',
      title: socialForm.title.trim(),
      category: socialForm.category,
      categoryIcon: categoryIcons[socialForm.category] || '🌍',
      timeInterval: socialForm.timeInterval,
      location: socialForm.location || 'Local Community Environment',
      impact: socialForm.impact || 'Community Environmental Action',
      description: socialForm.description || `Undertook ${socialForm.category} action under Taruvar Environmental Movement.`,
      photo: socialForm.photoPreview,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      views: 1,
      likes: 1,
      isLiked: true
    };

    const updatedWorks = [newWork, ...socialWorks];
    setSocialWorks(updatedWorks);
    try {
      localStorage.setItem('taruvar_social_works', JSON.stringify(updatedWorks));
    } catch {}

    setSubmittingSocial(false);
    setShowSocialModal(false);
    setSocialForm({
      title: '',
      category: 'River & Water Cleaning',
      timeInterval: '1 Day Action',
      location: '',
      impact: '',
      description: '',
      photo: null,
      photoPreview: null
    });

    confetti({ particleCount: 70, spread: 60 });
    if (showToast) {
      showToast('Environmental Care Work logged & shared to Explore feed! 🌍');
    }
  };

  const handleLikeSocialWork = (id) => {
    setSocialWorks(prev => prev.map(w => {
      if (w.id === id) {
        const nextLiked = !w.isLiked;
        return {
          ...w,
          isLiked: nextLiked,
          likes: nextLiked ? w.likes + 1 : w.likes - 1
        };
      }
      return w;
    }));
  };

  if (!currentUser) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-taruvar-light text-taruvar-secondary rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-glow">
          🌱
        </div>
        <h2 className="text-3xl font-extrabold text-taruvar-dark">Your Taruvar Eco-Profile</h2>
        <p className="text-sm text-taruvar-muted leading-relaxed">
          Log in or register to track your adopted trees, log 1-15 day growth & wellness care, upload environmental social works, and earn verified badges!
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
        >
          Log In / Register Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. PROFILE HEADER BANNER */}
      <div className="bg-gradient-to-r from-taruvar-secondary via-[#1F5435] to-taruvar-dark text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur border-2 border-white/20 flex items-center justify-center text-4xl shadow-lg shrink-0">
            🌱
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{displayName}</h1>
              <span className="px-2.5 py-0.5 bg-taruvar-accent text-taruvar-dark text-[10px] font-bold rounded-full uppercase tracking-wider">
                Eco Guardian
              </span>
            </div>
            <p className="text-xs text-white/80">{userEmail}</p>
            <p className="text-[11px] text-taruvar-accent font-medium pt-1">
              Official Taruvar Account • taruvar.org
            </p>
          </div>
        </div>

        {/* Right Stats & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 z-10">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-2xl font-black text-taruvar-accent">{myTrees.length}</p>
              <p className="text-[10px] text-white/80 uppercase">Trees Adopted</p>
            </div>
            <div className="text-center px-3">
              <p className="text-2xl font-black text-white">{socialWorks.length}</p>
              <p className="text-[10px] text-white/80 uppercase">Eco Actions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {isAdmin && (
              <button
                onClick={() => {
                  if (setActivePage) setActivePage('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-taruvar-dark font-black text-xs rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300/40"
              >
                <ShieldCheck className="w-4 h-4 text-taruvar-dark stroke-[2.5]" />
                <span>Admin Desk</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2.5 bg-white/15 hover:bg-red-600 text-white font-bold text-xs rounded-2xl border border-white/20 shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECTION TAB CONTROLS */}
      <div className="flex items-center justify-between border-b border-taruvar-border pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'my-trees', label: 'Section A: My Trees & Wellness', icon: '🌳' },
            { id: 'social-work', label: 'Section B: Environmental Care Work', icon: '🌊' },
            { id: 'id-card', label: 'My Eco-Guardian Card', icon: '🪪' },
            { id: 'leaderboard', label: 'Eco Leaderboard', icon: '🏆' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-taruvar-secondary text-white shadow-md'
                  : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'my-trees' ? (
          <button
            onClick={onOpenAdopt}
            className="px-4 py-2.5 bg-taruvar-primary text-taruvar-dark font-extrabold text-xs rounded-2xl shadow hover:bg-taruvar-accent transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adopt Another Tree
          </button>
        ) : activeTab === 'social-work' ? (
          <button
            onClick={() => setShowSocialModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Environmental Work
          </button>
        ) : null}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SECTION A — MY ADOPTED TREES & FLEXIBLE 1-15 DAY CARE   */}
      {/* ============================================================== */}
      {activeTab === 'my-trees' && (
        <div className="space-y-6">
          
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Tree Adoption & Flexible Wellness Monitoring</span>
              </h3>
              <p className="text-xs text-emerald-800/80">
                Log nurturing updates according to your preferred schedule (select 1 to 15 days interval from the dropdown).
              </p>
            </div>
            <button
              onClick={onOpenAdopt}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
            >
              + Adopt New Sapling
            </button>
          </div>

          {myTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-4">
              <span className="text-4xl">🌱</span>
              <h3 className="text-xl font-bold text-taruvar-dark">No Adopted Trees Yet</h3>
              <p className="text-xs text-taruvar-muted max-w-sm mx-auto">
                Join the #OnePersonOneTree movement by adopting your first sapling, pledging 365-day care, and tracking its wellness updates!
              </p>
              <button
                onClick={onOpenAdopt}
                className="px-6 py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-2xl shadow cursor-pointer"
              >
                Adopt Your First Tree Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myTrees.map((tree) => (
                <div key={tree.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-taruvar-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Tree Photo & Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border">
                      <img src={tree.plantation_photo} alt={tree.tree_name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-taruvar-dark/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold">
                        ID: {tree.id}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>{tree.wellness || 'Thriving'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-taruvar-secondary uppercase tracking-wider">{tree.species}</span>
                      <h3 className="text-2xl font-extrabold text-taruvar-dark">{tree.tree_name}</h3>
                      <p className="text-xs text-taruvar-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-taruvar-primary" /> {tree.location} • Planted {tree.planted_date || 'Recent'}
                      </p>
                    </div>

                    {/* Wellness Details Pill */}
                    <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-taruvar-muted font-bold">Care Cadence:</span>
                        <span className="font-extrabold text-taruvar-secondary">{tree.lastCareInterval || 'Flexible 1-15 Days'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-taruvar-muted font-bold">Wellness Status:</span>
                        <span className="font-bold text-emerald-700">{tree.wellness || 'Thriving & Healthy'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 1-15 Day Care & Growth Logs */}
                  <div className="lg:col-span-7 space-y-5 border-t lg:border-t-0 lg:border-l border-taruvar-border pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-taruvar-dark text-lg">Tree Wellness & Care Logs</h4>
                          <p className="text-xs text-taruvar-muted">Update growth measurements, watering, and wellness photos anytime.</p>
                        </div>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-taruvar-light text-taruvar-secondary rounded-full">
                          {(tree.reports || []).length} Logs Recorded
                        </span>
                      </div>

                      {/* Care Logs List */}
                      {(tree.reports || []).length === 0 ? (
                        <div className="p-6 bg-taruvar-bg rounded-2xl border border-taruvar-border text-center text-xs text-taruvar-muted space-y-2">
                          <Droplets className="w-6 h-6 text-taruvar-secondary mx-auto" />
                          <p className="font-bold text-taruvar-dark">No Care Logs Submitted Yet</p>
                          <p>Record your first watering, organic fertilizing, or wellness update below!</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {(tree.reports || []).map((rep, idx) => (
                            <div key={rep.id || idx} className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center gap-3 text-xs">
                              <img src={rep.photo} alt="Care log" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-taruvar-dark truncate">
                                    {rep.activity || `Log #${idx + 1}`} ({rep.intervalDays ? `${rep.intervalDays}-Day Cadence` : 'Care Update'})
                                  </span>
                                  <span className="text-[10px] text-taruvar-muted shrink-0">{rep.date}</span>
                                </div>
                                <p className="text-[11px] text-emerald-700 font-bold mt-0.5">{rep.wellness || 'Status: Thriving'}</p>
                                <p className="text-taruvar-muted truncate text-[11px]">{rep.notes}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action to Log Careness / Wellness (1-15 Days Dropdown) */}
                    <div className="pt-4 border-t border-taruvar-border">
                      <button
                        onClick={() => {
                          setReportModalTree(tree);
                          setReportNotes('');
                          setReportPhotoPreview(null);
                        }}
                        className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> Log Tree Care & Wellness Update (1-15 Days Cadence)
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SECTION B — ENVIRONMENTAL SOCIAL WORK (RIVERS/MOUNTAINS)*/}
      {/* ============================================================== */}
      {activeTab === 'social-work' && (
        <div className="space-y-8">
          
          {/* Stunning Section B Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-900 to-[#0d2a1b] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-teal-500/30 space-y-6">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="px-3.5 py-1 bg-teal-400/20 text-teal-300 text-xs font-black rounded-full uppercase tracking-wider border border-teal-400/30 inline-flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Section B • Citizen Eco-Stewardship</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Environmental Care & Social Impact
                </h3>
                <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
                  Beyond tree care, document and showcase your real-world environmental actions: clean riverbanks, clear mountain trails, organize waste collection, and lead community wellness drives.
                </p>
              </div>

              {/* Attractive Primary + Add Yours Button */}
              <button
                onClick={() => setShowSocialModal(true)}
                className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 hover:from-teal-300 hover:to-emerald-300 text-taruvar-dark font-black text-sm rounded-2xl shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>+ Add Your Eco Action</span>
              </button>
            </div>

            {/* Quick Interactive Category Launch Chips */}
            <div className="relative z-10 pt-4 border-t border-white/15">
              <p className="text-[11px] font-bold text-teal-200/70 uppercase tracking-wider mb-2.5">
                Quick Category Actions (Click to Log):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: 'River Cleaning', icon: '🌊', cat: 'River & Water Cleaning' },
                  { label: 'Mountain Care', icon: '🏔️', cat: 'Mountain & Forest Care' },
                  { label: 'Park Waste', icon: '🧹', cat: 'Neighborhood & Park Waste Cleanup' },
                  { label: 'Planting Drive', icon: '🪴', cat: 'Plantation & Seedballs' },
                  { label: 'Eco Wellness', icon: '🧘', cat: 'Eco Wellness & Awareness' },
                  { label: 'Plastic Free', icon: '♻️', cat: 'Plastic Free Drive' }
                ].map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setSocialForm(prev => ({ ...prev, category: chip.cat }));
                      setShowSocialModal(true);
                    }}
                    className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 rounded-2xl text-center space-y-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xl block group-hover:scale-110 transition-transform">{chip.icon}</span>
                    <span className="text-[11px] font-bold text-white block truncate">{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Decorative Blur Orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Social Works Gallery / Clean Zero-State */}
          {socialWorks.length === 0 ? (
            <div className="bg-white p-12 sm:p-16 rounded-3xl border border-taruvar-border text-center space-y-5 shadow-card">
              <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner border border-teal-200">
                🌊
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-xl font-black text-taruvar-dark">No Environmental Works Logged Yet</h3>
                <p className="text-xs text-taruvar-muted leading-relaxed">
                  Have you participated in a river cleaning, mountain trail waste cleanup, or neighborhood greening? Be the first to log your action!
                </p>
              </div>
              <button
                onClick={() => setShowSocialModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all hover:scale-105"
              >
                + Log Your First Environmental Work
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socialWorks.map((work) => (
                <div key={work.id} className="bg-white rounded-3xl border border-taruvar-border shadow-card hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">
                  
                  <div>
                    {/* Photo */}
                    <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                      <img src={work.photo} alt={work.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20">
                        <span>{work.categoryIcon}</span>
                        <span>{work.category}</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-teal-950/80 backdrop-blur-md text-teal-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-teal-500/30">
                        {work.timeInterval}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-taruvar-muted mb-1">
                          <span className="font-bold text-taruvar-secondary flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {work.author}
                          </span>
                          <span>{work.date}</span>
                        </div>
                        <h4 className="font-black text-taruvar-dark text-base">{work.title}</h4>
                        <p className="text-xs text-taruvar-muted flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {work.location}
                        </p>
                      </div>

                      {/* Impact Pill */}
                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs">
                        <span className="font-extrabold text-teal-900 block">🌿 Measurable Impact:</span>
                        <p className="text-teal-800 font-bold mt-0.5">{work.impact}</p>
                      </div>

                      <p className="text-xs text-taruvar-dark/80 leading-relaxed">
                        {work.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Likes */}
                  <div className="p-4 bg-taruvar-bg border-t border-taruvar-border flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleLikeSocialWork(work.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        work.isLiked ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-taruvar-dark hover:bg-taruvar-light'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${work.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{work.likes} Likes</span>
                    </button>

                    <span className="text-[11px] text-taruvar-muted font-bold">
                      👁️ {work.views || 45} Views on Explore
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MY ECO-GUARDIAN ID CARD                                  */}
      {/* ============================================================== */}
      {activeTab === 'id-card' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-taruvar-border shadow-card space-y-6 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full uppercase tracking-wider inline-block">
              Digital Guardian Identity
            </span>
            <h2 className="text-2xl font-black text-taruvar-dark">Your Official Eco-Guardian ID Card</h2>
            <p className="text-xs text-taruvar-muted">
              Use this digital identity card to verify your adopted tree, show your care progress, or print a physical PVC card for your wallet/lanyard.
            </p>
          </div>

          <GuardianIdCard
            guardianName={displayName}
            memberId={currentUser?.user_metadata?.member_id || `TRV-IND-2026-${currentUser?.id ? currentUser.id.substring(0, 4) : '2026'}`}
            treeId={myTrees[0]?.id || myTrees[0]?.treeId || 'TRV-TREE-PENDING'}
            species={myTrees[0]?.species || 'Registered Eco-Guardian'}
            plantedDate={myTrees[0]?.planted_date || myTrees[0]?.plantedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            location={myTrees[0]?.location || 'Active Guardian Community'}
            verifiedMonths={myTrees[0]?.verified_months || 1}
            photoUrl={myTrees[0]?.plantation_photo || myTrees[0]?.photoUrl || null}
            isBulk={myTrees[0]?.isBulk}
            orgName={myTrees[0]?.orgName}
            treeCount={myTrees[0]?.treeCount}
            treeStatus={myTrees[0]?.status || 'pending'}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ECO LEADERBOARD (DYNAMIC & CLEAN)                        */}
      {/* ============================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-taruvar-secondary uppercase tracking-widest bg-taruvar-light px-3 py-1 rounded-full">
              Live Guardian Ranking
            </span>
            <h3 className="text-2xl font-extrabold text-taruvar-dark">Public Tree & Action Leaderboard</h3>
            <p className="text-xs text-taruvar-muted">Ranked by verified adoptions, community upvotes, and environmental actions.</p>
          </div>

          {myTrees.length === 0 && socialWorks.length === 0 ? (
            <div className="p-10 bg-taruvar-bg rounded-3xl border border-taruvar-border text-center space-y-3">
              <span className="text-3xl">🏆</span>
              <h4 className="font-bold text-base text-taruvar-dark">No Leaderboard Entries Yet</h4>
              <p className="text-xs text-taruvar-muted">Adopt a tree or log an environmental action to start climbing the rankings!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...myTrees, ...socialWorks]
                .sort((a, b) => (b.upvotes || b.likes || 0) - (a.upvotes || a.likes || 0))
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={item.id || idx} className="p-4 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-taruvar-light text-taruvar-secondary font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-taruvar-dark">
                          {item.tree_name || item.title}
                        </h4>
                        <p className="text-[10px] text-taruvar-muted">
                          {item.species || item.category} • {item.location}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-white font-mono font-bold text-xs rounded-full border border-taruvar-border text-taruvar-secondary">
                      {item.upvotes || item.likes || 0} Upvotes
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL A: LOG TREE CARE & WELLNESS (1-15 DAYS DROPDOWN)          */}
      {/* ============================================================== */}
      {reportModalTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-taruvar-dark w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-taruvar-border space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-taruvar-secondary" />
                <h3 className="font-black text-lg">Log Tree Care & Wellness</h3>
              </div>
              <button 
                onClick={() => setReportModalTree(null)}
                className="w-8 h-8 rounded-full bg-taruvar-bg flex items-center justify-center text-gray-500 hover:text-taruvar-dark cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitTreeCareUpdate} className="space-y-4 text-xs">
              
              <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center gap-3">
                <img src={reportModalTree.plantation_photo} alt="Tree" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-extrabold text-taruvar-dark">{reportModalTree.tree_name}</h4>
                  <p className="text-[10px] text-taruvar-muted">{reportModalTree.species} • {reportModalTree.location}</p>
                </div>
              </div>

              {/* 1. Time Interval Dropdown (1 to 15 Days Option) */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 text-taruvar-secondary">
                  ⏱️ Select Care Update Time Interval (1 - 15 Days) *
                </label>
                <select
                  value={careIntervalDays}
                  onChange={(e) => setCareIntervalDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border bg-white font-bold text-taruvar-dark focus:ring-2 focus:ring-taruvar-secondary"
                >
                  <option value={1}>1 Day — Daily Care Update</option>
                  <option value={2}>2 Days — Alternate Day Care</option>
                  <option value={3}>3 Days — 3-Day Wellness Routine</option>
                  <option value={4}>4 Days — 4-Day Progress Update</option>
                  <option value={5}>5 Days — 5-Day Growth Check</option>
                  <option value={6}>6 Days — 6-Day Log</option>
                  <option value={7}>7 Days — Weekly Care & Nourishment</option>
                  <option value={8}>8 Days — 8-Day Progress</option>
                  <option value={9}>9 Days — 9-Day Progress</option>
                  <option value={10}>10 Days — 10-Day Growth Milestone</option>
                  <option value={11}>11 Days — 11-Day Update</option>
                  <option value={12}>12 Days — 12-Day Update</option>
                  <option value={13}>13 Days — 13-Day Update</option>
                  <option value={14}>14 Days — Bi-Weekly Routine</option>
                  <option value={15}>15 Days — Fortnightly Growth & Wellness</option>
                </select>
                <p className="text-[10px] text-taruvar-muted mt-1">Select the exact day cadence you are logging for your tree.</p>
              </div>

              {/* 2. Care Activity & Wellness Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Care Activity Performed</label>
                  <select
                    value={careActivity}
                    onChange={(e) => setCareActivity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="Watering & Soil Nurturing">💧 Watering & Soil Nurturing</option>
                    <option value="Organic Vermicompost Added">🍂 Organic Vermicompost Added</option>
                    <option value="Weeding & Pest Defense">🛡️ Weeding & Pest Defense</option>
                    <option value="Sunlight / Shade Adjustment">☀️ Sunlight / Shade Adjustment</option>
                    <option value="Growth & Height Measurement">📏 Growth & Height Measurement</option>
                    <option value="Protective Fencing Maintained">🎋 Protective Fencing Maintained</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Tree Wellness Status</label>
                  <select
                    value={wellnessStatus}
                    onChange={(e) => setWellnessStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white font-bold text-emerald-700"
                  >
                    <option value="Thriving & Lush Green">🌟 Thriving & Lush Green</option>
                    <option value="Healthy Steady Growth">🌱 Healthy Steady Growth</option>
                    <option value="Dry / Needs Water Care">💧 Dry / Needs Water Care</option>
                    <option value="Recovering from Heat/Frost">🩹 Recovering from Heat/Frost</option>
                  </select>
                </div>
              </div>

              {/* 3. Photo Upload */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Progress Photo *</label>
                <label 
                  htmlFor="tree-care-photo"
                  className="block border-2 border-dashed border-taruvar-secondary/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-taruvar-light/50 transition-all bg-taruvar-bg"
                >
                  <input 
                    type="file" 
                    id="tree-care-photo" 
                    accept="image/*" 
                    onChange={handlePhotoSelect} 
                    className="hidden" 
                  />
                  {reportPhotoPreview ? (
                    <div>
                      <img src={reportPhotoPreview} alt="Preview" className="h-36 mx-auto object-cover rounded-xl border border-taruvar-border" />
                      <span className="block text-[10px] text-taruvar-secondary font-bold mt-1">✓ Photo attached (tap to change)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-3">
                      <Camera className="w-7 h-7 text-taruvar-secondary mx-auto" />
                      <p className="font-bold">Upload fresh tree progress photo</p>
                      <p className="text-[10px] text-taruvar-muted">Shows leaves, height, and general wellness</p>
                    </div>
                  )}
                </label>
              </div>

              {/* 4. Notes */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Care Notes & Observations</label>
                <textarea
                  rows={2}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Watered 5 liters in the evening, added 200g vermicompost, shoots are turning bright green..."
                  className="w-full px-3.5 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Sprout className="w-4 h-4" />
                <span>Save {careIntervalDays}-Day Wellness Log</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL B: UPLOAD ENVIRONMENTAL SOCIAL WORK (CLEANING, RIVERS..) */}
      {/* ============================================================== */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-taruvar-dark w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-taruvar-border space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-lg">Log Environmental Care Work</h3>
              </div>
              <button 
                onClick={() => setShowSocialModal(false)}
                className="w-8 h-8 rounded-full bg-taruvar-bg flex items-center justify-center text-gray-500 hover:text-taruvar-dark cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitSocialWork} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Title of Environmental Initiative *</label>
                <input
                  type="text"
                  required
                  value={socialForm.title}
                  onChange={(e) => setSocialForm({ ...socialForm, title: e.target.value })}
                  placeholder="e.g. Yamuna Riverbank Cleanliness Drive / Aravalli Hill Trek"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={socialForm.category}
                    onChange={(e) => setSocialForm({ ...socialForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="River & Water Cleaning">🌊 River & Water Body Cleaning</option>
                    <option value="Mountain & Forest Care">🏔️ Mountain & Forest Care</option>
                    <option value="Neighborhood & Park Waste Cleanup">🧹 Neighborhood & Park Waste Cleanup</option>
                    <option value="Plantation & Seedballs">🪴 Plantation & Seedballs Drive</option>
                    <option value="Eco Wellness & Awareness">🧘 Eco Wellness & Workshop</option>
                    <option value="Plastic Free Drive">♻️ Plastic Free / Zero Waste Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Duration / Time Cadence</label>
                  <select
                    value={socialForm.timeInterval}
                    onChange={(e) => setSocialForm({ ...socialForm, timeInterval: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white font-bold"
                  >
                    <option value="1 Day Action">1 Day Single Action</option>
                    <option value="3 Days Campaign">3 Days Campaign</option>
                    <option value="7 Days Drive">7 Days Drive (1 Week)</option>
                    <option value="15 Days Initiative">15 Days Initiative</option>
                    <option value="Ongoing Community Project">Ongoing Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={socialForm.location}
                    onChange={(e) => setSocialForm({ ...socialForm, location: e.target.value })}
                    placeholder="e.g. Ghat #4, Rishikesh / Ridge Forest"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Measurable Impact</label>
                  <input
                    type="text"
                    value={socialForm.impact}
                    onChange={(e) => setSocialForm({ ...socialForm, impact: e.target.value })}
                    placeholder="e.g. 50 kg plastic cleared, 12 volunteers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Action / Field Photo *</label>
                <label 
                  htmlFor="social-photo-input"
                  className="block border-2 border-dashed border-teal-500/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-teal-50/50 transition-all bg-taruvar-bg"
                >
                  <input 
                    type="file" 
                    id="social-photo-input" 
                    accept="image/*" 
                    onChange={handleSocialPhotoSelect} 
                    className="hidden" 
                  />
                  {socialForm.photoPreview ? (
                    <div>
                      <img src={socialForm.photoPreview} alt="Preview" className="h-36 mx-auto object-cover rounded-xl border border-taruvar-border" />
                      <span className="block text-[10px] text-teal-700 font-bold mt-1">✓ Photo attached (tap to change)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-3">
                      <Upload className="w-7 h-7 text-teal-600 mx-auto" />
                      <p className="font-bold">Upload cleanup / environmental proof photo</p>
                      <p className="text-[10px] text-taruvar-muted">Shows volunteers, before/after, or collection bags</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Action Description & Highlights</label>
                <textarea
                  rows={2}
                  value={socialForm.description}
                  onChange={(e) => setSocialForm({ ...socialForm, description: e.target.value })}
                  placeholder="Describe what you and your community accomplished, materials collected, or lessons learned..."
                  className="w-full px-3.5 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-teal-600"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingSocial}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Waves className="w-4 h-4" />
                <span>Publish Environmental Work to Explore Feed</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
