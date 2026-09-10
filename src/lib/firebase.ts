import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (with databaseId specified from config)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'worker'
): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  await syncUserProfile(result.user, { name: displayName, role });
  return result.user;
}

/**
 * Sign in as Demo / Guest Worker or Employer
 */
export async function loginDemoUser(role: UserRole = 'worker', customName?: string): Promise<FirebaseUser> {
  const result = await signInAnonymously(auth);
  const name = customName || (role === 'employer' ? 'TechVenture Mumbai' : 'Arun Sharma');
  await syncUserProfile(result.user, {
    name,
    role,
    phone: '+91 98765 43210',
    address: 'Andheri East, Mumbai, MH',
  });
  return result.user;
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Sync user profile document in Firestore
 */
export async function syncUserProfile(
  fbUser: FirebaseUser,
  defaults: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data() as UserProfile;
    return {
      ...data,
      id: fbUser.uid,
      email: fbUser.email || data.email || 'guest@moneymaker.in',
    };
  }

  // Create new profile record
  const newProfile: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || defaults.name || (fbUser.isAnonymous ? 'Demo Worker' : 'New Worker'),
    email: fbUser.email || defaults.email || 'worker@moneymaker.in',
    phone: defaults.phone || '+91 98200 12345',
    role: defaults.role || 'worker',
    lat: defaults.lat || 19.1136,
    lng: defaults.lng || 72.8697,
    address: defaults.address || 'Andheri East, Mumbai, MH',
    rating: defaults.rating ?? 4.9,
    skills: defaults.skills || ['Delivery', 'Data Entry', 'Retail'],
    availability: defaults.availability || 'flexible',
    completedJobsCount: defaults.completedJobsCount ?? 14,
    totalEarnings: defaults.totalEarnings ?? 18450,
    avatar: fbUser.photoURL || defaults.avatar || '👨🏽',
    created_at: new Date().toISOString(),
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfileDoc(userId: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
}
