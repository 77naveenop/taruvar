import React from 'react';
import { Sprout, ShieldCheck, Heart, Users, Compass, Globe, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage({ onOpenPledge, setActivePage }) {
  return (
    <div className="space-y-20 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Our Mission & Philosophy • taruvar.org
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-taruvar-dark tracking-tight">
          Nurturing Nature Beyond Plantation.
        </h1>
        <p className="text-taruvar-muted text-base sm:text-lg leading-relaxed">
          Taruvar is a developing environmental organization and public movement built on the core belief that planting a tree is only the beginning.
        </p>
      </div>

      {/* The Core Idea: Why Plantation Alone Is Not Enough */}
      <section className="bg-white p-8 md:p-12 rounded-3xl border border-taruvar-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary">The Problem We Solve</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-taruvar-dark">
            Why Plantation Alone Is Not Enough
          </h2>
          <p className="text-sm text-taruvar-muted leading-relaxed">
            Every year, millions of saplings are planted across environmental drives. Yet, a massive percentage of these saplings wither away within months due to a lack of long-term care, protection, and watering.
          </p>
          <p className="text-sm text-taruvar-muted leading-relaxed">
            The headline usually asks: <em className="text-taruvar-dark font-medium font-sans">“How many trees did we plant?”</em>
          </p>
          <p className="text-sm text-taruvar-dark font-semibold">
            Taruvar wants citizens to ask: <span className="text-taruvar-secondary">“How many trees are still alive, growing, and being cared for?”</span>
          </p>
        </div>

        <div className="lg:col-span-5 bg-taruvar-bg p-6 rounded-2xl border border-taruvar-border space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h4 className="font-bold text-taruvar-dark text-base">The Concept of "Paalna"</h4>
              <p className="text-xs text-taruvar-muted">Nurturing like a guardian</p>
            </div>
          </div>
          <p className="text-xs text-taruvar-dark leading-relaxed">
            Derived from the traditional idea of nurturing, <strong>Paalna</strong> represents continuous guardianship. When you plant a tree with Taruvar, you adopt its survival.
          </p>
          <div className="pt-2 border-t border-taruvar-border text-[11px] text-taruvar-secondary font-bold">
            Planting = 1 Day • Paalna = 365+ Days
          </div>
        </div>
      </section>

      {/* The 5-Step Philosophy */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-taruvar-dark">
            The Taruvar 5-Step Cycle
          </h2>
          <p className="text-xs text-taruvar-muted">
            The framework guiding every individual, school, and community chapter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '🌱', title: 'Plant', desc: 'Giving a tree its beginning with local climate-matched species.' },
            { step: '💧', title: 'Care', desc: 'Taking active responsibility for water, soil, and shelter (Paalna).' },
            { step: '📸', title: 'Document', desc: 'Recording growth milestones and creating a digital timeline history.' },
            { step: '🌿', title: 'Grow', desc: 'Watching saplings strengthen into self-sustaining healthy trees.' },
            { step: '🤝', title: 'Inspire', desc: 'Sharing verified progress to encourage neighborhood participation.' }
          ].map((item, idx) => (
            <div key={item.title} className="bg-white p-6 rounded-2xl border border-taruvar-border shadow-sm text-center space-y-2">
              <span className="text-3xl block">{item.step}</span>
              <span className="text-[10px] font-bold text-taruvar-secondary uppercase tracking-widest">Step 0{idx + 1}</span>
              <h3 className="font-bold text-taruvar-dark text-lg">{item.title}</h3>
              <p className="text-xs text-taruvar-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology & Community Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Youth & Campus */}
        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-taruvar-light flex items-center justify-center text-2xl">🎓</div>
          <h3 className="text-xl font-bold text-taruvar-dark">Youth Engagement & Leadership</h3>
          <p className="text-sm text-taruvar-muted leading-relaxed">
            Taruvar gives students opportunities to work on real environmental projects, build community leadership skills, and earn documented volunteer/internship experience based on genuine participation.
          </p>
          <ul className="space-y-2 text-xs text-taruvar-dark font-medium">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Campus ambassador programs</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Real hands-on environmental experience</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Verified work credentials</li>
          </ul>
        </div>

        {/* Women's Participation */}
        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-taruvar-light flex items-center justify-center text-2xl">👩</div>
          <h3 className="text-xl font-bold text-taruvar-dark">Taruvar Green Shakti</h3>
          <p className="text-sm text-taruvar-muted leading-relaxed">
            Women are natural guardians of local ecosystems. Taruvar Green Shakti mobilizes women leaders in neighborhoods and rural areas to steward tree care circles and lead environmental action.
          </p>
          <ul className="space-y-2 text-xs text-taruvar-dark font-medium">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Community leadership circles</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Grassroot environmental participation</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-taruvar-primary" /> Sustainable neighborhood stewardship</li>
          </ul>
        </div>
      </section>

      {/* Long term vision & Transparency */}
      <section className="bg-taruvar-secondary text-white p-8 md:p-12 rounded-3xl space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold text-taruvar-accent uppercase tracking-widest">Our Vision & Commitment</span>
          <h2 className="text-3xl font-extrabold">Building a Nationwide Movement</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Our long-term goal is to build a nationwide, technology-enabled public movement where anyone can plant a tree, receive a digital Tree ID, share growth updates, and take independent long-term responsibility for nature.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-taruvar-accent">
            <ShieldCheck className="w-4 h-4" />
            <span>Honest metrics • No fake claims • Genuine public action</span>
          </div>
          <button
            onClick={onOpenPledge}
            className="px-6 py-3 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-bold text-xs rounded-xl transition-all"
          >
            Pledge Your Tree
          </button>
        </div>
      </section>

    </div>
  );
}
