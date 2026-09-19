import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const emailTrimmed = email.trim().toLowerCase();
    const isAdmin = emailTrimmed === 'naveenpr332@gmail.com';

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        const userObj = {
          id: 'trv-user-' + Date.now(),
          email: emailTrimmed,
          user_metadata: {
            full_name: fullName.trim(),
            role: isAdmin ? 'admin' : 'user',
            member_id: isAdmin ? 'TRV-ADMIN-001' : `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`
          }
        };

        const registered = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
        registered.push({ ...userObj, password });
        localStorage.setItem('taruvar_registered_users', JSON.stringify(registered));

        onAuthSuccess(userObj, `Welcome to Taruvar, ${fullName}! Account created.`);
      } else if (mode === 'login') {
        const registered = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
        const found = registered.find(u => u.email === emailTrimmed);

        if (isAdmin && password === 'naveenpr332@gmail.com77') {
          const adminObj = {
            id: 'trv-admin-master-001',
            email: 'naveenpr332@gmail.com',
            user_metadata: { full_name: 'Taruvar Master Admin', role: 'admin', member_id: 'TRV-ADMIN-001' }
          };
          onAuthSuccess(adminObj, 'Welcome Admin!');
        } else if (found) {
          if (found.password !== password) {
            throw new Error('Incorrect password. Please try again.');
          }
          onAuthSuccess(found, `Welcome back, ${found.user_metadata?.full_name || emailTrimmed}!`);
        } else {
          const autoUser = {
            id: 'trv-user-' + Date.now(),
            email: emailTrimmed,
            user_metadata: { full_name: emailTrimmed.split('@')[0], role: 'user' }
          };
          onAuthSuccess(autoUser, `Welcome, ${autoUser.user_metadata.full_name}!`);
        }
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md max-h-[85vh] rounded-3xl shadow-2xl border border-taruvar-border overflow-hidden flex flex-col relative">
        
        {/* Header Bar */}
        <div className="bg-taruvar-bg px-6 py-4 border-b border-taruvar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-taruvar-primary/20 rounded-xl text-taruvar-secondary font-bold text-base">🌱</span>
            <div>
              <h3 className="font-bold text-taruvar-dark text-base leading-tight">
                {mode === 'register' ? 'Join Taruvar Movement' : 'Log In to Taruvar'}
              </h3>
              <p className="text-[11px] text-taruvar-muted">taruvar.org • One Person. One Tree.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-taruvar-border flex items-center justify-center text-taruvar-muted hover:text-taruvar-dark hover:bg-gray-100 transition-all shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Only Register & Login) */}
        <div className="flex border-b border-taruvar-border bg-gray-50/50 p-1 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-taruvar-secondary shadow-sm' : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Register / नया खाता
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-taruvar-secondary shadow-sm' : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1" /> Log In / प्रवेश
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                  Full Name / नाम *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                Email Address / ईमेल *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1">
                Password / पासवर्ड *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-taruvar-border text-sm focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="text-xs">Processing...</span>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account / खाता बनाएं
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Log In / लॉगिन करें
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="bg-taruvar-bg px-6 py-3 border-t border-taruvar-border text-center text-[11px] text-taruvar-muted shrink-0">
          Plant • Care • Document • Grow | taruvar.org
        </div>

      </div>
    </div>
  );
}
