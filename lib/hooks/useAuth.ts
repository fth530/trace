import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
} from '../firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setInitializing(false);
      setLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency - subscribe once on mount

  const handleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    return result;
  };

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOut();
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    initializing,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };
};
