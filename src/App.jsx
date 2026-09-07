import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TreeJourneyPage from './pages/TreeJourneyPage';
import InitiativesPage from './pages/InitiativesPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdoptTreePage from './pages/AdoptTreePage';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [getInvolvedTab, setGetInvolvedTab] = useState('volunteer');
  const [toastMessage, setToastMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Check Supabase Auth state on mount & set up listener
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handleAuthSuccess = (user, msg) => {
    setCurrentUser(user);
    showToast(msg);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    showToast('Signed out successfully.');
    setActivePage('home');
  };

  const navigateToGetInvolved = (tabId = 'volunteer') => {
    setGetInvolvedTab(tabId);
    setActivePage('get-involved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdopt = () => {
    setActivePage('adopt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAuth = () => {
    setActivePage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-taruvar-bg text-taruvar-dark selection:bg-taruvar-primary selection:text-white pb-16 sm:pb-14">
      {/* Top Header Navigation (Clean, No Toggle Menu) */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenPledge={navigateToAdopt}
        currentUser={currentUser}
        onOpenAuth={navigateToAuth}
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
            onOpenAuth={navigateToAuth}
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
            onOpenAuth={navigateToAuth}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            setActivePage={setActivePage}
            showToast={showToast}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage 
            currentUser={currentUser}
            onOpenAuth={navigateToAuth}
            onOpenAdopt={navigateToAdopt}
            showToast={showToast}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardPage 
            currentUser={currentUser}
            showToast={showToast}
            onOpenAuth={navigateToAuth}
          />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setActivePage={setActivePage} 
        onOpenPledge={navigateToAdopt} 
        onNavigateGetInvolved={navigateToGetInvolved}
      />

      {/* Modern Sticky Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenPledge={navigateToAdopt}
        currentUser={currentUser}
        onOpenAuth={navigateToAuth}
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
