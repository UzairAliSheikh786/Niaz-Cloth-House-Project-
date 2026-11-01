import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { clientCache } from '../utils/cache';
import { analytics } from '../utils/analytics';
import { errorTracker } from '../utils/errorTracker';

export interface PatronProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  address?: string;
  createdAt: string;
  lastLoginAt?: string;
  isOnline?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userProfile: PatronProfile | null;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup' | 'forgot' | 'profile';
  openAuthModal: (view?: 'login' | 'signup' | 'forgot' | 'profile') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string, city?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<PatronProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  mapAuthError: (error: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<PatronProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'forgot' | 'profile'>('login');

  // Admin authorization check (hardened to verified admin email)
  const isAdmin = user ? (user.email === 'uzairaliuzairali640@gmail.com' || user.email === 'admin@nch.com' || user.email === 'admin@niazclothhouse.com') : false;

  useEffect(() => {
    analytics.init();
    errorTracker.init();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        errorTracker.addBreadcrumb(`Auth state changed: Logged in (${currentUser.email})`);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          const assignedRole = currentUser.email === 'uzairaliuzairali640@gmail.com' 
            ? 'Super Administrator' 
            : (currentUser.email === 'admin@nch.com' || currentUser.email === 'admin@niazclothhouse.com' ? 'Store Administrator' : 'Customer');

          const now = new Date().toISOString();
          if (snap.exists()) {
            const data = snap.data() as PatronProfile;
            const updatedProfile: PatronProfile = {
              ...data,
              email: currentUser.email || data.email,
              displayName: currentUser.displayName || data.displayName || 'Customer',
              photoURL: currentUser.photoURL || data.photoURL || '',
              isOnline: true,
              lastLoginAt: now,
              role: assignedRole,
            };
            await setDoc(userDocRef, updatedProfile, { merge: true });
            setUserProfile(updatedProfile);
          } else {
            const newProfile: PatronProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Customer',
              photoURL: currentUser.photoURL || '',
              phone: '',
              city: 'Rawalpindi',
              createdAt: now,
              lastLoginAt: now,
              isOnline: true,
              role: assignedRole,
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          errorTracker.captureException(err, { category: 'auth' });
        }
      } else {
        errorTracker.addBreadcrumb('Auth state changed: Unauthenticated');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (view: 'login' | 'signup' | 'forgot' | 'profile' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const mapAuthError = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address format.';
      case 'auth/user-disabled':
        return 'This account has been deactivated. Please contact our shop support at 0334-6565636.';
      case 'auth/user-not-found':
        return 'No account was found with this email. Please check your spelling or sign up.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'The password entered is incorrect. Please try again or use Forgot Password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters with a combination of letters and numbers.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Access has been temporarily throttled for security. Please try again in 5 minutes.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing verification.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please verify your internet connection and retry.';
      default:
        return error?.message || 'Authentication request could not be processed. Please check your credentials.';
    }
  };

  const signInWithGoogle = async () => {
    try {
      errorTracker.addBreadcrumb('Initiating Google sign in');
      const result = await signInWithPopup(auth, googleProvider);
      analytics.track('login_success', { method: 'google', email: result.user.email });
      closeAuthModal();
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      errorTracker.addBreadcrumb(`Email login attempt for ${email}`);
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      analytics.track('login_success', { method: 'password', email: result.user.email });
      closeAuthModal();
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone?: string, city?: string) => {
    try {
      errorTracker.addBreadcrumb(`Email sign up for ${email}`);
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Update display name
      if (name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() });
      }

      // Send email verification
      await sendEmailVerification(result.user).catch((e) => {
        console.warn('Verification email dispatch note:', e.message);
      });

      // Create profile document
      const newProfile: PatronProfile = {
        uid: result.user.uid,
        email: result.user.email || email.trim(),
        displayName: name.trim() || 'Customer',
        phone: phone || '',
        city: city || 'Rawalpindi',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', result.user.uid), newProfile);
      setUserProfile(newProfile);

      analytics.track('signup_success', { method: 'password', email: result.user.email });
      closeAuthModal();
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      errorTracker.addBreadcrumb(`Password reset requested for ${email}`);
      await sendPasswordResetEmail(auth, email.trim());
      analytics.track('password_reset_sent', { email: email.trim() });
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('No user currently logged in');
    try {
      await sendEmailVerification(auth.currentUser);
      analytics.track('verification_email_resent');
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      errorTracker.addBreadcrumb('Customer logging out, clearing state');
      if (auth.currentUser) {
        try {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            { isOnline: false, lastActiveAt: new Date().toISOString() },
            { merge: true }
          );
        } catch {
          // ignore
        }
      }
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      clientCache.clear();
      
      // Clear patron session storage
      try {
        sessionStorage.removeItem('nch_analytics_events');
        localStorage.removeItem('nch_user_session');
      } catch {}

      analytics.track('logout');
      closeAuthModal();
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (data: Partial<PatronProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
      analytics.track('profile_updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      errorTracker.captureException(err, { category: 'auth' });
      throw err;
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    const currentUser = auth.currentUser;
    const uid = currentUser.uid;

    try {
      errorTracker.addBreadcrumb(`GDPR permanent erasure requested for UID ${uid}`);
      
      // 1. Delete Firestore user record
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Firestore doc delete note:', err);
      }

      // 2. Delete Firebase Auth user
      await deleteUser(currentUser);

      // 3. Purge client cache & cookies
      clientCache.clear();
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      setUser(null);
      setUserProfile(null);
      closeAuthModal();
      analytics.track('account_deleted_gdpr');
    } catch (error) {
      errorTracker.captureException(error, { category: 'auth' });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
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
        mapAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
