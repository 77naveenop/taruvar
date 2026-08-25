import React, { useState } from 'react';
import { ShieldCheck, Check, X, Eye, Camera, Clock, Award, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDashboardPage({ showToast }) {
  const [activeTab, setActiveTab] = useState('pending-trees'); // 'pending-trees' | 'pending-reports' | 'all-verified'

  // Pending tree adoptions awaiting admin confirmation
  const [pendingTrees, setPendingTrees] = useState([
    {
      id: 'tree-301',
      adopter_name: 'Vikas Gupta',
      adopter_email: 'vikas@example.com',
      tree_name: 'Green Neem Shelter',
      species: 'Neem Tree',
      location: 'Sector 15 Botanical Garden',
      plantation_photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      date: 'Aug 25, 2026'
    },
    {
      id: 'tree-302',
      adopter_name: 'Pooja Nair',
      adopter_email: 'pooja@example.com',
      tree_name: 'Banyan Legacy',
      species: 'Banyan Tree',
      location: 'Community Green Circle',
      plantation_photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
      date: 'Aug 24, 2026'
    }
  ]);

  // Pending monthly growth reports awaiting admin verification
  const [pendingReports, setPendingReports] = useState([
    {
      id: 'rep-401',
      tree_name: 'My Peepal Guardian',
      adopter_name: 'Priya Sharma',
      month: 3,
      growth_photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
      notes: 'Month 3 checkup: Height increased by 12cm, soil fertilized with vermicompost.',
      date: 'Aug 25, 2026'
    }
  ]);

  const [approvedCount, setApprovedCount] = useState(14);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  const handleApproveTree = (treeId, adopterName) => {
    setPendingTrees(prev => prev.filter(t => t.id !== treeId));
    setApprovedCount(prev => prev + 1);
    confetti({ particleCount: 50, spread: 50 });
    if (showToast) {
      showToast(`Adoption approved for ${adopterName}! Notification email sent.`);
    }
  };

  const handleRejectTree = (treeId) => {
    setPendingTrees(prev => prev.filter(t => t.id !== treeId));
    if (showToast) {
      showToast(`Adoption submission rejected.`);
    }
  };

  const handleVerifyReport = (reportId, monthNum, adopterName) => {
    setPendingReports(prev => prev.filter(r => r.id !== reportId));
    confetti({ particleCount: 60, spread: 60 });
    if (showToast) {
      showToast(`Month ${monthNum} Growth Report verified for ${adopterName}! Progress updated.`);
    }
  };

  return (
    <div className="space-y-10 pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 bg-white/10 backdrop-blur text-taruvar-accent text-xs font-bold rounded-full border border-white/10">
            INTERNAL TEAM DASHBOARD • taruvar.org
          </span>
          <h1 className="text-3xl font-extrabold">Taruvar Admin Verification Desk</h1>
          <p className="text-xs text-white/80 max-w-xl">
            Review submitted plantation action photos, approve tree adoptions, and verify 5-month growth progress reports.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
          <div className="text-center px-3 border-r border-white/10">
            <p className="text-2xl font-black text-taruvar-accent">{pendingTrees.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Pending Adoptions</p>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-black text-white">{pendingReports.length}</p>
            <p className="text-[10px] text-white/80 uppercase">Pending Reports</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-taruvar-border pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending-trees')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending-trees'
              ? 'bg-taruvar-secondary text-white shadow'
              : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
          }`}
        >
          <Clock className="w-4 h-4 text-taruvar-accent" />
          <span>Pending Adoptions ({pendingTrees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending-reports')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending-reports'
              ? 'bg-taruvar-secondary text-white shadow'
              : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
          }`}
        >
          <Camera className="w-4 h-4 text-taruvar-accent" />
          <span>Pending Monthly Reports ({pendingReports.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING TREES */}
      {activeTab === 'pending-trees' && (
        <div className="space-y-6">
          {pendingTrees.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-taruvar-border text-center space-y-3">
              <Check className="w-12 h-12 text-taruvar-primary mx-auto" />
              <h3 className="text-xl font-bold text-taruvar-dark">All Tree Adoptions Reviewed!</h3>
              <p className="text-xs text-taruvar-muted">No pending tree adoption submissions right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTrees.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card space-y-4">
                  
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-taruvar-border relative group">
                    <img src={item.plantation_photo} alt={item.tree_name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedPhotoModal(item.plantation_photo)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Plantation Photo Proof
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-taruvar-secondary">{item.species}</span>
                    <h3 className="text-xl font-extrabold text-taruvar-dark">{item.tree_name}</h3>
                    <p className="text-xs text-taruvar-dark font-semibold">Adopter: {item.adopter_name} ({item.adopter_email})</p>
                    <p className="text-[11px] text-taruvar-muted">Location: {item.location} • Submitted: {item.date}</p>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-taruvar-border">
                    <button
                      onClick={() => handleApproveTree(item.id, item.adopter_name)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" /> Approve Adoption
                    </button>
                    <button
                      onClick={() => handleRejectTree(item.id)}
                      className="py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
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

      {/* TAB 2: PENDING MONTHLY REPORTS */}
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
                    className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
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
