import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';
import { saveCloudPendingAdoption } from './lib/cloudDb';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TreeJourneyPage from './pages/TreeJourneyPage';
import InitiativesPage from './pages/InitiativesPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdoptTreePage from './pages/AdoptTreePage';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [getInvolvedTab, setGetInvolvedTab] = useState('volunteer');
  const [toastMessage, setToastMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authRedirectTarget, setAuthRedirectTarget] = useState(null);

  // Check session on mount & sync any local pending adoptions to cloud
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taruvar_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase() === 'naveenpr332@gmail.com') {
          parsed.user_metadata = { ...(parsed.user_metadata || {}), role: 'admin' };
        }
        setCurrentUser(parsed);
      }

      // Auto-sync any existing local pending adoptions to cloud
      const localAdoptions = JSON.parse(localStorage.getItem('taruvar_adoptions') || '[]');
      const localPending = JSON.parse(localStorage.getItem('taruvar_pending_adoptions') || '[]');
      const allPending = [
        ...localPending,
        ...localAdoptions.filter(a => a.status === 'pending')
      ];

      allPending.forEach(item => {
        saveCloudPendingAdoption(item).catch(() => {});
      });
    } catch (e) {
      console.error(e);
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Auto recognize admin email
        if (session.user.email?.toLowerCase() === 'naveenpr332@gmail.com') {
          session.user.user_metadata = { ...session.user.user_metadata, role: 'admin' };
        }
        setCurrentUser(session.user);
        localStorage.setItem('taruvar_session_user', JSON.stringify(session.user));
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      if (u) {
        if (u.email?.toLowerCase() === 'naveenpr332@gmail.com') {
          u.user_metadata = { ...u.user_metadata, role: 'admin' };
        }
        setCurrentUser(u);
        localStorage.setItem('taruvar_session_user', JSON.stringify(u));
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleAuthSuccess = (user, msg) => {
    if (user && user.email?.toLowerCase() === 'naveenpr332@gmail.com') {
      user.user_metadata = { ...(user.user_metadata || {}), role: 'admin' };
    }
    if (user) {
      localStorage.setItem('taruvar_session_user', JSON.stringify(user));
    }
    setCurrentUser(user);
    showToast(msg);
  };

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('taruvar_session_user');
    setCurrentUser(null);
    setAuthRedirectTarget(null);
    showToast('Signed out successfully.');
    setActivePage('home');
  };

  const navigateToGetInvolved = (tabId = 'volunteer') => {
    setGetInvolvedTab(tabId);
    setActivePage('get-involved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdopt = () => {
    if (!currentUser) {
      setAuthRedirectTarget('adopt');
      setActivePage('auth');
      showToast('Please sign in or register to adopt a tree / पौधा अपनाने के लिए कृपया लॉग इन करें');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActivePage('adopt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToAuth = (target = null) => {
    setAuthRedirectTarget(target);
    setActivePage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-taruvar-bg text-taruvar-dark selection:bg-taruvar-primary selection:text-white pb-20 md:pb-0">
      {/* Top Header Navigation (Clean, No Toggle Menu) */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenPledge={navigateToAdopt}
        currentUser={currentUser}
        onOpenAuth={() => navigateToAuth(null)}
        onLogout={handleLogout}
        onNavigateGetInvolved={navigateToGetInvolved}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage 
            setActivePage={setActivePage} 
            onOpenPledge={navigateToAdopt}
            showToast={showToast} 
            onNavigateGetInvolved={navigateToGetInvolved}
            onOpenAuth={() => navigateToAuth(null)}
            currentUser={currentUser}
          />
        )}

        {activePage === 'about' && (
          <AboutPage 
            setActivePage={setActivePage} 
            onOpenPledge={navigateToAdopt} 
          />
        )}

        {activePage === 'tree-journey' && (
          <TreeJourneyPage 
            showToast={showToast} 
            onOpenPledge={navigateToAdopt} 
          />
        )}

        {activePage === 'initiatives' && (
          <InitiativesPage 
            setActivePage={setActivePage} 
            onOpenPledge={navigateToAdopt}
            onNavigateGetInvolved={navigateToGetInvolved}
          />
        )}

        {activePage === 'get-involved' && (
          <GetInvolvedPage 
            showToast={showToast}
            initialTab={getInvolvedTab}
          />
        )}

        {activePage === 'adopt' && (
          <AdoptTreePage 
            currentUser={currentUser}
            showToast={showToast}
            setActivePage={setActivePage}
            onOpenAuth={() => navigateToAuth('adopt')}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            setActivePage={setActivePage}
            showToast={showToast}
            redirectTarget={authRedirectTarget}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage 
            currentUser={currentUser}
            onOpenAuth={() => navigateToAuth(null)}
            onOpenAdopt={navigateToAdopt}
            onLogout={handleLogout}
            setActivePage={setActivePage}
            showToast={showToast}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardPage 
            currentUser={currentUser}
            showToast={showToast}
            onOpenAuth={() => navigateToAuth('admin')}
          />
        )}

        {activePage === 'explore' && (
          <ExplorePage 
            currentUser={currentUser}
            showToast={showToast}
            onOpenPledge={navigateToAdopt}
            onOpenAuth={() => navigateToAuth('explore')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setActivePage={setActivePage} 
        onOpenPledge={navigateToAdopt} 
        onNavigateGetInvolved={navigateToGetInvolved}
      />

      {/* Modern Sticky Bottom Navigation Bar (Mobile only) */}
      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenPledge={navigateToAdopt}
        currentUser={currentUser}
        onOpenAuth={() => navigateToAuth(null)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
}
