// Web stub for Firebase Auth
// Firebase native modules require native builds and are not available on web
// The app gracefully falls back to local-only mode

import { logger } from '../utils/logger';

logger.warn('Firebase Auth: Running in web mode (local-only, no cloud sync)');

const FIREBASE_UNAVAILABLE = {
  success: false,
  error: 'Firebase is not available on web. Use a native build for cloud sync.',
};

export const configureGoogleSignIn = () => {};

export const signInAnonymously = async () => FIREBASE_UNAVAILABLE;

export const signInWithGoogle = async () => FIREBASE_UNAVAILABLE;

export const signOut = async () => FIREBASE_UNAVAILABLE;

export const getCurrentUser = () => null;

export const onAuthStateChanged = (callback: (user: any) => void) => {
  callback(null);
  return () => {};
};
