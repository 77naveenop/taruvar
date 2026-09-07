import React from 'react';
import { Sprout, Users, Award, ShieldCheck, Heart, Sparkles, ArrowRight, Target, CheckCircle2, Globe, Phone, Mail, MessageCircle } from 'lucide-react';

export default function AboutPage({ setActivePage, onOpenPledge }) {
  
  // 7-Member Core Leadership & Pillars
  const teamMembers = [
    {
      name: 'Naveen Sharma',
      role: 'Founder & Lead Steward',
      hindiRole: 'संस्थापक एवं मुख्य संचालक',
      bio: 'Leading the vision of individual environmental responsibility, tech-enabled tree tracking, and grassroots citizen action across India.',
      icon: '🌱',
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      name: 'Dr. Anita Verma',
      role: 'Botanical & Plantation Advisor',
      hindiRole: 'वानस्पतिक सलाहकार',
      bio: 'Guiding indigenous sapling selection (Neem, Peepal, Banyan), soil nutrition frameworks, and high-survival organic care practices.',
      icon: '🌿',
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Rahul Mishra',
      role: 'Community Operations Lead',
      hindiRole: 'सामुदायिक अभियान प्रमुख',
      bio: 'Coordinating neighborhood tree adoption circles, weekend volunteer watering groups, and ward-level greening drives.',
      icon: '🤝',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Pooja Sundaram',
      role: 'Taruvar Green Shakti Lead',
      hindiRole: 'महिला नेतृत्व संयोजक',
      bio: 'Empowering women-led community groups and self-help collectives to champion sapling care and local green spaces.',
      icon: '👩',
      color: 'bg-amber-100 text-amber-800'
    },
    {
      name: 'Aman Deep Singh',
      role: 'Youth & Campus Network Coordinator',
      hindiRole: 'युवा व विश्वविद्यालय समन्वयक',
      bio: 'Mobilizing university chapters, student environmental internships, and on-ground campus afforestation challenges.',
      icon: '🎓',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Sneha Patel',
      role: 'Tree Journey Platform & Tech Lead',
      hindiRole: 'डिजिटल ट्रैकर व तकनीक प्रमुख',
      bio: 'Architecting the digital tree growth log, QR passport verification engine, and community photo feed systems.',
      icon: '📱',
      color: 'bg-teal-100 text-teal-800'
    },
    {
      name: 'Vikram Joshi',
      role: 'Partnerships & Outreach Coordinator',
      hindiRole: 'साझेदारी व संपर्क प्रमुख',
      bio: 'Connecting schools, corporate CSR programs, and resident welfare associations with Taruvar adoption programs.',
      icon: '🏢',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  return (
    <div className="space-y-20 pb-24 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SECTION 1 — MISSION HERO */}
      <section className="bg-gradient-to-r from-taruvar-dark via-[#1F5435] to-taruvar-secondary text-white p-8 sm:p-14 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-taruvar-accent border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One Person. One Tree. • एक व्यक्ति, एक पेड़</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Our Mission: Shifting From One-Day Planting to Lifetime Care.
          </h1>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
            Taruvar was born out of a stark environmental reality: millions of trees are planted in ceremonial drives every monsoon, yet over 80% perish within 6 months due to neglect. We are here to change that through the philosophy of <strong>Paalna (देखभाल)</strong>.
          </p>
        </div>
      </section>

      {/* SECTION 2 — CORE PHILOSOPHY & VALUES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-taruvar-light text-taruvar-secondary flex items-center justify-center text-2xl font-bold">
            🌱
          </div>
          <h3 className="text-xl font-extrabold text-taruvar-dark">The Power of One</h3>
          <p className="text-xs text-taruvar-muted leading-relaxed">
            You don't need to fund a forest. If one citizen takes full personal accountability for <strong>just one tree</strong>, we build thriving urban and rural canopies with a 95%+ survival rate.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-taruvar-light text-taruvar-secondary flex items-center justify-center text-2xl font-bold">
            💧
          </div>
          <h3 className="text-xl font-extrabold text-taruvar-dark">Paalna (365-Day Care)</h3>
          <p className="text-xs text-taruvar-muted leading-relaxed">
            Planting is day 1. The real impact is watering during summer heatwaves, protecting saplings with tree guards, and providing organic compost through seasonal cycles.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-taruvar-border shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-taruvar-light text-taruvar-secondary flex items-center justify-center text-2xl font-bold">
            📸
          </div>
          <h3 className="text-xl font-extrabold text-taruvar-dark">Photo-Verified Growth</h3>
          <p className="text-xs text-taruvar-muted leading-relaxed">
            Technology brings genuine transparency. Every adopter logs monthly photo updates, earning verified badges and tracking their tree's height, health, and survival.
          </p>
        </div>
      </section>

      {/* SECTION 3 — 7-MEMBER LEADERSHIP TEAM */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-taruvar-secondary bg-taruvar-light px-3.5 py-1 rounded-full">
            Our Team & Leadership • हमारी टीम
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-taruvar-dark">
            Meet the Core Team Behind Taruvar
          </h2>
          <p className="text-taruvar-muted text-sm">
            Dedicated coordinators, botanical advisors, and community leaders driving long-term environmental guardianship across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div 
              key={member.name}
              className="bg-white p-6 rounded-3xl border border-taruvar-border shadow-card hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center text-3xl shadow-sm`}>
                  {member.icon}
                </div>

                <div>
                  <h3 className="text-lg font-black text-taruvar-dark">{member.name}</h3>
                  <p className="text-xs font-bold text-taruvar-secondary">{member.role}</p>
                  <p className="text-[11px] font-semibold text-taruvar-muted">{member.hindiRole}</p>
                </div>

                <p className="text-xs text-taruvar-muted leading-relaxed pt-1 border-t border-taruvar-border">
                  {member.bio}
                </p>
              </div>

              <div className="pt-2 text-[10px] font-bold text-taruvar-secondary uppercase tracking-wider">
                Taruvar Core Pillar
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — CONTACT & CONNECT */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-taruvar-border shadow-card space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-taruvar-dark">Get in Touch With Taruvar</h2>
          <p className="text-xs text-taruvar-muted">
            Have questions about tree adoption, student drives, or institutional partnerships? Reach out to our team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <a
            href="mailto:teamtaruvar@gmail.com"
            className="p-5 rounded-2xl bg-taruvar-bg hover:bg-taruvar-light border border-taruvar-border flex flex-col items-center text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-taruvar-secondary group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-taruvar-dark">Email Us</p>
            <p className="text-xs text-taruvar-secondary font-semibold">teamtaruvar@gmail.com</p>
          </a>

          <a
            href="tel:8543964107"
            className="p-5 rounded-2xl bg-taruvar-bg hover:bg-taruvar-light border border-taruvar-border flex flex-col items-center text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-taruvar-secondary group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-taruvar-dark">Call Us</p>
            <p className="text-xs text-taruvar-secondary font-semibold">+91 8543964107</p>
          </a>

          <a
            href="https://wa.me/917887254107"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-taruvar-bg hover:bg-emerald-50 border border-taruvar-border flex flex-col items-center text-center space-y-2 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-taruvar-dark">WhatsApp Chat</p>
            <p className="text-xs text-emerald-600 font-semibold">+91 7887254107</p>
          </a>
        </div>
      </section>

      {/* SECTION 5 — CALL TO ACTION */}
      <section className="bg-gradient-to-r from-taruvar-secondary to-taruvar-dark text-white p-8 sm:p-12 rounded-3xl text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold">Ready to Adopt Your Tree?</h2>
        <p className="text-sm text-gray-200 max-w-xl mx-auto">
          Join thousands of citizens taking personal responsibility for our planet. Receive your official ID card today.
        </p>
        <button
          onClick={() => {
            setActivePage('adopt');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-8 py-4 bg-taruvar-primary hover:bg-taruvar-accent text-taruvar-dark font-extrabold rounded-2xl shadow-xl transition-all inline-flex items-center gap-2 text-sm cursor-pointer"
        >
          <Sprout className="w-5 h-5" />
          <span>Grow / Adopt Your Tree</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
