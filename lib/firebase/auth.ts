import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './config';

// Google Sign-In yapılandırması
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
};

// Google ile giriş yap
export const signInWithGoogle = async () => {
  try {
    // Google Sign-In akışını başlat
    await GoogleSignin.hasPlayServices();
    const signInResult = await GoogleSignin.signIn();
    
    // idToken'ı al
    const idToken = signInResult.data?.idToken;
    
    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Firebase credential oluştur
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Firebase'e giriş yap
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Çıkış yap
export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = () => {
  return auth().currentUser;
};

// Auth state değişikliklerini dinle
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};
