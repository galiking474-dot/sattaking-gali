"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import type { Admin } from "@/types";

interface AuthState {
  user: User | null;
  admin: Admin | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  admin: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        const adminDoc = await getDoc(doc(getDb(), "admins", firebaseUser.uid));
        if (adminDoc.exists() && adminDoc.data().isActive) {
          setUser(firebaseUser);
          setAdmin(adminDoc.data() as Admin);
        } else {
          await firebaseSignOut(getFirebaseAuth());
          setUser(null);
          setAdmin(null);
        }
      } else {
        setUser(null);
        setAdmin(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await setPersistence(getFirebaseAuth(), browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    const adminDoc = await getDoc(doc(getDb(), "admins", cred.user.uid));
    if (!adminDoc.exists() || !adminDoc.data().isActive) {
      await firebaseSignOut(getFirebaseAuth());
      throw new Error("Access denied. You are not an authorized admin.");
    }
    await updateDoc(doc(getDb(), "admins", cred.user.uid), {
      lastLogin: serverTimestamp(),
    });
    setAdmin(adminDoc.data() as Admin);
  };

  const signOut = async () => {
    await firebaseSignOut(getFirebaseAuth());
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
