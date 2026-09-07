import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import PledgeModal from './components/PledgeModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { supabase } from './lib/supabase';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TreeJourneyPage from './pages/TreeJourneyPage';
import InitiativesPage from './pages/InitiativesPage';
import GetInvolvedPage from './pages/GetInvolvedPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [getInvolvedTab, setGetInvolvedTab] = useState('volunteer');
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  const handlePledgeComplete = (msg) => {
    showToast(msg);
  };

  const navigateToGetInvolved = (tabId = 'volunteer') => {
    setGetInvolvedTab(tabId);
    setActivePage('get-involved');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-taruvar-bg text-taruvar-dark selection:bg-taruvar-primary selection:text-white pb-16 sm:pb-14">
      {/* Top Header Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenPledge={() => setIsPledgeOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigateGetInvolved={navigateToGetInvolved}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage 
            setActivePage={setActivePage} 
            onOpenPledge={() => setIsPledgeOpen(true)}
            showToast={showToast} 
            onNavigateGetInvolved={navigateToGetInvolved}
            onOpenAuth={() => setIsAuthOpen(true)}
            currentUser={currentUser}
          />
        )}

        {activePage === 'about' && (
          <AboutPage 
            setActivePage={setActivePage} 
            onOpenPledge={() => setIsPledgeOpen(true)} 
          />
        )}

        {activePage === 'tree-journey' && (
          <TreeJourneyPage 
            showToast={showToast} 
            onOpenPledge={() => setIsPledgeOpen(true)} 
          />
        )}

        {activePage === 'initiatives' && (
          <InitiativesPage 
            setActivePage={setActivePage} 
            onOpenPledge={() => setIsPledgeOpen(true)}
            onNavigateGetInvolved={navigateToGetInvolved}
          />
        )}

        {activePage === 'get-involved' && (
          <GetInvolvedPage 
            showToast={showToast}
            initialTab={getInvolvedTab}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage 
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdopt={() => setIsPledgeOpen(true)}
            showToast={showToast}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardPage 
            currentUser={currentUser}
            showToast={showToast}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setActivePage={setActivePage} 
        onOpenPledge={() => setIsPledgeOpen(true)} 
        onNavigateGetInvolved={navigateToGetInvolved}
      />

      {/* Ergonomic Sticky Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenPledge={() => setIsPledgeOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Interactive Tree Adoption Modal */}
      <PledgeModal 
        isOpen={isPledgeOpen} 
        onClose={() => setIsPledgeOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsPledgeOpen(false);
          setIsAuthOpen(true);
        }}
        onPledgeComplete={handlePledgeComplete} 
      />

      {/* Interactive Auth Modal (Register / Login) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
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
