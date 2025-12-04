import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlhyU4B4SXgar5Agv7xkLIMGGYnIV_pE4",
  authDomain: "online-money-8001f.firebaseapp.com",
  databaseURL: "https://online-money-8001f-default-rtdb.asia-southeast1.firebasedatabase.app", // Added specific Database URL for Singapore region
  projectId: "online-money-8001f",
  storageBucket: "online-money-8001f.firebasestorage.app",
  messagingSenderId: "784742905450",
  appId: "1:784742905450:web:0867820ff3bd4fc0acfc13",
  measurementId: "G-Y7KXB4BXC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Safe Analytics Initialization
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics failed to initialize. This is likely due to browser privacy settings or ad blockers.", e);
  }
}

// Export Authentication and Database services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const storage = getStorage(app);

// Use device language for auth flow
auth.useDeviceLanguage();