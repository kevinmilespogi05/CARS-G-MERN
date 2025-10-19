import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'patrol' | 'admin' | 'superAdmin';
  points: number;
  createdAt: Date;
  lastActive: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: 'user',
          points: 0,
          createdAt: new Date(),
          lastActive: new Date()
        };
        
        await setDoc(userDocRef, newUserProfile);
        setUserProfile(newUserProfile);
      } else {
        // Update last active
        const profileData = userDoc.data() as UserProfile;
        await setDoc(userDocRef, { ...profileData, lastActive: new Date() }, { merge: true });
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Create user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        role: 'user',
        points: 0,
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      await setDoc(userDocRef, newUserProfile);
      setUserProfile(newUserProfile);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect will handle fetching the user profile
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          setUserProfile(profileData);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
