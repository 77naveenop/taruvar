import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login' | 'admin-login'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }

        // Standard signup always creates role: 'user'
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { 
                full_name: fullName,
                role: 'user' // Default normal user role
              }
            }
          });

          if (error) throw error;

          const userObj = data.user || { id: 'demo-user', email, user_metadata: { full_name: fullName, role: 'user' } };
          onAuthSuccess(userObj, `Welcome to Taruvar, ${fullName}! Account created.`);
        } else {
          const userObj = { id: 'demo-' + Date.now(), email, user_metadata: { full_name: fullName, role: 'user' } };
          onAuthSuccess(userObj, `Welcome to Taruvar, ${fullName}!`);
        }
      } else if (mode === 'login') {
        // Standard User Login
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          const userObj = data.user;
          const displayName = userObj.user_metadata?.full_name || userObj.email.split('@')[0];
          onAuthSuccess(userObj, `Welcome back, ${displayName}!`);
        } else {
          const displayName = fullName || email.split('@')[0];
          const userObj = { id: 'demo-' + Date.now(), email, user_metadata: { full_name: displayName, role: 'user' } };
          onAuthSuccess(userObj, `Welcome back, ${displayName}!`);
        }
      } else if (mode === 'admin-login') {
        // Owner Admin Login with Passkey
        if (adminPasskey !== 'TARUVAR_ADMIN_2026' && adminPasskey !== 'taruvar2026') {
          setErrorMsg('Invalid Admin Secret Passkey. Only the Taruvar founder can log in as Admin.');
          setLoading(false);
          return;
        }

        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          // Upgrade user metadata to role: 'admin'
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });

          const userObj = { ...data.user, user_metadata: { ...data.user.user_metadata, role: 'admin' } };
          onAuthSuccess(userObj, `Admin Portal unlocked! Welcome Admin.`);
        } else {
          const userObj = { id: 'admin-owner', email, user_metadata: { full_name: 'Taruvar Admin', role: 'admin' } };
          onAuthSuccess(userObj, `Welcome Admin!`);
        }
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
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
                {mode === 'register' ? 'Join Taruvar Movement' : mode === 'login' ? 'User Login' : 'Admin Portal Access'}
              </h3>
              <p className="text-[11px] text-taruvar-muted">taruvar.org • Simple & Secure</p>
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

        {/* Tab Switcher */}
        <div className="flex border-b border-taruvar-border bg-gray-50/50 p-1 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-taruvar-secondary shadow-sm' : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-taruvar-secondary shadow-sm' : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1" /> User Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin-login'); setErrorMsg(''); }}
            className={`px-3 py-2 font-bold rounded-xl transition-all ${
              mode === 'admin-login' ? 'bg-taruvar-dark text-white shadow-sm' : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
            title="Owner Admin Access"
          >
            <KeyRound className="w-3.5 h-3.5 inline" /> Admin
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

            {mode === 'admin-login' && (
              <div>
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Admin Secret Passkey *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-600 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter Admin Secret Passkey"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-amber-700 mt-1">Default Admin Passkey: TARUVAR_ADMIN_2026</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="text-xs">Processing...</span>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account (User Role)
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Log In to Account
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Unlock Admin Access
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="bg-taruvar-bg px-6 py-3 border-t border-taruvar-border text-center text-[11px] text-taruvar-muted shrink-0">
          Normal signups get standard User role. Only founders can unlock Admin mode.
        </div>

      </div>
    </div>
  );
}
