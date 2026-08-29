import React, { useState } from 'react';
import { Sprout, Users, GraduationCap, Smartphone, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function InitiativesPage({ setActivePage, onOpenPledge }) {
  const [activeTab, setActiveTab] = useState('all');

  const initiatives = [
    {
      id: 'one-person-one-tree',
      title: 'ONE PERSON. ONE TREE.',
      subtitle: 'Public Individual Movement',
      icon: '🌱',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      summary: 'A public movement encouraging individuals to take responsibility for at least one tree from plantation to full maturity.',
      points: [
        'Shift focus from quantity of saplings planted to survival rate of trees.',
        'Encourages personal ownership under the Paalna (nurturing) concept.',
        'Accessible to every citizen regardless of location or age.',
        'Simple 5-step framework: Plant → Care → Document → Grow → Inspire.'
      ],
      target: 'Individuals, Families, Neighborhood Residents',
      cta: 'Grow / Adopt Your Tree',
      action: onOpenPledge
    },
    {
      id: 'green-shakti',
      title: 'TARUVAR GREEN SHAKTI',
      subtitle: 'Women Environmental Leadership',
      icon: '👩',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      summary: 'Empowering women\'s leadership, participation, and environmental guardianship in residential areas, villages, and community groups.',
      points: [
        'Mobilizing women as primary guardians of local saplings and community greens.',
        'Promoting neighborhood tree care circles and rainwater distribution.',
        'Building leadership networks and environmental stewardship workshops.',
        'Recognizing women eco-leaders with documented Taruvar Green Shakti honors.'
      ],
      target: 'Women leaders, Homemakers, Working professionals, Self-help groups',
      cta: 'Join Green Shakti Circle',
      action: () => { setActivePage('get-involved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    },
    {
      id: 'youth-campus',
      title: 'TARUVAR YOUTH & CAMPUS NETWORK',
      subtitle: 'Student Volunteer & Internship Platform',
      icon: '🎓',
      color: 'bg-green-50 text-green-700 border-green-200',
      summary: 'Connecting students with real environmental campaigns, leadership opportunities, and documented participation credentials.',
      points: [
        'Establish campus chapters in schools, colleges, and universities.',
        'Hands-on experience in campaign management, tree monitoring, and youth drives.',
        'Documented volunteer certificates and internship experience based on real work.',
        'Leadership progression from volunteer to Campus Chapter Coordinator.'
      ],
      target: 'High school students, College undergraduates, Youth organizations',
      cta: 'Apply for Campus Chapter',
      action: () => { setActivePage('get-involved'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    },
    {
      id: 'tree-journey-tech',
      title: 'TARUVAR TREE JOURNEY',
      subtitle: 'Developing Tech Ecosystem',
      icon: '📱',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      summary: 'A technology-enabled concept to give every planted tree a unique digital identity, GPS log, and growth timeline.',
      points: [
        'Assign unique Tree IDs and downloadable digital Tree Passports.',
        'Photo progress tracking at Day 1, Day 30, Month 6, and Year 1.',
        'Community verification system to certify tree health and survival.',
        'Open data metrics for transparent environmental movement tracking.'
      ],
      target: 'Tech-conscious citizens, Eco-tech enthusiasts, Environmentalists',
      cta: 'Explore Tree Journey Prototype',
      action: () => { setActivePage('tree-journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    }
  ];

  return (
    <div className="space-y-20 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-primary/20">
          🌱 CORE INITIATIVES • taruvar.org
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-taruvar-dark tracking-tight">
          Pillars of the Taruvar Movement
        </h1>
        <p className="text-taruvar-muted text-base sm:text-lg leading-relaxed">
          Taruvar operates through four focused initiatives designed to engage individuals, women, students, and technology for long-term environmental participation.
        </p>
      </div>

      {/* Initiatives Detail Cards */}
      <div className="space-y-10">
        {initiatives.map((init) => (
          <div 
            key={init.id}
            id={init.id}
            className="bg-white p-8 md:p-12 rounded-3xl border border-taruvar-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Header / Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 bg-taruvar-light rounded-2xl">{init.icon}</span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-taruvar-secondary">{init.subtitle}</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-taruvar-dark">{init.title}</h2>
                </div>
              </div>

              <p className="text-sm text-taruvar-dark font-medium leading-relaxed">
                {init.summary}
              </p>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-muted">Key Goals & Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {init.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-taruvar-muted leading-snug bg-taruvar-bg p-3 rounded-xl border border-taruvar-border">
                      <CheckCircle2 className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-taruvar-border">
                <div className="text-xs text-taruvar-muted">
                  <strong className="text-taruvar-dark">Target Audience:</strong> {init.target}
                </div>
                <button
                  onClick={init.action}
                  className="px-6 py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>{init.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-taruvar-bg to-white p-6 rounded-2xl border border-taruvar-border space-y-4">
              <div className="p-4 bg-white rounded-xl border border-taruvar-border text-center space-y-2 shadow-sm">
                <span className="text-3xl">{init.icon}</span>
                <h4 className="font-bold text-taruvar-dark text-sm">{init.title}</h4>
                <p className="text-[11px] text-taruvar-muted">Taruvar Official Initiative • taruvar.org</p>
              </div>

              <div className="p-4 bg-taruvar-light/60 rounded-xl border border-taruvar-primary/20 flex items-start gap-2 text-xs text-taruvar-dark">
                <ShieldCheck className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                <span>Every initiative prioritizes long-term care (*Paalna*) and verifiable participation over simple photo ops.</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
