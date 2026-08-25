import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PledgeModal from './components/PledgeModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TreeJourneyPage from './pages/TreeJourneyPage';
import InitiativesPage from './pages/InitiativesPage';
import GetInvolvedPage from './pages/GetInvolvedPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const handlePledgeComplete = (msg) => {
    showToast(msg);
  };

  return (
    <div className="min-h-screen flex flex-col bg-taruvar-bg text-taruvar-dark selection:bg-taruvar-primary selection:text-white">
      {/* Sticky Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenPledge={() => setIsPledgeOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage 
            setActivePage={setActivePage} 
            onOpenPledge={() => setIsPledgeOpen(true)}
            showToast={showToast} 
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
          />
        )}

        {activePage === 'get-involved' && (
          <GetInvolvedPage 
            showToast={showToast} 
          />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setActivePage={setActivePage} 
        onOpenPledge={() => setIsPledgeOpen(true)} 
      />

      {/* Interactive Pledge Modal */}
      <PledgeModal 
        isOpen={isPledgeOpen} 
        onClose={() => setIsPledgeOpen(false)} 
        onPledgeComplete={handlePledgeComplete} 
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
