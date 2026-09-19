import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Compass, Sprout, ArrowUp, ArrowDown, 
  MapPin, Calendar, Award, CheckCircle2, Volume2, VolumeX, Sparkles, 
  Plus, Camera, Upload, ShieldCheck, TreePine, Eye, X, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

export default function ExplorePage({ currentUser, onOpenPledge, showToast, onOpenAuth }) {
  // If user is not logged in, show auth gate screen
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-taruvar-border shadow-card text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-taruvar-primary text-taruvar-dark rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/20">
            🌱
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-taruvar-secondary" />
              <span>Taruvar Reels & Feed</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-taruvar-dark">
              Sign In to Watch Taruvar Reels
            </h2>
            <p className="text-xs sm:text-sm text-taruvar-muted leading-relaxed">
              Join the <strong>#OnePersonOneTree</strong> movement to watch real-time sapling reels, cheer tree guardians, and track 5-month growth stories across India.
            </p>
          </div>

          <div className="p-4 bg-taruvar-bg/70 rounded-2xl border border-taruvar-border text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Watch verified tree plantation reels & videos</span>
            </div>
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Like, cheer & comment on fellow guardians' progress</span>
            </div>
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Post your own tree updates & earn milestone badges</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black text-sm rounded-2xl shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In / Create Guardian Account</span>
            </button>

            <button
              onClick={onOpenPledge}
              className="w-full py-3 bg-taruvar-light hover:bg-taruvar-border text-taruvar-dark font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-taruvar-secondary" />
              <span>Adopt a Tree First</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'adoptions' | 'milestones' | 'bulk'
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [heartAnim, setHeartAnim] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});

  // Tree Post Modal State
  const [postFormData, setPostFormData] = useState({
    treeName: '',
    species: 'Neem Tree (Azadirachta indica)',
    location: '',
    month: 1,
    caption: '',
    photo: null,
    photoPreview: null
  });
  const [postLoading, setPostLoading] = useState(false);

  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Default initial rich reels showcase (real movement stories)
  const defaultReels = [
    {
      id: 'reel-1',
      author: 'Naveen Sharma',
      memberId: 'TRV-ADMIN-001',
      avatar: '🌱',
      tree_name: 'Banyan Sanctuary Guardian',
      species: 'Banyan Tree (Ficus benghalensis)',
      treeCount: 1,
      isBulk: false,
      location: 'Botanical Eco Corridor, Delhi NCR',
      photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      caption: 'Starting Day 1 of our Banyan tree guardianship. Planted with organic vermicompost and bamboo protective cage! #OnePersonOneTree #Paalna',
      milestone: 'Day 1 • Plantation Complete',
      verifiedMonths: 1,
      likes: 142,
      isLiked: false,
      date: 'Sep 18, 2026',
      badge: 'Core Founder Tree'
    },
    {
      id: 'reel-2',
      author: 'Delhi Public School Campus Chapter',
      memberId: 'TRV-ORG-2026-DPS-50',
      avatar: '🎓',
      tree_name: 'DPS Green Shakti Canopy',
      species: '50 Trees (Neem, Peepal, Jamun & Gulmohar)',
      treeCount: 50,
      isBulk: true,
      orgName: 'Delhi Public School Chapter',
      location: 'Campus Playground Green Boundary',
      photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      caption: '50 students each took personal responsibility for 1 sapling today! We are monitoring drip irrigation daily. Month 1 growth verified.',
      milestone: 'Month 1 • 50/50 Trees Thriving',
      verifiedMonths: 1,
      likes: 289,
      isLiked: false,
      date: 'Sep 15, 2026',
      badge: 'Campus Bulk Drive'
    },
    {
      id: 'reel-3',
      author: 'Taruvar Green Shakti Circle',
      memberId: 'TRV-GNS-2026-088',
      avatar: '👩',
      tree_name: 'Amrit Neem Care Hub',
      species: 'Neem Tree (Azadirachta indica)',
      treeCount: 1,
      isBulk: false,
      location: 'Community Park Ward 7',
      photo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      caption: 'Month 3 update: Our neighborhood women circle watered through peak heat. 14cm height gain with fresh green shoots! 🌿',
      milestone: 'Month 3 • Verified Growth',
      verifiedMonths: 3,
      likes: 318,
      isLiked: false,
      date: 'Sep 10, 2026',
      badge: 'Green Shakti Care'
    }
  ];

  const [reelsList, setReelsList] = useState(() => {
    try {
      const localAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      if (localAdoptions.length > 0) {
        const mapped = localAdoptions.map((t, idx) => ({
          id: t.id || `local-${idx}`,
          author: t.guardianName || t.adopter_name || 'Eco Guardian',
          memberId: t.memberId || 'TRV-IND-2026-MEMBER',
          avatar: '🌱',
          tree_name: t.tree_name || t.treeName || 'My Adopted Tree',
          species: t.species || 'Indigenous Tree',
          treeCount: t.treeCount || 1,
          isBulk: t.isBulk || false,
          orgName: t.orgName || null,
          location: t.location || 'Community Green Area',
          photo: t.photoUrl || t.plantation_photo || '/logo.jpg',
          caption: t.caption || `Adopted under the Taruvar #OnePersonOneTree movement. Caring for this sapling with 365-day Paalna commitment.`,
          milestone: `Month ${t.verified_months || 1} • Verified Progress`,
          verifiedMonths: t.verified_months || 1,
          likes: t.upvotes || 24,
          isLiked: false,
          date: t.plantedDate || 'Recent',
          badge: t.isBulk ? 'Organization Drive' : 'Individual Guardian'
        }));
        return [...mapped, ...defaultReels];
      }
      return defaultReels;
    } catch {
      return defaultReels;
    }
  });

  // Filtered Reels
  const filteredReels = reelsList.filter(reel => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bulk') return reel.isBulk;
    if (activeFilter === 'milestones') return reel.verifiedMonths > 1;
    if (activeFilter === 'adoptions') return reel.verifiedMonths === 1;
    return true;
  });

  const activeReel = filteredReels[currentReelIndex] || filteredReels[0];

  const handleNextReel = () => {
    if (currentReelIndex < filteredReels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else {
      setCurrentReelIndex(0); // loop back
    }
  };

  const handlePrevReel = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    } else {
      setCurrentReelIndex(filteredReels.length - 1);
    }
  };

  // Keyboard navigation (Up/Down arrow keys for reels)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrevReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentReelIndex, filteredReels.length]);

  const handleToggleLike = (reelId) => {
    setReelsList(prev => prev.map(reel => {
      if (reel.id === reelId) {
        const nextLiked = !reel.isLiked;
        if (nextLiked) {
          setHeartAnim(reelId);
          setTimeout(() => setHeartAnim(null), 1000);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        }
        return {
          ...reel,
          isLiked: nextLiked,
          likes: nextLiked ? reel.likes + 1 : reel.likes - 1
        };
      }
      return reel;
    }));
  };

  const handleDoubleTap = (reelId) => {
    const reel = reelsList.find(r => r.id === reelId);
    if (reel && !reel.isLiked) {
      handleToggleLike(reelId);
    } else {
      setHeartAnim(reelId);
      setTimeout(() => setHeartAnim(null), 1000);
    }
  };

  const handleShare = (reel) => {
    const shareText = `Check out this verified tree adoption by ${reel.author} on Taruvar! 🌱\nSpecies: ${reel.species}\nLocation: ${reel.location}\nExplore at https://taruvar.org`;
    if (navigator.share) {
      navigator.share({
        title: 'Taruvar Tree Story',
        text: shareText,
        url: 'https://taruvar.org'
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      if (showToast) {
        showToast('Tree Reel link copied to clipboard! Share on WhatsApp / Instagram.');
      }
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Supporter';
    const newComment = {
      id: Date.now(),
      author: authorName,
      text: commentText.trim(),
      time: 'Just now'
    };
    setComments(prev => ({
      ...prev,
      [activeReel?.id]: [...(prev[activeReel?.id] || []), newComment]
    }));
    setCommentText('');
    if (showToast) showToast('Comment posted! 🌱');
  };

  // Photo Select for New Post
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostFormData(prev => ({
          ...prev,
          photo: reader.result,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Tree Story / Reel Post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postFormData.photoPreview || !postFormData.treeName) {
      alert('Please provide a tree name and upload a photo to post.');
      return;
    }

    setPostLoading(true);
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Guardian';
    const memberId = currentUser?.user_metadata?.member_id || `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReel = {
      id: `reel-${Date.now()}`,
      author: authorName,
      memberId: memberId,
      avatar: '🌱',
      tree_name: postFormData.treeName,
      species: postFormData.species,
      treeCount: 1,
      isBulk: false,
      location: postFormData.location || 'Local Community Canopy',
      photo: postFormData.photoPreview,
      caption: postFormData.caption || `Caring for our new ${postFormData.treeName} under Taruvar Paalna movement. Month ${postFormData.month} update!`,
      milestone: `Month ${postFormData.month} • Verified Progress`,
      verifiedMonths: Number(postFormData.month) || 1,
      likes: 1,
      isLiked: true,
      date: 'Today',
      badge: 'Community Reel'
    };

    setReelsList([newReel, ...reelsList]);
    setCurrentReelIndex(0);
    setPostLoading(false);
    setShowPostModal(false);
    setPostFormData({
      treeName: '',
      species: 'Neem Tree (Azadirachta indica)',
      location: '',
      month: 1,
      caption: '',
      photo: null,
      photoPreview: null
    });

    confetti({ particleCount: 80, spread: 70 });
    if (showToast) {
      showToast('Your Tree Reel update is live on the Explore Feed!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1c14] text-white py-4 md:py-8 px-2 sm:px-4 flex flex-col items-center">
      
      {/* Top Filter & Action Bar */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between gap-2 px-2 z-20">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: '🌟 All Reels' },
            { id: 'adoptions', label: '🌱 New Adoptions' },
            { id: 'milestones', label: '🌿 Growth Progress' },
            { id: 'bulk', label: '🏢 Bulk Drives' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => { setActiveFilter(filter.id); setCurrentReelIndex(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter.id
                  ? 'bg-taruvar-primary text-taruvar-dark shadow-md font-extrabold'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Post Tree Update Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              if (showToast) showToast('Please sign in to share a tree update reel!');
              onOpenAuth();
            } else {
              setShowPostModal(true);
            }
          }}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-taruvar-dark font-black text-xs rounded-full shadow-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-transform hover:scale-105"
          title="Post Tree Reel"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Post Reel</span>
        </button>
      </div>

      {/* Main Reels Container (Aspect 9:16 Responsive Mobile/Desktop Card) */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[78vh] sm:h-[82vh] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black flex flex-col justify-between select-none">
        
        {/* Background Fullscreen Reel Photo with Double-Tap Support */}
        {activeReel && (
          <div 
            className="absolute inset-0 z-0 cursor-pointer"
            onDoubleClick={() => handleDoubleTap(activeReel.id)}
          >
            <img 
              src={activeReel.photo} 
              alt={activeReel.tree_name} 
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlays for crisp readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
          </div>
        )}

        {/* Heart Burst Animation on Double-Tap/Like */}
        {heartAnim === activeReel?.id && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-2xl" />
          </div>
        )}

        {/* Top Header Information on Reel */}
        <div className="relative z-10 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-taruvar-accent">{activeReel?.badge || 'Taruvar Reel'}</span>
            <span className="text-white/60">• {currentReelIndex + 1}/{filteredReels.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white border border-white/20 transition-all cursor-pointer"
              title={isMuted ? 'Unmute Ambient Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-taruvar-primary" />}
            </button>
          </div>
        </div>

        {/* Right Floating Action Sidebar (Like, Comment, Share, Adopt) */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5">
          
          {/* Like / Heart Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleToggleLike(activeReel?.id)}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-125 ${
                activeReel?.isLiked 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
              }`}
            >
              <Heart className={`w-6 h-6 ${activeReel?.isLiked ? 'fill-white' : ''}`} />
            </button>
            <span className="text-[11px] font-black text-white mt-1 drop-shadow-md">
              {activeReel?.likes || 0}
            </span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowCommentsModal(true)}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer shadow-lg active:scale-110"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-[11px] font-black text-white mt-1 drop-shadow-md">
              {(comments[activeReel?.id]?.length || 0) + 3}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleShare(activeReel)}
              className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 border border-white/20 transition-all cursor-pointer shadow-lg active:scale-110"
              title="Share Reel"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">Share</span>
          </div>

          {/* Adopt Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={onOpenPledge}
              className="w-12 h-12 rounded-full bg-taruvar-primary text-taruvar-dark flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl shadow-taruvar-primary/40 p-1 border-2 border-white"
              title="Adopt This Tree Species"
            >
              <Sprout className="w-6 h-6 fill-taruvar-dark" />
            </button>
            <span className="text-[9px] font-extrabold text-taruvar-accent mt-1 uppercase tracking-tight">Adopt</span>
          </div>

        </div>

        {/* Bottom Reel Caption & Adopter Info Overlay */}
        <div className="relative z-10 p-5 pr-16 space-y-2.5">
          
          {/* Adopter Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-taruvar-primary flex items-center justify-center text-lg font-bold border-2 border-white/30 shadow-md">
              {activeReel?.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white drop-shadow-sm">{activeReel?.author}</h4>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              </div>
              <p className="text-[10px] font-mono font-bold text-taruvar-accent/90">{activeReel?.memberId}</p>
            </div>
          </div>

          {/* Tree Species & Location Tag */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur text-white text-[11px] font-bold border border-white/10 flex items-center gap-1">
              <TreePine className="w-3 h-3 text-emerald-400" />
              {activeReel?.species}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur text-white/90 text-[11px] font-medium border border-white/10 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              {activeReel?.location}
            </span>
          </div>

          {/* Milestone Badge & Caption */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-md text-[10px] font-extrabold border border-emerald-500/40">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{activeReel?.milestone}</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-normal line-clamp-3">
              {activeReel?.caption}
            </p>
          </div>

        </div>

      </div>

      {/* Desktop / Mobile Reel Navigation Controls (Up / Down Arrows) */}
      <div className="flex items-center justify-center gap-4 mt-4 z-20">
        <button
          onClick={handlePrevReel}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1 text-xs font-bold"
          title="Previous Tree Reel (↑ Arrow Up)"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <span className="text-xs font-bold text-white/60">
          Scroll or use ↑ ↓ keys
        </span>

        <button
          onClick={handleNextReel}
          className="p-3 bg-taruvar-secondary hover:bg-emerald-600 text-white rounded-full transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1 text-xs font-bold"
          title="Next Tree Reel (↓ Arrow Down)"
        >
          <span className="hidden sm:inline">Next Reel</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL 1: Comments & Community Feedback */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-taruvar-dark w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl p-5 space-y-4 max-h-[70vh] flex flex-col justify-between text-white">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-taruvar-primary" />
                <h3 className="font-extrabold text-sm">Community Tree Cheers</h3>
              </div>
              <button 
                onClick={() => setShowCommentsModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs hover:bg-white/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-accent">@priyasharma</span>
                  <span className="text-[10px] text-white/50">2h ago</span>
                </div>
                <p className="text-white/80">Such inspiring growth! The leaves look so lush and healthy 🌱👏</p>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-accent">@vikram_delhi</span>
                  <span className="text-[10px] text-white/50">5h ago</span>
                </div>
                <p className="text-white/80">Great initiative. Which organic compost mix did you use for the roots?</p>
              </div>

              {/* Dynamic user comments */}
              {(comments[activeReel?.id] || []).map((c) => (
                <div key={c.id} className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">@{c.author}</span>
                    <span className="text-[10px] text-white/50">{c.time}</span>
                  </div>
                  <p className="text-white/90">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Cheer this tree guardian..."
                className="flex-1 px-4 py-2.5 bg-white/10 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-taruvar-primary"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-taruvar-primary text-taruvar-dark font-black rounded-xl text-xs flex items-center justify-center cursor-pointer hover:bg-taruvar-accent transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Create Tree Reel / Growth Post */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-taruvar-dark w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-taruvar-border space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-taruvar-secondary" />
                <h3 className="font-black text-lg">Share Tree Reel Update</h3>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-taruvar-dark cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              
              {/* Photo Upload Area */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Tree / Sapling Photo *</label>
                <label 
                  htmlFor="reel-photo-input"
                  className="block border-2 border-dashed border-taruvar-secondary/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-taruvar-light/50 transition-all bg-taruvar-bg"
                >
                  <input 
                    type="file" 
                    id="reel-photo-input" 
                    accept="image/*" 
                    onChange={handlePhotoSelect} 
                    className="hidden" 
                  />
                  {postFormData.photoPreview ? (
                    <div>
                      <img src={postFormData.photoPreview} alt="Preview" className="h-36 mx-auto object-cover rounded-xl border border-taruvar-border" />
                      <span className="block text-[10px] text-taruvar-secondary font-bold mt-1">✓ Photo attached (tap to change)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-3">
                      <Upload className="w-8 h-8 text-taruvar-secondary mx-auto" />
                      <p className="font-bold">Select plantation / progress photo</p>
                      <p className="text-[10px] text-taruvar-muted">Shows tree height & current health</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Tree Name *</label>
                <input
                  type="text"
                  required
                  value={postFormData.treeName}
                  onChange={(e) => setPostFormData({ ...postFormData, treeName: e.target.value })}
                  placeholder="e.g. Green Peepal Guardian"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Tree Species</label>
                  <select
                    value={postFormData.species}
                    onChange={(e) => setPostFormData({ ...postFormData, species: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="Neem Tree (Azadirachta indica)">Neem Tree</option>
                    <option value="Peepal Tree (Ficus religiosa)">Peepal Tree</option>
                    <option value="Banyan Tree (Ficus benghalensis)">Banyan Tree</option>
                    <option value="Mango Tree (Mangifera indica)">Mango Tree</option>
                    <option value="Gulmohar (Delonix regia)">Gulmohar Tree</option>
                    <option value="Jamun Tree (Syzygium cumini)">Jamun Tree</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Growth Month</label>
                  <select
                    value={postFormData.month}
                    onChange={(e) => setPostFormData({ ...postFormData, month: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value={1}>Day 1 / Month 1 (Planted)</option>
                    <option value={2}>Month 2 Progress</option>
                    <option value={3}>Month 3 Progress</option>
                    <option value={4}>Month 4 Progress</option>
                    <option value={5}>Month 5 (Final Badge)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Plantation Location</label>
                <input
                  type="text"
                  value={postFormData.location}
                  onChange={(e) => setPostFormData({ ...postFormData, location: e.target.value })}
                  placeholder="e.g. Sector 15 Park, Noida"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-primary"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Caption / Care Notes</label>
                <textarea
                  rows={2}
                  value={postFormData.caption}
                  onChange={(e) => setPostFormData({ ...postFormData, caption: e.target.value })}
                  placeholder="Share a short note about this tree's watering, compost, or growth..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-primary"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={postLoading}
                className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm mt-2"
              >
                <Sprout className="w-4 h-4" />
                <span>Publish Tree Reel</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
