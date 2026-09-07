import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

export default function AuthPage({ onAuthSuccess, setActivePage, showToast }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.fullName,
                role: 'user',
                member_id: `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`
              }
            }
          });
          if (error) throw error;
          confetti({ particleCount: 60, spread: 60 });
          if (onAuthSuccess) {
            onAuthSuccess(data?.user || { email: formData.email, user_metadata: { full_name: formData.fullName, role: 'user' } }, 'Account created successfully! Welcome to Taruvar.');
          }
        } else {
          // Demo fallback
          confetti({ particleCount: 60, spread: 60 });
          if (onAuthSuccess) {
            onAuthSuccess({ email: formData.email, user_metadata: { full_name: formData.fullName, role: 'user' } }, 'Account created successfully!');
          }
        }
      } else {
        // Log in
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (error) throw error;
          if (onAuthSuccess) {
            onAuthSuccess(data?.user, 'Signed in successfully!');
          }
        } else {
          if (onAuthSuccess) {
            onAuthSuccess({ email: formData.email, user_metadata: { full_name: 'Tree Guardian', role: 'user' } }, 'Signed in successfully!');
          }
        }
      }

      setActivePage('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 pb-24 max-w-md mx-auto px-4 sm:px-6">
      
      {/* Header Badge */}
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 bg-taruvar-light text-taruvar-secondary rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-sm border border-taruvar-border">
          🌱
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Taruvar Guardian Network</span>
        </div>
        <h1 className="text-3xl font-black text-taruvar-dark">
          {mode === 'register' ? 'Join the Movement' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-taruvar-muted">
          {mode === 'register' 
            ? 'Create your Eco-Guardian account to adopt trees, track 5-month growth logs, and earn verification badges.' 
            : 'Sign in to access your adopted trees, monthly logs, and community ranking.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-taruvar-bg p-1.5 rounded-2xl border border-taruvar-border flex items-center mb-6">
        <button
          onClick={() => { setMode('register'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'register' 
              ? 'bg-white text-taruvar-dark shadow' 
              : 'text-taruvar-muted hover:text-taruvar-dark'
          }`}
        >
          Create Account / रजिस्टर
        </button>
        <button
          onClick={() => { setMode('login'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'login' 
              ? 'bg-white text-taruvar-dark shadow' 
              : 'text-taruvar-muted hover:text-taruvar-dark'
          }`}
        >
          User Log In / प्रवेश
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-taruvar-border shadow-card space-y-4">
        
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Naveen Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{mode === 'register' ? 'Register as Eco-Guardian' : 'Sign In to Profile'}</span>
            </>
          )}
        </button>

      </form>

      {/* Switch Helper */}
      <div className="mt-6 text-center text-xs text-taruvar-muted">
        {mode === 'register' ? (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-taruvar-secondary font-bold hover:underline"
            >
              Sign In here
            </button>
          </p>
        ) : (
          <p>
            New to Taruvar?{' '}
            <button
              onClick={() => setMode('register')}
              className="text-taruvar-secondary font-bold hover:underline"
            >
              Create an account
            </button>
          </p>
        )}
      </div>

    </div>
  );
}
