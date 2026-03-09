import { logger } from '../utils/logger';

let auth: any = null;
let GoogleSignin: any = null;

try {
  auth = require('@react-native-firebase/auth').default;
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  const { GOOGLE_WEB_CLIENT_ID } = require('./config');
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
} catch {
  logger.warn('Firebase native modules not available (Expo Go mode)');
}

const FIREBASE_UNAVAILABLE = {
  success: false,
  error: 'Firebase is not available in Expo Go. Use a development build.',
};

export const configureGoogleSignIn = () => {};

export const signInAnonymously = async () => {
  if (!auth) return FIREBASE_UNAVAILABLE;
  try {
    const userCredential = await auth().signInAnonymously();
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    logger.error('Anonymous Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  if (!auth || !GoogleSignin) return FIREBASE_UNAVAILABLE;
  try {
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;
    if (!idToken) throw new Error('No ID token found');
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    logger.error('Google Sign-In Error:', error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  if (!auth) return FIREBASE_UNAVAILABLE;
  try {
    if (GoogleSignin) await GoogleSignin.signOut();
    await auth().signOut();
    return { success: true };
  } catch (error: any) {
    logger.error('Sign Out Error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  if (!auth) return null;
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return auth().onAuthStateChanged(callback);
};
