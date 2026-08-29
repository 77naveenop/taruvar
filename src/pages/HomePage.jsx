import React from 'react';
import { 
  Sprout, Droplets, Camera, TreePine, Heart, ArrowRight, Sparkles, 
  Users, Award, BookOpen, ShieldCheck, CheckCircle2, ChevronRight,
  Globe, Compass, Check, UserPlus, Play
} from 'lucide-react';
import TreeJourneySandbox from '../components/TreeJourneySandbox';

export default function HomePage({ setActivePage, onOpenPledge, showToast, onNavigateGetInvolved, onOpenAuth, currentUser }) {

  // Core 4 Initiatives
  const initiativesData = [
    {
      id: 'one-tree',
      icon: '🌱',
      title: 'ONE PERSON. ONE TREE.',
      subtitle: 'एक व्यक्ति, एक पेड़',
      desc: 'Take personal responsibility for at least one tree from plantation to full growth.',
      badge: 'Core Movement'
    },
    {
      id: 'green-shakti',
      icon: '👩',
      title: 'TARUVAR GREEN SHAKTI',
      subtitle: 'महिला नेतृत्व',
      desc: 'Empowering women leadership in neighborhood greening and sapling care circles.',
      badge: 'Community Power'
    },
    {
      id: 'youth-network',
      icon: '🎓',
      title: 'YOUTH & CAMPUS NETWORK',
      subtitle: 'युवा शक्ति',
      desc: 'Students lead local drives, gain verified environmental experience, and build leadership skills.',
      badge: 'Campus Drive'
    },
    {
      id: 'tree-journey-digital',
      icon: '📱',
      title: 'TREE JOURNEY TRACKER',
      subtitle: 'डिजिटल ट्रैकर',
      desc: 'Document growth milestones with photos and track tree survival over months and years.',
      badge: 'Tech Enabled'
    }
  ];

  const handleJoinClick = () => {
    if (currentUser) {
      setActivePage('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onOpenAuth) {
      onOpenAuth();
    } else if (onNavigateGetInvolved) {
      onNavigateGetInvolved('volunteer');
    }
  };

  return (
    <div className="space-y-20 md:space-y-28 pb-16">
      
      {/* SECTION 1 — HERO WITH CINEMATIC GROWING TREE TIME-LAPSE VIDEO BACKGROUND */}
      <section className="relative min-h-[620px] sm:min-h-[700px] flex items-center justify-center text-white overflow-hidden bg-black">
        
        {/* Background Video: Sprouting & Growing Tree Time-lapse */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 opacity-65"
        >
          {/* High quality royalty-free nature & plant growth time-lapse videos */}
          <source 
            src="https://cdn.pixabay.com/video/2020/04/18/36423-412217622_large.mp4" 
            type="video/mp4" 
          />
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-young-plant-growing-in-the-soil-time-lapse-42984-large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Rich Multi-layer Gradient Overlay for Optimal Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-taruvar-dark via-taruvar-dark/75 to-black/60 backdrop-blur-[0.5px]"></div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 py-16 sm:py-24">
          
          {/* Movement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md text-taruvar-accent text-xs font-bold rounded-full border border-white/20 shadow-xl animate-fade-in">
            <Sparkles className="w-4 h-4 text-taruvar-accent" />
            <span>ONE PERSON. ONE TREE. • एक व्यक्ति, एक पेड़</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Don't Just Plant a Tree. <br />
            <span className="text-taruvar-accent">Nurture It For Life.</span>
          </h1>

          {/* Bilingual Friendly Subtitle */}
          <p className="text-base sm:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto font-normal">
            Planting is only day one. Join a movement focused on continuous tree care (<strong>Paalna / देखभाल</strong>), photo growth tracking, and genuine survival.
          </p>

          {/* Primary & Secondary Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            
            {/* 1. Main Button: Grow / Adopt Your Tree */}
            <button
              onClick={onOpenPledge}
              className="w-full sm:w-auto px-8 py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Sprout className="w-5 h-5 text-taruvar-dark" />
              <span>Grow / Adopt Your Tree</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 2. Join as a User / Register Button (100% Functional) */}
            <button
              onClick={handleJoinClick}
              className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold text-base rounded-2xl border border-white/40 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-taruvar-accent" />
              <span>{currentUser ? 'My Tree Journey / प्रोफाइल' : 'Join as a User / रजिस्टर करें'}</span>
            </button>

          </div>

          {/* Clean 3-Pillar Summary Bar */}
          <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-taruvar-accent animate-pulse"></span>
              <span>1. Plant (पौधारोपण)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-taruvar-primary animate-pulse"></span>
              <span>2. Care & Paalna (देखभाल)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>3. Document & Grow (सत्यापन)</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2 — THE 5-STEP CARE PHILOSOPHY (PAALNA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            The Taruvar Framework
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            The 5-Step Journey of Every Tree
          </h2>
          <p className="text-taruvar-muted text-sm">
            Moving beyond one-day photo ops to real, long-term nurturing.
          </p>
        </div>

        {/* 5 Clean Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '🌱',
              name: '1. Plant',
              hindi: 'पौधा लगाना',
              desc: 'Select a climate-suitable indigenous sapling.'
            },
            {
              step: '💧',
              name: '2. Care',
              hindi: 'देखभाल (Paalna)',
              desc: 'Provide water, organic nutrients, and protection.'
            },
            {
              step: '📸',
              name: '3. Document',
              hindi: 'तस्वीर व लॉग',
              desc: 'Upload monthly photo updates to verify progress.'
            },
            {
              step: '🌿',
              name: '4. Grow',
              hindi: 'निरंतर विकास',
              desc: 'Track height, health, and 5-month milestones.'
            },
            {
              step: '🤝',
              name: '5. Inspire',
              hindi: 'दूसरों को प्रेरित करें',
              desc: 'Inspire family, friends, and campus chapters.'
            }
          ].map((s) => (
            <div 
              key={s.name}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:shadow-lg hover:-translate-y-1 transition-all space-y-3 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-taruvar-bg border border-taruvar-border flex items-center justify-center text-3xl shadow-sm">
                {s.step}
              </div>
              <h3 className="text-lg font-bold text-taruvar-dark">{s.name}</h3>
              <p className="text-xs font-semibold text-taruvar-secondary">{s.hindi}</p>
              <p className="text-xs text-taruvar-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — ONE PERSON. ONE TREE. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-taruvar-bg via-white to-taruvar-light p-8 md:p-12 rounded-3xl border border-taruvar-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-secondary text-white text-xs font-bold rounded-full">
              Core Philosophy • एक व्यक्ति, एक पेड़
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-taruvar-dark tracking-tight">
              One Person. One Tree.
            </h2>

            <p className="text-base sm:text-lg text-taruvar-dark leading-relaxed font-normal">
              You do not need to plant hundreds of saplings. Take responsibility for <strong>just one tree</strong> and nurture it into a strong, shade-giving canopy.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-2xl border border-taruvar-border text-xs text-taruvar-dark font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-taruvar-secondary" /> Personal Tree Guardian
              </div>
              <div className="p-3 bg-white rounded-2xl border border-taruvar-border text-xs text-taruvar-dark font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-taruvar-secondary" /> 5-Month Growth Badge
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenPledge}
                className="px-8 py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <span>Grow / Adopt Your Tree</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card text-center space-y-4">
              <div className="p-5 bg-taruvar-light rounded-2xl space-y-2">
                <span className="text-4xl">🌳</span>
                <h4 className="font-extrabold text-taruvar-dark text-lg">The Power of One</h4>
                <p className="text-xs text-taruvar-muted leading-relaxed">
                  If 1,000 citizens adopt and protect 1 tree each, 1,000 trees grow to maturity with a 95%+ survival rate.
                </p>
              </div>
              <p className="text-xs font-bold text-taruvar-secondary">
                taruvar.org • Tree Care Movement
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 — TREE JOURNEY DIGITAL DEMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Interactive Growth Tracker
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            How Tree Journey Works
          </h2>
          <p className="text-taruvar-muted text-sm">
            Experience how adopters submit monthly progress photos, receive admin verification, and earn badges.
          </p>
        </div>

        {/* Tree Journey Sandbox Simulation */}
        <TreeJourneySandbox />
      </section>

      {/* SECTION 5 — CORE INITIATIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Programs & Action
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            Our Core Initiatives
          </h2>
          <p className="text-taruvar-muted text-sm">
            Four targeted programs driving environmental leadership and citizen action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initiativesData.map((init) => (
            <div 
              key={init.id}
              className="bg-white p-7 rounded-3xl border border-taruvar-border shadow-card hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-taruvar-light flex items-center justify-center text-2xl">
                    {init.icon}
                  </span>
                  <span className="px-3 py-1 bg-taruvar-bg text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-border">
                    {init.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-taruvar-dark">{init.title}</h3>
                  <span className="text-xs font-bold text-taruvar-secondary">{init.subtitle}</span>
                </div>

                <p className="text-xs text-taruvar-muted leading-relaxed">
                  {init.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  setActivePage('initiatives');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="pt-3 border-t border-taruvar-border flex items-center justify-between text-taruvar-secondary hover:text-taruvar-hover font-bold text-xs group"
              >
                <span>Explore Initiative</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — GET INVOLVED (DIRECT PATHWAYS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Join Taruvar • जुड़ें
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            Choose Your Pathway
          </h2>
          <p className="text-taruvar-muted text-sm">
            Select how you would like to participate and submit your details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'PLANT & ADOPT',
              subtitle: 'पौधा अपनाएं',
              desc: 'Adopt a sapling, upload photo proof, and start your 5-month care log.',
              cta: 'Adopt a Tree',
              action: onOpenPledge,
              icon: '🌱'
            },
            {
              title: 'VOLUNTEER',
              subtitle: 'स्वयंसेवक बनें',
              desc: 'Join local weekend watering and plantation drives in your city.',
              cta: 'Apply as Volunteer',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('volunteer') : setActivePage('get-involved'),
              icon: '🤝'
            },
            {
              title: 'STUDENT NETWORK',
              subtitle: 'विद्यार्थी पोर्टल',
              desc: 'Lead campus drives, earn verified work hours, and build leadership skills.',
              cta: 'Student Portal',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('student') : setActivePage('get-involved'),
              icon: '🎓'
            },
            {
              title: 'COMMUNITY LEADER',
              subtitle: 'सामुदायिक नेतृत्व',
              desc: 'Organize greening initiatives for your neighborhood, society, or village.',
              cta: 'Become a Leader',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('leader') : setActivePage('get-involved'),
              icon: '📢'
            }
          ].map((card) => (
            <div 
              key={card.title}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:border-taruvar-secondary transition-all space-y-4 flex flex-col justify-between text-left"
            >
              <div className="space-y-2">
                <span className="text-3xl block">{card.icon}</span>
                <h3 className="text-base font-extrabold text-taruvar-dark tracking-tight">{card.title}</h3>
                <p className="text-[11px] font-bold text-taruvar-secondary">{card.subtitle}</p>
                <p className="text-xs text-taruvar-muted leading-relaxed">{card.desc}</p>
              </div>

              <button
                onClick={card.action}
                className="w-full py-3 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>{card.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-taruvar-secondary via-[#1F5435] to-taruvar-dark text-white p-8 md:p-14 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs font-bold text-taruvar-accent border border-white/10 inline-block">
              One Person. One Tree. • taruvar.org
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Start With One Tree Today.
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Take responsibility for one sapling. Document its growth. Make an impact that lasts for generations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenPledge}
              className="w-full sm:w-auto px-8 py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sprout className="w-5 h-5" />
              <span>Grow / Adopt Your Tree</span>
            </button>

            <button
              onClick={() => onNavigateGetInvolved ? onNavigateGetInvolved('volunteer') : setActivePage('get-involved')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm"
            >
              Join Movement / शामिल हों
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
