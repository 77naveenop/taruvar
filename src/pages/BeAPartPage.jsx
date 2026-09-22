import React, { useState } from 'react';
import { 
  Users, Sprout, Heart, Award, ArrowRight, CheckCircle2, ShieldCheck, 
  MapPin, Sparkles, Send, Waves, Mountain, BookOpen, Building, UserPlus, Check, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BeAPartPage({ showToast, onOpenPledge, currentUser, onOpenAuth }) {
  // Top Switcher: 'join-roles' | 'current-projects'
  const [activeSection, setActiveSection] = useState('join-roles');

  // Selected Role in Form
  const [selectedRole, setSelectedRole] = useState('volunteer');
  const [formData, setFormData] = useState({
    fullName: currentUser?.user_metadata?.full_name || '',
    email: currentUser?.email || '',
    phone: '',
    city: '',
    state: '',
    skills: '',
    availability: 'Weekends (2-4 hours)',
    message: '',
    consent: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRole, setSubmittedRole] = useState(null);

  // Role Definitions
  const rolesList = [
    {
      id: 'guardian',
      title: 'Tree Guardian & Caretaker',
      hindi: 'वृक्ष पालक व अभिभावक',
      icon: '🌱',
      badge: 'Direct Care',
      desc: 'Adopt one or more saplings in your home, society, or locality and nurture them through verified 1-15 day care logs.',
      commit: '15 mins/week • 365 Days',
      color: 'from-emerald-500 to-green-600'
    },
    {
      id: 'volunteer',
      title: 'Local Action Volunteer',
      hindi: 'स्थानीय स्वयंसेवक',
      icon: '🤝',
      badge: 'Field Action',
      desc: 'Join weekend tree watering circles, riverbank plastic cleanups, and local park greening drives in your city.',
      commit: '2-4 hours on weekends',
      color: 'from-teal-500 to-emerald-600'
    },
    {
      id: 'youth',
      title: 'Youth & Campus Ambassador',
      hindi: 'युवा व विश्वविद्यालय दूत',
      icon: '🎓',
      badge: 'Campus Leadership',
      desc: 'Lead student tree chapters, organize 50-tree campus canopies, earn verified internship credentials and certificates.',
      commit: 'Student Chapters & Drives',
      color: 'from-blue-500 to-teal-600'
    },
    {
      id: 'green-shakti',
      title: 'Taruvar Green Shakti Leader',
      hindi: 'महिला पर्यावरण नेतृत्व',
      icon: '👩',
      badge: 'Women Collective',
      desc: 'Empower women self-help groups and neighborhood circles to organize sapling care, seedball drives, and eco-wellness.',
      commit: 'Community Circles',
      color: 'from-rose-500 to-amber-600'
    },
    {
      id: 'ward-leader',
      title: 'Area / Ward Coordinator',
      hindi: 'क्षेत्र व वार्ड समन्वयक',
      icon: '📢',
      badge: 'Coordination',
      desc: 'Liaison with municipal ward parks, coordinate sapling deliveries, and manage neighborhood caretaker rosters.',
      commit: '3-5 hours/week',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'partner',
      title: 'Institutional & CSR Partner',
      hindi: 'संस्थागत व कॉर्पोरेट पार्टनर',
      icon: '🏢',
      badge: 'Organization',
      desc: 'For companies, schools, and NGOs looking to sponsor verified multi-tree plantation drives with photo audit tracking.',
      commit: 'CSR & Organizational Alliances',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  // Active Projects List
  const activeProjects = [
    {
      id: 'proj-1',
      title: 'Project One Person. One Tree.',
      subtitle: 'एक व्यक्ति, एक पेड़ राष्ट्रीय अभियान',
      category: 'Citizen Afforestation',
      icon: '🌱',
      progress: 68,
      target: '100,000 Verified Trees',
      desc: 'Enabling citizens across Indian cities to adopt one tree each with a mandatory 5-month care and photo verification journey.',
      locations: 'Delhi NCR, Bangalore, Pune, Lucknow, Jaipur, Hyderabad',
      status: 'Active & Enrolling'
    },
    {
      id: 'proj-2',
      title: 'Project Clean Riverbanks (Yamuna & Ganga)',
      subtitle: 'नदी तट स्वच्छता व वृक्षारोपण',
      category: 'Water & River Care',
      icon: '🌊',
      progress: 54,
      target: '50 km Riverfront Protected',
      desc: 'Weekly community cleanups clearing plastic debris along river ghats and planting soil-binding riverine shrubs.',
      locations: 'Delhi Yamuna Ghats, Rishikesh, Varanasi',
      status: 'Active Weekend Drives'
    },
    {
      id: 'proj-3',
      title: 'Project Taruvar Green Shakti',
      subtitle: 'महिला नेतृत्व हरित क्रांति',
      category: 'Women Leadership',
      icon: '👩',
      progress: 82,
      target: '500 Women Self-Help Circles',
      desc: 'Mobilizing neighborhood women collectives to lead organic vermicomposting, sapling nurseries, and local park stewardship.',
      locations: 'Semi-urban & rural community clusters',
      status: 'Expanding Nationwide'
    },
    {
      id: 'proj-4',
      title: 'Project Campus Green Canopies',
      subtitle: 'विश्वविद्यालय व विद्यालय हरित आच्छादन',
      category: 'Youth & Education',
      icon: '🎓',
      progress: 45,
      target: '200 Campus 50-Tree Canopies',
      desc: 'Partnering with universities and schools where student teams plant and adopt 50-tree native mini-forests on campus grounds.',
      locations: 'Colleges & Schools across 12 States',
      status: 'Semester Cohort Open'
    },
    {
      id: 'proj-5',
      title: 'Project Clean Trail & Seedball Dispersion',
      subtitle: 'पर्वत व वन पथ स्वच्छता',
      category: 'Mountain & Forest Care',
      icon: '🏔️',
      progress: 60,
      target: '10,000 Native Seedballs Dispersed',
      desc: 'Eco-trekking drives to clear non-biodegradable tourist trash along forest hiking routes and disperse indigenous seedballs.',
      locations: 'Aravalli Biodiversity Trails, Shivalik Foothills',
      status: 'Weekend Expeditions'
    }
  ];

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      alert('Please provide your name and email to proceed.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedRole(rolesList.find(r => r.id === selectedRole)?.title || selectedRole);
      confetti({ particleCount: 80, spread: 70 });
      if (showToast) {
        showToast('Application received! A Taruvar coordinator will connect with you on WhatsApp/Email.');
      }
    }, 600);
  };

  return (
    <div className="space-y-12 pb-20 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. TOP HERO HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-black rounded-full border border-taruvar-border uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-taruvar-secondary" />
          <span>Movement Participation Portal</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-taruvar-dark tracking-tight leading-tight">
          Be a Part of <span className="text-taruvar-secondary">TARUVAR</span>
        </h1>
        <p className="text-taruvar-muted text-sm sm:text-base leading-relaxed">
          Whether you want to nurture a tree, join weekend river cleanups, lead a campus chapter, or partner as an organization — there is a purposeful role for you.
        </p>

        {/* 2. TOP SECTION SWITCHER TOGGLE BUTTONS */}
        <div className="pt-2 flex items-center justify-center">
          <div className="p-1.5 bg-white border border-taruvar-border rounded-2xl shadow-sm inline-flex items-center gap-2">
            <button
              onClick={() => setActiveSection('join-roles')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'join-roles'
                  ? 'bg-taruvar-secondary text-white shadow-md'
                  : 'text-taruvar-muted hover:text-taruvar-dark'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Be a Part (Join Us)</span>
            </button>

            <button
              onClick={() => setActiveSection('current-projects')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'current-projects'
                  ? 'bg-taruvar-secondary text-white shadow-md'
                  : 'text-taruvar-muted hover:text-taruvar-dark'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Current Projects & Initiatives</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: BE A PART & ROLE ONBOARDING                          */}
      {/* ============================================================== */}
      {activeSection === 'join-roles' && (
        <div className="space-y-10">
          
          {/* Step 1: Role Selector Grid */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-taruvar-dark">1. Choose Your Engagement Pathway</h2>
              <p className="text-xs text-taruvar-muted">Click any role below to select it for your application</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rolesList.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-gradient-to-b from-white to-taruvar-light border-taruvar-secondary shadow-lg ring-2 ring-taruvar-secondary/40'
                        : 'bg-white border-taruvar-border shadow-card hover:border-taruvar-secondary/60 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-12 h-12 rounded-2xl bg-taruvar-bg border border-taruvar-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {role.icon}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-taruvar-secondary text-white' : 'bg-taruvar-light text-taruvar-secondary'
                        }`}>
                          {role.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-black text-taruvar-dark text-base">{role.title}</h3>
                        <p className="text-[11px] font-bold text-taruvar-secondary">{role.hindi}</p>
                      </div>

                      <p className="text-xs text-taruvar-muted leading-relaxed">
                        {role.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-taruvar-border flex items-center justify-between text-xs">
                      <span className="text-[10px] font-semibold text-taruvar-muted">⏱️ {role.commit}</span>
                      <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-taruvar-secondary font-black' : 'text-taruvar-muted'}`}>
                        {isSelected ? '✓ Selected' : 'Select →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Interactive Role Application Form */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-taruvar-border shadow-card p-6 sm:p-10 space-y-6">
            
            {submittedRole ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-taruvar-dark">Welcome to Taruvar!</h3>
                <p className="text-xs sm:text-sm text-taruvar-muted leading-relaxed max-w-md mx-auto">
                  Thank you for applying as a <strong>{submittedRole}</strong>. Our state coordinator will reach out to you on WhatsApp & Email within 24–48 hours with onboarding steps!
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onOpenPledge}
                    className="px-6 py-3 bg-taruvar-secondary text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Adopt a Tree in the Meantime
                  </button>
                  <button
                    onClick={() => setSubmittedRole(null)}
                    className="px-6 py-3 bg-taruvar-light text-taruvar-dark font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                
                <div className="space-y-1 pb-2 border-b border-taruvar-border">
                  <h3 className="text-lg font-black text-taruvar-dark flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-taruvar-secondary" />
                    <span>2. Complete Your Details</span>
                  </h3>
                  <p className="text-xs text-taruvar-muted">
                    Applying for: <span className="font-extrabold text-taruvar-secondary">{rolesList.find(r => r.id === selectedRole)?.title}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Noida / Pune"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">Your Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-taruvar-border bg-white"
                    >
                      <option value="Weekends (2-4 hours)">Weekends (2-4 hours)</option>
                      <option value="Flexible Weekdays">Flexible Weekdays</option>
                      <option value="Student Campus Hours">Student Campus Hours</option>
                      <option value="Full-time Volunteer / Intern">Full-time Volunteer / Intern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1">Key Skills / Interests</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g. Sapling Care, Social Media, Field Drives"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Why do you want to join Taruvar?</label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us a little about your environmental interest or community goals..."
                    className="w-full px-3.5 py-2 rounded-xl border border-taruvar-border focus:ring-2 focus:ring-taruvar-secondary"
                  ></textarea>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent-check"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 rounded text-taruvar-secondary focus:ring-taruvar-secondary"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-taruvar-muted">
                    I agree to receive movement updates, drive notices, and tree care coordination messages via WhatsApp & Email from Taruvar Foundation.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application • शामिल हों</span>
                </button>
              </form>
            )}

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: CURRENT PROJECTS & ACTIVE INITIATIVES                */}
      {/* ============================================================== */}
      {activeSection === 'current-projects' && (
        <div className="space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-taruvar-dark">Live Environmental Projects</h2>
            <p className="text-xs sm:text-sm text-taruvar-muted">
              Active nationwide initiatives you can support, participate in, or sponsor today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProjects.map((proj) => (
              <div 
                key={proj.id}
                className="bg-white rounded-3xl border border-taruvar-border shadow-card p-6 sm:p-8 space-y-5 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-taruvar-light border border-taruvar-border flex items-center justify-center text-2xl">
                      {proj.icon}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-taruvar-secondary uppercase tracking-wider">{proj.category}</span>
                    <h3 className="text-xl font-black text-taruvar-dark">{proj.title}</h3>
                    <p className="text-xs font-semibold text-taruvar-muted">{proj.subtitle}</p>
                  </div>

                  <p className="text-xs text-taruvar-dark/80 leading-relaxed font-normal">
                    {proj.desc}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-taruvar-muted">Movement Target:</span>
                      <span className="text-taruvar-secondary">{proj.target}</span>
                    </div>
                    <div className="w-full h-2.5 bg-taruvar-bg rounded-full overflow-hidden border border-taruvar-border">
                      <div 
                        className="h-full bg-gradient-to-r from-taruvar-primary to-taruvar-secondary rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-3 bg-taruvar-bg rounded-2xl border border-taruvar-border text-xs text-taruvar-muted flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Active In:</strong> {proj.locations}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveSection('join-roles');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full py-3 bg-taruvar-light hover:bg-taruvar-secondary hover:text-white text-taruvar-secondary font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Join This Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
