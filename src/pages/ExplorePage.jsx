import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Compass, Sprout, 
  MapPin, Calendar, Award, CheckCircle2, Sparkles, 
  Plus, Camera, Upload, ShieldCheck, TreePine, Eye, X, Send, Bookmark, MoreHorizontal,
  Flame, TrendingUp, Clock, Filter, Waves, Mountain, Trash2, Leaf, Activity, Droplets,
  ChevronRight, ArrowRight, Shield, Check, Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getCloudApprovedAdoptions, 
  getCloudPendingAdoptions, 
  getCloudSocialWorks, 
  saveCloudSocialWork,
  getCloudComments,
  saveCloudComment 
} from '../lib/cloudDb';
import { compressImage } from '../lib/imageCompressor';

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

  // Filters & Modal State
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'trees' | 'rivers' | 'mountains' | 'cleanups'
  const [heartAnim, setHeartAnim] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [inlineCommentInputs, setInlineCommentInputs] = useState({});
  
  // Persistent comments across sessions & cloud
  const [comments, setComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taruvar_feed_comments') || '{}');
    } catch {
      return {};
    }
  });

  // Persistent user liked posts mapping { [postId]: true/false }
  const [userLikes, setUserLikes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taruvar_user_likes') || '{}');
    } catch {
      return {};
    }
  });

  // Persistent likes counters mapping { [postId]: number }
  const [postLikes, setPostLikes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taruvar_post_likes') || '{}');
    } catch {
      return {};
    }
  });

  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  // Tree Growing Journey Modal State
  const [selectedJourneyTree, setSelectedJourneyTree] = useState(null);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  // Environmental Creator Guide Modal State
  const [showCreatorGuideModal, setShowCreatorGuideModal] = useState(false);

  // Local & Cloud tree directory for looking up complete growing milestones
  const [treeDirectory, setTreeDirectory] = useState(() => {
    try {
      const localAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const localPending = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      return [...localAdoptions, ...localPending];
    } catch {
      return [];
    }
  });

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

  // Clean Aggregated feed state combining real Tree Adoptions + Environmental Social Works + Cloud DB
  const [feedList, setFeedList] = useState(() => {
    try {
      const localAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const localPending = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      const localSocialWorks = JSON.parse(localStorage.getItem('taruvar_social_works') || '[]');
      const savedUserLikes = JSON.parse(localStorage.getItem('taruvar_user_likes') || '{}');
      const savedPostLikes = JSON.parse(localStorage.getItem('taruvar_post_likes') || '{}');
      
      const allLocalTrees = [...localAdoptions, ...localPending];
      const seenTreeIds = new Set();
      const uniqueLocalTrees = [];
      for (const t of allLocalTrees) {
        const id = t.id || t.treeId;
        if (id && !seenTreeIds.has(id)) {
          seenTreeIds.add(id);
          uniqueLocalTrees.push(t);
        }
      }

      const mappedTrees = uniqueLocalTrees.map((t, idx) => {
        const pId = t.id || t.treeId || `local-tree-${idx}`;
        return {
          id: pId,
          treeId: pId,
          author: t.guardianName || t.adopter_name || 'Eco Guardian',
          memberId: t.memberId || 'TRV-IND-2026-MEMBER',
          avatar: '🌱',
          type: 'tree',
          title: t.tree_name || t.treeName || 'My Adopted Tree',
          species: t.species || 'Indigenous Tree',
          category: 'Tree Paalna Care',
          categoryIcon: '🌳',
          location: t.location || 'Community Green Area',
          photo: t.photoUrl || t.plantation_photo || '/logo.jpg',
          caption: t.caption || `Adopted under Taruvar #OnePersonOneTree. Cadence: ${t.lastCareInterval || '1-15 Days'} wellness log. Status: ${t.wellness || 'Thriving'} 🌱`,
          badge: t.isBulk ? 'Organization Drive' : 'Paalna Guardian',
          likes: savedPostLikes[pId] !== undefined ? savedPostLikes[pId] : (t.likes ?? t.upvotes ?? 0),
          views: t.views ?? 0,
          isLiked: Boolean(savedUserLikes[pId]),
          date: t.plantedDate || t.planted_date || 'RECENT',
          plantedDate: t.plantedDate || t.planted_date || 'RECENT',
          wellness: t.wellness || 'Thriving & Lush Green',
          lastCareInterval: t.lastCareInterval || '1-15 Days',
          reports: Array.isArray(t.reports) ? t.reports : [],
          timestamp: t.timestamp || (Date.now() - (idx * 1000 * 60 * 60 * 12))
        };
      });

      const mappedSocial = localSocialWorks.map((w, idx) => {
        const pId = w.id || `local-soc-${idx}`;
        return {
          id: pId,
          treeId: w.treeId,
          author: w.author || 'Eco Guardian',
          memberId: w.memberId || 'TRV-SOC-2026',
          avatar: w.categoryIcon || '🌊',
          type: 'social',
          title: w.title || 'Environmental Care Work',
          category: w.category || 'Environmental Work',
          categoryIcon: w.categoryIcon || '🌊',
          location: w.location || 'Local Community Environment',
          photo: w.photo || w.photoPreview || '/logo.jpg',
          caption: w.caption || `${w.description || ''} Impact: ${w.impact || 'Community Action'} 🌿`,
          badge: w.timeInterval || w.badge || 'Environmental Drive',
          likes: savedPostLikes[pId] !== undefined ? savedPostLikes[pId] : (w.likes ?? 0),
          views: w.views ?? 0,
          isLiked: Boolean(savedUserLikes[pId]),
          date: w.date || 'RECENT',
          timestamp: w.timestamp || (Date.now() - (idx * 1000 * 60 * 60 * 8))
        };
      });

      return [...mappedSocial, ...mappedTrees];
    } catch {
      return [];
    }
  });

  // Background Cloud Sync for adoptions, social works, and comments
  useEffect(() => {
    async function loadCloudData() {
      try {
        const [approvedCloud, pendingCloud, cloudSocial, cloudComments] = await Promise.all([
          getCloudApprovedAdoptions(),
          getCloudPendingAdoptions(),
          getCloudSocialWorks(),
          getCloudComments()
        ]);

        if (cloudComments && typeof cloudComments === 'object') {
          setComments(prev => ({
            ...cloudComments,
            ...prev
          }));
        }

        const savedUserLikes = JSON.parse(localStorage.getItem('taruvar_user_likes') || '{}');
        const savedPostLikes = JSON.parse(localStorage.getItem('taruvar_post_likes') || '{}');

        const allTrees = [...(approvedCloud || []), ...(pendingCloud || [])];
        
        // Update tree directory
        setTreeDirectory(prev => {
          const map = new Map();
          for (const t of [...prev, ...allTrees]) {
            const id = t.id || t.treeId;
            if (id) map.set(id, t);
          }
          return Array.from(map.values());
        });

        const treePosts = allTrees.map(t => {
          const pId = t.id || t.treeId || `cloud-${Date.now()}`;
          return {
            id: pId,
            treeId: pId,
            author: t.adopter_name || t.guardianName || 'Eco Guardian',
            memberId: t.memberId || 'TRV-IND-2026-MEMBER',
            avatar: '🌱',
            type: 'tree',
            title: t.tree_name || t.treeName || 'Adopted Tree',
            species: t.species || 'Indigenous Tree',
            category: 'Tree Paalna Care',
            categoryIcon: '🌳',
            location: t.location || 'Community Green Area',
            photo: t.plantation_photo || t.photoUrl || '/logo.jpg',
            caption: t.caption || `Adopted under the Taruvar #OnePersonOneTree movement. Ongoing wellness care and verification in progress! 🌿`,
            badge: t.isBulk ? 'Campus Drive' : (t.status === 'approved' ? 'Verified Guardian' : 'Paalna Guardian'),
            likes: savedPostLikes[pId] !== undefined ? savedPostLikes[pId] : (t.likes ?? t.upvotes ?? 0),
            views: t.views ?? 0,
            isLiked: Boolean(savedUserLikes[pId]),
            date: t.plantedDate || t.planted_date || 'RECENT',
            plantedDate: t.plantedDate || t.planted_date || 'RECENT',
            wellness: t.wellness || 'Thriving & Lush Green',
            lastCareInterval: t.lastCareInterval || '1-15 Days',
            reports: Array.isArray(t.reports) ? t.reports : [],
            timestamp: t.timestamp || (Date.now() - 1000 * 60 * 60 * 24)
          };
        });

        const socialPosts = (cloudSocial || []).map(w => {
          const pId = w.id || `cloud-sw-${Date.now()}`;
          return {
            id: pId,
            treeId: w.treeId,
            author: w.author || 'Eco Guardian',
            memberId: w.memberId || 'TRV-SOC-2026',
            avatar: w.categoryIcon || '🌊',
            type: 'social',
            title: w.title || 'Environmental Care Work',
            category: w.category || 'Environmental Work',
            categoryIcon: w.categoryIcon || '🌊',
            location: w.location || 'Local Community Environment',
            photo: w.photo || w.photoPreview || '/logo.jpg',
            caption: w.caption || `${w.description || ''} Impact: ${w.impact || 'Community Action'} 🌿`,
            badge: w.timeInterval || w.badge || 'Environmental Drive',
            likes: savedPostLikes[pId] !== undefined ? savedPostLikes[pId] : (w.likes ?? 0),
            views: w.views ?? 0,
            isLiked: Boolean(savedUserLikes[pId]),
            date: w.date || 'RECENT',
            timestamp: w.timestamp || Date.now()
          };
        });

        const combinedCloud = [...socialPosts, ...treePosts];

        setFeedList(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newOnes = combinedCloud.filter(p => !existingIds.has(p.id));
          return [...newOnes, ...prev];
        });
      } catch (err) {
        console.warn('Explore cloud sync note:', err);
      }
    }
    loadCloudData();
  }, []);

  // Tree Directory Lookup & Milestones Helpers
  const getTreeForPost = (post) => {
    if (!post) return null;
    const targetId = post.treeId || post.id;
    const found = treeDirectory.find(t => (t.id === targetId || t.treeId === targetId));
    if (found) return found;
    if (post.type === 'tree') {
      return {
        id: post.id,
        tree_name: post.title,
        treeName: post.title,
        species: post.species || 'Indigenous Tree',
        adopter_name: post.author,
        guardianName: post.author,
        location: post.location,
        plantation_photo: post.photo,
        photoUrl: post.photo,
        plantedDate: post.plantedDate || post.date,
        wellness: post.wellness || 'Thriving & Lush Green',
        lastCareInterval: post.lastCareInterval || '1-15 Days',
        reports: Array.isArray(post.reports) ? post.reports : []
      };
    }
    return null;
  };

  const getTreeMilestoneCount = (post) => {
    const tree = getTreeForPost(post);
    if (!tree) return 1;
    const repCount = Array.isArray(tree.reports) ? tree.reports.length : 0;
    return repCount + 1; // +1 for Day 0 Sapling
  };

  const openTreeJourney = (post) => {
    const tree = getTreeForPost(post);
    if (tree) {
      setSelectedJourneyTree(tree);
      setShowJourneyModal(true);
    } else {
      setSelectedJourneyTree({
        id: post.id || post.treeId || 'tree-journey',
        tree_name: post.title,
        treeName: post.title,
        species: post.species || 'Indigenous Tree',
        adopter_name: post.author,
        guardianName: post.author,
        location: post.location,
        plantation_photo: post.photo,
        photoUrl: post.photo,
        plantedDate: post.date,
        wellness: post.wellness || 'Thriving & Lush Green',
        reports: []
      });
      setShowJourneyModal(true);
    }
  };

  // Filter & Stable Sort Pipeline (Sorting by static timestamp prevents posts from jumping when liked!)
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
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

  // Toggle Like with Instant UI Feedback & Persistent Storage
  const handleToggleLike = (postId) => {
    const isCurrentlyLiked = Boolean(userLikes[postId]);
    const nextLiked = !isCurrentlyLiked;

    if (nextLiked) {
      setHeartAnim(postId);
      setTimeout(() => setHeartAnim(null), 900);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }

    // 1. Update userLikes in state & localStorage
    const updatedUserLikes = { ...userLikes, [postId]: nextLiked };
    setUserLikes(updatedUserLikes);
    try {
      localStorage.setItem('taruvar_user_likes', JSON.stringify(updatedUserLikes));
    } catch {}

    // 2. Update postLikes count in state & localStorage
    const targetPost = feedList.find(p => p.id === postId);
    const currentLikes = postLikes[postId] !== undefined ? postLikes[postId] : (targetPost?.likes || 0);
    const nextLikesCount = nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    const updatedPostLikes = { ...postLikes, [postId]: nextLikesCount };
    setPostLikes(updatedPostLikes);
    try {
      localStorage.setItem('taruvar_post_likes', JSON.stringify(updatedPostLikes));
    } catch {}

    // 3. Update in-place feed list without changing list order
    setFeedList(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLikesCount,
          views: (post.views || 0) + 1
        };
      }
      return post;
    }));
  };

  const handleDoubleTap = (postId) => {
    const isCurrentlyLiked = Boolean(userLikes[postId]);
    if (!isCurrentlyLiked) {
      handleToggleLike(postId);
    } else {
      setHeartAnim(postId);
      setTimeout(() => setHeartAnim(null), 900);
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

  // Add Comment with Persistent Storage & Cloud Sync
  const handleAddComment = async (postId, text) => {
    if (!text || !text.trim()) return;
    const authorName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Eco Supporter';
    const newComment = {
      id: Date.now(),
      author: authorName,
      text: text.trim(),
      time: 'Just now'
    };

    const updatedComments = {
      ...comments,
      [postId]: [...(comments[postId] || []), newComment]
    };

    setComments(updatedComments);
    try {
      localStorage.setItem('taruvar_feed_comments', JSON.stringify(updatedComments));
      // Sync comment to cloud DB
      await saveCloudComment(postId, newComment);
    } catch (err) {
      console.warn('Cloud comment notice:', err);
    }

    setCommentText('');
    if (showToast) showToast('Cheer & comment posted! 🌱');
  };

  // Photo Select for New Post
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 900, 900, 0.7);
        setPostFormData(prev => ({
          ...prev,
          photo: compressed,
          photoPreview: compressed
        }));
      } catch {
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
    }
  };

  // Submit New Post directly to Explore
  const handleCreatePost = async (e) => {
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
      userEmail: (currentUser?.email || '').trim().toLowerCase(),
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
      likes: 0,
      views: 0,
      isLiked: false,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now()
    };

    setFeedList(prev => [newPost, ...prev]);

    // Save to local storage
    try {
      const localSocial = JSON.parse(localStorage.getItem('taruvar_social_works') || '[]');
      const updatedLocal = [newPost, ...localSocial.filter(p => p.id !== newPost.id)];
      localStorage.setItem('taruvar_social_works', JSON.stringify(updatedLocal));

      // Permanent Cloud Sync so everyone on the platform sees it across devices!
      await saveCloudSocialWork(newPost);
    } catch (err) {
      console.warn('Cloud sync note for new post:', err);
    }

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
      showToast('Your Environmental Work is live & saved across Taruvar! 🌿');
    }
  };

  return (
    <div className="min-h-screen bg-taruvar-bg text-taruvar-dark py-4 sm:py-8 px-3 sm:px-4">
      
      {/* Centered Instagram-Style Feed Container */}
      <div className="max-w-xl mx-auto w-full space-y-5">

        {/* 1. TOP STICKY ADD YOURS BAR */}
        <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl px-4 py-3 sm:py-3.5 border border-taruvar-border shadow-md transition-all">
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Environmental creators (Click to learn how to become a creator) */}
            <button
              onClick={() => setShowCreatorGuideModal(true)}
              className="flex items-center gap-2 group cursor-pointer text-left transition-transform active:scale-95"
              title="Click to learn how to become an Environmental Creator"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🌿</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-taruvar-dark group-hover:text-taruvar-secondary transition-colors tracking-tight">
                  Environmental creators
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black group-hover:bg-emerald-200">
                  Guide ⓘ
                </span>
              </div>
            </button>

            {/* Right: Add yours+ Action Button */}
            <button
              onClick={() => setShowPostModal(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-taruvar-secondary via-emerald-600 to-teal-600 hover:opacity-90 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center gap-1 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
              title="Share your tree or environmental work"
            >
              <span>Add yours+</span>
            </button>
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

                  {/* CHECK JOURNEY OF THIS TREE BUTTON */}
                  {(post.type === 'tree' || post.treeId) && (
                    <div className="pt-2">
                      <button
                        onClick={() => openTreeJourney(post)}
                        className="w-full py-2.5 px-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                            🌱
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs">
                              <span>Check Journey of this tree</span>
                              <span className="px-2 py-0.5 bg-emerald-200/90 text-emerald-900 text-[10px] font-black rounded-full">
                                {getTreeMilestoneCount(post)} Milestones
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-700/90 font-medium">
                              Planted sapling → verified 1-15 day growth photos & wellness logs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-800 text-xs font-black shrink-0 pl-2">
                          <span>View</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>
                  )}

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
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = inlineCommentInputs[post.id];
                    if (val && val.trim()) {
                      handleAddComment(post.id, val.trim());
                      setInlineCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                    }
                  }}
                  className="px-4 py-3 border-t border-taruvar-border flex items-center gap-2 bg-taruvar-bg/40"
                >
                  <div className="w-6 h-6 rounded-full bg-taruvar-secondary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {currentUser?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <input 
                    type="text"
                    placeholder="Cheer this environmental guardian..."
                    value={inlineCommentInputs[post.id] || ''}
                    onChange={(e) => {
                      const text = e.target.value;
                      setInlineCommentInputs(prev => ({ ...prev, [post.id]: text }));
                    }}
                    className="flex-1 bg-transparent text-xs text-taruvar-dark placeholder:text-taruvar-muted focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inlineCommentInputs[post.id]?.trim()}
                    className="text-xs font-bold text-taruvar-secondary hover:text-taruvar-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
                  >
                    Post
                  </button>
                </form>

              </article>
            ))}
          </div>
        )}

        {/* 3. END OF FEED INDICATOR ("That's it") */}
        {filteredAndSortedPosts.length > 0 && (
          <div className="py-10 pb-16 text-center space-y-3">
            <div className="w-14 h-14 bg-white border border-taruvar-border rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
              ✨
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-black text-taruvar-dark tracking-tight">
                That's it! You're all caught up.
              </h4>
              <p className="text-xs text-taruvar-muted max-w-xs mx-auto leading-relaxed">
                You've seen all recent tree stories and community environmental updates.
              </p>
            </div>
            <div className="pt-1">
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary font-bold text-xs rounded-xl border border-taruvar-border transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Your Work to Feed</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Comments Sheet Modal (z-[70] sits on top of mobile bottom nav & virtual keyboard) */}
      {showCommentsModal && activeCommentsPost && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-taruvar-border shadow-2xl p-5 pb-8 sm:pb-5 space-y-4 max-h-[85vh] sm:max-h-[75vh] flex flex-col justify-between text-taruvar-dark">
            
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
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs min-h-[140px] max-h-[280px]">
              {!(comments[activeCommentsPost.id]?.length > 0) ? (
                <div className="py-8 text-center space-y-1.5 text-xs text-taruvar-muted">
                  <span className="text-2xl block">💬</span>
                  <p className="font-bold text-taruvar-dark">No comments yet</p>
                  <p className="text-[11px]">Be the first to cheer this eco guardian!</p>
                </div>
              ) : (
                (comments[activeCommentsPost.id] || []).map((c) => (
                  <div key={c.id} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">@{c.author}</span>
                      <span className="text-[10px] text-emerald-600">{c.time}</span>
                    </div>
                    <p className="text-taruvar-dark">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) {
                  handleAddComment(activeCommentsPost.id, commentText);
                  setCommentText('');
                }
              }} 
              className="flex gap-2 pt-2 border-t border-taruvar-border"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Cheer this environmental guardian..."
                className="flex-1 px-4 py-3 bg-taruvar-bg rounded-xl text-xs text-taruvar-dark placeholder-taruvar-muted focus:outline-none focus:ring-2 focus:ring-taruvar-secondary border border-taruvar-border"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-3 bg-taruvar-secondary text-white font-black rounded-xl text-xs flex items-center justify-center cursor-pointer hover:bg-taruvar-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
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

      {/* ======================================================== */}
      {/* MODAL 3: TREE GROWING JOURNEY MODAL */}
      {/* ======================================================== */}
      {showJourneyModal && selectedJourneyTree && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col border border-taruvar-border shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-taruvar-border bg-gradient-to-r from-emerald-50 via-teal-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
                  🌱
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Tree Growing Journey
                    </span>
                    <span className="text-[10px] text-taruvar-muted font-bold">
                      {selectedJourneyTree.id}
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-taruvar-dark leading-tight mt-0.5">
                    {selectedJourneyTree.tree_name || selectedJourneyTree.treeName || 'Adopted Tree'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowJourneyModal(false);
                  setSelectedJourneyTree(null);
                }}
                className="w-8 h-8 rounded-full bg-taruvar-bg hover:bg-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tree Summary Bar */}
            <div className="px-5 py-3 bg-taruvar-bg/70 border-b border-taruvar-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-taruvar-dark flex items-center gap-1">
                  <span className="text-emerald-600">Guardian:</span>
                  <span>{selectedJourneyTree.adopter_name || selectedJourneyTree.guardianName || 'Eco Guardian'}</span>
                </span>
                <span className="text-taruvar-muted">•</span>
                <span className="text-taruvar-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{selectedJourneyTree.location || 'Community Green Area'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-[11px] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-700" />
                  <span>{selectedJourneyTree.wellness || 'Thriving & Lush Green'}</span>
                </span>
              </div>
            </div>

            {/* Scrollable Timeline */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Introduction Card */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-emerald-950 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-black text-xs">Complete Lifecycle & Care Diary</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Under Taruvar's <strong>#OnePersonOneTree</strong> Paalna initiative, tree guardians take responsibility for nurturing saplings to maturity. Every milestone photo and wellness log is permanently recorded below.
                  </p>
                </div>
              </div>

              {/* Chronological Milestones List */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-400 before:to-emerald-200">
                
                {/* Milestone 1: Plantation Day (Day 0) */}
                <div className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                    1
                  </div>

                  <div className="bg-white rounded-2xl border border-taruvar-border p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                        Milestone 1 • Plantation Day (Day 0)
                      </span>
                      <span className="text-[11px] font-bold text-taruvar-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{selectedJourneyTree.plantedDate || selectedJourneyTree.planted_date || 'Plantation Day'}</span>
                      </span>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-taruvar-border bg-gray-900 max-h-56">
                      <img 
                        src={selectedJourneyTree.plantation_photo || selectedJourneyTree.photoUrl || selectedJourneyTree.photo || '/logo.jpg'} 
                        alt="Sapling Plantation" 
                        className="w-full h-48 sm:h-56 object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-xs text-taruvar-dark flex items-center gap-2">
                        <span>🌱 Sapling Planted & Pledged</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {selectedJourneyTree.species || 'Indigenous Species'}
                        </span>
                      </div>
                      <p className="text-[11px] text-taruvar-muted leading-relaxed">
                        Sapling officially registered under Taruvar. Guardian pledged to protect, water, and nurture the tree through regular 1-15 day verification cycles.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Milestones 2+: Growth & Care Reports */}
                {Array.isArray(selectedJourneyTree.reports) && selectedJourneyTree.reports.length > 0 ? (
                  selectedJourneyTree.reports.map((report, rIdx) => (
                    <div key={report.id || rIdx} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                        {rIdx + 2}
                      </div>

                      <div className="bg-white rounded-2xl border border-taruvar-border p-4 shadow-xs space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-900 text-[10px] font-black rounded-full uppercase">
                            Milestone {rIdx + 2} • {report.intervalDays || 1}-Day Care Log
                          </span>
                          <span className="text-[11px] font-bold text-taruvar-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{report.date || 'Care Logged'}</span>
                          </span>
                        </div>

                        {report.photo && (
                          <div className="rounded-xl overflow-hidden border border-taruvar-border bg-gray-900 max-h-56">
                            <img 
                              src={report.photo} 
                              alt={`Milestone ${rIdx + 2}`} 
                              className="w-full h-48 sm:h-56 object-cover"
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-taruvar-light text-taruvar-secondary text-[10px] font-bold rounded-md">
                              🌿 Activity: {report.activity || 'Tree Nurturing'}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
                              ✓ Status: {report.wellness || 'Thriving'}
                            </span>
                          </div>
                          {report.notes && (
                            <p className="text-[11px] text-taruvar-dark bg-taruvar-bg/60 p-2.5 rounded-xl border border-taruvar-border leading-relaxed">
                              "{report.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative">
                    <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                      ⏳
                    </div>
                    <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 space-y-1 text-amber-950">
                      <p className="font-black text-xs">Upcoming Growth Update</p>
                      <p className="text-[11px] text-amber-900/90 leading-relaxed">
                        The guardian logs regular 1-15 day growth photos and wellness progress. Next milestone photo will appear here once submitted!
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-taruvar-bg border-t border-taruvar-border flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowJourneyModal(false);
                  onOpenPledge();
                }}
                className="px-4 py-2.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Adopt a Tree Like This</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${selectedJourneyTree.tree_name || 'Adopted Tree'} Journey • Taruvar`,
                      text: `Check out the growing journey of ${selectedJourneyTree.tree_name} under Taruvar #OnePersonOneTree!`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    if (showToast) showToast('Journey link copied to clipboard!');
                  }
                }}
                className="px-3.5 py-2.5 bg-white hover:bg-taruvar-border border border-taruvar-border text-taruvar-dark font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Journey</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ENVIRONMENTAL CREATOR PATHWAY & GUIDE MODAL */}
      {/* ======================================================== */}
      {showCreatorGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col border border-taruvar-border shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-taruvar-border bg-gradient-to-r from-teal-50 via-emerald-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-green-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                  🌿
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                    Taruvar Creator Program
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-taruvar-dark leading-tight mt-0.5">
                    How to Become an Environmental Creator
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowCreatorGuideModal(false)}
                className="w-8 h-8 rounded-full bg-taruvar-bg hover:bg-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Guide Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Intro Banner */}
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent rounded-2xl border border-emerald-200 space-y-1.5">
                <p className="font-black text-sm text-taruvar-dark flex items-center gap-2">
                  <span>Beyond Tree Adoption • Be an Eco Storyteller</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </p>
                <p className="text-[11px] text-taruvar-muted leading-relaxed">
                  Anyone can adopt a tree, but <strong>Environmental Creators</strong> lead ground-level initiatives—cleaning sacred rivers, protecting mountain trails, eliminating plastic waste, and inspiring thousands of citizens across India.
                </p>
              </div>

              {/* 4 Core Pillars */}
              <div>
                <h4 className="font-black text-xs text-taruvar-dark uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>The 4 Action Pillars for Creators</span>
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-blue-900 text-xs">
                      <span>🌊</span>
                      <span>River & Water Care</span>
                    </div>
                    <p className="text-[10px] text-blue-800 leading-tight">
                      Ghat cleanups, pond restoration, removing plastic & floral waste from rivers.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs">
                      <span>🏔️</span>
                      <span>Mountain & Treks</span>
                    </div>
                    <p className="text-[10px] text-amber-800 leading-tight">
                      Zero-waste hiking, collecting trash from high-altitude trails, eco-tourism care.
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-teal-900 text-xs">
                      <span>🧹</span>
                      <span>Waste Elimination</span>
                    </div>
                    <p className="text-[10px] text-teal-800 leading-tight">
                      Neighborhood cleanup drives, segregation campaigns, anti-littering circles.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs">
                      <span>🌳</span>
                      <span>Citizen Forestry</span>
                    </div>
                    <p className="text-[10px] text-emerald-800 leading-tight">
                      Seedball dispersal, community nurseries, multi-tree canopy guardianship.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Step Process */}
              <div>
                <h4 className="font-black text-xs text-taruvar-dark uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The Step-by-Step Creator Process</span>
                </h4>
                
                <div className="space-y-2.5">
                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-taruvar-secondary text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h5 className="font-black text-xs text-taruvar-dark">Execute On-Ground Eco Action</h5>
                      <p className="text-[11px] text-taruvar-muted mt-0.5">
                        Conduct a cleanup, plantation drive, or conservation activity individually or with your society/college group.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h5 className="font-black text-xs text-taruvar-dark">Capture Proof & Impact Media</h5>
                      <p className="text-[11px] text-taruvar-muted mt-0.5">
                        Take clear field photos or videos showing before/after impact, waste collected, or saplings nurtured.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h5 className="font-black text-xs text-taruvar-dark">Tap "Add yours+" to Publish</h5>
                      <p className="text-[11px] text-taruvar-muted mt-0.5">
                        Click the <strong>Add yours+</strong> button in the Explore bar, choose your category, cadence (1, 3, 7, 15 days), upload photo, and post.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <h5 className="font-black text-xs text-taruvar-dark">Earn Creator Badge & Official Credentials</h5>
                      <p className="text-[11px] text-taruvar-muted mt-0.5">
                        Your work is verified by Taruvar inspectors. You earn the <strong>Verified Eco-Guardian Badge</strong> and an official, verifiable Taruvar Environmental Creator Certificate in your Profile!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Benefits Summary */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1.5">
                <p className="font-extrabold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Creator Benefits & Recognition</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-emerald-900 font-semibold pt-1">
                  <div>✓ Verified Green Creator Checkmark</div>
                  <div>✓ Pan-India Explore Feed Visibility</div>
                  <div>✓ Official QR-Verifiable Certificate</div>
                  <div>✓ Leadership in Taruvar City Chapters</div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-taruvar-bg border-t border-taruvar-border flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowCreatorGuideModal(false);
                  setShowPostModal(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-taruvar-secondary via-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publish My Environmental Action Now (Add yours+)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
