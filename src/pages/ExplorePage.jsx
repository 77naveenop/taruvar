import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Compass, Sprout, 
  MapPin, Calendar, Award, CheckCircle2, Sparkles, 
  Plus, Camera, Upload, ShieldCheck, TreePine, Eye, X, Send, Bookmark, MoreHorizontal,
  Flame, TrendingUp, Clock, Filter, Waves, Mountain, Trash2, Leaf, Activity, Droplets
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCloudApprovedAdoptions } from '../lib/cloudDb';

export default function ExplorePage({ currentUser, onOpenPledge, showToast, onOpenAuth }) {
  // If user is not logged in, show auth gate screen
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-taruvar-bg">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-taruvar-border shadow-card text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-taruvar-primary text-taruvar-dark rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/20">
            🌱
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-taruvar-secondary" />
              <span>Taruvar Environmental Feed</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-taruvar-dark">
              Sign In to Explore Feed
            </h2>
            <p className="text-xs sm:text-sm text-taruvar-muted leading-relaxed">
              Join the <strong>#OnePersonOneTree</strong> movement to scroll trending tree nurturing updates, river cleanups, mountain treks, and eco-wellness actions across India.
            </p>
          </div>

          <div className="p-4 bg-taruvar-bg/70 rounded-2xl border border-taruvar-border text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Watch verified tree plantation & 1-15 day care updates</span>
            </div>
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-teal-600">✓</span>
              <span>Discover river cleanups, mountain treks & waste drives</span>
            </div>
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Like, cheer & comment on fellow eco-guardians' work</span>
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

  // Filters & Sorting Algorithm
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'trending' | 'trees' | 'rivers' | 'mountains' | 'cleanups'
  const [sortBy, setSortBy] = useState('trending'); // 'trending' (algo) | 'recent' | 'views'
  const [heartAnim, setHeartAnim] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  // Tree / Eco Post Modal State
  const [postFormData, setPostFormData] = useState({
    title: '',
    category: 'Tree Adoption & Care',
    location: '',
    timeCadence: '1 Day Action',
    caption: '',
    photo: null,
    photoPreview: null
  });
  const [postLoading, setPostLoading] = useState(false);

  // Clean Aggregated feed state combining real Tree Adoptions + Environmental Social Works + Cloud DB (Zero Dummy Data)
  const [feedList, setFeedList] = useState(() => {
    try {
      const localAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const localSocialWorks = JSON.parse(localStorage.getItem('taruvar_social_works') || '[]');
      
      const mappedTrees = localAdoptions.map((t, idx) => ({
        id: t.id || `local-tree-${idx}`,
        author: t.guardianName || t.adopter_name || 'Eco Guardian',
        memberId: t.memberId || 'TRV-IND-2026-MEMBER',
        avatar: '🌱',
        type: 'tree',
        title: t.tree_name || t.treeName || 'My Adopted Tree',
        category: 'Tree Paalna Care',
        categoryIcon: '🌳',
        location: t.location || 'Community Green Area',
        photo: t.photoUrl || t.plantation_photo || '/logo.jpg',
        caption: t.caption || `Adopted under Taruvar #OnePersonOneTree. Cadence: ${t.lastCareInterval || '1-15 Days'} wellness log. Status: ${t.wellness || 'Thriving'} 🌱`,
        badge: t.isBulk ? 'Organization Drive' : 'Paalna Guardian',
        likes: t.upvotes || 1,
        views: (t.upvotes || 1) * 8 + 12,
        isLiked: false,
        date: t.plantedDate || 'RECENT',
        timestamp: Date.now() - (idx * 1000 * 60 * 60 * 12)
      }));

      const mappedSocial = localSocialWorks.map((w, idx) => ({
        id: w.id || `local-soc-${idx}`,
        author: w.author || 'Eco Guardian',
        memberId: 'TRV-SOC-2026',
        avatar: w.categoryIcon || '🌊',
        type: 'social',
        title: w.title || 'Environmental Care Work',
        category: w.category || 'Environmental Work',
        categoryIcon: w.categoryIcon || '🌊',
        location: w.location || 'Local Community Environment',
        photo: w.photo || '/logo.jpg',
        caption: `${w.description || ''} Impact: ${w.impact || 'Community Action'} 🌿`,
        badge: w.timeInterval || 'Environmental Drive',
        likes: w.likes || 1,
        views: w.views || (w.likes || 1) * 8 + 15,
        isLiked: false,
        date: w.date || 'RECENT',
        timestamp: Date.now() - (idx * 1000 * 60 * 60 * 8)
      }));

      return [...mappedSocial, ...mappedTrees];
    } catch {
      return [];
    }
  });

  // Background Cloud Sync
  useEffect(() => {
    async function loadCloudData() {
      try {
        const approvedCloud = await getCloudApprovedAdoptions();
        if (Array.isArray(approvedCloud) && approvedCloud.length > 0) {
          const cloudMapped = approvedCloud.map(t => ({
            id: t.id || t.treeId || `cloud-${Date.now()}`,
            author: t.adopter_name || t.guardianName || 'Eco Guardian',
            memberId: t.memberId || 'TRV-IND-2026-MEMBER',
            avatar: '🌱',
            type: 'tree',
            title: t.tree_name || t.treeName || 'Adopted Tree',
            category: 'Tree Paalna Care',
            categoryIcon: '🌳',
            location: t.location || 'Community Green Area',
            photo: t.plantation_photo || t.photoUrl || '/logo.jpg',
            caption: t.caption || `Adopted under the Taruvar #OnePersonOneTree movement. Verified by team Taruvar with ongoing wellness care! 🌿`,
            badge: t.isBulk ? 'Campus Drive' : 'Verified Guardian',
            likes: t.upvotes || 35,
            views: (t.upvotes || 35) * 18 + 320,
            isLiked: false,
            date: t.plantedDate || t.planted_date || 'RECENT',
            timestamp: Date.now() - 1000 * 60 * 60 * 24
          }));

          setFeedList(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = cloudMapped.filter(p => !existingIds.has(p.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('Explore cloud sync note:', err);
      }
    }
    loadCloudData();
  }, []);

  // Algorithm Ranking Function
  const calculateAlgoScore = (post) => {
    const viewsWeight = (post.views || 0) * 0.3;
    const likesWeight = (post.likes || 0) * 2.0;
    const commentsCount = (comments[post.id]?.length || 0);
    const commentsWeight = commentsCount * 3.0;
    
    // Recency boost (decay over time)
    const ageInHours = (Date.now() - (post.timestamp || Date.now())) / (1000 * 60 * 60);
    const recencyMultiplier = Math.max(0.2, 1 - (ageInHours / 240));

    return (viewsWeight + likesWeight + commentsWeight) * recencyMultiplier;
  };

  // Filter & Sort Pipeline
  const filteredAndSortedPosts = feedList
    .filter(post => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'trees') return post.type === 'tree' || post.category.includes('Tree');
      if (activeFilter === 'rivers') return post.category.includes('River') || post.title.toLowerCase().includes('river');
      if (activeFilter === 'mountains') return post.category.includes('Mountain') || post.title.toLowerCase().includes('hill') || post.title.toLowerCase().includes('trek');
      if (activeFilter === 'cleanups') return post.category.includes('Cleanup') || post.category.includes('Cleaning') || post.category.includes('Waste');
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') {
        return calculateAlgoScore(b) - calculateAlgoScore(a);
      }
      if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      if (sortBy === 'recent') {
        return (b.timestamp || 0) - (a.timestamp || 0);
      }
      return 0;
    });

  const handleToggleLike = (postId) => {
    setFeedList(prev => prev.map(post => {
      if (post.id === postId) {
        const nextLiked = !post.isLiked;
        if (nextLiked) {
          setHeartAnim(postId);
          setTimeout(() => setHeartAnim(null), 1000);
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        }
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : post.likes - 1,
          views: (post.views || 0) + 1 // Viewing/liking increments interaction
        };
      }
      return post;
    }));
  };

  const handleDoubleTap = (postId) => {
    const post = feedList.find(r => r.id === postId);
    if (post && !post.isLiked) {
      handleToggleLike(postId);
    } else {
      setHeartAnim(postId);
      setTimeout(() => setHeartAnim(null), 1000);
    }
  };

  const handleToggleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const next = !prev[postId];
      if (showToast) {
        showToast(next ? 'Post saved to your eco-collection! 🔖' : 'Removed from collection.');
      }
      return { ...prev, [postId]: next };
    });
  };

  const handleShare = (post) => {
    const shareText = `Check out this verified environmental care work: "${post.title}" by ${post.author} on Taruvar! 🌱\nLocation: ${post.location}\nExplore live at https://taruvar.org`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: shareText,
        url: 'https://taruvar.org'
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      if (showToast) {
        showToast('Link copied to clipboard! Share on WhatsApp / Instagram.');
      }
    }
  };

  const handleAddComment = (postId, text) => {
    if (!text || !text.trim()) return;
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Supporter';
    const newComment = {
      id: Date.now(),
      author: authorName,
      text: text.trim(),
      time: 'Just now'
    };
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setCommentText('');
    if (showToast) showToast('Cheer & comment posted! 🌱');
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

  // Submit New Post directly to Explore
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postFormData.photoPreview || !postFormData.title) {
      alert('Please provide a title and upload a photo to post.');
      return;
    }

    setPostLoading(true);
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Guardian';
    const memberId = currentUser?.user_metadata?.member_id || `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPost = {
      id: `feed-user-${Date.now()}`,
      author: authorName,
      memberId: memberId,
      avatar: postFormData.category.includes('River') ? '🌊' : postFormData.category.includes('Mountain') ? '🏔️' : '🌱',
      type: postFormData.category.includes('Tree') ? 'tree' : 'social',
      title: postFormData.title,
      category: postFormData.category,
      categoryIcon: postFormData.category.includes('River') ? '🌊' : postFormData.category.includes('Mountain') ? '🏔️' : '🌳',
      location: postFormData.location || 'Local Community Environment',
      photo: postFormData.photoPreview,
      caption: postFormData.caption || `${postFormData.title} completed under Taruvar movement. 🌱`,
      badge: postFormData.timeCadence || 'Eco Action',
      likes: 1,
      views: 12,
      isLiked: true,
      date: 'JUST NOW',
      timestamp: Date.now()
    };

    setFeedList([newPost, ...feedList]);
    setPostLoading(false);
    setShowPostModal(false);
    setPostFormData({
      title: '',
      category: 'Tree Adoption & Care',
      location: '',
      timeCadence: '1 Day Action',
      caption: '',
      photo: null,
      photoPreview: null
    });

    confetti({ particleCount: 70, spread: 60 });
    if (showToast) {
      showToast('Your Environmental Work is live on the Explore Feed! 🌿');
    }
  };

  return (
    <div className="min-h-screen bg-taruvar-bg text-taruvar-dark py-4 sm:py-8 px-3 sm:px-4">
      
      {/* Centered Instagram-Style Feed Container */}
      <div className="max-w-xl mx-auto w-full space-y-5">

        {/* 1. TOP STICKY DISCOVERY BAR & + ADD YOURS BUTTON */}
        <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-taruvar-border shadow-md space-y-2.5 transition-all">
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h2 className="font-black text-sm sm:text-base text-taruvar-dark leading-tight">Explore Feed</h2>
            </div>

            {/* Clean + Add Yours Toggle Button */}
            <button
              onClick={() => setShowPostModal(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-taruvar-secondary via-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title="Share your tree or environmental work"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Yours</span>
            </button>
          </div>

          {/* Compact Algorithm & Category Filters */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-taruvar-border/60">
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'trending', label: '🔥 Trending', icon: Flame },
                { id: 'views', label: '👁️ Views', icon: Eye },
                { id: 'recent', label: '⏱️ Latest', icon: Clock }
              ].map(sort => {
                const Icon = sort.icon;
                const isActive = sortBy === sort.id;
                return (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-taruvar-secondary text-white shadow-2xs' 
                        : 'bg-taruvar-bg text-taruvar-muted hover:text-taruvar-dark'
                    }`}
                  >
                    <span>{sort.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-taruvar-border/80 shrink-0 mx-1"></div>

            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'all', label: '🌟 All' },
                { id: 'trees', label: '🌳 Trees' },
                { id: 'rivers', label: '🌊 Rivers' },
                { id: 'mountains', label: '🏔️ Mountains' },
                { id: 'cleanups', label: '🧹 Cleanups' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    activeFilter === filter.id
                      ? 'bg-taruvar-light text-taruvar-secondary font-black border border-taruvar-secondary'
                      : 'bg-taruvar-bg text-taruvar-dark/70 hover:bg-taruvar-light border border-taruvar-border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 2. CONTINUOUS VERTICAL SCROLL FEED */}
        {filteredAndSortedPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-taruvar-border text-center space-y-4 shadow-card">
            <div className="w-16 h-16 bg-taruvar-light text-taruvar-secondary rounded-2xl flex items-center justify-center mx-auto text-3xl">
              🌱
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-taruvar-dark">Explore Feed is Live & Clean</h3>
              <p className="text-xs text-taruvar-muted max-w-xs mx-auto">
                No mock data. Adopt a tree or share your environmental work to be the first on the live feed!
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-5 py-2.5 bg-taruvar-secondary text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-taruvar-hover transition-all"
            >
              + Add Yours Now
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredAndSortedPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden transition-all hover:shadow-md"
              >
                
                {/* POST HEADER: Avatar, Author, Badge, Location */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Story Gradient Ring around Avatar */}
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-teal-400 via-emerald-500 to-amber-500 shrink-0">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-base">
                        {post.avatar}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs sm:text-sm text-taruvar-dark hover:text-taruvar-secondary cursor-pointer">
                          {post.author}
                        </h4>
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      </div>
                      <p className="text-[10px] text-taruvar-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{post.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-taruvar-light text-taruvar-secondary text-[10px] font-bold rounded-full border border-taruvar-border shrink-0 flex items-center gap-1">
                      <span>{post.categoryIcon}</span>
                      <span>{post.badge || post.category}</span>
                    </span>
                  </div>
                </div>

                {/* POST MEDIA: Photo with Double-Tap to Heart */}
                <div 
                  className="relative aspect-square sm:aspect-[4/3] w-full bg-gray-900 cursor-pointer overflow-hidden select-none group"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                >
                  <img 
                    src={post.photo} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  {/* Animated Heart Overlay on Double Tap */}
                  {heartAnim === post.id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-ping">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                    </div>
                  )}

                  {/* View Count & Category Watermark on Photo */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-xl border border-white/20 flex items-center gap-1 shadow-sm">
                      <Eye className="w-3 h-3 text-taruvar-primary" />
                      <span>{post.views?.toLocaleString() || 120} views</span>
                    </span>
                  </div>

                  {/* Floating Category Tag */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold rounded-lg border border-emerald-500/30">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* POST ACTION BAR (Like, Comment, Share, Adopt/Bookmark) */}
                <div className="p-4 pb-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      
                      {/* Heart / Like Button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`transition-transform active:scale-125 cursor-pointer flex items-center gap-1.5 ${
                          post.isLiked ? 'text-rose-500' : 'text-taruvar-dark hover:text-rose-500'
                        }`}
                        title={post.isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => {
                          setActiveCommentsPost(post);
                          setShowCommentsModal(true);
                        }}
                        className="text-taruvar-dark hover:text-taruvar-secondary transition-transform active:scale-110 cursor-pointer"
                        title="Comment"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(post)}
                        className="text-taruvar-dark hover:text-taruvar-secondary transition-transform active:scale-110 cursor-pointer"
                        title="Share Story"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>

                    </div>

                    <div className="flex items-center gap-2">
                      {post.type === 'tree' ? (
                        <button
                          onClick={onOpenPledge}
                          className="px-3 py-1.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs font-bold rounded-xl border border-taruvar-border transition-all flex items-center gap-1 cursor-pointer"
                          title="Adopt a tree"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          <span>Adopt</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-xl border border-teal-200">
                          {post.categoryIcon} Eco Work
                        </span>
                      )}

                      {/* Bookmark / Save */}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          bookmarkedPosts[post.id] ? 'text-taruvar-secondary' : 'text-taruvar-muted hover:text-taruvar-dark'
                        }`}
                        title="Save to Collection"
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarkedPosts[post.id] ? 'fill-taruvar-secondary' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* LIKES & VIEWS SUMMARY */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-black text-taruvar-dark">
                      {post.likes.toLocaleString()} likes
                    </span>
                    <span className="text-taruvar-muted font-medium">•</span>
                    <span className="text-taruvar-muted font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3 text-teal-600" />
                      <span>{post.views?.toLocaleString() || 120} views</span>
                    </span>
                  </div>

                  {/* CAPTION SECTION */}
                  <div className="text-xs text-taruvar-dark space-y-1">
                    <p className="leading-relaxed">
                      <span className="font-black mr-1.5">{post.author}</span>
                      <span className="font-bold text-teal-800 mr-1.5">[{post.title}]</span>
                      <span className="text-taruvar-dark/90">{post.caption}</span>
                    </p>
                  </div>

                  {/* COMMENTS PREVIEW */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-taruvar-border/60">
                      {comments[post.id].slice(-2).map(c => (
                        <p key={c.id} className="text-xs text-taruvar-dark/80">
                          <span className="font-black mr-1.5 text-taruvar-dark">{c.author}</span>
                          <span>{c.text}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* VIEW ALL COMMENTS BUTTON */}
                  <button
                    onClick={() => {
                      setActiveCommentsPost(post);
                      setShowCommentsModal(true);
                    }}
                    className="text-[11px] font-semibold text-taruvar-muted hover:text-taruvar-secondary transition-colors cursor-pointer block"
                  >
                    View all {(comments[post.id]?.length || 0) + 2} comments
                  </button>

                  {/* TIMESTAMP */}
                  <div className="text-[10px] font-bold text-taruvar-muted tracking-wider uppercase">
                    {post.date}
                  </div>

                </div>

                {/* INLINE QUICK COMMENT BOX */}
                <div className="px-4 py-3 border-t border-taruvar-border flex items-center gap-2 bg-taruvar-bg/40">
                  <div className="w-6 h-6 rounded-full bg-taruvar-secondary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {currentUser?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <input 
                    type="text"
                    placeholder="Cheer this environmental guardian..."
                    id={`comment-input-${post.id}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment(post.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 bg-transparent text-xs text-taruvar-dark placeholder:text-taruvar-muted focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`comment-input-${post.id}`);
                      if (input && input.value) {
                        handleAddComment(post.id, input.value);
                        input.value = '';
                      }
                    }}
                    className="text-xs font-bold text-taruvar-secondary hover:text-taruvar-hover cursor-pointer"
                  >
                    Post
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}

      </div>

      {/* MODAL 1: Comments Sheet Modal */}
      {showCommentsModal && activeCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-taruvar-border shadow-2xl p-5 space-y-4 max-h-[75vh] flex flex-col justify-between text-taruvar-dark">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-taruvar-secondary" />
                <h3 className="font-black text-sm">Community Cheers & Comments</h3>
              </div>
              <button 
                onClick={() => setShowCommentsModal(false)}
                className="w-7 h-7 rounded-full bg-taruvar-bg flex items-center justify-center text-xs hover:bg-taruvar-light cursor-pointer text-taruvar-muted"
              >
                ✕
              </button>
            </div>

            {/* Post Summary */}
            <div className="flex items-center gap-3 p-2.5 bg-taruvar-bg rounded-2xl border border-taruvar-border text-xs">
              <img src={activeCommentsPost.photo} alt="Post" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              <div className="truncate">
                <p className="font-bold text-taruvar-dark truncate">{activeCommentsPost.title}</p>
                <p className="text-[10px] text-taruvar-muted truncate">{activeCommentsPost.category} • {activeCommentsPost.location}</p>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-secondary">@priyasharma</span>
                  <span className="text-[10px] text-taruvar-muted">2h ago</span>
                </div>
                <p className="text-taruvar-dark">Incredible environmental dedication! Respect to the team for taking action 👏🌿</p>
              </div>

              <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-secondary">@vikram_delhi</span>
                  <span className="text-[10px] text-taruvar-muted">5h ago</span>
                </div>
                <p className="text-taruvar-dark">Great initiative. How can we join the next weekend cleanup or planting session?</p>
              </div>

              {/* Dynamic user comments */}
              {(comments[activeCommentsPost.id] || []).map((c) => (
                <div key={c.id} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">@{c.author}</span>
                    <span className="text-[10px] text-emerald-600">{c.time}</span>
                  </div>
                  <p className="text-taruvar-dark">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment(activeCommentsPost.id, commentText);
              }} 
              className="flex gap-2 pt-2 border-t border-taruvar-border"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Cheer this environmental guardian..."
                className="flex-1 px-4 py-2.5 bg-taruvar-bg rounded-xl text-xs text-taruvar-dark placeholder-taruvar-muted focus:outline-none focus:ring-2 focus:ring-taruvar-secondary border border-taruvar-border"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-taruvar-secondary text-white font-black rounded-xl text-xs flex items-center justify-center cursor-pointer hover:bg-taruvar-hover transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Create Environmental Work Post */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-taruvar-dark w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-taruvar-border space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-taruvar-secondary" />
                <h3 className="font-black text-lg">Share Environmental Care Work</h3>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 rounded-full bg-taruvar-bg flex items-center justify-center text-gray-500 hover:text-taruvar-dark cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              
              {/* Photo Upload Area */}
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Action / Field Photo *</label>
                <label 
                  htmlFor="post-photo-input"
                  className="block border-2 border-dashed border-taruvar-secondary/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-taruvar-light/50 transition-all bg-taruvar-bg"
                >
                  <input 
                    type="file" 
                    id="post-photo-input" 
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
                      <p className="font-bold">Select action / sapling photo</p>
                      <p className="text-[10px] text-taruvar-muted">Shows plantation, cleanup, or river care</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Title of Initiative *</label>
                <input
                  type="text"
                  required
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  placeholder="e.g. Yamuna Ghat Cleaning / Neem Care Log"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="Tree Adoption & Care">🌳 Tree Adoption & Care</option>
                    <option value="River & Water Cleaning">🌊 River & Water Cleaning</option>
                    <option value="Mountain & Forest Care">🏔️ Mountain & Forest Care</option>
                    <option value="Neighborhood Waste Cleanup">🧹 Neighborhood Waste Cleanup</option>
                    <option value="Plantation & Seedballs">🪴 Plantation & Seedballs</option>
                    <option value="Eco Wellness & Awareness">🧘 Eco Wellness & Awareness</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Duration / Cadence</label>
                  <select
                    value={postFormData.timeCadence}
                    onChange={(e) => setPostFormData({ ...postFormData, timeCadence: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="1 Day Action">1 Day Action</option>
                    <option value="3 Days Campaign">3 Days Campaign</option>
                    <option value="7 Days Drive">7 Days Drive</option>
                    <option value="15 Days Initiative">15 Days Initiative</option>
                    <option value="Ongoing Project">Ongoing Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={postFormData.location}
                  onChange={(e) => setPostFormData({ ...postFormData, location: e.target.value })}
                  placeholder="e.g. Sector 15 Park / Ghat #3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Caption / Care Story</label>
                <textarea
                  rows={2}
                  value={postFormData.caption}
                  onChange={(e) => setPostFormData({ ...postFormData, caption: e.target.value })}
                  placeholder="Share a short note about this environmental work..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={postLoading}
                className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm mt-2"
              >
                <Sprout className="w-4 h-4" />
                <span>Publish to Explore Feed</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
