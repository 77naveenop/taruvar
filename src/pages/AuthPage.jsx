import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

export default function AuthPage({ onAuthSuccess, setActivePage, showToast, redirectTarget }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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

    const emailTrimmed = formData.email.trim().toLowerCase();
    const isAdminEmail = emailTrimmed === 'naveenpr332@gmail.com';
    const isMasterAdminPassword = formData.password === 'naveenpr332@gmail.com77';

    try {
      // 1. MASTER ADMIN INSTANT AUTHENTICATION
      if (isAdminEmail && isMasterAdminPassword) {
        const masterAdminUser = {
          id: 'trv-admin-master-001',
          email: 'naveenpr332@gmail.com',
          user_metadata: {
            full_name: 'Taruvar Master Admin',
            role: 'admin',
            member_id: 'TRV-ADMIN-001'
          }
        };

        // Try background Supabase sync
        if (supabase) {
          try {
            await supabase.auth.signInWithPassword({
              email: emailTrimmed,
              password: formData.password
            });
          } catch (e) {
            // Non-blocking
          }
        }

        localStorage.setItem('taruvar_session_user', JSON.stringify(masterAdminUser));
        confetti({ particleCount: 70, spread: 70 });
        
        if (onAuthSuccess) {
          onAuthSuccess(masterAdminUser, 'Welcome Admin! Verification desk unlocked.');
        }
        setActivePage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 2. USER REGISTRATION
      if (mode === 'register') {
        const userRole = isAdminEmail ? 'admin' : 'user';
        const memberId = isAdminEmail 
          ? 'TRV-ADMIN-001' 
          : `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newUser = {
          id: `trv-user-${Date.now()}`,
          email: emailTrimmed,
          user_metadata: {
            full_name: formData.fullName.trim() || 'Eco-Guardian',
            role: userRole,
            member_id: memberId
          }
        };

        // Save to local registered users database
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
          const existingIndex = registeredUsers.findIndex(u => u.email === emailTrimmed);
          if (existingIndex >= 0) {
            registeredUsers[existingIndex] = { ...newUser, password: formData.password };
          } else {
            registeredUsers.push({ ...newUser, password: formData.password });
          }
          localStorage.setItem('taruvar_registered_users', JSON.stringify(registeredUsers));
        } catch (e) {
          console.error(e);
        }

        // Supabase registration if enabled
        if (supabase) {
          try {
            await supabase.auth.signUp({
              email: emailTrimmed,
              password: formData.password,
              options: {
                data: {
                  full_name: formData.fullName.trim(),
                  role: userRole,
                  member_id: memberId
                }
              }
            });
          } catch (supabaseErr) {
            console.warn('Supabase background signup:', supabaseErr.message);
          }
        }

        localStorage.setItem('taruvar_session_user', JSON.stringify(newUser));
        confetti({ particleCount: 70, spread: 60 });

        if (onAuthSuccess) {
          onAuthSuccess(newUser, isAdminEmail ? 'Admin Account Created & Activated!' : 'Account created successfully! Welcome to Taruvar.');
        }

        if (isAdminEmail || userRole === 'admin') {
          setActivePage('admin');
        } else if (redirectTarget === 'adopt') {
          setActivePage('adopt');
        } else {
          setActivePage('profile');
        }
      } else {
        // 3. USER / ADMIN SIGN IN
        let authenticatedUser = null;

        // Try Supabase auth first if available
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: emailTrimmed,
              password: formData.password
            });
            if (!error && data?.user) {
              authenticatedUser = data.user;
              if (isAdminEmail) {
                authenticatedUser.user_metadata = { ...authenticatedUser.user_metadata, role: 'admin' };
              }
            }
          } catch (e) {
            console.warn('Supabase signin attempt:', e.message);
          }
        }

        // Fallback to local user database
        if (!authenticatedUser) {
          const registeredUsers = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
          const localUser = registeredUsers.find(u => u.email === emailTrimmed);

          if (localUser) {
            if (localUser.password !== formData.password) {
              throw new Error('Incorrect password. Please verify and try again.');
            }
            authenticatedUser = {
              id: localUser.id,
              email: localUser.email,
              user_metadata: localUser.user_metadata
            };
          } else if (isAdminEmail) {
            // Admin fallback
            if (!isMasterAdminPassword) {
              throw new Error('Invalid Admin password. Please check your credentials.');
            }
            authenticatedUser = {
              id: 'trv-admin-master-001',
              email: 'naveenpr332@gmail.com',
              user_metadata: {
                full_name: 'Taruvar Master Admin',
                role: 'admin',
                member_id: 'TRV-ADMIN-001'
              }
            };
          } else {
            // Auto-create or login seamlessly for valid password
            if (formData.password.length >= 6) {
              authenticatedUser = {
                id: `trv-user-${Date.now()}`,
                email: emailTrimmed,
                user_metadata: {
                  full_name: emailTrimmed.split('@')[0],
                  role: 'user',
                  member_id: `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`
                }
              };
              registeredUsers.push({ ...authenticatedUser, password: formData.password });
              localStorage.setItem('taruvar_registered_users', JSON.stringify(registeredUsers));
            } else {
              throw new Error('Account not found. Please click "Create Account" tab above to register.');
            }
          }
        }

        const isUserAdmin = isAdminEmail || authenticatedUser?.user_metadata?.role === 'admin';
        if (isUserAdmin && authenticatedUser) {
          authenticatedUser.user_metadata = { ...authenticatedUser.user_metadata, role: 'admin' };
        }

        localStorage.setItem('taruvar_session_user', JSON.stringify(authenticatedUser));
        confetti({ particleCount: 60, spread: 60 });

        if (onAuthSuccess) {
          onAuthSuccess(authenticatedUser, isUserAdmin ? 'Welcome Admin! Verification desk unlocked.' : 'Signed in successfully!');
        }

        if (isUserAdmin) {
          setActivePage('admin');
        } else if (redirectTarget === 'adopt') {
          setActivePage('adopt');
        } else {
          setActivePage('profile');
        }
      }

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
        <div className="w-16 h-16 bg-taruvar-light text-taruvar-secondary rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-xs border border-taruvar-border">
          🌱
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-taruvar-light text-taruvar-secondary text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Taruvar Guardian Network</span>
        </div>
        <h1 className="text-3xl font-black text-taruvar-dark">
          {mode === 'register' ? 'Join the Movement' : 'Sign In to Taruvar'}
        </h1>
        <p className="text-xs text-taruvar-muted leading-relaxed">
          {redirectTarget === 'adopt' && (
            <span className="text-taruvar-secondary font-bold block mb-1">
              🌱 Please sign in or register to complete your tree adoption.
            </span>
          )}
          {mode === 'register' 
            ? 'Create your Eco-Guardian account to adopt trees, track 5-month growth logs, and earn verification badges.' 
            : 'Enter your email and password to access your profile, adopted trees, and verification desk.'}
        </p>
      </div>

      {/* Clean Mode Switcher Tabs (Only 2 Public Tabs) */}
      <div className="bg-taruvar-bg p-1.5 rounded-2xl border border-taruvar-border flex items-center mb-6 gap-1">
        <button
          type="button"
          onClick={() => { setMode('login'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'login' 
              ? 'bg-white text-taruvar-dark shadow-xs font-extrabold' 
              : 'text-taruvar-muted hover:text-taruvar-dark'
          }`}
        >
          Sign In / प्रवेश
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setErrorMsg(''); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'register' 
              ? 'bg-white text-taruvar-dark shadow-xs font-extrabold' 
              : 'text-taruvar-muted hover:text-taruvar-dark'
          }`}
        >
          Create Account / रजिस्टर
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
          className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {mode === 'register' ? 'Register as Eco-Guardian' : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
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
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className="text-taruvar-secondary font-bold hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </p>
        ) : (
          <p>
            New to Taruvar?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className="text-taruvar-secondary font-bold hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </p>
        )}
      </div>

    </div>
  );
}
