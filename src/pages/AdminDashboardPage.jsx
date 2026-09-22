import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Check, X, Eye, Camera, Clock, Award, KeyRound, Lock, 
  AlertCircle, User, Mail, UserPlus, LogIn, RefreshCw, Plus, Trash2, 
  Edit3, MapPin, Sparkles, FolderPlus, Crown, Building, Globe, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getCloudPendingAdoptions, 
  getCloudApprovedAdoptions, 
  approveCloudAdoption, 
  rejectCloudAdoption,
  getCloudInitiatives,
  saveCloudInitiative,
  deleteCloudInitiative,
  getCloudAdminHierarchy,
  saveCloudSubAdmin,
  deleteCloudSubAdmin,
  SUPERADMIN_EMAIL
} from '../lib/cloudDb';

export default function AdminDashboardPage({ currentUser, showToast, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('pending-trees');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Direct Admin Login Form State if not logged in
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Admin Hierarchy state
  const [appointedAdmins, setAppointedAdmins] = useState([]);
  const [initiativesList, setInitiativesList] = useState([]);

  // Check Superadmin vs Sub-admin permissions
  const userEmailLower = currentUser?.email?.toLowerCase();
  const isSuperadmin = userEmailLower === SUPERADMIN_EMAIL || currentUser?.user_metadata?.role === 'superadmin';
  const isAppointedAdmin = appointedAdmins.some(a => a.email === userEmailLower && a.status === 'active');
  const [localIsAdmin, setLocalIsAdmin] = useState(
    isSuperadmin || isAppointedAdmin || currentUser?.user_metadata?.role === 'admin'
  );

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

  // Modal / Form States for Initiatives Management
  const [showAddInitiativeModal, setShowAddInitiativeModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState(null);
  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    subtitle: '',
    category: 'Citizen Afforestation',
    icon: '🌱',
    coverImage: '',
    summary: '',
    point1: '',
    point2: '',
    point3: '',
    targetGoal: '1,000 Trees',
    currentProgress: 0,
    status: 'Active',
    location: 'Pan-India'
  });
  const [savingInitiative, setSavingInitiative] = useState(false);

  // Modal / Form States for Appointing New Admin
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleLevel: 'regional_admin',
    roleTitle: 'Regional Admin (क्षेत्रीय प्रशासक)',
    region: 'Lucknow, Uttar Pradesh',
    passcode: 'TARUVAR_ADMIN_2026'
  });
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Unified Data Loader across Cloud DB + LocalStorage
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Load Trees from LocalStorage
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

      // 2. Load from Shared Cloud Database
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

      // 3. Load Initiatives
      const inits = await getCloudInitiatives();
      setInitiativesList(inits);

      // 4. Load Admin Hierarchy
      const admins = await getCloudAdminHierarchy();
      setAppointedAdmins(admins);

      if (admins.some(a => a.email === userEmailLower && a.status === 'active')) {
        setLocalIsAdmin(true);
      }

    } catch (err) {
      console.warn('Admin load data note:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [userEmailLower]);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData();
    }, 6000);
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
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          user_metadata: { ...(currentUser.user_metadata || {}), role: 'admin' }
        };
        localStorage.setItem('taruvar_session_user', JSON.stringify(updatedUser));
      }
      confetti({ particleCount: 60, spread: 60 });
      if (showToast) showToast('Admin Role Activated Successfully!');
    } else {
      setPasskeyError('Invalid Secret Passkey. Only authorized Taruvar administrators can approve requests.');
    }
  };

  // Direct Admin Login
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
      const isSuper = adminEmail.trim().toLowerCase() === SUPERADMIN_EMAIL;
      const adminUser = {
        id: isSuper ? 'trv-superadmin-master' : `trv-admin-${Date.now()}`,
        email: adminEmail.trim().toLowerCase(),
        user_metadata: {
          full_name: isSuper ? 'Taruvar Superadmin (Founder)' : 'Taruvar Admin',
          role: isSuper ? 'superadmin' : 'admin',
          member_id: isSuper ? 'TRV-SUPERADMIN-001' : 'TRV-ADMIN-REGIONAL'
        }
      };
      localStorage.setItem('taruvar_session_user', JSON.stringify(adminUser));
      setLocalIsAdmin(true);
      if (showToast) showToast(`Welcome ${isSuper ? 'Superadmin' : 'Admin'}! Approval desk unlocked.`);
      confetti({ particleCount: 70, spread: 70 });
    } catch (err) {
      setPasskeyError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Approve Tree
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

      approveCloudAdoption(treeId, newApprovedItem).catch(e => console.warn('Cloud approve error:', e));
    }

    confetti({ particleCount: 50, spread: 50 });
    if (showToast) {
      showToast(`Adoption approved for ${adopterName}! Verified and active in Planted Directory.`);
    }
  };

  // Reject Tree
  const handleRejectTree = async (treeId) => {
    const updatedPending = pendingTrees.filter(t => t.id !== treeId && t.treeId !== treeId);
    setPendingTrees(updatedPending);
    localStorage.setItem('taruvar_pending_adoptions', JSON.stringify(updatedPending));

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

    if (showToast) {
      showToast(`Adoption submission rejected.`);
    }
  };

  // Verify Growth Report
  const handleVerifyReport = (reportId, monthNum, adopterName) => {
    const updatedReports = pendingReports.filter(r => r.id !== reportId);
    setPendingReports(updatedReports);
    localStorage.setItem('taruvar_pending_reports', JSON.stringify(updatedReports));
    confetti({ particleCount: 60, spread: 60 });
    if (showToast) {
      showToast(`Month ${monthNum} Growth Report verified for ${adopterName}! Progress updated.`);
    }
  };

  // ----------------------------------------------------
  // INITIATIVE MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const handleOpenAddInitiative = () => {
    setEditingInitiative(null);
    setInitiativeForm({
      title: '',
      subtitle: '',
      category: 'Citizen Afforestation',
      icon: '🌱',
      coverImage: '',
      summary: '',
      point1: '',
      point2: '',
      point3: '',
      targetGoal: '1,000 Trees',
      currentProgress: 0,
      status: 'Active',
      location: 'Pan-India'
    });
    setShowAddInitiativeModal(true);
  };

  const handleEditInitiative = (init) => {
    setEditingInitiative(init);
    setInitiativeForm({
      title: init.title || '',
      subtitle: init.subtitle || '',
      category: init.category || 'Citizen Afforestation',
      icon: init.icon || '🌱',
      coverImage: init.coverImage || '',
      summary: init.summary || '',
      point1: init.points?.[0] || '',
      point2: init.points?.[1] || '',
      point3: init.points?.[2] || '',
      targetGoal: init.targetGoal || '1,000 Trees',
      currentProgress: init.currentProgress || 0,
      status: init.status || 'Active',
      location: init.location || 'Pan-India'
    });
    setShowAddInitiativeModal(true);
  };

  const handleSaveInitiative = async (e) => {
    e.preventDefault();
    if (!initiativeForm.title.trim()) {
      if (showToast) showToast('Please enter an initiative title.');
      return;
    }

    setSavingInitiative(true);
    try {
      const points = [
        initiativeForm.point1,
        initiativeForm.point2,
        initiativeForm.point3
      ].filter(Boolean);

      const recordToSave = {
        id: editingInitiative ? editingInitiative.id : `init-${Date.now()}`,
        title: initiativeForm.title.trim(),
        subtitle: initiativeForm.subtitle.trim(),
        category: initiativeForm.category,
        icon: initiativeForm.icon || '🌱',
        coverImage: initiativeForm.coverImage.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        summary: initiativeForm.summary.trim(),
        points: points.length > 0 ? points : ['Dedicated to verified field conservation.', 'Community-driven accountability.'],
        targetGoal: initiativeForm.targetGoal,
        currentProgress: Number(initiativeForm.currentProgress) || 0,
        status: initiativeForm.status,
        location: initiativeForm.location.trim() || 'Pan-India',
        createdAt: editingInitiative?.createdAt || new Date().toISOString().split('T')[0]
      };

      await saveCloudInitiative(recordToSave);
      
      // Update local state
      setInitiativesList(prev => {
        const filtered = prev.filter(i => i.id !== recordToSave.id);
        return [recordToSave, ...filtered];
      });

      setShowAddInitiativeModal(false);
      confetti({ particleCount: 50, spread: 50 });
      if (showToast) showToast(`Initiative "${recordToSave.title}" saved & synced to cloud!`);
    } catch (err) {
      if (showToast) showToast('Failed to save initiative: ' + err.message);
    } finally {
      setSavingInitiative(false);
    }
  };

  const handleDeleteInitiative = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete initiative "${title}"?`)) return;
    try {
      await deleteCloudInitiative(id);
      setInitiativesList(prev => prev.filter(i => i.id !== id));
      if (showToast) showToast(`Initiative "${title}" deleted.`);
    } catch (err) {
      if (showToast) showToast('Error deleting initiative.');
    }
  };

  // ----------------------------------------------------
  // ADMIN HIERARCHY MANAGEMENT HANDLERS (SUPERADMIN ONLY)
  // ----------------------------------------------------
  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.email.trim() || !adminForm.fullName.trim()) {
      if (showToast) showToast('Please provide admin name and email.');
      return;
    }

    setSavingAdmin(true);
    try {
      const newAdminRecord = {
        id: `admin-${Date.now()}`,
        email: adminForm.email.trim().toLowerCase(),
        fullName: adminForm.fullName.trim(),
        phone: adminForm.phone.trim(),
        roleLevel: adminForm.roleLevel,
        roleTitle: adminForm.roleTitle,
        region: adminForm.region.trim(),
        status: 'active',
        appointedBy: currentUser?.email || SUPERADMIN_EMAIL,
        appointedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        passcode: adminForm.passcode || 'TARUVAR_ADMIN_2026'
      };

      await saveCloudSubAdmin(newAdminRecord);

      setAppointedAdmins(prev => {
        const filtered = prev.filter(a => a.email !== newAdminRecord.email);
        return [newAdminRecord, ...filtered];
      });

      setShowAddAdminModal(false);
      setAdminForm({
        fullName: '',
        email: '',
        phone: '',
        roleLevel: 'regional_admin',
        roleTitle: 'Regional Admin (क्षेत्रीय प्रशासक)',
        region: 'Lucknow, Uttar Pradesh',
        passcode: 'TARUVAR_ADMIN_2026'
      });

      confetti({ particleCount: 60, spread: 60 });
      if (showToast) showToast(`Admin ${newAdminRecord.fullName} appointed for ${newAdminRecord.region}!`);
    } catch (err) {
      if (showToast) showToast('Failed to appoint admin: ' + err.message);
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (email, name) => {
    if (!window.confirm(`Revoke admin privileges for ${name} (${email})?`)) return;
    try {
      await deleteCloudSubAdmin(email);
      setAppointedAdmins(prev => prev.filter(a => a.email !== email));
      if (showToast) showToast(`Admin access revoked for ${name}.`);
    } catch (err) {
      if (showToast) showToast('Failed to revoke admin.');
    }
  };

  const handleToggleAdminStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    const updated = { ...admin, status: newStatus };
    await saveCloudSubAdmin(updated);
    setAppointedAdmins(prev => prev.map(a => a.email === admin.email ? updated : a));
    if (showToast) showToast(`Admin status updated to ${newStatus}.`);
  };

  // ADMIN AUTHORIZATION GATE
  const isAdminAuthorized = localIsAdmin || isSuperadmin || isAppointedAdmin || currentUser?.user_metadata?.role === 'admin';

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
            Enter your secret founder passkey or log in with your appointed admin email.
          </p>
        </div>

        {passkeyError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passkeyError}</span>
          </div>
        )}

        {currentUser ? (
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
              <ShieldCheck className="w-4 h-4" /> Activate Admin Privileges
            </button>
          </form>
        ) : (
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
                  placeholder="admin@taruvar.org or naveenpr332@gmail.com"
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
    <div className="space-y-8 pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            {isSuperadmin ? (
              <span className="px-3 py-1 bg-amber-500 text-taruvar-dark text-xs font-black rounded-full border border-amber-300 inline-flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5" /> MASTER SUPERADMIN • Founder Authority
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-800 text-taruvar-accent text-xs font-bold rounded-full border border-emerald-600 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> REGIONAL ADMIN • Verified Desk
              </span>
            )}
            <span className="text-[11px] text-white/80 font-mono">
              {currentUser?.email || SUPERADMIN_EMAIL}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold">Taruvar Central Command & Verification</h1>
          <p className="text-xs text-white/80 max-w-xl">
            {isSuperadmin 
              ? 'Manage adoptions, approve field trees, curate foundation initiatives, and appoint regional administrators.' 
              : 'Approve submitted sapling proofs, verify Paalna growth reports, and monitor regional initiatives.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-2.5 border-r border-white/10">
            <p className="text-xl font-black text-amber-300">{pendingTrees.length}</p>
            <p className="text-[9px] text-white/80 uppercase">Pending</p>
          </div>
          <div className="text-center px-2.5 border-r border-white/10">
            <p className="text-xl font-black text-taruvar-accent">{approvedTrees.length}</p>
            <p className="text-[9px] text-white/80 uppercase">Planted</p>
          </div>
          <div className="text-center px-2.5 border-r border-white/10">
            <p className="text-xl font-black text-white">{initiativesList.length}</p>
            <p className="text-[9px] text-white/80 uppercase">Initiatives</p>
          </div>
          {isSuperadmin && (
            <div className="text-center px-2.5">
              <p className="text-xl font-black text-amber-300">{appointedAdmins.length}</p>
              <p className="text-[9px] text-white/80 uppercase">Admins</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-taruvar-border pb-4 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Tab 1: Pending Trees */}
          <button
            onClick={() => setActiveTab('pending-trees')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending-trees'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-200" />
            <span>Pending Adoptions ({pendingTrees.length})</span>
          </button>

          {/* Tab 2: Planted Directory */}
          <button
            onClick={() => setActiveTab('planted-directory')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'planted-directory'
                ? 'bg-taruvar-secondary text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-taruvar-accent" />
            <span>Planted Directory ({approvedTrees.length})</span>
          </button>

          {/* Tab 3: Pending Reports */}
          <button
            onClick={() => setActiveTab('pending-reports')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending-reports'
                ? 'bg-taruvar-secondary text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <Camera className="w-4 h-4 text-taruvar-accent" />
            <span>Growth Reports ({pendingReports.length})</span>
          </button>

          {/* Tab 4: Initiatives Management */}
          <button
            onClick={() => setActiveTab('initiatives')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'initiatives'
                ? 'bg-emerald-700 text-white shadow'
                : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-emerald-200" />
            <span>Manage Initiatives ({initiativesList.length})</span>
          </button>

          {/* Tab 5: Admin Hierarchy (Superadmin exclusive) */}
          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('admin-hierarchy')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'admin-hierarchy'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-white text-taruvar-dark border border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Admin Team Hierarchy ({appointedAdmins.length})</span>
            </button>
          )}

        </div>

        {/* Live Refresh Button */}
        <button
          onClick={loadAllData}
          disabled={isRefreshing}
          className="px-3.5 py-2.5 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary text-xs font-bold rounded-2xl border border-taruvar-border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          title="Refresh Data from Cloud"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PENDING TREES */}
      {/* ========================================================= */}
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
                    ⏳ Pending Approval
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
                    <p className="text-xs text-taruvar-dark font-semibold">Adopter: {item.adopter_name} ({item.adopter_email})</p>
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

      {/* ========================================================= */}
      {/* TAB 2: PLANTED TREES DIRECTORY */}
      {/* ========================================================= */}
      {activeTab === 'planted-directory' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <label className="block text-xs font-bold text-taruvar-muted uppercase tracking-wider mb-1.5">
                Search Planted Trees Database
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Adopter, Tree ID, Species, or Location..."
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

          {approvedTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-3">
              <span className="text-4xl">🌳</span>
              <h3 className="text-xl font-bold text-taruvar-dark">No Approved Planted Trees Yet</h3>
              <p className="text-xs text-taruvar-muted max-w-sm mx-auto">
                When you approve submitted tree adoptions, they will appear here in the Taruvar Planted Registry.
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

      {/* ========================================================= */}
      {/* TAB 3: PENDING GROWTH REPORTS */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* TAB 4: INITIATIVES & PROJECTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'initiatives' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-taruvar-dark">Taruvar Live Initiatives & Projects</h3>
              <p className="text-xs text-taruvar-muted">
                Create new campaigns, update goals and field metrics, or adjust public program details.
              </p>
            </div>

            <button
              onClick={handleOpenAddInitiative}
              className="px-5 py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Initiative</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiativesList.map((init) => (
              <div 
                key={init.id} 
                className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden flex flex-col justify-between p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-taruvar-light flex items-center justify-center text-xl">
                      {init.icon || '🌱'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-full border border-emerald-300">
                      {init.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-taruvar-dark">{init.title}</h4>
                    <p className="text-[11px] text-taruvar-secondary font-bold">{init.subtitle}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">📍 {init.location || 'Pan-India'} • {init.category}</p>
                  </div>

                  <p className="text-xs text-taruvar-muted leading-relaxed line-clamp-3">
                    {init.summary}
                  </p>

                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-[11px] text-taruvar-dark">
                      <span>Target: {init.targetGoal}</span>
                      <span className="text-taruvar-secondary">{init.currentProgress || 0} achieved</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-taruvar-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditInitiative(init)}
                    className="p-2 bg-gray-100 hover:bg-taruvar-light text-taruvar-secondary rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Edit Initiative"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteInitiative(init.id, init.title)}
                    className="p-2 bg-gray-100 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Delete Initiative"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ADMIN HIERARCHY & APPOINT TEAM (SUPERADMIN ONLY) */}
      {/* ========================================================= */}
      {activeTab === 'admin-hierarchy' && isSuperadmin && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-extrabold text-taruvar-dark">Appoint & Manage Regional Admins</h3>
              </div>
              <p className="text-xs text-taruvar-muted mt-1">
                As Superadmin, you can appoint regional coordinators, district tree inspectors, and project leads across India.
              </p>
            </div>

            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Appoint New Admin</span>
            </button>
          </div>

          {/* Current Master Superadmin Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-taruvar-dark text-base">Taruvar Founder (Head Superadmin)</h4>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-950 text-[10px] font-black rounded-full">MASTER</span>
                </div>
                <p className="text-xs text-taruvar-muted">Email: <strong>{SUPERADMIN_EMAIL}</strong> • National Jurisdiction</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              Active Head Administrator
            </span>
          </div>

          {/* Appointed Sub-Admins Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-muted">
              Appointed Regional Administrators ({appointedAdmins.length})
            </h4>

            {appointedAdmins.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-taruvar-border text-center space-y-2">
                <Users className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-taruvar-muted font-bold">No Regional Admins Appointed Yet</p>
                <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                  Click "+ Appoint New Admin" above to designate coordinators for Lucknow, Delhi, Bihar, or your local field campuses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointedAdmins.map((adm) => (
                  <div 
                    key={adm.id || adm.email}
                    className="bg-white p-5 rounded-3xl border border-taruvar-border shadow-card space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-taruvar-secondary bg-taruvar-light px-2.5 py-0.5 rounded-lg">
                          {adm.roleTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          adm.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {adm.status.toUpperCase()}
                        </span>
                      </div>

                      <h5 className="font-extrabold text-taruvar-dark text-base">{adm.fullName}</h5>
                      <p className="text-xs text-taruvar-dark font-medium">✉️ {adm.email}</p>
                      {adm.phone && <p className="text-[11px] text-gray-500">📞 {adm.phone}</p>}
                      <p className="text-[11px] text-taruvar-muted">📍 Jurisdiction: <strong>{adm.region}</strong></p>
                      <p className="text-[10px] text-gray-400">Appointed: {adm.appointedDate}</p>
                    </div>

                    <div className="pt-3 border-t border-taruvar-border flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleAdminStatus(adm)}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        {adm.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDeleteAdmin(adm.email, adm.fullName)}
                        className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT INITIATIVE */}
      {/* ========================================================= */}
      {showAddInitiativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-taruvar-border my-8">
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <h3 className="text-lg font-black text-taruvar-dark">
                {editingInitiative ? 'Edit Initiative' : 'Create New Movement Initiative'}
              </h3>
              <button 
                onClick={() => setShowAddInitiativeModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInitiative} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Initiative Title *</label>
                  <input
                    type="text"
                    required
                    value={initiativeForm.title}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, title: e.target.value })}
                    placeholder="e.g. RIVERBANK GREEN CORRIDOR"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Hindi Subtitle</label>
                  <input
                    type="text"
                    value={initiativeForm.subtitle}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, subtitle: e.target.value })}
                    placeholder="e.g. नदी तट वनीकरण अभियान"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Category</label>
                  <select
                    value={initiativeForm.category}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border bg-white"
                  >
                    <option value="Citizen Afforestation">Citizen Afforestation</option>
                    <option value="Women Leadership">Women Leadership</option>
                    <option value="Campus & Youth">Campus & Youth</option>
                    <option value="Water & River Care">Water & River Care</option>
                    <option value="Waste & Cleanliness">Waste & Cleanliness</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Target Goal</label>
                  <input
                    type="text"
                    value={initiativeForm.targetGoal}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, targetGoal: e.target.value })}
                    placeholder="e.g. 5,000 Trees"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Current Progress</label>
                  <input
                    type="number"
                    value={initiativeForm.currentProgress}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, currentProgress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Location / Jurisdiction</label>
                  <input
                    type="text"
                    value={initiativeForm.location}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, location: e.target.value })}
                    placeholder="e.g. Lucknow, UP or Pan-India"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-taruvar-dark uppercase mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={initiativeForm.icon}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, icon: e.target.value })}
                    placeholder="🌱, 🌊, 🏔️, 👩, 🎓"
                    className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={initiativeForm.coverImage}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                />
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Summary Description *</label>
                <textarea
                  required
                  rows={3}
                  value={initiativeForm.summary}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, summary: e.target.value })}
                  placeholder="Brief overview of the mission and why it matters..."
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-taruvar-dark uppercase">Key Action Points / Pillars</label>
                <input
                  type="text"
                  value={initiativeForm.point1}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, point1: e.target.value })}
                  placeholder="Pillar 1 (e.g. 95%+ Survival rate guarantee)"
                  className="w-full px-3 py-1.5 rounded-lg border border-taruvar-border text-xs"
                />
                <input
                  type="text"
                  value={initiativeForm.point2}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, point2: e.target.value })}
                  placeholder="Pillar 2 (e.g. Photo log verification every 15 days)"
                  className="w-full px-3 py-1.5 rounded-lg border border-taruvar-border text-xs"
                />
                <input
                  type="text"
                  value={initiativeForm.point3}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, point3: e.target.value })}
                  placeholder="Pillar 3 (e.g. Community certificate & leaderboard)"
                  className="w-full px-3 py-1.5 rounded-lg border border-taruvar-border text-xs"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingInitiative}
                  className="flex-1 py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-xl shadow transition-all cursor-pointer text-xs"
                >
                  {savingInitiative ? 'Saving to Cloud...' : (editingInitiative ? 'Save Changes' : 'Publish Initiative')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInitiativeModal(false)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: APPOINT NEW REGIONAL ADMIN (SUPERADMIN ONLY) */}
      {/* ========================================================= */}
      {showAddAdminModal && isSuperadmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between border-b border-taruvar-border pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-taruvar-dark">Appoint New Administrator</h3>
              </div>
              <button 
                onClick={() => setShowAddAdminModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Admin Email *</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="e.g. rahul.lucknow@taruvar.org"
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                />
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Role Designation Level</label>
                <select
                  value={adminForm.roleLevel}
                  onChange={(e) => {
                    const level = e.target.value;
                    let title = 'Regional Admin (क्षेत्रीय प्रशासक)';
                    if (level === 'field_inspector') title = 'Field Tree Verifier (वृक्ष सत्यापन अधिकारी)';
                    if (level === 'project_coordinator') title = 'Project & Drive Lead (अभियान समन्वयक)';
                    setAdminForm({ ...adminForm, roleLevel: level, roleTitle: title });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border bg-white"
                >
                  <option value="regional_admin">Regional Coordinator (क्षेत्रीय प्रशासक)</option>
                  <option value="field_inspector">Field Inspector / Tree Verifier (निरीक्षक)</option>
                  <option value="project_coordinator">Project Lead (परियोजना समन्वयक)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-taruvar-dark uppercase mb-1">Assigned City / Jurisdiction *</label>
                <input
                  type="text"
                  required
                  value={adminForm.region}
                  onChange={(e) => setAdminForm({ ...adminForm, region: e.target.value })}
                  placeholder="e.g. Lucknow, UP or Delhi-NCR"
                  className="w-full px-3 py-2 rounded-xl border border-taruvar-border"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingAdmin}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition-all cursor-pointer text-xs"
                >
                  {savingAdmin ? 'Appointing Admin...' : 'Confirm & Appoint Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHOTO VIEWER MODAL */}
      {/* ========================================================= */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-3xl w-full p-4 relative text-center">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-white/20 px-3 py-1 rounded-full cursor-pointer"
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
