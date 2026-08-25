import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, Heart, Sparkles, Users, GraduationCap, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GetInvolvedPage({ showToast }) {
  const [activeTab, setActiveTab] = useState('volunteer'); // 'volunteer' | 'student' | 'leader' | 'green-shakti' | 'partner'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    areaOfInterest: 'Tree Plantation & Care',
    message: '',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);

  const tabs = [
    { id: 'volunteer', label: 'Become a Volunteer', icon: '🤝' },
    { id: 'student', label: 'Student / Internship', icon: '🎓' },
    { id: 'leader', label: 'Community Leader', icon: '📢' },
    { id: 'green-shakti', label: 'Taruvar Green Shakti', icon: '👩' },
    { id: 'partner', label: 'Partner With Taruvar', icon: '🏢' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.consent) {
      alert('Please complete all required fields and accept communication consent.');
      return;
    }

    setSubmitted(true);
    confetti({ particleCount: 60, spread: 60 });
    if (showToast) {
      showToast(`Thank you, ${formData.name}! Your application for ${tabs.find(t => t.id === activeTab)?.label} has been recorded.`);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      areaOfInterest: 'Tree Plantation & Care',
      message: '',
      consent: false
    });
  };

  return (
    <div className="space-y-16 pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full border border-taruvar-primary/20">
          <Sparkles className="w-3.5 h-3.5" /> JOIN THE MOVEMENT • taruvar.org
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-taruvar-dark tracking-tight">
          There Is More Than One Way to Start.
        </h1>
        <p className="text-taruvar-muted text-base sm:text-lg leading-relaxed">
          Whether you want to volunteer on weekends, lead a campus initiative, or represent Taruvar Green Shakti, submit your details below to connect with us.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-taruvar-border shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 bg-taruvar-bg p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-taruvar-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-taruvar-muted mb-4">
            Select Your Pathway
          </h3>

          <div className="space-y-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSubmitted(false);
                }}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${
                  activeTab === t.id
                    ? 'bg-taruvar-secondary text-white font-bold shadow-md'
                    : 'bg-white text-taruvar-dark hover:bg-taruvar-light border border-taruvar-border'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-taruvar-border text-xs text-taruvar-muted space-y-2">
            <p className="flex items-center gap-1.5 text-taruvar-secondary font-bold">
              <ShieldCheck className="w-4 h-4" /> Honest Credentials
            </p>
            <p className="leading-relaxed">
              Certificates and documented internship experience are granted strictly based on verified work completed during campaigns.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-8 p-6 md:p-12">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-taruvar-secondary">
                  Application Form
                </span>
                <h3 className="text-2xl font-bold text-taruvar-dark mt-1">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <p className="text-xs text-taruvar-muted mt-1">
                  Collect essential information to register your interest with Taruvar (taruvar.org).
                </p>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="yourname@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                    City & State
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-3 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-3 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                  Primary Area of Interest
                </label>
                <select
                  name="areaOfInterest"
                  value={formData.areaOfInterest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50 bg-white"
                >
                  <option value="Tree Plantation & Care">🌱 Tree Plantation & Paalna Care</option>
                  <option value="Campus & Student Leadership">🎓 Campus & Student Leadership</option>
                  <option value="Women Environmental Leadership (Green Shakti)">👩 Taruvar Green Shakti (Women Leadership)</option>
                  <option value="Digital Platform & Tech Development">📱 Digital Tech & Tree Journey</option>
                  <option value="Institutional CSR Partnership">🏢 School / College / CSR Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                  Short Message / Motivation
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us briefly why you want to participate or lead..."
                  className="w-full px-4 py-3 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                ></textarea>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-0.5 text-taruvar-secondary rounded focus:ring-taruvar-primary"
                />
                <label htmlFor="consent" className="text-xs text-taruvar-muted leading-relaxed">
                  I consent to Taruvar contacting me regarding volunteer activities, movement updates, and official communications via email or phone. (taruvar.org)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
              >
                <Send className="w-4 h-4" /> Submit Application
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-taruvar-light text-taruvar-secondary rounded-full flex items-center justify-center mx-auto text-4xl shadow-glow">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-extrabold text-taruvar-dark">Application Received!</h3>
              <p className="text-sm text-taruvar-muted max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-taruvar-dark">{formData.name}</strong>. Your interest in <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> has been logged. Our movement coordinator will reach out to you at <span className="text-taruvar-secondary font-semibold">{formData.email}</span>.
              </p>

              <div className="p-4 bg-taruvar-bg max-w-md mx-auto rounded-2xl border border-taruvar-border text-xs text-taruvar-dark">
                Official Taruvar Registry • taruvar.org
              </div>

              <button
                onClick={resetForm}
                className="px-6 py-3 bg-taruvar-secondary text-white font-bold text-xs rounded-xl"
              >
                Submit Another Response
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
