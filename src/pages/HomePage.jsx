import React, { useState } from 'react';
import { 
  Sprout, Droplets, Camera, TreePine, Heart, ArrowRight, Sparkles, 
  Users, Award, BookOpen, ShieldCheck, CheckCircle2, ChevronRight,
  Share2, Compass, Layers, Globe
} from 'lucide-react';
import TreeJourneySandbox from '../components/TreeJourneySandbox';

export default function HomePage({ setActivePage, onOpenPledge, showToast, onNavigateGetInvolved }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeStoryFilter, setActiveStoryFilter] = useState('all');

  // Initiatives Data
  const initiativesData = [
    {
      id: 'one-tree',
      icon: '🌱',
      title: 'ONE PERSON. ONE TREE.',
      subtitle: 'Public Movement',
      desc: 'A public movement encouraging individuals to take responsibility for at least one tree from plantation to full growth.',
      badge: 'Core Campaign'
    },
    {
      id: 'green-shakti',
      icon: '👩',
      title: 'TARUVAR GREEN SHAKTI',
      subtitle: 'Women Leadership',
      desc: 'Encouraging women\'s participation, leadership, and community environmental action across neighborhoods and villages.',
      badge: 'Community Power'
    },
    {
      id: 'youth-network',
      icon: '🎓',
      title: 'TARUVAR YOUTH & CAMPUS NETWORK',
      subtitle: 'Student Action',
      desc: 'Giving students opportunities to volunteer, lead real projects, build leadership skills, and earn documented experience.',
      badge: 'Campus Drive'
    },
    {
      id: 'tree-journey-digital',
      icon: '📱',
      title: 'TARUVAR TREE JOURNEY',
      subtitle: 'Digital Platform',
      desc: 'A developing digital concept for documenting, assigning Tree IDs, and following the growth of trees over time.',
      badge: 'Tech Enabled'
    }
  ];

  // Why Join Grid Items
  const whyJoinItems = [
    {
      icon: <Sprout className="w-6 h-6 text-taruvar-primary" />,
      title: 'Make Environmental Impact',
      desc: 'Take meaningful, long-term action for nature instead of one-day photo ops.'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-taruvar-primary" />,
      title: 'Learn Through Real Work',
      desc: 'Participate in real-world environmental campaigns, soil preparation, and sapling monitoring.'
    },
    {
      icon: <Award className="w-6 h-6 text-taruvar-primary" />,
      title: 'Build Documented Experience',
      desc: 'Eligible contributors receive official volunteer or internship credentials based strictly on genuine verified work.'
    },
    {
      icon: <Users className="w-6 h-6 text-taruvar-primary" />,
      title: 'Take Leadership',
      desc: 'Grow from individual volunteer to local campus coordinator or community leader.'
    },
    {
      icon: <Heart className="w-6 h-6 text-taruvar-primary" />,
      title: 'Build Community',
      desc: 'Connect with an inspiring network of youth, students, and citizens passionate about nature.'
    }
  ];

  // Stories Data
  const stories = [
    {
      id: 'first-tree',
      category: 'personal',
      title: 'My First Tree: From Sapling to Sanctuary',
      author: 'Priya Sharma, Student Volunteer',
      summary: 'How caring for a single Peepal sapling over 8 months transformed my daily routine and inspired 12 classmates.',
      tag: 'Participant Story'
    },
    {
      id: 'campus-drive',
      category: 'campus',
      title: 'Students Creating Change on Campus',
      author: 'Taruvar Campus Chapter',
      summary: 'A group of 30 university students mapped, watered, and adopted 45 saplings on their university perimeter.',
      tag: 'Campus Movement'
    },
    {
      id: 'green-women',
      category: 'women',
      title: 'Women Leading Green Communities',
      author: 'Green Shakti Collective',
      summary: 'Women leaders organizing neighborhood tree care circles and rainwater collection points around young saplings.',
      tag: 'Green Shakti'
    }
  ];

  const filteredStories = activeStoryFilter === 'all' 
    ? stories 
    : stories.filter(s => s.category === activeStoryFilter);

  return (
    <div className="space-y-24 md:space-y-32 pb-16">
      
      {/* SECTION 1 — HERO */}
      <section className="relative pt-12 md:pt-20 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-primary/20">
                <Sparkles className="w-4 h-4" />
                <span>One Person. One Tree. • taruvar.org</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-taruvar-dark leading-[1.1] tracking-tight">
                A Tree's Journey <br className="hidden sm:inline" />
                <span className="text-taruvar-secondary">Doesn't End</span> When You Plant It.
              </h1>

              <p className="text-lg sm:text-xl text-taruvar-muted leading-relaxed max-w-2xl font-normal">
                Planting gives a tree its beginning. Caring for it gives the action its meaning.
                Taruvar is building a movement where people take responsibility for the trees they plant and document their journey as they grow.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onOpenPledge}
                  className="px-8 py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white text-base font-bold rounded-2xl shadow-lg shadow-taruvar-secondary/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Adopt & Care for a Tree</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActivePage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white hover:bg-taruvar-light text-taruvar-dark font-bold text-base rounded-2xl border border-taruvar-border transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-5 h-5 text-taruvar-secondary" />
                  <span>Explore Taruvar</span>
                </button>
              </div>

              {/* Movement Tagline Quote */}
              <div className="pt-6 border-t border-taruvar-border/60 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-taruvar-primary/20 border-2 border-white flex items-center justify-center text-xs">🌱</span>
                  <span className="w-8 h-8 rounded-full bg-taruvar-secondary/20 border-2 border-white flex items-center justify-center text-xs">💧</span>
                  <span className="w-8 h-8 rounded-full bg-taruvar-accent/30 border-2 border-white flex items-center justify-center text-xs">📸</span>
                </div>
                <p className="text-xs text-taruvar-muted font-medium">
                  Join hundreds pledging to nurture saplings under the concept of <strong className="text-taruvar-dark font-semibold">"Paalna"</strong>.
                </p>
              </div>

            </div>

            {/* Right Visual Banner: Animated Sapling Transformation */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Visual Card */}
                <div className="glass-card p-6 md:p-8 rounded-3xl shadow-card relative overflow-hidden space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-taruvar-light text-taruvar-secondary rounded-full">
                      ID: TRV-PLEDGE-01
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-taruvar-secondary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-taruvar-primary animate-ping"></span> Live Journey
                    </span>
                  </div>

                  {/* Sapling growth mockup container */}
                  <div className="bg-gradient-to-b from-taruvar-bg to-white p-8 rounded-2xl border border-taruvar-border text-center relative space-y-4">
                    <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-taruvar-primary to-taruvar-secondary flex items-center justify-center text-5xl shadow-glow transform hover:scale-105 transition-all">
                      🌱
                    </div>

                    <div>
                      <h3 className="font-extrabold text-xl text-taruvar-dark">From Sapling to Sanctuary</h3>
                      <p className="text-xs text-taruvar-muted mt-1">
                        "Planting is just 1% of the journey. The real magic happens during the 365 days of care."
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-taruvar-border text-center">
                      <div className="p-2 rounded-xl bg-white border border-taruvar-border">
                        <p className="text-[10px] text-taruvar-muted font-bold uppercase">PLANT</p>
                        <p className="text-xs font-bold text-taruvar-secondary">Day 1</p>
                      </div>
                      <div className="p-2 rounded-xl bg-taruvar-light border border-taruvar-primary/30">
                        <p className="text-[10px] text-taruvar-secondary font-bold uppercase">PAALNA</p>
                        <p className="text-xs font-bold text-taruvar-secondary">365 Days</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-taruvar-border">
                        <p className="text-[10px] text-taruvar-muted font-bold uppercase">GROW</p>
                        <p className="text-xs font-bold text-taruvar-dark">Forever</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-taruvar-light/50 rounded-2xl border border-taruvar-primary/20 flex items-center justify-between text-xs font-medium text-taruvar-secondary">
                    <span>Public Environmental Action</span>
                    <span className="font-bold">taruvar.org</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — THE BIG IDEA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            The Taruvar Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            More Than Plantation.
          </h2>
          <p className="text-taruvar-muted text-base">
            Instead of asking "How many trees did we plant?", Taruvar empowers people to ask: "How many trees are still alive, growing, and cared for?"
          </p>
        </div>

        {/* 5-Step Visual Journey */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '🌱',
              name: 'Plant',
              tagline: 'Give a tree its beginning.',
              desc: 'Select a suitable local species and plant with care.'
            },
            {
              step: '💧',
              name: 'Care',
              tagline: 'Take responsibility.',
              desc: 'Water, protect, and nurture the sapling through seasons.'
            },
            {
              step: '📸',
              name: 'Document',
              tagline: 'Record its journey.',
              desc: 'Capture milestones as your sapling grows stronger.'
            },
            {
              step: '🌿',
              name: 'Grow',
              tagline: 'Watch the progress.',
              desc: 'Celebrate 30-day, 6-month, and 1-year growth.'
            },
            {
              step: '🤝',
              name: 'Inspire',
              tagline: 'Encourage others.',
              desc: 'Share verified impact and inspire your community.'
            }
          ].map((s, idx) => (
            <div 
              key={s.name}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:shadow-lg hover:-translate-y-1 transition-all space-y-3 relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-taruvar-bg border border-taruvar-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {s.step}
              </div>
              <div className="text-xs font-extrabold text-taruvar-secondary uppercase tracking-widest">
                STAGE 0{idx + 1}
              </div>
              <h3 className="text-xl font-bold text-taruvar-dark">{s.name}</h3>
              <p className="text-xs font-semibold text-taruvar-secondary">{s.tagline}</p>
              <p className="text-xs text-taruvar-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote Footer */}
        <div className="mt-12 text-center p-8 bg-taruvar-secondary text-white rounded-3xl shadow-xl max-w-3xl mx-auto space-y-2">
          <p className="text-xl md:text-2xl font-serif italic text-taruvar-accent">
            “One tree can start a journey. One person's responsibility can inspire many.”
          </p>
          <p className="text-xs text-white/70 uppercase tracking-widest font-semibold pt-2">
            The Philosophy of Paalna • Taruvar Movement
          </p>
        </div>
      </section>

      {/* SECTION 3 — ONE PERSON. ONE TREE. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-taruvar-bg via-white to-taruvar-light p-8 md:p-14 rounded-3xl border border-taruvar-border shadow-card relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-secondary text-white text-xs font-bold rounded-full">
                Featured Movement Campaign
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-taruvar-dark tracking-tight">
                One Person. One Tree.
              </h2>

              <p className="text-lg text-taruvar-dark font-medium leading-relaxed">
                You don't need to plant hundreds of trees to make a difference.
                <span className="block font-bold text-taruvar-secondary text-xl mt-1">Start with one.</span>
              </p>

              <div className="space-y-2 text-sm text-taruvar-muted font-medium">
                <p className="flex items-center gap-2">🌱 <span>Plant a tree.</span></p>
                <p className="flex items-center gap-2">🛡️ <span>Take responsibility for it.</span></p>
                <p className="flex items-center gap-2">💧 <span>Care for it continuously.</span></p>
                <p className="flex items-center gap-2">📸 <span>Document its growth milestones.</span></p>
                <p className="flex items-center gap-2">🌳 <span>Watch it grow into a canopy.</span></p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenPledge}
                  className="px-8 py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 text-base"
                >
                  <span>Join the Movement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card text-center space-y-4">
                <div className="p-4 bg-taruvar-light rounded-2xl">
                  <span className="text-4xl">🌳</span>
                  <h4 className="font-extrabold text-taruvar-dark text-lg mt-2">The Power of One</h4>
                  <p className="text-xs text-taruvar-muted mt-1">
                    If 1,000 people plant & protect just 1 tree each, 1,000 trees grow to maturity instead of dying in uncared plantations.
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-taruvar-secondary px-2">
                  <span>Target Survival Rate: 95%+</span>
                  <span>taruvar.org</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 — TREE JOURNEY (DIGITAL CONCEPT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Future Digital Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            Every Tree Has a Story.
          </h2>
          <p className="text-taruvar-muted text-base">
            Taruvar is developing a digital ecosystem where every participant will eventually get a Tree ID, photo timeline, and verifiable growth record.
          </p>
        </div>

        {/* Tree Journey Interactive Component */}
        <TreeJourneySandbox />

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setActivePage('tree-journey');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-taruvar-secondary hover:text-taruvar-hover font-bold text-sm underline decoration-2 underline-offset-4"
          >
            <span>Explore Future Tree Journey Ecosystem</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 5 — TARUVAR INITIATIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Core Initiatives
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            Action Driven By Purpose.
          </h2>
          <p className="text-taruvar-muted text-base">
            Explore the four pillar programs powering the Taruvar environmental movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initiativesData.map((init) => (
            <div 
              key={init.id}
              className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card hover:shadow-xl transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-14 h-14 rounded-2xl bg-taruvar-light flex items-center justify-center text-3xl">
                    {init.icon}
                  </span>
                  <span className="px-3 py-1 bg-taruvar-bg text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-border">
                    {init.badge}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-taruvar-muted">{init.subtitle}</span>
                  <h3 className="text-xl font-extrabold text-taruvar-dark mt-0.5">{init.title}</h3>
                </div>

                <p className="text-sm text-taruvar-muted leading-relaxed">
                  {init.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  setActivePage('initiatives');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="pt-4 border-t border-taruvar-border flex items-center justify-between text-taruvar-secondary hover:text-taruvar-hover font-bold text-sm group"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — WHY JOIN TARUVAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-taruvar-bg p-8 md:p-12 rounded-3xl border border-taruvar-border space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-white px-3.5 py-1 rounded-full border border-taruvar-border">
              Why Join Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
              Your Contribution Can Become Something Bigger.
            </h2>
            <p className="text-taruvar-muted text-base">
              Be part of a movement that values real work, continuous learning, and documented environmental participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyJoinItems.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-taruvar-border shadow-sm space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-taruvar-light flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-taruvar-dark">{item.title}</h3>
                <p className="text-xs text-taruvar-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Transparent Experience Disclaimer */}
          <div className="bg-white p-6 rounded-2xl border border-taruvar-primary/30 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-taruvar-secondary shrink-0 mt-1" />
            <div className="space-y-1 text-xs leading-relaxed text-taruvar-dark">
              <strong className="font-bold text-taruvar-secondary">Transparency Commitment:</strong>
              <p className="text-taruvar-muted">
                At Taruvar, certificates, volunteer credentials, and internship experience documentation are issued strictly based on genuine participation, verified tree care activity, and actual completed work. We do not sell certificates or provide fake credentials.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — HOW TO GET INVOLVED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Take Action
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            There Is More Than One Way to Start.
          </h2>
          <p className="text-taruvar-muted text-base">
            Choose the path that fits your passion, role, or available time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'PLANT A TREE',
              desc: 'Start your own tree journey today by taking responsibility for a single sapling.',
              cta: 'Start Journey',
              action: onOpenPledge,
              icon: '🌱'
            },
            {
              title: 'VOLUNTEER',
              desc: 'Contribute your time, skills, and weekend hours to local environmental drives.',
              cta: 'Join as Volunteer',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('volunteer') : setActivePage('get-involved'),
              icon: '🤝'
            },
            {
              title: 'JOIN AS A STUDENT',
              desc: 'Work on meaningful projects, lead campus drives, and build real leadership skills.',
              cta: 'Student Portal',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('student') : setActivePage('get-involved'),
              icon: '🎓'
            },
            {
              title: 'LEAD IN COMMUNITY',
              desc: 'Bring tree plantation & Paalna care to your school, college, or local neighborhood.',
              cta: 'Become a Leader',
              action: () => onNavigateGetInvolved ? onNavigateGetInvolved('leader') : setActivePage('get-involved'),
              icon: '📢'
            }
          ].map((card) => (
            <div 
              key={card.title}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:border-taruvar-secondary transition-all space-y-4 flex flex-col justify-between text-left"
            >
              <div className="space-y-3">
                <span className="text-3xl">{card.icon}</span>
                <h3 className="text-base font-extrabold text-taruvar-dark tracking-tight">{card.title}</h3>
                <p className="text-xs text-taruvar-muted leading-relaxed">{card.desc}</p>
              </div>

              <button
                onClick={card.action}
                className="w-full py-3 bg-taruvar-light hover:bg-taruvar-primary hover:text-white text-taruvar-secondary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>{card.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — OUR GROWING MOVEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-taruvar-secondary text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-taruvar-accent">
              Honest Movement Baseline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Our Growing Movement</h2>
            <p className="text-sm text-white/80">
              We begin transparently at zero. As citizens plant, care, and document trees across India, these verified statistics will grow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Trees Documented', val: '0+' },
              { label: 'Volunteers & Contributors', val: '0+' },
              { label: 'Communities Reached', val: '0+' },
              { label: 'Tree Journeys', val: '0+' }
            ].map((st, i) => (
              <div key={i} className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
                <p className="text-4xl sm:text-5xl font-black text-taruvar-accent font-mono">{st.val}</p>
                <p className="text-xs font-semibold text-white/90 mt-2">{st.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-white/60">
              No fake numbers. Every metric displayed on taruvar.org will represent verified human care.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 9 — FEATURED STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
              Real Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark mt-2">
              Stories That Grow.
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Stories' },
              { id: 'personal', label: 'My First Tree' },
              { id: 'campus', label: 'Campus' },
              { id: 'women', label: 'Green Shakti' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveStoryFilter(f.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${
                  activeStoryFilter === f.id
                    ? 'bg-taruvar-secondary text-white shadow'
                    : 'bg-white text-taruvar-dark border border-taruvar-border hover:bg-taruvar-light'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div 
              key={story.id}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="px-3 py-1 bg-taruvar-light text-taruvar-secondary text-[11px] font-bold rounded-full">
                  {story.tag}
                </span>
                <h3 className="text-lg font-bold text-taruvar-dark">{story.title}</h3>
                <p className="text-xs text-taruvar-muted leading-relaxed">{story.summary}</p>
              </div>

              <div className="pt-4 border-t border-taruvar-border flex items-center justify-between">
                <span className="text-[11px] text-taruvar-muted font-medium">{story.author}</span>
                <button
                  onClick={() => setSelectedStory(story)}
                  className="text-xs font-bold text-taruvar-secondary hover:underline"
                >
                  Read Story
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Story Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl shadow-2xl border border-taruvar-border space-y-4">
              <span className="px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full">
                {selectedStory.tag}
              </span>
              <h3 className="text-2xl font-bold text-taruvar-dark">{selectedStory.title}</h3>
              <p className="text-xs text-taruvar-secondary font-semibold">{selectedStory.author}</p>
              <p className="text-sm text-taruvar-muted leading-relaxed">
                {selectedStory.summary}
              </p>
              <div className="p-4 bg-taruvar-bg rounded-2xl border border-taruvar-border text-xs text-taruvar-dark">
                <strong>Demo Story Note:</strong> As participants document their trees on taruvar.org, real stories and photo timelines submitted by volunteers will feature here.
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="w-full py-3 bg-taruvar-secondary text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 10 — FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-taruvar-secondary via-[#1F5435] to-taruvar-dark text-white p-10 md:p-16 rounded-3xl shadow-2xl text-center space-y-8 relative overflow-hidden">
          
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs font-bold text-taruvar-accent border border-white/10 inline-block">
              One Person. One Tree. • taruvar.org
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Planting Is Just The Beginning.
            </h2>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal">
              A tree needs more than one day of attention. Start with one tree.
              Take responsibility for its journey. Grow something that lasts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenPledge}
              className="w-full sm:w-auto px-8 py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base"
            >
              <Sprout className="w-5 h-5" />
              <span>Start Your Journey</span>
            </button>

            <button
              onClick={() => {
                setActivePage('get-involved');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-base"
            >
              Become a Volunteer
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 max-w-xl mx-auto">
            <p className="text-xs text-white/60">
              “I don't need to change the whole world today. I can start with one tree.”
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
