import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Heart, Award, Camera, Upload, CheckCircle2, Clock, 
  Sparkles, ThumbsUp, MapPin, Calendar, Plus, ChevronRight, Layers, Lock, Flame
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export default function ProfilePage({ currentUser, onOpenAuth, onOpenAdopt, showToast }) {
  const [activeTab, setActiveTab] = useState('my-trees'); // 'my-trees' | 'community-feed' | 'leaderboard'
  const [reportModalTree, setReportModalTree] = useState(null);
  const [reportMonth, setReportMonth] = useState(1);
  const [reportNotes, setReportNotes] = useState('');
  const [reportPhoto, setReportPhoto] = useState(null);
  const [reportPhotoPreview, setReportPhotoPreview] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Sample initial tree adoptions state (backed by local state + Supabase if available)
  const [myTrees, setMyTrees] = useState([
    {
      id: 'tree-101',
      tree_name: 'My Peepal Guardian',
      species: 'Peepal Tree',
      status: 'approved', // 'pending' | 'approved' | 'rejected'
      plantation_photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      location: 'Green Campus Sector 4',
      verified_months: 2, // 0 to 5
      upvotes: 24,
      user_upvoted: false,
      planted_date: 'Aug 15, 2026',
      reports: [
        { month: 1, photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80', notes: 'First monthly check. Sapling grew 5cm with new leaves!', status: 'verified', date: 'Sep 15, 2026' },
        { month: 2, photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80', notes: 'Month 2 report. Organic compost added, stem is thickening.', status: 'verified', date: 'Oct 15, 2026' }
      ]
    }
  ]);

  const [communityFeed, setCommunityFeed] = useState([
    {
      id: 'tree-201',
      author: 'Ananya Sharma',
      avatar: '👩‍🌾',
      tree_name: 'Banyan Sanctuary',
      species: 'Banyan Tree',
      location: 'Community Park Area',
      plantation_photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      verified_months: 4,
      upvotes: 58,
      user_upvoted: false,
      date: 'Aug 10, 2026'
    },
    {
      id: 'tree-202',
      author: 'Rahul Verma',
      avatar: '👨‍🎓',
      tree_name: 'Gulmohar Bloom',
      species: 'Gulmohar Tree',
      location: 'University Quadrangle',
      plantation_photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
      verified_months: 5,
      upvotes: 92,
      user_upvoted: false,
      date: 'Jul 22, 2026'
    }
  ]);

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Tree Care Guardian';
  const userEmail = currentUser?.email || 'connect@taruvar.org';

  const handleUpvote = (treeId, isCommunity = false) => {
    if (isCommunity) {
      setCommunityFeed(prev => prev.map(t => {
        if (t.id === treeId) {
          const newUpvoted = !t.user_upvoted;
          return {
            ...t,
            user_upvoted: newUpvoted,
            upvotes: newUpvoted ? t.upvotes + 1 : t.upvotes - 1
          };
        }
        return t;
      }));
    } else {
      setMyTrees(prev => prev.map(t => {
        if (t.id === treeId) {
          const newUpvoted = !t.user_upvoted;
          return {
            ...t,
            user_upvoted: newUpvoted,
            upvotes: newUpvoted ? t.upvotes + 1 : t.upvotes - 1
          };
        }
        return t;
      }));
    }
  };

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

  const submitMonthlyReport = (e) => {
    e.preventDefault();
    if (!reportPhotoPreview) {
      alert('Please upload a progress photo for your monthly report.');
      return;
    }

    setSubmittingReport(true);

    const newReport = {
      month: reportMonth,
      photo: reportPhotoPreview,
      notes: reportNotes || `Month ${reportMonth} progress update photo submitted.`,
      status: 'pending', // Pending admin verification
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setMyTrees(prev => prev.map(t => {
      if (t.id === reportModalTree.id) {
        return {
          ...t,
          reports: [...t.reports, newReport]
        };
      }
      return t;
    }));

    setSubmittingReport(false);
    setReportModalTree(null);
    setReportNotes('');
    setReportPhotoPreview(null);
    
    confetti({ particleCount: 50, spread: 50 });
    if (showToast) {
      showToast(`Month ${reportMonth} growth report submitted! Pending team verification.`);
    }
  };

  if (!currentUser) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-taruvar-light text-taruvar-secondary rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-glow">
          🌱
        </div>
        <h2 className="text-3xl font-extrabold text-taruvar-dark">Your Taruvar Eco-Profile</h2>
        <p className="text-sm text-taruvar-muted leading-relaxed">
          Log in or register to track your adopted trees, submit 5-month growth verification reports, and climb the community eco-leaderboard!
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          Log In / Register Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Profile Header Banner */}
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

        {/* Stats Summary */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-3 rounded-2xl border border-white/10 z-10">
          <div className="text-center px-3 border-r border-white/10">
            <p className="text-2xl font-black text-taruvar-accent">{myTrees.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Trees Adopted</p>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-black text-white">{myTrees.reduce((acc, t) => acc + t.upvotes, 0)}</p>
            <p className="text-[10px] text-white/80 uppercase">Upvotes Received</p>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center justify-between border-b border-taruvar-border pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'my-trees', label: 'My Adopted Trees', icon: '🌳' },
            { id: 'community-feed', label: 'Community Feed', icon: '🌍' },
            { id: 'leaderboard', label: 'Eco Leaderboard', icon: '🏆' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
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

        <button
          onClick={onOpenAdopt}
          className="px-4 py-2.5 bg-taruvar-primary text-taruvar-dark font-extrabold text-xs rounded-2xl shadow hover:bg-taruvar-accent transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Adopt Another Tree
        </button>
      </div>

      {/* TAB 1: MY ADOPTED TREES */}
      {activeTab === 'my-trees' && (
        <div className="space-y-8">
          {myTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-4">
              <span className="text-4xl">🌱</span>
              <h3 className="text-xl font-bold text-taruvar-dark">No Trees Adopted Yet</h3>
              <p className="text-xs text-taruvar-muted max-w-sm mx-auto">
                Start your environmental journey today by adopting a tree with plantation photo proof!
              </p>
              <button onClick={onOpenAdopt} className="px-6 py-3 bg-taruvar-secondary text-white font-bold text-xs rounded-xl">
                Adopt Your First Tree
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {myTrees.map((tree) => (
                <div key={tree.id} className="lg:col-span-12 bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8">
                  
                  {/* Left Column: Tree Photo & Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border">
                      <img src={tree.plantation_photo} alt={tree.tree_name} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tree.status === 'approved' 
                          ? 'bg-emerald-600 text-white shadow' 
                          : 'bg-amber-500 text-white shadow'
                      }`}>
                        {tree.status === 'approved' ? '✅ Admin Confirmed' : '⏳ Pending Admin Approval'}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-taruvar-secondary uppercase tracking-wider">{tree.species}</span>
                      <h3 className="text-2xl font-extrabold text-taruvar-dark">{tree.tree_name}</h3>
                      <p className="text-xs text-taruvar-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-taruvar-primary" /> {tree.location} • Planted {tree.planted_date}
                      </p>
                    </div>

                    {/* Upvote & Share Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleUpvote(tree.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          tree.user_upvoted 
                            ? 'bg-taruvar-secondary text-white' 
                            : 'bg-taruvar-bg text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{tree.upvotes} Upvotes</span>
                      </button>

                      {tree.verified_months >= 5 && (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Award className="w-4 h-4 text-amber-600" /> 5-Month Verified Badge!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 5-Month Growth Verification Timeline */}
                  <div className="lg:col-span-7 space-y-5 border-t lg:border-t-0 lg:border-l border-taruvar-border pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-taruvar-dark text-lg">5-Month Verification Journey</h4>
                          <p className="text-xs text-taruvar-muted">Submit monthly progress photos for 5 consecutive months to earn your official badge.</p>
                        </div>
                        <span className="text-xs font-mono font-bold px-3 py-1 bg-taruvar-light text-taruvar-secondary rounded-full">
                          {tree.verified_months} / 5 Verified
                        </span>
                      </div>

                      {/* 5 Milestone Circles */}
                      <div className="grid grid-cols-5 gap-2 text-center pt-2">
                        {[1, 2, 3, 4, 5].map((monthNum) => {
                          const report = tree.reports.find(r => r.month === monthNum);
                          const isVerified = report && report.status === 'verified';
                          const isPending = report && report.status === 'pending';

                          return (
                            <div key={monthNum} className="space-y-1">
                              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isVerified 
                                  ? 'bg-taruvar-secondary text-white border-taruvar-secondary shadow-sm'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border-amber-400'
                                  : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}>
                                {isVerified ? <CheckCircle2 className="w-5 h-5" /> : `M${monthNum}`}
                              </div>
                              <p className="text-[10px] font-bold text-taruvar-muted">
                                {isVerified ? 'Verified' : isPending ? 'Pending' : 'Locked'}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Submitted Monthly Reports List */}
                      <div className="space-y-2 pt-2">
                        {tree.reports.map((rep) => (
                          <div key={rep.month} className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center gap-3 text-xs">
                            <img src={rep.photo} alt={`Month ${rep.month}`} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-taruvar-dark">Month {rep.month} Growth Log</span>
                                <span className="text-[10px] text-taruvar-muted">{rep.date}</span>
                              </div>
                              <p className="text-taruvar-muted truncate mt-0.5">{rep.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action to Submit Next Month Report */}
                    {tree.verified_months < 5 && (
                      <div className="pt-4 border-t border-taruvar-border">
                        <button
                          onClick={() => {
                            setReportModalTree(tree);
                            setReportMonth(tree.reports.length + 1);
                          }}
                          className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" /> Submit Month {tree.reports.length + 1} Growth Photo Report
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMUNITY FEED */}
      {activeTab === 'community-feed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communityFeed.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{post.avatar}</span>
                  <div>
                    <h4 className="font-bold text-taruvar-dark text-sm">{post.author}</h4>
                    <p className="text-[10px] text-taruvar-muted">{post.date} • {post.location}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-taruvar-light text-taruvar-secondary text-[10px] font-bold rounded-full">
                  {post.verified_months}/5 Months Verified
                </span>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border">
                <img src={post.plantation_photo} alt={post.tree_name} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-taruvar-secondary">{post.species}</span>
                  <h3 className="font-extrabold text-taruvar-dark text-base">{post.tree_name}</h3>
                </div>

                <button
                  onClick={() => handleUpvote(post.id, true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    post.user_upvoted 
                      ? 'bg-taruvar-secondary text-white' 
                      : 'bg-taruvar-bg text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{post.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ECO LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-taruvar-secondary uppercase tracking-widest bg-taruvar-light px-3 py-1 rounded-full">
              Community Top Nurtured Trees
            </span>
            <h3 className="text-2xl font-extrabold text-taruvar-dark">Public Tree Ranking Leaderboard</h3>
            <p className="text-xs text-taruvar-muted">Ranked by community upvotes and 5-month verification progress.</p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {communityFeed.map((rank, idx) => (
              <div key={rank.id} className="p-4 bg-taruvar-bg rounded-2xl border border-taruvar-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-taruvar-dark text-sm">{rank.tree_name}</h4>
                    <p className="text-[11px] text-taruvar-muted">Nurtured by {rank.author} • {rank.species}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-taruvar-secondary">
                  <span>👍 {rank.upvotes} Upvotes</span>
                  <span className="px-3 py-1 bg-white rounded-xl border border-taruvar-border text-taruvar-dark">
                    {rank.verified_months}/5 Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Growth Report Submission Modal */}
      {reportModalTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 md:p-8 rounded-3xl shadow-2xl border border-taruvar-border space-y-5 relative">
            <button
              onClick={() => setReportModalTree(null)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center absolute top-4 right-4 text-gray-500 hover:text-dark"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-taruvar-secondary uppercase tracking-wider">
                5-Month Verification Log
              </span>
              <h3 className="text-2xl font-bold text-taruvar-dark">Month {reportMonth} Growth Report</h3>
              <p className="text-xs text-taruvar-muted">For {reportModalTree.tree_name}</p>
            </div>

            <form onSubmit={submitMonthlyReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                  Upload Growth Progress Photo *
                </label>
                <div className="border-2 border-dashed border-taruvar-border rounded-2xl p-4 text-center cursor-pointer hover:border-taruvar-secondary transition-all bg-taruvar-bg">
                  {reportPhotoPreview ? (
                    <img src={reportPhotoPreview} alt="Preview" className="h-32 mx-auto object-cover rounded-xl" />
                  ) : (
                    <div className="space-y-1">
                      <Camera className="w-8 h-8 text-taruvar-secondary mx-auto" />
                      <p className="text-xs font-bold text-taruvar-dark">Click to Upload Photo</p>
                      <p className="text-[10px] text-taruvar-muted">Shows sapling height & new growth</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" required onChange={handlePhotoSelect} className="hidden" id="report-photo-input" />
                  <label htmlFor="report-photo-input" className="block text-[11px] font-bold text-taruvar-secondary cursor-pointer mt-2">
                    {reportPhotoPreview ? 'Change Photo' : 'Select Photo File'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                  Growth Notes / Sapling Observations
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Stem thickened, watered every 3 days, new leaf buds appeared..."
                  className="w-full px-4 py-2.5 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full py-3.5 bg-taruvar-secondary text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
              >
                Submit Month {reportMonth} Growth Report
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
