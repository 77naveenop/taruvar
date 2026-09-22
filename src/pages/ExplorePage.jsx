import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Compass, Sprout, 
  MapPin, Calendar, Award, CheckCircle2, Sparkles, 
  Plus, Camera, Upload, ShieldCheck, TreePine, Eye, X, Send, Bookmark, MoreHorizontal
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
              <span>Taruvar Instagram Feed</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-taruvar-dark">
              Sign In to Explore Feed
            </h2>
            <p className="text-xs sm:text-sm text-taruvar-muted leading-relaxed">
              Join the <strong>#OnePersonOneTree</strong> movement to scroll real-time sapling reels, cheer tree guardians, and track 5-month growth stories across India.
            </p>
          </div>

          <div className="p-4 bg-taruvar-bg/70 rounded-2xl border border-taruvar-border text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-taruvar-dark font-bold">
              <span className="text-emerald-600">✓</span>
              <span>Watch verified tree plantation photos & updates</span>
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
  const [heartAnim, setHeartAnim] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

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

  // Default initial rich feed showcase
  const defaultPosts = [
    {
      id: 'post-1',
      author: 'Naveen Sharma',
      memberId: 'TRV-ADMIN-001',
      avatar: '🌱',
      tree_name: 'Banyan Sanctuary Guardian',
      species: 'Banyan Tree (Ficus benghalensis)',
      treeCount: 1,
      isBulk: false,
      location: 'Botanical Eco Corridor, Delhi NCR',
      photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      caption: 'Starting Day 1 of our Banyan tree guardianship. Planted with organic vermicompost and bamboo protective cage! 🌿 #OnePersonOneTree #Paalna #TaruvarIndia',
      milestone: 'Day 1 • Plantation Complete',
      verifiedMonths: 1,
      likes: 142,
      isLiked: false,
      date: '2 DAYS AGO',
      badge: 'Core Founder Tree'
    },
    {
      id: 'post-2',
      author: 'Delhi Public School Chapter',
      memberId: 'TRV-ORG-2026-DPS-50',
      avatar: '🎓',
      tree_name: 'DPS Green Shakti Canopy',
      species: '50 Trees (Neem, Peepal, Jamun & Gulmohar)',
      treeCount: 50,
      isBulk: true,
      orgName: 'Delhi Public School Chapter',
      location: 'Campus Playground Green Boundary',
      photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
      caption: '50 students each took personal responsibility for 1 sapling today! We are monitoring drip irrigation daily. Month 1 growth verified. 🌳🎒 #YouthForEarth #CampusDrive',
      milestone: 'Month 1 • 50/50 Trees Thriving',
      verifiedMonths: 1,
      likes: 289,
      isLiked: false,
      date: '4 DAYS AGO',
      badge: 'Campus Bulk Drive'
    },
    {
      id: 'post-3',
      author: 'Pooja Sundaram (Green Shakti)',
      memberId: 'TRV-GNS-2026-088',
      avatar: '👩',
      tree_name: 'Amrit Neem Care Hub',
      species: 'Neem Tree (Azadirachta indica)',
      treeCount: 1,
      isBulk: false,
      location: 'Community Park Ward 7, Bangalore',
      photo: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      caption: 'Month 3 update: Our neighborhood women circle watered through peak summer heat. 14cm height gain with fresh green shoots! 🌿💧 #GreenShakti #Paalna #Month3Progress',
      milestone: 'Month 3 • Verified Growth',
      verifiedMonths: 3,
      likes: 318,
      isLiked: false,
      date: '1 WEEK AGO',
      badge: 'Green Shakti Care'
    },
    {
      id: 'post-4',
      author: 'Rahul Mishra',
      memberId: 'TRV-IND-2026-9041',
      avatar: '🪴',
      tree_name: 'Prithvi Peepal Tree',
      species: 'Peepal Tree (Ficus religiosa)',
      treeCount: 1,
      isBulk: false,
      location: 'Sector 62 Park, Noida UP',
      photo: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
      caption: '5-Month Journey Completed! Officially verified as a Level 5 Eco-Guardian. Tree is now standing strong with thick foliage! 🏆🌳 #BadgeEarned #5MonthsPaalna',
      milestone: 'Month 5 • 5-Star Verified Badge',
      verifiedMonths: 5,
      likes: 412,
      isLiked: false,
      date: '2 WEEKS AGO',
      badge: '5-Month Certified'
    }
  ];

  const [postsList, setPostsList] = useState(() => {
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
          caption: t.caption || `Adopted under the Taruvar #OnePersonOneTree movement. Caring for this sapling with 365-day Paalna commitment. 🌱`,
          milestone: `Month ${t.verified_months || 1} • Verified Progress`,
          verifiedMonths: t.verified_months || 1,
          likes: t.upvotes || 24,
          isLiked: false,
          date: t.plantedDate || 'RECENT',
          badge: t.isBulk ? 'Organization Drive' : 'Individual Guardian'
        }));
        return [...mapped, ...defaultPosts];
      }
      return defaultPosts;
    } catch {
      return defaultPosts;
    }
  });

  // Background Cloud Sync to load all approved trees across India into the feed
  useEffect(() => {
    async function loadCloudPosts() {
      try {
        const approvedCloud = await getCloudApprovedAdoptions();
        if (Array.isArray(approvedCloud) && approvedCloud.length > 0) {
          const cloudMapped = approvedCloud.map(t => ({
            id: t.id || t.treeId || `cloud-${Date.now()}`,
            author: t.adopter_name || t.guardianName || 'Eco Guardian',
            memberId: t.memberId || 'TRV-IND-2026-MEMBER',
            avatar: '🌱',
            tree_name: t.tree_name || t.treeName || 'Adopted Tree',
            species: t.species || 'Indigenous Tree',
            treeCount: t.treeCount || 1,
            isBulk: Boolean(t.isBulk),
            orgName: t.orgName || null,
            location: t.location || 'Community Green Area',
            photo: t.plantation_photo || t.photoUrl || '/logo.jpg',
            caption: t.caption || `Adopted under the Taruvar #OnePersonOneTree movement. Verified by team Taruvar with ongoing 5-month growth monitoring! 🌿`,
            milestone: `Month ${t.verified_months || 1} • Verified Progress`,
            verifiedMonths: t.verified_months || 1,
            likes: t.upvotes || 35,
            isLiked: false,
            date: t.plantedDate || t.planted_date || 'RECENT',
            badge: t.isBulk ? 'Organization Drive' : 'Verified Guardian'
          }));

          setPostsList(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = cloudMapped.filter(p => !existingIds.has(p.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('Explore cloud sync note:', err);
      }
    }
    loadCloudPosts();
  }, []);

  // Filtered Posts for Vertical Scroll
  const filteredPosts = postsList.filter(post => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bulk') return post.isBulk;
    if (activeFilter === 'milestones') return post.verifiedMonths > 1;
    if (activeFilter === 'adoptions') return post.verifiedMonths === 1;
    return true;
  });

  const handleToggleLike = (postId) => {
    setPostsList(prev => prev.map(post => {
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
          likes: nextLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleDoubleTap = (postId) => {
    const post = postsList.find(r => r.id === postId);
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
        showToast(next ? 'Tree saved to your collection! 🔖' : 'Removed from saved collection.');
      }
      return { ...prev, [postId]: next };
    });
  };

  const handleShare = (post) => {
    const shareText = `Check out this verified tree adoption by ${post.author} on Taruvar! 🌱\nSpecies: ${post.species}\nLocation: ${post.location}\nExplore live at https://taruvar.org`;
    if (navigator.share) {
      navigator.share({
        title: 'Taruvar Tree Story',
        text: shareText,
        url: 'https://taruvar.org'
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      if (showToast) {
        showToast('Tree Story link copied to clipboard! Share on WhatsApp / Instagram.');
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

  // Submit New Tree Story / Post
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postFormData.photoPreview || !postFormData.treeName) {
      alert('Please provide a tree name and upload a photo to post.');
      return;
    }

    setPostLoading(true);
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Guardian';
    const memberId = currentUser?.user_metadata?.member_id || `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      memberId: memberId,
      avatar: '🌱',
      tree_name: postFormData.treeName,
      species: postFormData.species,
      treeCount: 1,
      isBulk: false,
      location: postFormData.location || 'Local Community Canopy',
      photo: postFormData.photoPreview,
      caption: postFormData.caption || `Caring for our new ${postFormData.treeName} under Taruvar Paalna movement. Month ${postFormData.month} update! 🌱`,
      milestone: `Month ${postFormData.month} • Verified Progress`,
      verifiedMonths: Number(postFormData.month) || 1,
      likes: 1,
      isLiked: true,
      date: 'JUST NOW',
      badge: 'Community Story'
    };

    setPostsList([newPost, ...postsList]);
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

    confetti({ particleCount: 70, spread: 60 });
    if (showToast) {
      showToast('Your Tree Story is live on the Explore Feed! 🌿');
    }
  };

  return (
    <div className="min-h-screen bg-taruvar-bg text-taruvar-dark py-4 sm:py-8 px-3 sm:px-4">
      
      {/* Centered Instagram-Style Feed Container */}
      <div className="max-w-xl mx-auto w-full space-y-6">

        {/* 1. TOP INSTAGRAM STORY / FILTER BAR */}
        <div className="bg-white rounded-3xl p-4 border border-taruvar-border shadow-xs space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-taruvar-dark leading-tight">Explore Taruvar</h2>
                <p className="text-[11px] text-taruvar-muted">Real-time photos & nurturing stories from across India</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) {
                  if (showToast) showToast('Please sign in to share a tree story!');
                  onOpenAuth();
                } else {
                  setShowPostModal(true);
                }
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-taruvar-secondary to-emerald-600 hover:from-taruvar-hover hover:to-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Post Story</span>
            </button>
          </div>

          {/* Instagram-style Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'all', label: '🌟 All Feed' },
              { id: 'adoptions', label: '🌱 New Plantations' },
              { id: 'milestones', label: '🌿 5-Month Growth' },
              { id: 'bulk', label: '🏢 Campus & Bulk' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-taruvar-secondary text-white shadow-xs font-extrabold'
                    : 'bg-taruvar-bg text-taruvar-dark/80 hover:bg-taruvar-light border border-taruvar-border'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

        </div>

        {/* 2. CONTINUOUS VERTICAL SCROLL FEED */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-taruvar-border text-center space-y-3">
            <span className="text-4xl">🌱</span>
            <h3 className="font-bold text-base text-taruvar-dark">No Posts in this Category</h3>
            <p className="text-xs text-taruvar-muted">Be the first to share an update in this category!</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 bg-taruvar-secondary text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              View All Feed
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden transition-all hover:shadow-md"
              >
                
                {/* POST HEADER: Avatar, Author, Badge, Location */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Story Gradient Ring around Avatar */}
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-emerald-500 shrink-0">
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
                    <span className="px-2.5 py-1 bg-taruvar-light text-taruvar-secondary text-[10px] font-bold rounded-full border border-taruvar-border shrink-0">
                      {post.badge || 'Verified Tree'}
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
                    alt={post.tree_name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  {/* Animated Heart Overlay on Double Tap */}
                  {heartAnim === post.id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none animate-ping">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                    </div>
                  )}

                  {/* Floating Milestone Badge on Photo */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{post.milestone}</span>
                    </span>
                  </div>

                  {/* Tree Species Watermark */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold rounded-lg border border-emerald-500/30">
                      {post.species}
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
                        title="Share Tree Story"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>

                    </div>

                    <div className="flex items-center gap-2">
                      {/* Adopt Similar Species Quick CTA */}
                      <button
                        onClick={onOpenPledge}
                        className="px-3 py-1.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs font-bold rounded-xl border border-taruvar-border transition-all flex items-center gap-1 cursor-pointer"
                        title="Adopt a tree like this"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>Adopt</span>
                      </button>

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

                  {/* LIKES COUNT */}
                  <div className="text-xs font-black text-taruvar-dark">
                    {post.likes.toLocaleString()} likes
                  </div>

                  {/* CAPTION SECTION */}
                  <div className="text-xs text-taruvar-dark space-y-1">
                    <p className="leading-relaxed">
                      <span className="font-black mr-1.5">{post.author}</span>
                      <span className="font-bold text-taruvar-secondary mr-1.5">[{post.tree_name}]</span>
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
                    placeholder="Add a cheer or comment..."
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
                <h3 className="font-black text-sm">Comments & Cheers</h3>
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
              <img src={activeCommentsPost.photo} alt="Tree" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              <div className="truncate">
                <p className="font-bold text-taruvar-dark truncate">{activeCommentsPost.tree_name}</p>
                <p className="text-[10px] text-taruvar-muted truncate">{activeCommentsPost.species}</p>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-secondary">@priyasharma</span>
                  <span className="text-[10px] text-taruvar-muted">2h ago</span>
                </div>
                <p className="text-taruvar-dark">Such inspiring growth! The leaves look so lush and healthy 🌱👏</p>
              </div>

              <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-taruvar-secondary">@vikram_delhi</span>
                  <span className="text-[10px] text-taruvar-muted">5h ago</span>
                </div>
                <p className="text-taruvar-dark">Great initiative. Which organic compost mix did you use for the roots?</p>
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
                placeholder="Cheer this tree guardian..."
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

      {/* MODAL 2: Create Tree Story Post */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-taruvar-dark w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-taruvar-border space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-taruvar-secondary" />
                <h3 className="font-black text-lg">Share Tree Story</h3>
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
                <label className="block font-bold uppercase tracking-wider mb-1">Tree / Sapling Photo *</label>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Caption / Care Notes</label>
                <textarea
                  rows={2}
                  value={postFormData.caption}
                  onChange={(e) => setPostFormData({ ...postFormData, caption: e.target.value })}
                  placeholder="Share a short note about this tree's watering, compost, or growth..."
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
