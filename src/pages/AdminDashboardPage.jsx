import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Check, X, Eye, Camera, Clock, Award, KeyRound, Lock, AlertCircle, User, Mail, UserPlus, LogIn, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { 
  getCloudPendingAdoptions, 
  getCloudApprovedAdoptions, 
  approveCloudAdoption, 
  rejectCloudAdoption 
} from '../lib/cloudDb';

export default function AdminDashboardPage({ currentUser, showToast, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('pending-trees');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [localIsAdmin, setLocalIsAdmin] = useState(
    currentUser?.user_metadata?.role === 'admin' || 
    currentUser?.email?.toLowerCase() === 'naveenpr332@gmail.com'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Direct Admin Login Form State if not logged in
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Live pending tree adoptions awaiting admin confirmation
  const [pendingTrees, setPendingTrees] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      const all = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const pendingFromAll = all.filter(t => t.status === 'pending').map(t => ({
        id: t.id || t.treeId,
        treeId: t.treeId || t.id,
        adopter_name: t.guardianName || t.adopter_name,
        adopter_email: t.user_email || t.adopter_email,
        tree_name: t.tree_name || t.treeName,
        species: t.species || t.treeType,
        location: t.location,
        plantation_photo: t.photoUrl || t.plantation_photo,
        date: t.plantedDate || t.planted_date
      }));
      const combined = [...p];
      pendingFromAll.forEach(item => {
        if (!combined.some(c => c.id === item.id || c.treeId === item.treeId)) {
          combined.push(item);
        }
      });
      return combined;
    } catch {
      return [];
    }
  });

  // Live pending monthly growth reports awaiting admin verification
  const [pendingReports, setPendingReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taruvar_pending_reports') || '[]');
    } catch {
      return [];
    }
  });

  // Live database of all approved and planted trees in frontend
  const [approvedTrees, setApprovedTrees] = useState(() => {
    try {
      const all = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      return all.filter(t => t.status === 'approved' || !t.status);
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  // Robust unified data loader across Cloud DB + Supabase + LocalStorage
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Load from localStorage
      const localPending = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      const localAll = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const pendingFromAll = localAll.filter(t => t.status === 'pending').map(t => ({
        id: t.id || t.treeId,
        treeId: t.treeId || t.id,
        adopter_name: t.guardianName || t.adopter_name,
        adopter_email: t.user_email || t.adopter_email,
        tree_name: t.tree_name || t.treeName,
        species: t.species || t.treeType,
        location: t.location,
        plantation_photo: t.photoUrl || t.plantation_photo,
        date: t.plantedDate || t.planted_date
      }));

      const mergedPending = [...localPending];
      pendingFromAll.forEach(item => {
        if (!mergedPending.some(c => c.id === item.id || (c.treeId && c.treeId === item.treeId))) {
          mergedPending.push(item);
        }
      });

      const localApproved = localAll.filter(t => t.status === 'approved' || (!t.status && t.plantedDate));

      // 2. Load from Shared Cloud Database (Real-time Cross-Device Sync)
      try {
        const cloudPending = await getCloudPendingAdoptions();
        if (Array.isArray(cloudPending) && cloudPending.length > 0) {
          cloudPending.forEach(cp => {
            if (!mergedPending.some(p => p.id === cp.id || p.treeId === cp.treeId)) {
              mergedPending.push(cp);
            }
          });
        }

        const cloudApproved = await getCloudApprovedAdoptions();
        if (Array.isArray(cloudApproved) && cloudApproved.length > 0) {
          cloudApproved.forEach(ca => {
            if (!localApproved.some(a => a.id === ca.id || a.treeId === ca.treeId)) {
              localApproved.push(ca);
            }
          });
        }
      } catch (err) {
        console.warn('Cloud load notice:', err);
      }
      
      setPendingTrees([...mergedPending]);
      setApprovedTrees([...localApproved]);

      // 3. Load from Supabase pledges table if available
      if (supabase) {
        const { data, error } = await supabase.from('pledges').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const supabasePending = data.filter(d => d.status === 'pending').map(d => ({
            id: d.id,
            adopter_name: d.name,
            adopter_email: d.email,
            tree_name: d.tree_name,
            species: d.tree_type,
            location: d.location,
            plantation_photo: d.plantation_photo,
            treeId: d.tree_id_code || `TRV-TREE-${d.id}`,
            memberId: d.member_id_code,
            isBulk: d.name?.includes('(') || false,
            date: new Date(d.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));

          const combinedPending = [...mergedPending];
          supabasePending.forEach(sp => {
            if (!combinedPending.some(p => p.id === sp.id || p.treeId === sp.treeId)) {
              combinedPending.push(sp);
            }
          });
          setPendingTrees(combinedPending);

          const supabaseApproved = data.filter(d => d.status === 'approved').map(d => ({
            id: d.id,
            adopter_name: d.name,
            adopter_email: d.email,
            tree_name: d.tree_name,
            species: d.tree_type,
            location: d.location,
            plantation_photo: d.plantation_photo,
            treeId: d.tree_id_code || `TRV-TREE-${d.id}`,
            memberId: d.member_id_code,
            isBulk: d.name?.includes('(') || false,
            verified_months: d.verified_months || 1,
            date: new Date(d.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));

          const combinedApproved = [...localApproved];
          supabaseApproved.forEach(sa => {
            if (!combinedApproved.some(a => a.id === sa.id || a.treeId === sa.treeId)) {
              combinedApproved.push(sa);
            }
          });
          setApprovedTrees(combinedApproved);
        }
      }
    } catch (err) {
      console.warn('Admin load data note:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    // Auto sync interval every 4 seconds while admin is on the page
    const interval = setInterval(() => {
      loadAllData();
    }, 4000);
    window.addEventListener('focus', loadAllData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', loadAllData);
    };
  }, [loadAllData]);

  // Unlock Admin with Passkey
  const handleUnlockAdmin = async (e) => {
    e.preventDefault();
    setPasskeyError('');

    if (passkeyInput === 'TARUVAR_ADMIN_2026' || passkeyInput === 'taruvar2026' || passkeyInput === 'admin2026') {
      setLocalIsAdmin(true);
      if (supabase && currentUser) {
        // Permanently set role: 'admin' in Supabase user metadata
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
      }
      confetti({ particleCount: 60, spread: 60 });
      if (showToast) showToast('Admin Role Activated Permanently!');
    } else {
      setPasskeyError('Invalid Secret Passkey. Only the Taruvar founder can approve requests.');
    }
  };

  // Direct Admin Login / Register
  const handleAdminDirectLogin = async (e) => {
    e.preventDefault();
    setPasskeyError('');
    setAuthLoading(true);

    if (passkeyInput !== 'TARUVAR_ADMIN_2026' && passkeyInput !== 'taruvar2026' && passkeyInput !== 'admin2026') {
      setPasskeyError('Invalid Admin Passkey. Please enter TARUVAR_ADMIN_2026.');
      setAuthLoading(false);
      return;
    }

    try {
      if (supabase) {
        // Try sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });

        if (error) {
          // Try sign up if user doesn't exist
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              data: { full_name: 'Taruvar Admin', role: 'admin' }
            }
          });
          if (signUpError) throw signUpError;
          setLocalIsAdmin(true);
          if (showToast) showToast('Admin Account Created & Activated!');
        } else {
          // Upgrade to admin role permanently
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
          setLocalIsAdmin(true);
          if (showToast) showToast('Welcome Admin! Approval desk unlocked.');
        }
      } else {
        setLocalIsAdmin(true);
        if (showToast) showToast('Admin Access Unlocked!');
      }
      confetti({ particleCount: 70, spread: 70 });
    } catch (err) {
      setPasskeyError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleApproveTree = async (treeId, adopterName) => {
    const approvedTree = pendingTrees.find(t => t.id === treeId || t.treeId === treeId);
    const updatedPending = pendingTrees.filter(t => t.id !== treeId && t.treeId !== treeId);
    setPendingTrees(updatedPending);
    localStorage.setItem('taruvar_pending_adoptions', JSON.stringify(updatedPending));

    if (approvedTree) {
      const newApprovedItem = {
        ...approvedTree,
        status: 'approved',
        verified_months: 1,
        verifiedMonths: 1
      };
      setApprovedTrees(prev => [newApprovedItem, ...prev.filter(t => t.id !== treeId && t.treeId !== treeId)]);

      try {
        const currentAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
        let found = false;
        const updatedAdoptions = currentAdoptions.map(t => {
          if (t.id === treeId || t.treeId === treeId) {
            found = true;
            return { ...t, status: 'approved' };
          }
          return t;
        });
        if (!found) {
          updatedAdoptions.unshift({
            ...newApprovedItem,
            status: 'approved'
          });
        }
        localStorage.setItem('taruvar_adoptions', JSON.stringify(updatedAdoptions));
      } catch (e) {
        console.error(e);
      }

      // Sync approval with cloud
      approveCloudAdoption(treeId, newApprovedItem).catch(e => console.warn('Cloud approve error:', e));
    }

    if (supabase) {
      try {
        await supabase.from('pledges').update({ status: 'approved' }).eq('id', treeId);
      } catch (e) {}
    }

    confetti({ particleCount: 50, spread: 50 });
    if (showToast) {
      showToast(`Adoption approved for ${adopterName}! Verified and active in Planted Directory.`);
    }
  };

  const handleRejectTree = async (treeId) => {
    const updatedPending = pendingTrees.filter(t => t.id !== treeId && t.treeId !== treeId);
    setPendingTrees(updatedPending);
    localStorage.setItem('taruvar_pending_adoptions', JSON.stringify(updatedPending));

    // Sync rejection with cloud
    rejectCloudAdoption(treeId).catch(e => console.warn('Cloud reject error:', e));

    try {
      const currentAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const updatedAdoptions = currentAdoptions.map(t => {
        if (t.id === treeId || t.treeId === treeId) {
          return { ...t, status: 'rejected' };
        }
        return t;
      });
      localStorage.setItem('taruvar_adoptions', JSON.stringify(updatedAdoptions));
    } catch (e) {
      console.error(e);
    }

    if (supabase) {
      try {
        await supabase.from('pledges').update({ status: 'rejected' }).eq('id', treeId);
      } catch (e) {}
    }

    if (showToast) {
      showToast(`Adoption submission rejected.`);
    }
  };

  const handleVerifyReport = (reportId, monthNum, adopterName) => {
    const updatedReports = pendingReports.filter(r => r.id !== reportId);
    setPendingReports(updatedReports);
    localStorage.setItem('taruvar_pending_reports', JSON.stringify(updatedReports));
    confetti({ particleCount: 60, spread: 60 });
    if (showToast) {
      showToast(`Month ${monthNum} Growth Report verified for ${adopterName}! Progress updated.`);
    }
  };

  // ADMIN AUTHORIZATION GATE
  const isAdminAuthorized = localIsAdmin || currentUser?.user_metadata?.role === 'admin' || currentUser?.email?.toLowerCase() === 'naveenpr332@gmail.com';

  if (!isAdminAuthorized) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow">
          <Lock className="w-8 h-8 text-amber-700" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
            INTERNAL ADMIN DESK
          </span>
          <h2 className="text-2xl font-extrabold text-taruvar-dark">Founder & Admin Verification</h2>
          <p className="text-xs text-taruvar-muted leading-relaxed">
            Enter your secret founder passkey below to unlock permanent admin approval privileges.
          </p>
        </div>

        {passkeyError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passkeyError}</span>
          </div>
        )}

        {currentUser ? (
          /* User is logged in: Just needs passkey to permanently activate Admin role */
          <form onSubmit={handleUnlockAdmin} className="space-y-4 bg-white p-6 rounded-3xl border border-taruvar-border shadow-card text-left">
            <div className="p-3 bg-taruvar-light rounded-2xl text-xs text-taruvar-dark flex items-center gap-2">
              <User className="w-4 h-4 text-taruvar-secondary" />
              <span>Logged in as: <strong>{currentUser.email}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                Enter Admin Secret Passkey *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Passkey (TARUVAR_ADMIN_2026)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Activate Permanent Admin Role
            </button>
          </form>
        ) : (
          /* User is not logged in: Log In / Create Admin Account with Passkey */
          <form onSubmit={handleAdminDirectLogin} className="space-y-3 bg-white p-6 rounded-3xl border border-taruvar-border shadow-card text-left">
            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                Admin Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@taruvar.org"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                Admin Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Admin Secret Passkey *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-600 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="TARUVAR_ADMIN_2026"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-2 mt-2"
            >
              {authLoading ? 'Authenticating...' : <><ShieldCheck className="w-4 h-4" /> Log In & Unlock Admin Desk</>}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 bg-emerald-800 text-taruvar-accent text-xs font-bold rounded-full border border-emerald-600 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ADMIN ROLE • taruvar.org
          </span>
          <h1 className="text-3xl font-extrabold">Taruvar Admin Verification Desk</h1>
          <p className="text-xs text-white/80 max-w-xl">
            Review submitted plantation action photos, approve tree adoptions, and verify 5-month growth progress reports.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
          <div className="text-center px-3 border-r border-white/10">
            <p className="text-2xl font-black text-amber-300">{pendingTrees.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Pending Review</p>
          </div>
          <div className="text-center px-3 border-r border-white/10">
            <p className="text-2xl font-black text-taruvar-accent">{approvedTrees.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Planted Trees</p>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-black text-white">{pendingReports.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Pending Reports</p>
          </div>
        </div>
      </div>

      {/* Tabs & Live Refresh Control */}
      <div className="flex items-center justify-between border-b border-taruvar-border pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending-trees')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending-trees'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-200" />
            <span>Pending Adoptions ({pendingTrees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('planted-directory')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'planted-directory'
                ? 'bg-taruvar-secondary text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-taruvar-accent" />
            <span>Planted Trees Directory ({approvedTrees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending-reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending-reports'
                ? 'bg-taruvar-secondary text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <Camera className="w-4 h-4 text-taruvar-accent" />
            <span>Pending Growth Reports ({pendingReports.length})</span>
          </button>
        </div>

        {/* Live Refresh Button */}
        <button
          onClick={loadAllData}
          disabled={isRefreshing}
          className="px-3.5 py-2.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs font-bold rounded-2xl border border-taruvar-border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          title="Refresh All Adoption Requests"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
        </button>
      </div>

      {/* TAB 1: PENDING TREES */}
      {activeTab === 'pending-trees' && (
        <div className="space-y-6">
          {pendingTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-3">
              <Check className="w-12 h-12 text-taruvar-primary mx-auto" />
              <h3 className="text-xl font-bold text-taruvar-dark">All Tree Adoptions Reviewed!</h3>
              <p className="text-xs text-taruvar-muted">
                No pending tree adoption submissions awaiting review right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTrees.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-card space-y-4 relative">
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    ⏳ Pending Admin Approval
                  </span>

                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border relative group mt-3">
                    <img src={item.plantation_photo} alt={item.tree_name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedPhotoModal(item.plantation_photo)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Full Plantation Photo Proof
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-taruvar-secondary">{item.species}</span>
                    <h3 className="text-xl font-extrabold text-taruvar-dark">{item.tree_name}</h3>
                    <p className="text-xs text-taruvar-dark font-semibold">Adopter / Coordinator: {item.adopter_name} ({item.adopter_email})</p>
                    <p className="text-[11px] text-taruvar-muted">Location: {item.location} • Submitted: {item.date}</p>
                    {item.treeId && (
                      <p className="text-[10px] font-mono text-emerald-700 font-bold">Assigned Tree ID: {item.treeId}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-taruvar-border">
                    <button
                      onClick={() => handleApproveTree(item.id, item.adopter_name)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Approve & Certify Tree
                    </button>
                    <button
                      onClick={() => handleRejectTree(item.id)}
                      className="py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLANTED TREES DIRECTORY (DATABASE OF ALL APPROVED TREES) */}
      {activeTab === 'planted-directory' && (
        <div className="space-y-6">
          
          {/* Search Bar & Summary Bar */}
          <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <label className="block text-xs font-bold text-taruvar-muted uppercase tracking-wider mb-1.5">
                Search Planted Trees Database
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Adopter, Tree ID, Species, or Organization..."
                className="w-full px-4 py-2.5 rounded-xl border border-taruvar-border text-xs focus:ring-2 focus:ring-taruvar-primary"
              />
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-4 py-2 bg-taruvar-bg rounded-xl border border-taruvar-border text-center">
                <p className="font-extrabold text-taruvar-dark text-lg">{approvedTrees.length}</p>
                <p className="text-[10px] text-taruvar-muted uppercase font-bold">Approved Trees</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <p className="font-extrabold text-emerald-800 text-lg">
                  {approvedTrees.reduce((acc, t) => acc + (t.treeCount || 1), 0)}
                </p>
                <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Saplings</p>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          {approvedTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-3">
              <span className="text-4xl">🌳</span>
              <h3 className="text-xl font-bold text-taruvar-dark">No Approved Planted Trees Yet</h3>
              <p className="text-xs text-taruvar-muted max-w-sm mx-auto">
                When you approve submitted tree adoptions from the "Pending Adoptions" tab, they will be archived here permanently in the Taruvar Planted Registry.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedTrees
                .filter(t => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    t.tree_name?.toLowerCase().includes(q) ||
                    t.adopter_name?.toLowerCase().includes(q) ||
                    t.adopter_email?.toLowerCase().includes(q) ||
                    t.species?.toLowerCase().includes(q) ||
                    t.treeId?.toLowerCase().includes(q) ||
                    t.location?.toLowerCase().includes(q)
                  );
                })
                .map((tree) => (
                  <div key={tree.id || tree.treeId} className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden flex flex-col justify-between p-5 space-y-4">
                    
                    <div className="space-y-3">
                      <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border relative group">
                        <img 
                          src={tree.plantation_photo || tree.photoUrl || '/logo.jpg'} 
                          alt={tree.tree_name} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" /> Certified Planted
                        </span>
                        {tree.plantation_photo && (
                          <button
                            onClick={() => setSelectedPhotoModal(tree.plantation_photo)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1"
                          >
                            <Eye className="w-4 h-4" /> View Full Photo
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-taruvar-secondary">{tree.species}</span>
                          <span className="text-[10px] font-mono font-bold text-gray-500">{tree.treeId || tree.id}</span>
                        </div>
                        <h4 className="text-base font-extrabold text-taruvar-dark">{tree.tree_name}</h4>
                        <p className="text-xs text-taruvar-dark font-medium mt-0.5">Guardian: {tree.adopter_name || tree.guardianName}</p>
                        <p className="text-[11px] text-taruvar-muted">{tree.location} • Planted {tree.plantedDate || tree.planted_date || tree.date}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-taruvar-border flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 bg-taruvar-light text-taruvar-secondary rounded-lg font-bold text-[10px]">
                        {tree.isBulk ? `🏢 Bulk (${tree.treeCount || 1} Trees)` : '👤 Individual'}
                      </span>
                      <span className="text-emerald-700 font-bold text-[11px]">
                        {tree.verified_months || 1}/5 Mo Verified
                      </span>
                    </div>

                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDING MONTHLY REPORTS */}
      {activeTab === 'pending-reports' && (
        <div className="space-y-6">
          {pendingReports.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-3">
              <Check className="w-12 h-12 text-taruvar-primary mx-auto" />
              <h3 className="text-xl font-bold text-taruvar-dark">All Monthly Growth Reports Verified!</h3>
              <p className="text-xs text-taruvar-muted">No pending monthly growth reports awaiting verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReports.map((rep) => (
                <div key={rep.id} className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
                      Month {rep.month} Progress Report
                    </span>
                    <span className="text-xs text-taruvar-muted">{rep.date}</span>
                  </div>

                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border">
                    <img src={rep.growth_photo} alt={`Month ${rep.month}`} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-taruvar-dark">{rep.tree_name}</h3>
                    <p className="text-xs text-taruvar-dark">Caretaker: <strong>{rep.adopter_name}</strong></p>
                    <p className="text-xs text-taruvar-muted leading-relaxed bg-taruvar-bg p-3 rounded-xl border border-taruvar-border mt-2">
                      "{rep.notes}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerifyReport(rep.id, rep.month, rep.adopter_name)}
                    className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Verify Month {rep.month} Report & Unlock Progress
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Resolution Photo Viewer Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-3xl w-full p-4 relative text-center">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-white/20 px-3 py-1 rounded-full"
            >
              Close ✕
            </button>
            <img src={selectedPhotoModal} alt="Enlarged proof" className="w-full max-h-[80vh] object-contain rounded-2xl border-2 border-white/20" />
          </div>
        </div>
      )}

    </div>
  );
}
