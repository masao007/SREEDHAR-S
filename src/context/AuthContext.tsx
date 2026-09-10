import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  loginDemoUser,
  logoutUser,
  syncUserProfile,
  updateUserProfileDoc,
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { INITIAL_WORKER } from '../data/mockData';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  signInAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleRole: (newRole?: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(INITIAL_WORKER);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const unsubDoc = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            } else {
              const newProf = await syncUserProfile(user);
              setProfile(newProf);
            }
            setLoading(false);
          });
          return () => unsubDoc();
        } catch (err) {
          console.error('Failed to sync user doc:', err);
          setLoading(false);
        }
      } else {
        // Fallback default guest profile
        setProfile(INITIAL_WORKER);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    await loginWithGoogle();
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
    setIsAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'worker') => {
    await registerWithEmail(email, pass, name, role);
    setIsAuthModalOpen(false);
  };

  const signInAsDemo = async (role: UserRole) => {
    await loginDemoUser(role);
    setIsAuthModalOpen(false);
  };

  const signOut = async () => {
    await logoutUser();
    setProfile(INITIAL_WORKER);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (firebaseUser) {
      await updateUserProfileDoc(firebaseUser.uid, data);
    }
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const toggleRole = async (newRole?: UserRole) => {
    const roleToSet = newRole || (profile?.role === 'worker' ? 'employer' : 'worker');
    if (firebaseUser) {
      await updateUserProfileDoc(firebaseUser.uid, { role: roleToSet });
    }
    setProfile((prev) => (prev ? { ...prev, role: roleToSet } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemo,
        signOut,
        updateProfileData,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
