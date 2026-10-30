import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  LogOut, 
  Eye, 
  EyeOff,
  ShoppingBag,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';

export const PatronAuthModal: React.FC = () => {
  const { 
    user, 
    userProfile, 
    isAuthModalOpen, 
    authModalView, 
    openAuthModal, 
    closeAuthModal,
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset, 
    resendVerificationEmail, 
    logout, 
    updateUserProfile, 
    deleteAccount, 
    mapAuthError 
  } = useAuth();

  const { orders, showToast } = useShop();
  const { navigateTo } = useNavigation();

  // Customer Form states
  const [customerAuthMode, setCustomerAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Rawalpindi');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Admin Portal form states
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminIsLoading, setAdminIsLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Edit profile states
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editCity, setEditCity] = useState(userProfile?.city || 'Rawalpindi');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync mode with authModalView when opened
  useEffect(() => {
    if (authModalView === 'signup') {
      setCustomerAuthMode('signup');
    } else if (authModalView === 'login') {
      setCustomerAuthMode('signin');
    }
    setErrorMessage('');
    setSuccessMessage('');
    setAdminError('');
  }, [authModalView, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Customer Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      showToast('Logged in successfully as Customer!');
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Customer Email Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Phone validation (Pakistani format e.g. 03xx-xxxxxxx or +92...)
    if (phone.trim() && !/^((\+92)|0)?3[0-9]{9}$/.test(phone.replace(/[\s-]/g, ''))) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 0334-6565636).');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, name, phone, city);
      setSuccessMessage('Customer account created successfully! Welcome to Niaz Cloth House.');
      showToast('Account registered successfully!');
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Portal Login (Server Authenticated)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator username or password.');
      }

      sessionStorage.setItem('niaz_admin_token', data.token);
      localStorage.setItem('niaz_admin_token', data.token);
      closeAuthModal();
      showToast(`Welcome back, ${data.user?.fullName || 'Admin'}! Staff portal unlocked.`);
      navigateTo('admin');
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAdminIsLoading(false);
    }
  };

  // 1-Click Quick Admin Sign In
  const handleQuickAdminLogin = async () => {
    setAdminUsername('admin');
    setAdminPassword('Niaz1977#');
    setAdminError('');
    setAdminIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'Niaz1977#',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      sessionStorage.setItem('niaz_admin_token', data.token);
      localStorage.setItem('niaz_admin_token', data.token);
      closeAuthModal();
      showToast('Logged in as Store Administrator (Haji Niaz Ahmad). Opening Admin Panel...');
      navigateTo('admin');
    } catch (err: any) {
      setAdminError(err.message || 'Quick login failed.');
    } finally {
      setAdminIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide the email address associated with your account.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMessage('Password reset link has been dispatched to your email. Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await resendVerificationEmail();
      setSuccessMessage('Verification email has been re-sent. Please verify your address.');
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrorMessage('');
    try {
      await updateUserProfile({ phone: editPhone, city: editCity });
      setSuccessMessage('Customer details updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage('Failed to save profile updates. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await deleteAccount();
    } catch (err: any) {
      setErrorMessage(mapAuthError(err));
      setIsLoading(false);
    }
  };

  const userOrders = user
    ? orders.filter((o) => (o as any).userId === user.uid || o.customer.fullName.toLowerCase().includes((user.displayName || '').toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`bg-white w-full border border-[#E2E8F0] shadow-2xl overflow-hidden relative my-6 animate-in zoom-in-95 duration-200 ${
          authModalView === 'profile' || authModalView === 'forgot'
            ? 'max-w-lg'
            : 'max-w-4xl'
        }`}
      >
        {/* Top Header Strip */}
        <div className="bg-[#1C1917] text-[#F8FAFC] p-4 sm:p-5 border-b border-[#38332E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0284C7]/30 border border-[#38BDF8]/50 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="auth-modal-title" className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  {authModalView === 'profile' 
                    ? 'My Customer Account & Profile' 
                    : authModalView === 'forgot'
                    ? 'Reset Password'
                    : 'Account & Staff Access Portal'}
                </h3>
              </div>
              <p className="text-[11px] text-white/60">
                {authModalView === 'profile' || authModalView === 'forgot'
                  ? 'Niaz Cloth House · Paris Bazaar, Rawalpindi'
                  : 'Select your portal: Customer Account or Store Admin Panel'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-sm"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Alert Banner */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Global Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW A: FORGOT PASSWORD */}
        {/* ======================================================== */}
        {authModalView === 'forgot' && (
          <div className="p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-[#1C1917]/75 leading-relaxed">
                Enter your registered customer email address and we will dispatch a password reset link to your email.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#1C1917]/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full text-xs py-2 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] active:bg-[#075985] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-3 border-t border-[#E2E8F0] text-center text-xs">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-[#0284C7] font-semibold hover:underline"
                >
                  ← Back to Portal Selection
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW B: CUSTOMER PROFILE & SETTINGS */}
        {/* ======================================================== */}
        {authModalView === 'profile' && user && (
          <div className="p-6 space-y-5">
            {/* Profile Card */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#E2E8F0]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Customer'}
                  className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-lg font-serif font-bold">
                  {(user.displayName || 'C')[0]}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm text-[#1C1917] truncate">
                    {user.displayName || 'Customer'}
                  </h4>
                </div>
                <p className="text-xs text-[#1C1917]/60 truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Email Verification Banner */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Email Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-900">Email Unverified</span>
                  </>
                )}
              </div>

              {!user.emailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="text-[11px] font-semibold text-[#0284C7] hover:underline"
                >
                  Resend Email
                </button>
              )}
            </div>

            {/* Edit Contact & Delivery Details */}
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-1 text-xs">
              <span className="font-bold text-[#1C1917] block uppercase tracking-wider text-[10px]">
                Delivery Information (Saved for Checkout)
              </span>

              <div>
                <label className="block text-[#1C1917]/70 font-medium mb-1">WhatsApp / Mobile Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0334-6565636"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-[#1C1917]/70 font-medium mb-1">City in Pakistan</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Rawalpindi"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Save Details</span>}
              </button>
            </form>

            {/* Quick Staff Switch Button */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span className="text-[#1C1917]/80">Store Administrator or Staff?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  navigateTo('admin');
                }}
                className="text-[#0284C7] font-bold hover:underline"
              >
                Open Admin Panel →
              </button>
            </div>

            {/* Actions & Sign Out */}
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <button
                type="button"
                onClick={logout}
                className="w-full py-2 px-3 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              {/* GDPR Permanent Delete Account */}
              {!isDeletingConfirm ? (
                <button
                  type="button"
                  onClick={() => setIsDeletingConfirm(true)}
                  className="w-full py-1.5 text-[11px] text-red-700 hover:text-red-900 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account & Purge Data (GDPR Right to Erasure)</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                  <p className="font-semibold text-red-800">
                    Are you sure you want to permanently erase your account and all associated order tokens? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccountConfirm}
                      disabled={isLoading}
                      className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs transition-colors"
                    >
                      {isLoading ? 'Erasing...' : 'Yes, Delete Permanently'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeletingConfirm(false)}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW C: SIDE-BY-SIDE DUAL PORTAL (CUSTOMER & ADMIN) */}
        {/* ======================================================== */}
        {(authModalView === 'login' || authModalView === 'signup') && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
            
            {/* ---------------------------------------------------- */}
            {/* SIDE 1 (LEFT): CUSTOMER / USER PORTAL */}
            {/* ---------------------------------------------------- */}
            <div className="p-5 sm:p-6 bg-[#F8FAFC]/60 flex flex-col justify-between space-y-4">
              <div>
                {/* Customer Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#0284C7]/10 text-[#0284C7] rounded-sm">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-[#1C1917]">
                        As a Customer / User
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#0284C7]/10 text-[#0284C7]">
                    Shoppers
                  </span>
                </div>

                <p className="text-xs text-[#1C1917]/70 mt-2 leading-relaxed font-sans">
                  Browse pure unstitched fabrics, save delivery details, and track your courier orders.
                </p>

                {/* Customer Mode Tabs: Sign In vs Sign Up */}
                <div className="flex border border-[#E2E8F0] bg-white mt-4 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerAuthMode('signin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                      customerAuthMode === 'signin'
                        ? 'bg-[#0284C7] text-white shadow-2xs'
                        : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                    }`}
                  >
                    Customer Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerAuthMode('signup');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
                      customerAuthMode === 'signup'
                        ? 'bg-[#0284C7] text-white shadow-2xs'
                        : 'text-[#1C1917]/70 hover:text-[#1C1917]'
                    }`}
                  >
                    Create Account (Sign Up)
                  </button>
                </div>

                {/* Google 1-Click Fast Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={isLoading}
                    className="w-full py-2 px-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{customerAuthMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-3.5">
                  <div className="border-t border-[#E2E8F0] w-full" />
                  <span className="bg-[#F8FAFC] px-2 text-[10px] uppercase tracking-wider text-[#1C1917]/50 font-bold absolute">
                    Or with Email
                  </span>
                </div>

                {/* CUSTOMER SIGN IN FORM */}
                {customerAuthMode === 'signin' ? (
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="customer@example.com"
                          className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-[#1C1917]">Password</label>
                        <button
                          type="button"
                          onClick={() => openAuthModal('forgot')}
                          className="text-[11px] text-[#0284C7] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full text-xs py-2 pl-9 pr-9 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#1C1917]/40 hover:text-[#1C1917]"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Sign In as Customer</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* CUSTOMER SIGN UP FORM */
                  <form onSubmit={handleEmailSignUp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Tariq Mehmood"
                          className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tariq@example.com"
                          className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Password (min 6 characters) *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full text-xs py-2 pl-9 pr-9 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#1C1917]/40 hover:text-[#1C1917]"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                          Phone (WhatsApp)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0334-6565636"
                          className="w-full text-xs py-2 px-2.5 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                          City in Pakistan
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Rawalpindi"
                          className="w-full text-xs py-2 px-2.5 bg-white border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Create Customer Account</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom Customer Guarantee */}
              <div className="pt-2 text-[11px] text-[#1C1917]/60 flex items-center gap-1.5 border-t border-[#E2E8F0]">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nationwide Cash on Delivery (COD) across all cities of Pakistan</span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SIDE 2 (RIGHT): STORE ADMIN / STAFF PORTAL */}
            {/* ---------------------------------------------------- */}
            <div className="p-5 sm:p-6 bg-white flex flex-col justify-between space-y-4">
              <div>
                {/* Admin Header Tag */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#1C1917] text-[#38BDF8] rounded-sm">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-[#1C1917]">
                        As Store Admin / Staff
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#1C1917] text-[#38BDF8]">
                    Staff Only
                  </span>
                </div>

                <p className="text-xs text-[#1C1917]/70 mt-2 leading-relaxed font-sans">
                  Store management access to update fabric stock, modify prices, process customer orders, and sync WhatsApp catalog.
                </p>

                {/* Admin Alert Error */}
                {adminError && (
                  <div className="mt-3 bg-red-50 border border-red-200 p-2.5 text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="leading-tight">{adminError}</p>
                  </div>
                )}

                {/* Admin Login Form */}
                <form onSubmit={handleAdminLogin} className="space-y-3.5 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Admin Username / Staff Email *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                      <input
                        type="text"
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full text-xs py-2 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-[#1C1917]">
                        Admin Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminUsername('admin');
                          setAdminPassword('Niaz1977#');
                        }}
                        className="text-[10px] text-[#0284C7] hover:underline font-semibold"
                        title="Fill demo store credentials"
                      >
                        Auto-fill Credentials
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1C1917]/40" />
                      <input
                        type={adminShowPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs py-2 pl-9 pr-9 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1C1917] focus:outline-none focus:border-[#0284C7] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setAdminShowPassword(!adminShowPassword)}
                        className="absolute right-3 top-2.5 text-[#1C1917]/40 hover:text-[#1C1917]"
                      >
                        {adminShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Admin Sign In Button */}
                  <button
                    type="submit"
                    disabled={adminIsLoading}
                    className="w-full py-2.5 px-4 bg-[#1C1917] hover:bg-[#0284C7] active:bg-[#0369A1] text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                  >
                    {adminIsLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                        <span>Sign In as Admin & Open Panel →</span>
                      </>
                    )}
                  </button>

                  {/* Quick 1-Click Launch Button for Immediate Access */}
                  <button
                    type="button"
                    onClick={handleQuickAdminLogin}
                    disabled={adminIsLoading}
                    className="w-full py-2 px-3 bg-[#F8FAFC] hover:bg-[#F2ECE5] border border-[#0284C7]/30 text-xs font-semibold text-[#0284C7] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>⚡ 1-Click Fast Admin Sign In (Demo)</span>
                  </button>
                </form>

                {/* Default Credentials Notice */}
                <div className="mt-4 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#1C1917]/70 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>Username: <strong>admin</strong></span>
                    <span>Password: <strong>Niaz1977#</strong></span>
                  </div>
                  <p className="text-[10px] text-[#1C1917]/50 pt-0.5">
                    Protected with SHA-256 server authentication and rate limiting.
                  </p>
                </div>
              </div>

              {/* Bottom Admin Feature Highlights */}
              <div className="pt-2 text-[11px] text-[#1C1917]/60 flex items-center gap-1.5 border-t border-[#E2E8F0]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>Full access to Inventory, Orders Board & WhatsApp catalog</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
