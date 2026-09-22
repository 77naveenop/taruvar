import React, { useState, useEffect } from 'react';
import { Sprout, Users, GraduationCap, Smartphone, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Target } from 'lucide-react';
import { getCloudInitiatives, DEFAULT_INITIATIVES } from '../lib/cloudDb';

export default function InitiativesPage({ setActivePage, onOpenPledge, onNavigateGetInvolved }) {
  const [initiatives, setInitiatives] = useState(DEFAULT_INITIATIVES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const inits = await getCloudInitiatives();
        if (isMounted && Array.isArray(inits) && inits.length > 0) {
          setInitiatives(inits);
        }
      } catch (e) {
        console.warn('Initiatives load error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleAction = (init) => {
    if (init.id === 'one-person-one-tree' || init.category === 'Citizen Afforestation') {
      onOpenPledge();
    } else {
      setActivePage('be-a-part');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-primary/20">
          🌱 CORE INITIATIVES & CAMPAIGNS • taruvar.org
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-taruvar-dark tracking-tight">
          Pillars of the Taruvar Movement
        </h1>
        <p className="text-taruvar-muted text-base sm:text-lg leading-relaxed">
          Taruvar operates through focused initiatives designed to mobilize individuals, women leaders, students, and community volunteers for continuous environmental care.
        </p>
      </div>

      {/* Initiatives Detail Cards */}
      <div className="space-y-10">
        {initiatives.map((init) => (
          <div 
            key={init.id}
            id={init.id}
            className="bg-white p-8 md:p-12 rounded-3xl border border-taruvar-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:border-taruvar-secondary/40 transition-all"
          >
            {/* Header / Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-3 bg-taruvar-light rounded-2xl shrink-0">{init.icon || '🌱'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-taruvar-secondary">{init.subtitle || init.category}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-full">
                      {init.status || 'Active'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-taruvar-dark">{init.title}</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">📍 Location: <strong>{init.location || 'Pan-India'}</strong></p>
                </div>
              </div>

              <p className="text-sm text-taruvar-dark font-medium leading-relaxed">
                {init.summary}
              </p>

              {/* Key Points */}
              {Array.isArray(init.points) && init.points.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-taruvar-muted">Key Focus & Commitments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {init.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-taruvar-muted leading-snug bg-taruvar-bg p-3 rounded-xl border border-taruvar-border">
                        <CheckCircle2 className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-taruvar-border">
                <div className="text-xs text-taruvar-muted">
                  <strong className="text-taruvar-dark">Target Impact:</strong> {init.targetGoal || 'Community Greening'}
                </div>
                <button
                  onClick={() => handleAction(init)}
                  className="px-6 py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>{init.id === 'one-person-one-tree' ? 'Adopt a Tree' : 'Be a Part / Join'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-taruvar-bg to-white p-6 rounded-2xl border border-taruvar-border space-y-4">
              {init.coverImage ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-taruvar-border shadow-sm">
                  <img src={init.coverImage} alt={init.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-taruvar-border text-center space-y-2 shadow-sm">
                  <span className="text-4xl">{init.icon || '🌱'}</span>
                  <h4 className="font-bold text-taruvar-dark text-sm">{init.title}</h4>
                  <p className="text-[11px] text-taruvar-muted">Taruvar Official Movement • taruvar.org</p>
                </div>
              )}

              <div className="p-4 bg-taruvar-light/60 rounded-xl border border-taruvar-primary/20 flex items-start gap-2 text-xs text-taruvar-dark">
                <ShieldCheck className="w-4 h-4 text-taruvar-secondary shrink-0 mt-0.5" />
                <span>Every Taruvar initiative prioritizes long-term nurturing (<em>Paalna</em>) and digital verification over one-time photo ops.</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
