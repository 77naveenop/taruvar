import React, { useState } from 'react';
import { Calendar, MapPin, Camera, Sparkles, QrCode, ArrowRight, Shield, Award, CheckCircle } from 'lucide-react';

export default function TreeJourneySandbox({ compact = false }) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'mock-create'
  const [mockTreeName, setMockTreeName] = useState('Gulmohar Sapling');
  const [mockLocation, setMockLocation] = useState('Green Campus Sector 4');

  const timelineStages = [
    {
      id: 'day-1',
      stage: 'DAY 1',
      title: 'Tree Planted',
      date: 'Aug 15, 2026',
      badge: 'Sapling Init',
      desc: 'Sapling safely planted with organic compost. Tree ID assigned and GPS location locked.',
      height: '18 cm',
      status: 'Healthy & Watered',
      imgBg: 'from-emerald-600 to-green-700',
      icon: '🌱'
    },
    {
      id: 'day-30',
      stage: 'DAY 30',
      title: 'First Growth Update',
      date: 'Sep 15, 2026',
      badge: 'New Leaves',
      desc: '3 new leaf buds sprouted! Soil moisture levels monitored. First monthly milestone photo uploaded.',
      height: '24 cm',
      status: 'Growing Active',
      imgBg: 'from-green-600 to-teal-700',
      icon: '🌿'
    },
    {
      id: 'month-6',
      stage: 'MONTH 6',
      title: 'Growing Stronger',
      date: 'Feb 15, 2027',
      badge: 'Stem Hardening',
      desc: 'Stem trunk thickened significantly. Surviving winter season under active caretaker watch.',
      height: '45 cm',
      status: 'Robust Root System',
      imgBg: 'from-teal-700 to-emerald-800',
      icon: '🌳'
    },
    {
      id: 'year-1',
      stage: 'YEAR 1',
      title: 'A Year of Care',
      date: 'Aug 15, 2027',
      badge: '365 Days Survivor',
      desc: 'A full year of nurturing completed! The sapling is now a self-sustaining young tree offering shade.',
      height: '92 cm',
      status: 'Permanent Sanctuary',
      imgBg: 'from-taruvar-secondary to-green-900',
      icon: '🏆'
    }
  ];

  const currentStage = timelineStages[activeStageIndex];

  return (
    <div className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-taruvar-secondary via-[#1F5435] to-taruvar-secondary p-6 md:p-8 text-white relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur text-taruvar-accent text-xs font-semibold rounded-full border border-white/10 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> DIGITAL CONCEPT • COMING SOON
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Taruvar Tree Journey</h3>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              We are building a technology-enabled ecosystem where every tree gets a digital identity, photo timeline, and verifiable growth record.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'timeline' ? 'bg-white text-taruvar-secondary shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Interactive Timeline
            </button>
            <button
              onClick={() => setActiveTab('mock-create')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'mock-create' ? 'bg-white text-taruvar-secondary shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Preview Passport
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'timeline' ? (
        <div className="p-6 md:p-8">
          {/* Stage Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {timelineStages.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  activeStageIndex === idx 
                    ? 'border-taruvar-secondary bg-taruvar-light/50 ring-2 ring-taruvar-primary/40 shadow-sm' 
                    : 'border-taruvar-border hover:border-taruvar-primary/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black tracking-widest text-taruvar-secondary uppercase">{st.stage}</span>
                  <span className="text-base">{st.icon}</span>
                </div>
                <p className="font-bold text-sm text-taruvar-dark truncate">{st.title}</p>
                <p className="text-[11px] text-taruvar-muted mt-0.5">{st.height}</p>
                {activeStageIndex === idx && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-taruvar-secondary"></div>
                )}
              </button>
            ))}
          </div>

          {/* Timeline Card Detailed Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-taruvar-bg p-6 md:p-8 rounded-3xl border border-taruvar-border">
            {/* Visual Canvas Mockup */}
            <div className="lg:col-span-5 relative">
              <div className={`aspect-square rounded-2xl bg-gradient-to-br ${currentStage.imgBg} p-6 text-white flex flex-col justify-between relative shadow-lg overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-black/20 backdrop-blur rounded-full text-xs font-semibold text-taruvar-accent border border-white/10">
                    ID: TRV-8821
                  </span>
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div className="my-auto text-center space-y-3">
                  <span className="text-6xl inline-block drop-shadow-md transform hover:scale-110 transition-transform">
                    {currentStage.icon}
                  </span>
                  <div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold uppercase tracking-wider text-white">
                      {currentStage.stage} Milestone
                    </span>
                    <h4 className="text-2xl font-bold mt-2">{mockTreeName}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/80 bg-black/20 backdrop-blur p-3 rounded-xl border border-white/10">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-taruvar-accent" /> {mockLocation}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-taruvar-accent" /> {currentStage.date}</span>
                </div>
              </div>
            </div>

            {/* Stage Info & Metrics */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full">
                  {currentStage.badge}
                </span>
                <span className="text-xs text-taruvar-muted font-medium flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-taruvar-primary" /> Verified Photo Logged
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-extrabold text-taruvar-dark">{currentStage.title}</h4>
                <p className="text-taruvar-muted text-sm mt-2 leading-relaxed">
                  {currentStage.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-taruvar-border py-4">
                <div>
                  <p className="text-xs text-taruvar-muted uppercase tracking-wider">Recorded Height</p>
                  <p className="text-xl font-bold text-taruvar-secondary">{currentStage.height}</p>
                </div>
                <div>
                  <p className="text-xs text-taruvar-muted uppercase tracking-wider">Health Status</p>
                  <p className="text-xl font-bold text-taruvar-dark flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-taruvar-primary" /> {currentStage.status}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-taruvar-border flex items-start gap-3">
                <Shield className="w-5 h-5 text-taruvar-primary shrink-0 mt-0.5" />
                <p className="text-xs text-taruvar-muted">
                  <strong className="text-taruvar-dark">Long-term Responsibility:</strong> Unlike simple planting drives, the Taruvar Tree ID requires regular check-ins to certify survival.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Digital Passport Preview Sandbox */
        <div className="p-6 md:p-8 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <h4 className="text-xl font-bold text-taruvar-dark text-center">Customize Your Tree Passport Prototype</h4>
            <p className="text-xs text-taruvar-muted text-center">
              Test how participants will generate digital identities for their planted saplings once the app launches.
            </p>

            <div className="space-y-3 bg-taruvar-bg p-5 rounded-2xl border border-taruvar-border">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1">Tree / Sapling Name</label>
                <input
                  type="text"
                  value={mockTreeName}
                  onChange={(e) => setMockTreeName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-1">Plantation Location</label>
                <input
                  type="text"
                  value={mockLocation}
                  onChange={(e) => setMockLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/40"
                />
              </div>
            </div>

            <div className="p-6 bg-taruvar-secondary text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs text-taruvar-accent font-semibold uppercase tracking-wider">Passholder Certificate • taruvar.org</span>
                <h5 className="text-2xl font-bold">{mockTreeName}</h5>
                <p className="text-xs text-white/70 flex items-center gap-1 justify-center md:justify-start">
                  <MapPin className="w-3.5 h-3.5 text-taruvar-accent" /> {mockLocation}
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl text-taruvar-dark text-center shadow-lg shrink-0">
                <QrCode className="w-16 h-16 text-taruvar-secondary mx-auto" />
                <p className="text-[10px] font-mono font-bold mt-1 text-taruvar-muted">TRV-DEMO-2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
