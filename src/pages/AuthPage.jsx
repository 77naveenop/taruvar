import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthPage({ onAuthSuccess, setActivePage, showToast, redirectTarget }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const emailTrimmed = formData.email.trim().toLowerCase();
    const isAdminEmail = emailTrimmed === 'naveenpr332@gmail.com';
    const isMasterAdminPassword = formData.password === 'naveenpr332@gmail.com77';

    try {
      // 1. FORGOT / RESET PASSWORD FLOW
      if (mode === 'forgot') {
        if (!emailTrimmed) {
          throw new Error('Please enter your registered email address.');
        }

        if (!formData.newPassword || formData.newPassword.length < 6) {
          throw new Error('Please enter a new password with at least 6 characters.');
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match. Please re-enter carefully.');
        }

        // Check and update registered users database
        const registeredUsers = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
        const userIndex = registeredUsers.findIndex(u => u.email === emailTrimmed);

        if (userIndex >= 0) {
          registeredUsers[userIndex].password = formData.newPassword;
          localStorage.setItem('taruvar_registered_users', JSON.stringify(registeredUsers));
        } else if (isAdminEmail) {
          // Admin account reset
          registeredUsers.push({
            id: 'trv-admin-master-001',
            email: 'naveenpr332@gmail.com',
            password: formData.newPassword,
            user_metadata: {
              full_name: 'Taruvar Master Admin',
              role: 'admin',
              member_id: 'TRV-ADMIN-001'
            }
          });
          localStorage.setItem('taruvar_registered_users', JSON.stringify(registeredUsers));
        } else {
          // If user wasn't registered yet, create their fresh profile with this password
          const freshUser = {
            id: `trv-user-${Date.now()}`,
            email: emailTrimmed,
            password: formData.newPassword,
            user_metadata: {
              full_name: emailTrimmed.split('@')[0],
              role: 'user',
              member_id: `TRV-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`
            }
          };
          registeredUsers.push(freshUser);
          localStorage.setItem('taruvar_registered_users', JSON.stringify(registeredUsers));
        }

        setSuccessMsg('Your password has been successfully reset! You can now sign in with your new password.');
        if (showToast) showToast('Password reset successfully! Please sign in.');
        confetti({ particleCount: 50, spread: 60 });
        
        // Switch back to login mode with prefilled email
        setTimeout(() => {
          setFormData(prev => ({ ...prev, password: prev.newPassword, newPassword: '', confirmPassword: '' }));
          setMode('login');
        }, 1500);

        return;
      }

      // 2. MASTER ADMIN INSTANT AUTHENTICATION
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

        localStorage.setItem('taruvar_session_user', JSON.stringify(masterAdminUser));
        confetti({ particleCount: 70, spread: 70 });
        
        if (onAuthSuccess) {
          onAuthSuccess(masterAdminUser, 'Welcome Admin! Verification desk unlocked.');
        }
        setActivePage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 3. USER REGISTRATION
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

        localStorage.setItem('taruvar_session_user', JSON.stringify(newUser));
        confetti({ particleCount: 70, spread: 60 });

        if (onAuthSuccess) {
          onAuthSuccess(newUser, isAdminEmail ? 'Admin Account Created & Activated!' : 'Account created successfully! Welcome to Taruvar.');
        }

        if (isAdminEmail || userRole === 'admin') {
          setActivePage('admin');
        } else if (redirectTarget === 'adopt') {
          setActivePage('adopt');
        } else if (redirectTarget === 'explore') {
          setActivePage('explore');
        } else {
          setActivePage('profile');
        }
      } else {
        // 4. USER / ADMIN SIGN IN
        let authenticatedUser = null;

        // Local persistent user database verification
        const registeredUsers = JSON.parse(localStorage.getItem('taruvar_registered_users') || '[]');
        const localUser = registeredUsers.find(u => u.email === emailTrimmed);

        if (localUser) {
          if (localUser.password !== formData.password) {
            throw new Error('Incorrect password. Please verify your password or use "Forgot password?" below.');
          }
          authenticatedUser = {
            id: localUser.id,
            email: localUser.email,
            user_metadata: localUser.user_metadata
          };
        } else if (isAdminEmail) {
          // Admin fallback
          if (!isMasterAdminPassword) {
            throw new Error('Invalid Admin password. Please check your credentials or reset password.');
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
            throw new Error('Account not found. Please click "Create Account" tab above or use "Forgot password?" to set a password.');
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
        } else if (redirectTarget === 'explore') {
          setActivePage('explore');
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
          {mode === 'register' 
            ? 'Join the Movement' 
            : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Sign In to Taruvar'}
        </h1>
        <p className="text-xs text-taruvar-muted leading-relaxed">
          {redirectTarget === 'adopt' && (
            <span className="text-taruvar-secondary font-bold block mb-1">
              🌱 Please sign in or register to complete your tree adoption.
            </span>
          )}
          {redirectTarget === 'explore' && (
            <span className="text-taruvar-secondary font-bold block mb-1">
              🌟 Please sign in or register to watch and share Explore Reels.
            </span>
          )}
          {mode === 'register' 
            ? 'Create your Eco-Guardian account to adopt trees, track 5-month growth logs, and earn verification badges.' 
            : mode === 'forgot'
              ? 'Enter your registered email and choose a new password to restore account access.'
              : 'Enter your email and password to access your profile, adopted trees, and verification desk.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      {mode !== 'forgot' ? (
        <div className="bg-taruvar-bg p-1.5 rounded-2xl border border-taruvar-border flex items-center mb-6 gap-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
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
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'register' 
                ? 'bg-white text-taruvar-dark shadow-xs font-extrabold' 
                : 'text-taruvar-muted hover:text-taruvar-dark'
            }`}
          >
            Create Account / रजिस्टर
          </button>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between bg-taruvar-bg p-2 rounded-2xl border border-taruvar-border">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-taruvar-secondary hover:text-taruvar-hover px-3 py-1.5 rounded-xl hover:bg-white transition-all cursor-pointer"
          >
            ← Back to Sign In
          </button>
          <span className="text-[11px] font-bold text-taruvar-muted pr-3 uppercase">Account Recovery</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

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

        {mode === 'forgot' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-taruvar-border text-xs focus:outline-none focus:ring-2 focus:ring-taruvar-primary/50"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-taruvar-dark uppercase tracking-wider">
                Password *
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-[11px] font-bold text-taruvar-secondary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
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
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-taruvar-secondary hover:bg-taruvar-hover text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {mode === 'register' 
                  ? 'Register as Eco-Guardian' 
                  : mode === 'forgot'
                    ? 'Reset Password & Proceed'
                    : 'Sign In'}
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
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-taruvar-secondary font-bold hover:underline cursor-pointer"
            >
              Sign In here
            </button>
          </p>
        ) : mode === 'forgot' ? (
          <p>
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-taruvar-secondary font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            New to Taruvar?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
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
